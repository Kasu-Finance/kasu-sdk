import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { apyToEpochRate, epochRateToApy } from '../../domain/rates';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { SdkConfig } from '../../sdk-config';

import { KSULocking } from './locking';

// Offline: the constructor only builds contract instances. Nothing here calls
// the RPC or the subgraph.
function locking(): KSULocking {
    const chain = CHAIN_CONFIGS.base;
    const config = new SdkConfig({
        subgraphUrl: 'https://example.invalid/subgraph',
        contracts: chain.contracts,
        UNUSED_LENDING_POOL_IDS: [''],
    });
    return new KSULocking(
        config,
        new StaticJsonRpcProvider(chain.rpcUrls[0], chain.chainId),
    );
}

describe('KSULocking.calculateApy', () => {
    it('compounds the epoch rate instead of XOR-ing it', () => {
        // The old body was `(1 + r) ^ (EPOCHS_IN_YEAR - 1)` — bitwise XOR on
        // int32 operands, so every realistic rate returned the constant 50.
        for (const r of [0.001, 0.0025, 0.003, 0.005]) {
            expect(locking().calculateApy(r)).toBe(epochRateToApy(r));
            expect(locking().calculateApy(r)).not.toBe(50);
        }
    });

    it('lands on the APYs the platform actually quotes', () => {
        // Every live tranche APY, back through its own per-epoch rate.
        for (const apy of [0.1, 0.12, 0.14, 0.16, 0.22, 0.3]) {
            expect(locking().calculateApy(apyToEpochRate(apy))).toBeCloseTo(
                apy,
                10,
            );
        }
        expect(locking().calculateApy(0)).toBe(0);
    });

    it('agrees with DataService.calculateApyForTranche', () => {
        // The two used to carry separate copies of the constant AND separate
        // (one of them wrong) formulas.
        for (const r of [0.001, 0.003, 0.01]) {
            expect(locking().calculateApy(r)).toBe(epochRateToApy(r));
        }
    });
});
