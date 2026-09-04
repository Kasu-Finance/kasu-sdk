import { SdkConfig } from '../sdk-config';

import { CHAIN_CONFIGS } from './chain-configs';

// Pure config assertions — no network, unlike `facade.test.ts`.

const BASE_CONTRACTS = CHAIN_CONFIGS.base.contracts;

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
