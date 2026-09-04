import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';

import { SdkConfig } from '../sdk-config';

import { CHAIN_CONFIGS } from './chain-configs';
import { Kasu } from './kasu';

// Pure config assertions — no network, unlike `facade.test.ts`.

const BASE_CONTRACTS = CHAIN_CONFIGS.base.contracts;

/** A signer with a provider attached, offline — nothing here sends anything. */
function signer(): Wallet {
    return Wallet.createRandom().connect(
        new StaticJsonRpcProvider(
            CHAIN_CONFIGS.base.rpcUrls[0],
            CHAIN_CONFIGS.base.chainId,
        ),
    );
}

describe('SdkConfig — UNUSED_LENDING_POOL_IDS normalisation', () => {
    it("turns an empty exclusion list into the [''] sentinel", () => {
        // `id_not_in: []` matches NOTHING in the subgraph: on Base it returns
        // 0 pools where `['']` returns all 9 (verified live 2026-09-04).
        const config = new SdkConfig({
            subgraphUrl: 'https://example.invalid/subgraph',
            contracts: BASE_CONTRACTS,
            UNUSED_LENDING_POOL_IDS: [],
        });
        expect(config.UNUSED_LENDING_POOL_IDS).toEqual(['']);
    });

    it('leaves a caller-supplied exclusion list untouched', () => {
        const config = new SdkConfig({
            subgraphUrl: 'https://example.invalid/subgraph',
            contracts: BASE_CONTRACTS,
            UNUSED_LENDING_POOL_IDS: ['0xdead'],
        });
        expect(config.UNUSED_LENDING_POOL_IDS).toEqual(['0xdead']);
    });

    it('leaves a sentinel a consumer already passes untouched', () => {
        // kasu-ui passes [''], kasu-mobile passes the zero address.
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        for (const sentinel of [[''], [zeroAddress]]) {
            const config = new SdkConfig({
                subgraphUrl: 'https://example.invalid/subgraph',
                contracts: BASE_CONTRACTS,
                UNUSED_LENDING_POOL_IDS: sentinel,
            });
            expect(config.UNUSED_LENDING_POOL_IDS).toEqual(sentinel);
        }
    });
});

describe('CHAIN_CONFIGS — stable asset', () => {
    it('gives every chain exactly one stable asset', () => {
        for (const [chain, config] of Object.entries(CHAIN_CONFIGS)) {
            expect(config.stableAsset.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
            expect(config.stableAsset.symbol.length).toBeGreaterThan(0);
            expect(config.stableAsset.decimals).toBeGreaterThan(0);
            expect(config.stableAsset.currencyCode).toMatch(/^[A-Z]{3}$/);
            expect(chain).toBeTruthy();
        }
    });

    it('carries the live token per deployment', () => {
        expect(CHAIN_CONFIGS.base.stableAsset).toEqual({
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            currencyCode: 'USD',
        });
        expect(CHAIN_CONFIGS.xdc.stableAsset.symbol).toBe('AUDD');
        expect(CHAIN_CONFIGS.xdc.stableAsset.currencyCode).toBe('AUD');
        expect(CHAIN_CONFIGS['xdc-usdc'].stableAsset.symbol).toBe('USDC');
        expect(CHAIN_CONFIGS.plume.stableAsset.symbol).toBe('pUSD');
    });
});

describe('CHAIN_CONFIGS — rpcUrls', () => {
    it('gives every live deployment at least one default endpoint', () => {
        for (const chain of ['base', 'xdc', 'xdc-usdc'] as const) {
            expect(CHAIN_CONFIGS[chain].rpcUrls.length).toBeGreaterThan(0);
            expect(CHAIN_CONFIGS[chain].retired).toBeUndefined();
        }
    });

    it('never lists an XDC endpoint that fails CORS preflight', () => {
        // `rpc.xdc.org` / `erpc.xdc.org` answer OPTIONS without
        // `access-control-allow-origin`, so a browser call hangs. House rule.
        for (const config of Object.values(CHAIN_CONFIGS)) {
            for (const url of config.rpcUrls) {
                expect(url).not.toContain('rpc.xdc.org');
                expect(url).not.toContain('erpc.xdc.org');
            }
        }
    });

    it('marks the retired deployment and leaves it without a default RPC', () => {
        expect(CHAIN_CONFIGS.plume.retired).toBe(true);
        expect(CHAIN_CONFIGS.plume.rpcUrls).toEqual([]);
    });
});

describe('Kasu — read-only create and connect', () => {
    it('creates a read-only instance with no signerOrProvider', () => {
        const kasu = Kasu.create({ chain: 'base' });
        expect(kasu.isReadOnly).toBe(true);
        expect(kasu.provider).toBeInstanceOf(StaticJsonRpcProvider);
    });

    it('uses rpcUrls[0] and the config chain id, with no network detection', () => {
        const kasu = Kasu.create({ chain: 'base' });
        const provider = kasu.provider as StaticJsonRpcProvider;
        expect(provider.connection.url).toBe(CHAIN_CONFIGS.base.rpcUrls[0]);
        expect(provider.network.chainId).toBe(CHAIN_CONFIGS.base.chainId);
    });

    it('refuses a read-only create on a retired chain with no default RPC', () => {
        expect(() => Kasu.create({ chain: 'plume' })).toThrow(
            'Kasu.create: chain "plume" has no default RPC (retired); pass signerOrProvider',
        );
    });

    it('still accepts an explicit provider for the retired chain', () => {
        const provider = new StaticJsonRpcProvider(
            'https://example.invalid/plume',
            CHAIN_CONFIGS.plume.chainId,
        );
        const kasu = Kasu.create({ chain: 'plume', signerOrProvider: provider });
        expect(kasu.isReadOnly).toBe(true);
        expect(kasu.provider).toBe(provider);
    });

    it('is writable when created from a signer', () => {
        const kasu = Kasu.create({ chain: 'base', signerOrProvider: signer() });
        expect(kasu.isReadOnly).toBe(false);
    });

    it('connect returns a NEW writable instance, leaving the original read-only', () => {
        const readOnly = Kasu.create({ chain: 'base' });
        const connected = readOnly.connect(signer());
        expect(connected).not.toBe(readOnly);
        expect(connected.isReadOnly).toBe(false);
        expect(readOnly.isReadOnly).toBe(true);
    });

    it('connect keeps the chain config and the configOverrides', () => {
        const readOnly = Kasu.create({
            chain: 'base',
            configOverrides: { UNUSED_LENDING_POOL_IDS: ['0xhidden'] },
        });
        const connected = readOnly.connect(signer());
        expect(connected.chainConfig).toBe(readOnly.chainConfig);
        const configOf = (kasu: Kasu): SdkConfig =>
            (kasu.services.DataService as unknown as { _kasuConfig: SdkConfig })
                ._kasuConfig;
        expect(configOf(connected).UNUSED_LENDING_POOL_IDS).toEqual([
            '0xhidden',
        ]);
    });

    it('exposes the signer’s own provider on a connected instance', () => {
        const wallet = signer();
        const kasu = Kasu.create({ chain: 'base', signerOrProvider: wallet });
        expect(kasu.provider).toBe(wallet.provider);
    });

    it('throws rather than returning undefined for a provider-less signer', () => {
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: Wallet.createRandom(),
        });
        expect(() => kasu.provider).toThrow('has no provider attached');
    });
});

describe('DepositsFacade — read-only writes', () => {
    const readOnly = (): Kasu => Kasu.create({ chain: 'base' });
    const READ_ONLY_MESSAGE =
        'Kasu: this instance is read-only; call kasu.connect(signer) first';

    it('refuses deposit before touching the contract', async () => {
        await expect(
            readOnly().deposits.deposit({
                poolId: '0xpool',
                trancheId: '0xtranche',
                amount: 1,
                kycSignature: { blockExpiration: 0, signature: '0x' },
            }),
        ).rejects.toThrow(READ_ONLY_MESSAGE);
    });

    it('refuses withdraw', async () => {
        await expect(
            readOnly().deposits.withdraw({
                poolId: '0xpool',
                trancheId: '0xtranche',
                amount: 1,
            }),
        ).rejects.toThrow(READ_ONLY_MESSAGE);
    });

    it('refuses withdrawMax', async () => {
        await expect(
            readOnly().deposits.withdrawMax('0xpool', '0xtranche', '0xuser'),
        ).rejects.toThrow(READ_ONLY_MESSAGE);
    });

    it('lets a connected instance past the guard', () => {
        const connected = readOnly().connect(signer());
        // Reaches the contract call (and fails there on a fake address) rather
        // than being refused up front. Probing the guard directly keeps the
        // assertion off the network.
        const guard = connected.deposits as unknown as {
            assertWritable(): void;
        };
        expect(() => {
            guard.assertWritable();
        }).not.toThrow();
    });
});
