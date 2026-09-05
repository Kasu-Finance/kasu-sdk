/**
 * `kasu.flows.*` — the defaults it wires, and what a read-only instance does
 * when a run reaches a write port.
 *
 * Offline throughout. Every port that would touch the network is either
 * overridden here or refused by the read-only guard before it can dial out, so
 * these specs run in CI beside the pure ones.
 */
import { BigNumber, constants } from 'ethers';

import { GenerateContractResponse } from '../domain/loan-contract';
import { DepositFlow, WithdrawFlow } from '../flows';
import type {
    DepositFlowInput,
    GenerateContractRequest,
    KycSignature,
    WaitableTransaction,
} from '../flows';

import { Kasu } from './kasu';
import { READ_ONLY_MESSAGE } from './read-only';
import { KycParams } from './types';

const USER = '0xAbCdEf0000000000000000000000000000000001' as const;
const SIGNATURE = `0x${'11'.repeat(65)}`;
const AMOUNT = BigNumber.from('1000000');

const INPUT: DepositFlowInput = {
    poolId: '0xpool',
    trancheId: '0xtranche',
    amount: AMOUNT,
    fixedTermConfigId: '0',
    userAddress: USER,
    spender: '0xspender',
    contractMessage: { format: 'legacy' },
};

const readOnly = (): Kasu => Kasu.create({ chain: 'base' });

const CONTRACT: GenerateContractResponse = {
    fullName: 'A Lender',
    contractMessage: 'I accept.',
    formattedMessage: '{}',
    contractType: 'retail',
    contractVersion: 1,
    timestamp: Date.now(),
};

/** The three ports that always come from the application. */
function appPorts(): {
    signMessage: () => Promise<string>;
    generateContract: (
        req: GenerateContractRequest,
    ) => Promise<GenerateContractResponse>;
    getKycSignature: (params: KycParams) => Promise<KycSignature>;
} {
    return {
        signMessage: (): Promise<string> => Promise.resolve(SIGNATURE),
        generateContract: (): Promise<GenerateContractResponse> =>
            Promise.resolve({ ...CONTRACT, timestamp: Date.now() }),
        getKycSignature: (): Promise<KycSignature> =>
            Promise.resolve({ signature: '0x', blockExpiration: 0 }),
    };
}

/** Start, accept the agreement, and wait for the run to finish. */
async function runAccepting(flow: DepositFlow): Promise<void> {
    const running = flow.start(INPUT);
    for (let i = 0; i < 500; i += 1) {
        if (flow.state.phase === 'awaiting-accept') break;
        await new Promise((resolve) => setImmediate(resolve));
    }
    await flow.acceptContract();
    await running;
}

describe('FlowsFacade', () => {
    it('builds a DepositFlow and a WithdrawFlow', () => {
        const kasu = readOnly();
        expect(kasu.flows.deposit(appPorts())).toBeInstanceOf(DepositFlow);
        expect(kasu.flows.withdraw()).toBeInstanceOf(WithdrawFlow);
    });

    it('refuses the default approve port on a read-only instance', async () => {
        const flow = readOnly().flows.deposit({
            ...appPorts(),
            // Short allowance, so the run reaches the SDK's own approve.
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(BigNumber.from(0)),
        });
        await runAccepting(flow);

        expect(flow.state.failure?.step).toBe('approve');
        expect(flow.state.failure?.reason).toBe('failed');
        const failure = flow.state.failure;
        const error = failure && 'error' in failure ? failure.error : undefined;
        expect((error as Error).message).toBe(READ_ONLY_MESSAGE);
    });

    it('refuses the default deposit port on a read-only instance', async () => {
        const flow = readOnly().flows.deposit({
            ...appPorts(),
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(constants.MaxUint256),
        });
        await runAccepting(flow);

        expect(flow.state.failure?.step).toBe('request');
        const failure = flow.state.failure;
        const error = failure && 'error' in failure ? failure.error : undefined;
        expect((error as Error).message).toBe(READ_ONLY_MESSAGE);
    });

    it('defaults buildKycParams to the SDK, bound to this chain', async () => {
        let seen: KycParams | undefined;
        const kasu = readOnly();
        const flow = kasu.flows.deposit({
            ...appPorts(),
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(constants.MaxUint256),
            getKycSignature: (params: KycParams): Promise<KycSignature> => {
                seen = params;
                return Promise.resolve({ signature: '0x', blockExpiration: 0 });
            },
        });
        await runAccepting(flow);

        expect(seen).toBeDefined();
        expect(seen?.chainId).toBe('8453');
        expect(seen?.functionName).toBe('verifyUserKyc');
        expect(seen?.contractAddress).toBe(
            kasu.chainConfig.contracts.KasuAllowList.toLowerCase(),
        );
        expect(seen?.userAddress).toBe(USER.toLowerCase());
    });

    it('lets an override replace an SDK default, and passes it the exact amount', async () => {
        let approved: { spender: string; amount: BigNumber } | undefined;
        const flow = readOnly().flows.deposit({
            ...appPorts(),
            readAllowance: (): Promise<BigNumber> =>
                Promise.resolve(BigNumber.from(0)),
            approve: (
                spender: string,
                amount: BigNumber,
            ): Promise<WaitableTransaction> => {
                approved = { spender, amount };
                return Promise.resolve({
                    wait: (): Promise<unknown> => Promise.resolve(null),
                });
            },
        });
        await runAccepting(flow);

        // The override ran instead of the SDK's refusal, with the deposit
        // amount unchanged.
        expect(approved?.spender).toBe('0xspender');
        expect(approved?.amount.eq(AMOUNT)).toBe(true);
        // And the run carried on to the SDK's own (refused) deposit port.
        expect(flow.state.failure?.step).toBe('request');
    });

    it('refuses both default withdraw ports on a read-only instance', async () => {
        const exact = readOnly().flows.withdraw();
        await exact.start({
            poolId: '0xpool',
            trancheId: '0xtranche',
            amount: AMOUNT,
            userAddress: USER,
        });
        expect(exact.state.failure?.step).toBe('request');
        const exactFailure = exact.state.failure;
        expect(
            (
                (exactFailure && 'error' in exactFailure
                    ? exactFailure.error
                    : undefined) as Error
            ).message,
        ).toBe(READ_ONLY_MESSAGE);

        const max = readOnly().flows.withdraw();
        await max.start({
            poolId: '0xpool',
            trancheId: '0xtranche',
            amount: 'max',
            userAddress: USER,
        });
        expect(max.state.isMax).toBe(true);
        expect(max.state.failure?.step).toBe('request');
    });

    it('lets a withdraw override replace the SDK default', async () => {
        let called: string[] | undefined;
        const flow = readOnly().flows.withdraw({
            withdrawMax: (
                poolId: string,
                trancheId: string,
                userAddress: string,
            ): Promise<WaitableTransaction> => {
                called = [poolId, trancheId, userAddress];
                return Promise.resolve({
                    wait: (): Promise<unknown> => Promise.resolve(null),
                });
            },
        });
        await flow.start({
            poolId: '0xpool',
            trancheId: '0xtranche',
            amount: 'max',
            userAddress: USER,
        });

        expect(flow.state.phase).toBe('success');
        expect(called).toEqual(['0xpool', '0xtranche', USER.toLowerCase()]);
    });

    it('exposes the same read-only refusal the deposits facade uses', () => {
        expect(READ_ONLY_MESSAGE).toBe(
            'Kasu: this instance is read-only; call kasu.connect(signer) first',
        );
    });
});
