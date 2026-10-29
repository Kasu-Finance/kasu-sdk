import { CHAIN_CONFIGS } from './chain-configs';
import {
    resolveStrategyDeployments,
    StrategyDeploymentInputError,
    strategyDeployments,
} from './strategy-deployments';
import { SupportedChain } from './types';

// The built-in mapping's own entries, read from the config rather than typed
// in, so the spec follows the mapping when a pool is added.
const XDC_MAPPING = Object.entries(CHAIN_CONFIGS.xdc.poolMetadataMapping ?? {});
const [TAX_PAY_XDC, TAX_PAY_BASE] = XDC_MAPPING[0];

const BASE_ONLY = '0x1111111111111111111111111111111111111111';
const XDC_ONLY = '0x2222222222222222222222222222222222222222';
const XDC_USDC_POOL = '0x3333333333333333333333333333333333333333';

function refusal(run: () => unknown): string | undefined {
    try {
        run();
    } catch (error) {
        expect(error).toBeInstanceOf(StrategyDeploymentInputError);
        return (error as StrategyDeploymentInputError).code;
    }
    return undefined;
}

describe('CHAIN_CONFIGS — poolMetadataMapping', () => {
    it('leaves Base, the canonical deployment, without a mapping', () => {
        expect(CHAIN_CONFIGS.base.poolMetadataMapping).toBeUndefined();
    });

    it('maps lowercase addresses one to one, never onto themselves', () => {
        for (const config of Object.values(CHAIN_CONFIGS)) {
            const entries = Object.entries(config.poolMetadataMapping ?? {});
            const targets = entries.map(([, canonical]) => canonical);
            expect(new Set(targets).size).toBe(targets.length);
            for (const [local, canonical] of entries) {
                expect(local).toMatch(/^0x[0-9a-f]{40}$/);
                expect(canonical).toMatch(/^0x[0-9a-f]{40}$/);
                expect(local).not.toBe(canonical);
            }
        }
    });

    it('has XDC AUDD as the one deployment with counterparts today', () => {
        expect(XDC_MAPPING.length).toBeGreaterThan(0);
        expect(CHAIN_CONFIGS['xdc-usdc'].poolMetadataMapping).toBeUndefined();
        expect(CHAIN_CONFIGS.plume.poolMetadataMapping).toBeUndefined();
    });
});

describe('strategyDeployments', () => {
    it('finds the XDC counterpart of a canonical Base id', () => {
        expect(strategyDeployments(TAX_PAY_BASE, 'base')).toEqual([
            { chain: 'base', poolId: TAX_PAY_BASE },
            { chain: 'xdc', poolId: TAX_PAY_XDC },
        ]);
    });

    it('resolves the same set from the XDC side', () => {
        expect(strategyDeployments(TAX_PAY_XDC, 'xdc')).toEqual([
            { chain: 'base', poolId: TAX_PAY_BASE },
            { chain: 'xdc', poolId: TAX_PAY_XDC },
        ]);
    });

    it('round-trips every mapped pair, in both directions', () => {
        for (const [local, canonical] of XDC_MAPPING) {
            const expected = [
                { chain: 'base', poolId: canonical },
                { chain: 'xdc', poolId: local },
            ];
            expect(strategyDeployments(canonical, 'base')).toEqual(expected);
            expect(strategyDeployments(local, 'xdc')).toEqual(expected);
        }
    });

    it('compares case-insensitively, trims, and returns lowercase', () => {
        const shouted = `  ${TAX_PAY_BASE.toUpperCase().replace('0X', '0x')} `;
        expect(strategyDeployments(shouted, 'base')).toEqual([
            { chain: 'base', poolId: TAX_PAY_BASE },
            { chain: 'xdc', poolId: TAX_PAY_XDC },
        ]);
        expect(
            strategyDeployments(
                TAX_PAY_XDC.toUpperCase().replace('0X', '0x'),
                'xdc',
            ),
        ).toEqual(strategyDeployments(TAX_PAY_XDC, 'xdc'));
    });

    it('keeps a Base id with no counterpart a strategy of one (PayFi)', () => {
        expect(strategyDeployments(BASE_ONLY, 'base')).toEqual([
            { chain: 'base', poolId: BASE_ONLY },
        ]);
    });

    it('keeps an unmapped id off Base a strategy of one on its own chain', () => {
        expect(strategyDeployments(XDC_ONLY, 'xdc')).toEqual([
            { chain: 'xdc', poolId: XDC_ONLY },
        ]);
        expect(strategyDeployments(XDC_USDC_POOL, 'xdc-usdc')).toEqual([
            { chain: 'xdc-usdc', poolId: XDC_USDC_POOL },
        ]);
        expect(strategyDeployments(XDC_USDC_POOL, 'plume')).toEqual([
            { chain: 'plume', poolId: XDC_USDC_POOL },
        ]);
    });

    it('refuses an XDC chain-local id passed as Base', () => {
        expect(refusal(() => strategyDeployments(TAX_PAY_XDC, 'base'))).toBe(
            'wrong-chain',
        );
        expect(
            refusal(() => strategyDeployments(TAX_PAY_XDC, 'xdc-usdc')),
        ).toBe('wrong-chain');
    });

    it('refuses a canonical Base id passed as another chain', () => {
        expect(refusal(() => strategyDeployments(TAX_PAY_BASE, 'xdc'))).toBe(
            'wrong-chain',
        );
        expect(
            refusal(() => strategyDeployments(TAX_PAY_BASE, 'xdc-usdc')),
        ).toBe('wrong-chain');
    });

    it.each([
        ['empty', ''],
        ['blank', '   '],
        ['short', '0x1234'],
        ['no prefix', '1'.repeat(40)],
        ['non-hex', `0x${'g'.repeat(40)}`],
        ['a number', 42],
        ['undefined', undefined],
    ])('refuses a malformed pool id (%s)', (_label, id) => {
        expect(refusal(() => strategyDeployments(id as string, 'base'))).toBe(
            'pool-id',
        );
    });

    it.each([['mainnet'], ['toString'], ['__proto__'], [''], [undefined]])(
        'refuses an unknown chain (%s)',
        (chain) => {
            expect(
                refusal(() =>
                    strategyDeployments(BASE_ONLY, chain as SupportedChain),
                ),
            ).toBe('chain');
        },
    );

    it('returns a fresh array each call', () => {
        const first = strategyDeployments(TAX_PAY_BASE, 'base');
        first.pop();
        expect(strategyDeployments(TAX_PAY_BASE, 'base')).toHaveLength(2);
    });
});

describe('resolveStrategyDeployments — shapes the built-in mapping lacks', () => {
    const CANONICAL = '0xaaaa000000000000000000000000000000000001';
    const ON_XDC = '0xbbbb000000000000000000000000000000000001';
    const ON_XDC_USDC = '0xcccc000000000000000000000000000000000001';
    const configs = {
        // A mapping on Base is ignored: Base is canonical by definition.
        base: { poolMetadataMapping: { [BASE_ONLY]: CANONICAL } },
        xdc: {
            poolMetadataMapping: {
                [ON_XDC.toUpperCase().replace('0X', '0x')]: CANONICAL,
            },
        },
        'xdc-usdc': {
            poolMetadataMapping: {
                [ON_XDC_USDC]: CANONICAL.toUpperCase().replace('0X', '0x'),
            },
        },
        plume: {},
    };

    it('lists every mapped deployment, canonical first, in config order', () => {
        const expected = [
            { chain: 'base', poolId: CANONICAL },
            { chain: 'xdc', poolId: ON_XDC },
            { chain: 'xdc-usdc', poolId: ON_XDC_USDC },
        ];
        expect(resolveStrategyDeployments(configs, CANONICAL, 'base')).toEqual(
            expected,
        );
        expect(resolveStrategyDeployments(configs, ON_XDC, 'xdc')).toEqual(
            expected,
        );
        expect(
            resolveStrategyDeployments(configs, ON_XDC_USDC, 'xdc-usdc'),
        ).toEqual(expected);
    });

    it('refuses one deployment’s chain-local id on another', () => {
        expect(
            refusal(() =>
                resolveStrategyDeployments(configs, ON_XDC, 'xdc-usdc'),
            ),
        ).toBe('wrong-chain');
    });

    it('never reads a mapping on Base', () => {
        expect(resolveStrategyDeployments(configs, BASE_ONLY, 'base')).toEqual([
            { chain: 'base', poolId: BASE_ONLY },
        ]);
    });
});
