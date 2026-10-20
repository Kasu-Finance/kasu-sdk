import { CHAIN_CONFIGS } from '../facade/chain-configs';

import { explorerAddressUrl, explorerTxUrl } from './explorer-urls';

const HASH = `0x${'ab'.repeat(32)}`;
const ADDRESS_LOWER = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const ADDRESS_CHECKSUM = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

describe('CHAIN_CONFIGS — blockExplorerUrl', () => {
    it('gives every deployment an https origin with no trailing slash', () => {
        for (const config of Object.values(CHAIN_CONFIGS)) {
            expect(config.blockExplorerUrl).toMatch(/^https:\/\/[^/]+$/);
        }
    });

    it('mirrors the explorers the apps link to', () => {
        expect(CHAIN_CONFIGS.base.blockExplorerUrl).toBe(
            'https://basescan.org',
        );
        expect(CHAIN_CONFIGS.xdc.blockExplorerUrl).toBe('https://xdcscan.com');
        expect(CHAIN_CONFIGS['xdc-usdc'].blockExplorerUrl).toBe(
            'https://xdcscan.com',
        );
        expect(CHAIN_CONFIGS.plume.blockExplorerUrl).toBe(
            'https://explorer.plume.org',
        );
    });
});

describe('explorerTxUrl', () => {
    it('builds the exact tx URL', () => {
        expect(explorerTxUrl(CHAIN_CONFIGS.base, HASH)).toBe(
            `https://basescan.org/tx/${HASH}`,
        );
        const upper = `0x${'AB'.repeat(32)}`;
        expect(explorerTxUrl(CHAIN_CONFIGS.xdc, upper)).toBe(
            `https://xdcscan.com/tx/${upper}`,
        );
    });

    it('tolerates a trailing slash on a custom base', () => {
        expect(
            explorerTxUrl({ blockExplorerUrl: 'https://scan.example/' }, HASH),
        ).toBe(`https://scan.example/tx/${HASH}`);
    });

    it.each([
        ['empty', ''],
        ['no 0x prefix', 'ab'.repeat(32)],
        ['too short', `0x${'ab'.repeat(31)}`],
        ['too long', `0x${'ab'.repeat(33)}`],
        ['non-hex', `0x${'zz'.repeat(32)}`],
        ['an address', ADDRESS_LOWER],
        ['a path', `${HASH}/../../evil`],
        ['a query', `${HASH}?x=1`],
        ['whitespace', ` ${HASH}`],
        ['a trailing newline', `${HASH}\n`],
        ['a URL', 'https://evil.example/tx/0x00'],
    ])('rejects %s', (_label, hash) => {
        expect(() => explorerTxUrl(CHAIN_CONFIGS.base, hash)).toThrow(
            'explorerTxUrl',
        );
    });

    it('rejects a non-string', () => {
        expect(() =>
            explorerTxUrl(CHAIN_CONFIGS.base, 123 as unknown as string),
        ).toThrow('explorerTxUrl');
    });
});

describe('explorerAddressUrl', () => {
    it('builds the exact address URL, the address as given', () => {
        expect(explorerAddressUrl(CHAIN_CONFIGS.base, ADDRESS_CHECKSUM)).toBe(
            `https://basescan.org/address/${ADDRESS_CHECKSUM}`,
        );
        expect(
            explorerAddressUrl(CHAIN_CONFIGS['xdc-usdc'], ADDRESS_LOWER),
        ).toBe(`https://xdcscan.com/address/${ADDRESS_LOWER}`);
    });

    it.each([
        ['empty', ''],
        ['no 0x prefix', ADDRESS_LOWER.slice(2)],
        ['too short', ADDRESS_LOWER.slice(0, -2)],
        ['too long', `${ADDRESS_LOWER}00`],
        ['non-hex', `0x${'g'.repeat(40)}`],
        // One letter of the checksummed form flipped to upper case.
        ['a bad checksum', '0x833589FCD6eDb6E08f4c7C32D4f71b54bdA02913'],
        ['a tx hash', HASH],
        ['an ICAP address', 'XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36'],
        ['an xdc-prefixed address', `xdc${ADDRESS_LOWER.slice(2)}`],
        ['a path', `${ADDRESS_LOWER}/../evil`],
        ['whitespace', `${ADDRESS_LOWER} `],
    ])('rejects %s', (_label, address) => {
        expect(() => explorerAddressUrl(CHAIN_CONFIGS.base, address)).toThrow(
            'explorerAddressUrl',
        );
    });
});

describe('explorer URL base validation', () => {
    it.each([
        ['missing (a pre-2.10.0 custom config)', {}],
        ['http', { blockExplorerUrl: 'http://basescan.org' }],
        ['javascript:', { blockExplorerUrl: 'javascript:alert(1)' }],
        ['a query', { blockExplorerUrl: 'https://scan.example?x=' }],
        ['credentials', { blockExplorerUrl: 'https://user@scan.example' }],
        ['empty', { blockExplorerUrl: '' }],
    ])('refuses a base that is %s', (_label, config) => {
        expect(() =>
            explorerTxUrl(config as { blockExplorerUrl: string }, HASH),
        ).toThrow('blockExplorerUrl');
        expect(() =>
            explorerAddressUrl(
                config as { blockExplorerUrl: string },
                ADDRESS_LOWER,
            ),
        ).toThrow('blockExplorerUrl');
    });
});
