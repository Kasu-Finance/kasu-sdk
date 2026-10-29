import { providers } from 'ethers';

import { deriveRequestState } from '../../domain/requests';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { SdkConfig } from '../../sdk-config';

import {
    currentEpochFtdAmountQuery,
    currentFtdBalanceQuery,
    userRequestsQuery,
} from './queries';
import { UserRequestsSubgraph, UserRequestStatus } from './subgraph-types';
import { UserRequest } from './types';
import { UNKNOWN_REQUEST_TYPE_MESSAGE, UserLending } from './user-lending';

// ---------------------------------------------------------------------------
// Request amounts and their UNITS.
//
// The subgraph's `UserRequest.amountRequested` is an ASSET amount on a deposit
// request (the deposit NFT's `assetAmount`, top-ups added) and a SHARE amount
// on a withdrawal request (the withdrawal NFT's `sharesAmount`); both shrink as
// parts are accepted. `amountAccepted`, `amountRejected` and every event's
// `assetAmount` are assets. Only shares may go through the share price.
//
// Every tranche here is priced at 1.25 assets per share (balance 1250, shares
// 1000), so a figure that wrongly goes through the price comes out 25% high and
// a figure that wrongly skips it comes out 20% low. Before 2.13.1 a deposit's
// requested amount went through it: 1500 displayed as 1875.0.
//
// Every address is synthetic; every amount a round number.
// ---------------------------------------------------------------------------

const USER = '0x0000000000000000000000000000000000000001';
const POOL = '0x000000000000000000000000000000000000a001';
const TRANCHE_JUNIOR = '0x000000000000000000000000000000000000a011';

/** 1.25 assets per share. */
const JUNIOR = { balance: '1250', shares: '1000' };
/** 1.00 asset per share — only so the pool's AVERAGE price is not 1.25. */
const SENIOR = { balance: '1000', shares: '1000' };

type SubgraphRequest = UserRequestsSubgraph['userRequests'][number];
type SubgraphEvent = SubgraphRequest['userRequestEvents'][number];

const event = (
    requestId: string,
    index: number,
    type: SubgraphEvent['type'],
    amounts: { assetAmount?: string; sharesAmount?: string },
): SubgraphEvent => ({
    id: `${requestId}-${index}`,
    index: String(index),
    type,
    // The subgraph answers `null` for an amount that does not apply.
    assetAmount: amounts.assetAmount ?? (null as unknown as undefined),
    sharesAmount: amounts.sharesAmount ?? (null as unknown as string),
    createdOn: String(1_000_000 + index),
    transactionHash: `0x${String(index + 1).padStart(64, '0')}`,
    epochId: '10',
    tranche: { id: TRANCHE_JUNIOR, orderId: '0' },
});

const request = (
    id: string,
    fields: Pick<
        SubgraphRequest,
        | 'type'
        | 'status'
        | 'amountRequested'
        | 'amountAccepted'
        | 'amountRejected'
        | 'fixedTermConfigId'
    >,
    events: SubgraphEvent[],
): SubgraphRequest => ({
    id,
    nftId: id.split('-')[1],
    createdOn: '1000000',
    updatedOn: '1000000',
    user: { id: USER },
    lendingPool: {
        id: POOL,
        name: 'Synthetic Pool',
        balance: '2250',
        tranches: [
            { orderId: '0', shares: JUNIOR.shares },
            { orderId: '1', shares: SENIOR.shares },
        ],
        configuration: {
            tranchesConfig: [
                {
                    id: TRANCHE_JUNIOR,
                    interestRate: '0.002',
                    lendingPoolTrancheInterestRateUpdates: [],
                    lendingPoolTrancheFixedTermConfigs: [
                        {
                            configId: '2',
                            epochLockDuration: '52',
                            epochInterestRate: '0.003',
                        },
                    ] as unknown as SubgraphRequest['lendingPool']['configuration']['tranchesConfig'][number]['lendingPoolTrancheFixedTermConfigs'],
                },
            ],
        },
    } as unknown as SubgraphRequest['lendingPool'],
    tranche: { id: TRANCHE_JUNIOR, orderId: '0', ...JUNIOR },
    ...fields,
    userRequestEvents: events,
});

/** Pending: 1000 requested, then a 500 top-up on the same deposit NFT. */
const DEPOSIT_WITH_TOP_UP = request(
    `${POOL}-1`,
    {
        type: 'DepositRequest',
        status: UserRequestStatus.REQUESTED,
        amountRequested: '1500',
        amountAccepted: '0',
        amountRejected: '0',
        fixedTermConfigId: '0',
    },
    [
        event(`${POOL}-1`, 0, 'DepositInitiated', { assetAmount: '1000' }),
        event(`${POOL}-1`, 1, 'DepositIncreased', { assetAmount: '500' }),
    ],
);

/**
 * 400 shares requested; 160 accepted, paying out 200 assets; 240 shares still
 * queued, worth 300 at 1.25.
 */
const PARTIAL_WITHDRAWAL = request(
    `${POOL}-2`,
    {
        type: 'WithdrawalRequest',
        status: UserRequestStatus.PROCESSING,
        amountRequested: '240',
        amountAccepted: '200',
        amountRejected: '0',
        fixedTermConfigId: null as unknown as string,
    },
    [
        event(`${POOL}-2`, 0, 'WithdrawalInitiated', { sharesAmount: '400' }),
        event(`${POOL}-2`, 1, 'WithdrawalAccepted', {
            assetAmount: '200',
            sharesAmount: '160',
        }),
    ],
);

/** Pending fixed-term deposit of 2000 on config 2. */
const FIXED_TERM_DEPOSIT = request(
    `${POOL}-3`,
    {
        type: 'DepositRequest',
        status: UserRequestStatus.REQUESTED,
        amountRequested: '2000',
        amountAccepted: '0',
        amountRejected: '0',
        fixedTermConfigId: '2',
    },
    [event(`${POOL}-3`, 0, 'DepositInitiated', { assetAmount: '2000' })],
);

/** Fully settled deposit: nothing outstanding, 1000 accepted. */
const ACCEPTED_DEPOSIT = request(
    `${POOL}-4`,
    {
        type: 'DepositRequest',
        status: UserRequestStatus.PROCESSED,
        amountRequested: '0',
        amountAccepted: '1000',
        amountRejected: '0',
        fixedTermConfigId: '0',
    },
    [
        event(`${POOL}-4`, 0, 'DepositInitiated', { assetAmount: '1000' }),
        event(`${POOL}-4`, 1, 'DepositAccepted', {
            assetAmount: '1000',
            sharesAmount: '800',
        }),
    ],
);

/** A withdrawal cancelled with all 400 shares still queued. */
const CANCELLED_WITHDRAWAL = request(
    `${POOL}-5`,
    {
        type: 'WithdrawalRequest',
        status: UserRequestStatus.PROCESSED,
        amountRequested: '0',
        amountAccepted: '0',
        amountRejected: '0',
        fixedTermConfigId: null as unknown as string,
    },
    [
        event(`${POOL}-5`, 0, 'WithdrawalInitiated', { sharesAmount: '400' }),
        event(`${POOL}-5`, 1, 'WithdrawalCancelled', { sharesAmount: '400' }),
    ],
);

type GraphRequest = jest.Mock<Promise<unknown>, [string]>;

function harness(answer: (document: string) => unknown): {
    lending: UserLending;
    request: GraphRequest;
} {
    const chain = CHAIN_CONFIGS.base;
    const lending = new UserLending(
        new SdkConfig({
            subgraphUrl: 'https://example.invalid/subgraph',
            contracts: chain.contracts,
            UNUSED_LENDING_POOL_IDS: [''],
        }),
        new providers.StaticJsonRpcProvider(chain.rpcUrls[0], chain.chainId),
    );
    const request: GraphRequest = jest.fn((document: string) =>
        Promise.resolve(answer(document)),
    );
    const internals = lending as unknown as {
        _graph: unknown;
        _clearingCoordinatorAbi: unknown;
    };
    internals._graph = { request };
    internals._clearingCoordinatorAbi = {
        isLendingPoolClearingPending: (): Promise<boolean> =>
            Promise.resolve(false),
    };
    return { lending, request };
}

async function userRequests(
    ...requests: SubgraphRequest[]
): Promise<UserRequest[]> {
    const { lending } = harness((document) => {
        if (document !== userRequestsQuery) throw new Error('unexpected query');
        // The SDK must not depend on the fixture surviving the call.
        return structuredClone({ userRequests: requests });
    });
    return await lending.getUserRequests(USER, '10');
}

describe('UserLending.getUserRequests — request amounts in assets', () => {
    it('passes a deposit with a top-up through unchanged (no share price)', async () => {
        const [deposit] = await userRequests(DEPOSIT_WITH_TOP_UP);

        // 1000 + 500, as assets. Priced as shares it read 1875.0.
        expect(deposit.requestedAmount).toBe('1500');
        expect(deposit.acceptedAmount).toBe('0');
        expect(deposit.events.map((e) => [e.requestType, e.assetAmount])).toEqual([
            ['Initiated', '1000'],
            ['Increased', '500'],
        ]);
        expect(deposit.events.map((e) => e.totalRequested)).toEqual([
            '1000',
            '500',
        ]);

        const view = deriveRequestState(deposit);
        expect(view.statusCode).toBe('pending');
        expect(view.requestedAmount).toBe(1500);
        expect(view.amount).toBe(1500);
    });

    it('prices a partially accepted withdrawal: remaining shares at the tranche price, accepted assets as they are', async () => {
        const [withdrawal] = await userRequests(PARTIAL_WITHDRAWAL);

        // 240 shares outstanding × 1.25.
        expect(withdrawal.requestedAmount).toBe('300.0');
        // Already assets — never through the price again.
        expect(withdrawal.acceptedAmount).toBe('200');
        expect(
            withdrawal.events.map((e) => [
                e.requestType,
                e.assetAmount,
                e.totalRequested,
                e.totalAccepted,
            ]),
        ).toEqual([
            // 400 shares × 1.25 — the event carries shares only.
            ['Initiated', '500.0', '500.0', '0'],
            // The accepted event carries the assets paid out.
            ['Accepted', '200', '0', '200'],
        ]);

        const view = deriveRequestState(withdrawal);
        expect(view.statusCode).toBe('partial');
        expect(view.requestedAmount).toBe(300);
        expect(view.acceptedAmount).toBe(200);
        expect(view.amount).toBe(-200);
    });

    it('passes a fixed-term deposit through unchanged and keeps its config', async () => {
        const [deposit] = await userRequests(FIXED_TERM_DEPOSIT);

        expect(deposit.requestedAmount).toBe('2000');
        expect(deposit.fixedTermConfig?.configId).toBe('2');
        expect(deposit.events[0].assetAmount).toBe('2000');

        const view = deriveRequestState(deposit);
        expect(view.fixedTermConfigId).toBe('2');
        expect(view.amount).toBe(2000);
    });

    it('leaves settled and cancelled figures in assets', async () => {
        const [accepted, cancelled] = await userRequests(
            ACCEPTED_DEPOSIT,
            CANCELLED_WITHDRAWAL,
        );

        expect(accepted.requestedAmount).toBe('0');
        expect(accepted.acceptedAmount).toBe('1000');
        expect(accepted.events[1].assetAmount).toBe('1000');
        expect(deriveRequestState(accepted).amount).toBe(1000);

        // The cancelled withdrawal's 400 shares are recovered as 500 assets.
        expect(cancelled.requestedAmount).toBe('0.0');
        expect(cancelled.events.map((e) => e.assetAmount)).toEqual([
            '500.0',
            '500.0',
        ]);
        const view = deriveRequestState(cancelled);
        expect(view.statusCode).toBe('cancelled');
        expect(view.requestedAmount).toBe(500);
    });
});

describe('UserLending.getUserRequests — an unknown request type is skipped', () => {
    it('skips that one row, keeps the others and never prices it', async () => {
        const unknown = {
            ...DEPOSIT_WITH_TOP_UP,
            id: `${POOL}-9`,
            nftId: '9',
            type: 'DepositLockRequest' as unknown as SubgraphRequest['type'],
        };
        const logged = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        try {
            const rows = await userRequests(
                DEPOSIT_WITH_TOP_UP,
                unknown,
                PARTIAL_WITHDRAWAL,
            );

            expect(rows.map((r) => [r.id, r.requestedAmount])).toEqual([
                [`${POOL}-1`, '1500'],
                [`${POOL}-2`, '300.0'],
            ]);
            expect(logged).toHaveBeenCalledTimes(1);
            const message = String(logged.mock.calls[0][0]);
            expect(message).toContain(UNKNOWN_REQUEST_TYPE_MESSAGE);
            expect(message).toContain('DepositLockRequest');
            expect(message).toContain(`${POOL}-9`);
            // The type and the request id only — never the lender.
            expect(message.toLowerCase()).not.toContain(USER.toLowerCase());
        } finally {
            logged.mockRestore();
        }
    });
});

describe('UserLending.getCurrentEpochFtdAmount — deposit amounts are assets', () => {
    it('asks the subgraph for deposit requests only', () => {
        expect(currentEpochFtdAmountQuery).toMatch(/type:\s*DepositRequest/);
    });

    it('sums each tranche + config in assets, a cancelled request included', async () => {
        const { lending } = harness((document) => {
            if (document !== currentEpochFtdAmountQuery) {
                throw new Error('unexpected query');
            }
            const tranche = { id: TRANCHE_JUNIOR, ...JUNIOR };
            return {
                userRequests: [
                    { fixedTermConfigId: '2', amountRequested: '2000', tranche },
                    { fixedTermConfigId: '1', amountRequested: '750', tranche },
                    // Cancelled, then replaced by the request above: its 0
                    // must not overwrite the live 2000.
                    { fixedTermConfigId: '2', amountRequested: '0', tranche },
                ],
            };
        });

        const amounts = await lending.getCurrentEpochFtdAmount(
            [POOL],
            USER,
            '10',
        );

        const junior = amounts.get(TRANCHE_JUNIOR) ?? [];
        expect(junior[2]).toBe('2000.0');
        expect(junior[1]).toBe('750.0');
        expect(junior[0]).toBeUndefined();
    });

    it('leaves out a slot whose total is zero, and a tranche with no other', async () => {
        const OTHER_TRANCHE = '0x000000000000000000000000000000000000a013';
        const { lending } = harness((document) => {
            if (document !== currentEpochFtdAmountQuery) {
                throw new Error('unexpected query');
            }
            const tranche = { id: TRANCHE_JUNIOR, ...JUNIOR };
            return {
                userRequests: [
                    { fixedTermConfigId: '2', amountRequested: '2000', tranche },
                    // Cancelled outright: nothing left on config 1.
                    { fixedTermConfigId: '1', amountRequested: '0', tranche },
                    // A tranche whose only request was cancelled.
                    {
                        fixedTermConfigId: '1',
                        amountRequested: '0',
                        tranche: { id: OTHER_TRANCHE, ...JUNIOR },
                    },
                ],
            };
        });

        const amounts = await lending.getCurrentEpochFtdAmount(
            [POOL],
            USER,
            '10',
        );

        // Never the truthy string '0.0'.
        expect(amounts.get(TRANCHE_JUNIOR)?.[1]).toBeUndefined();
        expect(amounts.get(TRANCHE_JUNIOR)?.[2]).toBe('2000.0');
        expect(amounts.has(OTHER_TRANCHE)).toBe(false);
    });
});

describe('UserLending.getCurrentFtdBalance — a lock is worth its own tranche price', () => {
    it("prices locked shares at the lock's tranche, not the pool average", async () => {
        const { lending } = harness((document) => {
            if (document !== currentFtdBalanceQuery) {
                throw new Error('unexpected query');
            }
            return {
                userLendingPoolTrancheFixedTermDepositLocks: [
                    {
                        trancheShares: '100',
                        lendingPoolTrancheFixedTermConfig: {
                            configId: '2',
                            lendingPoolTranche: {
                                id: TRANCHE_JUNIOR,
                                ...JUNIOR,
                            },
                        },
                        // The pool average is (1250 + 1000) / 2000 = 1.125.
                        lendingPool: {
                            balance: '2250',
                            tranches: [
                                { shares: JUNIOR.shares },
                                { shares: SENIOR.shares },
                            ],
                        },
                    },
                ],
            };
        });

        const balances = await lending.getCurrentFtdBalance(POOL, USER);

        // 100 shares × 1.25 — the pool average would give 112.5.
        expect(balances.get(TRANCHE_JUNIOR)?.[2]).toBe(125);
        expect(currentFtdBalanceQuery).toMatch(
            /lendingPoolTranche\s*{\s*id\s+balance\s+shares\s*}/,
        );
    });
});
