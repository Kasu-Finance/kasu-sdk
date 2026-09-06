/**
 * `kasu.flows.*` — the defaults it wires, and what a read-only instance does
 * when a run reaches a write port.
 *
 * Offline throughout. Every port that would touch the network is either
 * overridden here or refused by the read-only guard before it can dial out, so
 * these specs run in CI beside the pure ones.
 */
import { BigNumber, constants, providers, utils } from 'ethers';

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

/**
 * A provider that answers every `eth_call` from memory.
 *
 * The SDK's own `readAllowance` port dials the chain's ERC-20, and these specs
 * are offline — so the ONE call it makes is answered here, and counted, which
 * is also how a spec can tell the SDK's default from a port that was silently
 * replaced by `undefined`.
 */
class StubProvider extends providers.StaticJsonRpcProvider {
    /** How many `eth_call`s the SDK's own ports made. */
    public calls = 0;

    constructor(private readonly _allowance = constants.Zero) {
        super('http://127.0.0.1:1/never-dialled', 8453);
    }

    override call(): Promise<string> {
        this.calls += 1;
        return Promise.resolve(
            utils.defaultAbiCoder.encode(['uint256'], [this._allowance]),
        );
    }
}

const waitable = (): WaitableTransaction => ({
    wait: (): Promise<unknown> => Promise.resolve(null),
});

/** Start, accept the agreement, and wait for the run to finish. */
async function runAccepting(
    flow: DepositFlow,
    input: DepositFlowInput = INPUT,
): Promise<void> {
    const running = flow.start(input);
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

    it('keeps its own default when an optional port is explicitly undefined', async () => {
        // `approve: sponsoredGasOn ? sponsoredApprove : undefined` is how a
        // consumer writes a conditional override — kasu-ui writes exactly
        // that. Spreading the overrides over the defaults would let the
        // `undefined` DELETE the default: `ports.approve is not a function`
        // at the approve step, and a `readAllowance` that silently forces an
        // approval on every run.
        const provider = new StubProvider();
        const kasu = Kasu.create({ chain: 'base', signerOrProvider: provider });
        const flow = kasu.flows.deposit({
            ...appPorts(),
            readAllowance: undefined,
            approve: undefined,
            deposit: undefined,
            buildKycParams: undefined,
            now: undefined,
        });
        // No `spender` on the input either: the facade's default is a real
        // address, and the ERC-20 read needs one.
        await runAccepting(flow, { ...INPUT, spender: undefined });

        // The SDK's own allowance read ran — it is the only thing that dials.
        expect(provider.calls).toBe(1);
        // And the SDK's own approve ran, refusing as a read-only instance
        // must, rather than throwing a TypeError from an absent function.
        expect(flow.state.failure?.step).toBe('approve');
        const failure = flow.state.failure;
        const error = failure && 'error' in failure ? failure.error : undefined;
        expect((error as Error).message).toBe(READ_ONLY_MESSAGE);
    });

    it('defaults the spender to this chain’s LendingPoolManager', async () => {
        // A spender the consumer has to supply is a spender the consumer can
        // get wrong: an approval granted to the wrong contract, and then a
        // revert diagnosed as `insufficient-balance`.
        const provider = new StubProvider();
        const kasu = Kasu.create({ chain: 'base', signerOrProvider: provider });
        let approved: { spender: string; amount: BigNumber } | undefined;
        const flow = kasu.flows.deposit({
            ...appPorts(),
            approve: (
                spender: string,
                amount: BigNumber,
            ): Promise<WaitableTransaction> => {
                approved = { spender, amount };
                return Promise.resolve(waitable());
            },
        });
        await runAccepting(flow, { ...INPUT, spender: undefined });

        expect(approved?.spender).toBe(
            kasu.chainConfig.contracts.LendingPoolManager,
        );
        expect(approved?.amount.eq(AMOUNT)).toBe(true);
        // Still overridable, for a consumer that replaced the deposit port.
        expect(INPUT.spender).toBe('0xspender');
    });

    it('defaults buildKycParams on the withdraw pre-check, bound to this chain', async () => {
        // kasu-mobile's withdraw pre-check IS these two ports. The SDK owns
        // the first exactly as it does on the deposit path, so the pre-check
        // is one thing across both money paths rather than two.
        let seen: KycParams | undefined;
        const kasu = readOnly();
        const flow = kasu.flows.withdraw({
            getKycSignature: (params: KycParams): Promise<unknown> => {
                seen = params;
                return Promise.resolve(null);
            },
            withdraw: (): Promise<WaitableTransaction> =>
                Promise.resolve(waitable()),
        });
        await flow.start({
            poolId: '0xpool',
            trancheId: '0xtranche',
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(seen?.chainId).toBe('8453');
        expect(seen?.userAddress).toBe(USER.toLowerCase());
        expect(seen?.contractAddress).toBe(
            kasu.chainConfig.contracts.KasuAllowList.toLowerCase(),
        );
        expect(flow.state.phase).toBe('success');
    });

    it('keeps the withdraw defaults when a port is explicitly undefined', async () => {
        const flow = readOnly().flows.withdraw({
            withdraw: undefined,
            withdrawMax: undefined,
        });
        await flow.start({
            poolId: '0xpool',
            trancheId: '0xtranche',
            amount: AMOUNT,
            userAddress: USER,
        });

        expect(flow.state.failure?.step).toBe('request');
        const failure = flow.state.failure;
        const error = failure && 'error' in failure ? failure.error : undefined;
        expect((error as Error).message).toBe(READ_ONLY_MESSAGE);
    });

    it('exposes the same read-only refusal the deposits facade uses', () => {
        expect(READ_ONLY_MESSAGE).toBe(
            'Kasu: this instance is read-only; call kasu.connect(signer) first',
        );
    });
});
