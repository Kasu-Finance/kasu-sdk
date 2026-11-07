import { BigNumber, providers } from 'ethers';

import { epochEndTimestamp } from '../../domain/yields';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { SdkConfig } from '../../sdk-config';

import { KSULocking } from './locking';

/** Base `SystemVariables.epochStartTimestamp(0)`, read on chain. */
const BASE_INITIAL = 1_717_653_600;

// Offline: the constructor only builds contract instances, and the one
// contract the method reads is replaced before it is called.
function locking(
    chain: 'base' | 'xdc',
    epochStartTimestamp: (epoch: number) => Promise<BigNumber>,
): KSULocking {
    const entry = CHAIN_CONFIGS[chain];
    const config = new SdkConfig({
        subgraphUrl: 'https://example.invalid/subgraph',
        contracts: entry.contracts,
        UNUSED_LENDING_POOL_IDS: [''],
        isLiteDeployment: entry.isLiteDeployment,
    });
    const service = new KSULocking(
        config,
        new providers.StaticJsonRpcProvider(entry.rpcUrls[0], entry.chainId),
    );
    (
        service as unknown as { _systemVariablesAbi: unknown }
    )._systemVariablesAbi = { epochStartTimestamp };
    return service;
}

describe('KSULocking.getInitialEpochStartTimestamp', () => {
    it('reads epochStartTimestamp(0) and returns unix seconds as a number', async () => {
        const read = jest.fn((epoch: number) =>
            Promise.resolve(BigNumber.from(BASE_INITIAL + epoch * 604_800)),
        );
        const initial = await locking(
            'base',
            read,
        ).getInitialEpochStartTimestamp();

        expect(read).toHaveBeenCalledTimes(1);
        expect(read).toHaveBeenCalledWith(0);
        expect(initial).toBe(BASE_INITIAL);
        // The value the domain layer anchors on: the end of epoch 124 is the
        // start of epoch 125 on Base.
        expect(epochEndTimestamp(initial, 124)).toBe(1_793_253_600);
    });

    it('works on a Lite deployment too: SystemVariables is on every chain', async () => {
        const read = jest.fn(() =>
            Promise.resolve(BigNumber.from(BASE_INITIAL)),
        );
        await expect(
            locking('xdc', read).getInitialEpochStartTimestamp(),
        ).resolves.toBe(BASE_INITIAL);
        expect(read).toHaveBeenCalledWith(0);
    });

    it('rejects when the read fails, rather than inventing an epoch zero', async () => {
        const read = jest.fn(() => Promise.reject(new Error('rpc down')));
        await expect(
            locking('base', read).getInitialEpochStartTimestamp(),
        ).rejects.toThrow('rpc down');
    });
});
