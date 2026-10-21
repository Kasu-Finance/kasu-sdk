import { providers } from 'ethers';
import * as fc from 'fast-check';

import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { SdkConfig } from '../../sdk-config';

import { Portfolio } from './portfolio';
import { PortfolioLendingPool, PortfolioTranche } from './types';

// Offline: the constructor only builds contract instances and a GraphQL
// client. `calculateYieldMetrics` is the same pure fold `getPortfolioSummary`
// runs, so nothing here reaches the RPC or the subgraph.
function portfolio(): Portfolio {
    const chain = CHAIN_CONFIGS.base;
    const config = new SdkConfig({
        subgraphUrl: 'https://example.invalid/subgraph',
        contracts: chain.contracts,
        UNUSED_LENDING_POOL_IDS: [''],
    });
    return new Portfolio(
        config,
        new providers.StaticJsonRpcProvider(chain.rpcUrls[0], chain.chainId),
    );
}

const VARIABLE_RATE = 0.002;
const VARIABLE_APY = 0.1;
const FIXED_CONFIG_ID = '1';
const FIXED_RATE = 0.003;
const FIXED_APY = 0.15;

interface Lock {
    amount: number;
    isLocked: boolean;
    lifetime: number;
}

/**
 * One tranche the way `getPortfolioLendingData` hands it over: `balance` is
 * the lender's whole tranche balance, and `investedAmount` is that balance
 * MINUS the locked loans only (portfolio.ts — `if (!cur.isLocked) return
 * total`). A matured lock's principal therefore stays inside `investedAmount`.
 */
function tranche(
    balance: number,
    locks: Lock[],
    variableLifetime = 0,
): PortfolioTranche {
    const lockedAmount = locks
        .filter((l) => l.isLocked)
        .reduce((sum, l) => sum + l.amount, 0);

    return {
        apy: String(VARIABLE_APY),
        interestRate: String(VARIABLE_RATE),
        fixedTermConfig: [
            {
                configId: FIXED_CONFIG_ID,
                apy: String(FIXED_APY),
                epochLockDuration: '13',
                epochInterestRate: String(FIXED_RATE),
                fixedTermDepositStatus: 'Everyone',
                fixedTermDepositAllowlist: [],
            },
        ],
        investedAmount: String(balance - lockedAmount),
        yieldEarnings: { lastEpoch: '0', lifetime: String(variableLifetime) },
        depositDetails: [],
        fixedLoans: locks.map((l, i) => ({
            isLocked: l.isLocked,
            lockId: String(i + 1),
            configId: FIXED_CONFIG_ID,
            epochInterestRate: String(FIXED_RATE),
            epochLockStart: '1',
            epochLockEnd: '14',
            epochLockDuration: '13',
            isWithdrawalRequested: false,
            startTime: 0,
            amount: String(l.amount),
            endTime: 0,
            yieldEarnings: { lastEpoch: '0', lifetime: String(l.lifetime) },
            depositDetails: [],
        })),
    } as unknown as PortfolioTranche;
}

type Metrics = ReturnType<Portfolio['calculateYieldMetrics']>;

function pools(...tranches: PortfolioTranche[]): PortfolioLendingPool[] {
    return [{ tranches } as unknown as PortfolioLendingPool];
}

/**
 * The oracle: Σ over positions of (variable residual + each LIVE lock), each
 * counted once — what a lender actually has working.
 */
function expected(t: PortfolioTranche): Metrics {
    const residual = parseFloat(t.investedAmount);
    const live = t.fixedLoans.filter((l) => l.isLocked);
    const liveAmount = live.reduce((s, l) => s + parseFloat(l.amount), 0);
    return {
        totalInvestments: residual + liveAmount,
        weeklyYieldEarnings: residual * VARIABLE_RATE + liveAmount * FIXED_RATE,
        weightedApy: residual * VARIABLE_APY + liveAmount * FIXED_APY,
        totalYieldEarned:
            parseFloat(t.yieldEarnings.lifetime) +
            t.fixedLoans.reduce(
                (s, l) => s + parseFloat(l.yieldEarnings.lifetime),
                0,
            ),
    };
}

describe('Portfolio.calculateYieldMetrics', () => {
    it('no locks: the summary is the variable balance', () => {
        const metrics = portfolio().calculateYieldMetrics(
            pools(tranche(1000, [], 12)),
        );

        expect(metrics.totalInvestments).toBeCloseTo(1000, 9);
        expect(metrics.weeklyYieldEarnings).toBeCloseTo(
            1000 * VARIABLE_RATE,
            9,
        );
        expect(metrics.weightedApy / metrics.totalInvestments).toBeCloseTo(
            VARIABLE_APY,
            9,
        );
        expect(metrics.totalYieldEarned).toBeCloseTo(12, 9);
    });

    it('a live lock is counted once, at its fixed rate', () => {
        // Balance 1000, of which 400 is locked: residual 600 + lock 400.
        const t = tranche(
            1000,
            [{ amount: 400, isLocked: true, lifetime: 5 }],
            7,
        );
        const metrics = portfolio().calculateYieldMetrics(pools(t));

        expect(t.investedAmount).toBe('600');
        expect(metrics.totalInvestments).toBeCloseTo(1000, 9);
        expect(metrics.weeklyYieldEarnings).toBeCloseTo(
            600 * VARIABLE_RATE + 400 * FIXED_RATE,
            9,
        );
        expect(metrics.weightedApy).toBeCloseTo(
            600 * VARIABLE_APY + 400 * FIXED_APY,
            9,
        );
        expect(metrics.totalYieldEarned).toBeCloseTo(12, 9);
    });

    it('a matured lock is not added on top of investedAmount', () => {
        // The lock matured: nothing was subtracted, so investedAmount is the
        // whole 1000 and already holds the matured 400. Before 2.10.1 the
        // summary read 1400.
        const t = tranche(
            1000,
            [{ amount: 400, isLocked: false, lifetime: 9 }],
            3,
        );
        const metrics = portfolio().calculateYieldMetrics(pools(t));

        expect(t.investedAmount).toBe('1000');
        expect(metrics.totalInvestments).toBeCloseTo(1000, 9);
        expect(metrics.weeklyYieldEarnings).toBeCloseTo(
            1000 * VARIABLE_RATE,
            9,
        );
        expect(metrics.weightedApy / metrics.totalInvestments).toBeCloseTo(
            VARIABLE_APY,
            9,
        );
        // The matured lock's yield was earned and stays in the lifetime.
        expect(metrics.totalYieldEarned).toBeCloseTo(12, 9);
    });

    it('a mix counts the residual and the live locks, each once', () => {
        // Balance 2000: live 500 + live 300 are subtracted (residual 1200,
        // which still holds the matured 250).
        const t = tranche(
            2000,
            [
                { amount: 500, isLocked: true, lifetime: 4 },
                { amount: 250, isLocked: false, lifetime: 6 },
                { amount: 300, isLocked: true, lifetime: 2 },
            ],
            8,
        );
        const metrics = portfolio().calculateYieldMetrics(pools(t));

        expect(t.investedAmount).toBe('1200');
        expect(metrics.totalInvestments).toBeCloseTo(2000, 9);
        expect(metrics.weeklyYieldEarnings).toBeCloseTo(
            1200 * VARIABLE_RATE + 800 * FIXED_RATE,
            9,
        );
        expect(metrics.weightedApy).toBeCloseTo(
            1200 * VARIABLE_APY + 800 * FIXED_APY,
            9,
        );
        expect(metrics.totalYieldEarned).toBeCloseTo(20, 9);
    });

    it('sums across pools and tranches', () => {
        const a = tranche(1000, [
            { amount: 400, isLocked: false, lifetime: 1 },
        ]);
        const b = tranche(500, [{ amount: 200, isLocked: true, lifetime: 1 }]);
        const metrics = portfolio().calculateYieldMetrics([
            ...pools(a),
            ...pools(b),
        ]);

        expect(metrics.totalInvestments).toBeCloseTo(1500, 9);
    });

    it('property: totals equal Σ (variable residual + each live lock)', () => {
        const svc = portfolio();
        const lockArb = fc.record({
            amount: fc.integer({ min: 0, max: 1_000_000 }),
            isLocked: fc.boolean(),
            lifetime: fc.integer({ min: 0, max: 10_000 }),
        });
        fc.assert(
            fc.property(
                fc.array(lockArb, { maxLength: 6 }),
                fc.integer({ min: 0, max: 1_000_000 }),
                fc.integer({ min: 0, max: 10_000 }),
                (locks, extra, variableLifetime) => {
                    const locked = locks
                        .filter((l) => l.isLocked)
                        .reduce((s, l) => s + l.amount, 0);
                    const matured = locks
                        .filter((l) => !l.isLocked)
                        .reduce((s, l) => s + l.amount, 0);
                    // The balance holds every live lock and every matured one,
                    // plus some free variable money.
                    const t = tranche(
                        locked + matured + extra,
                        locks,
                        variableLifetime,
                    );
                    const metrics = svc.calculateYieldMetrics(pools(t));
                    const want = expected(t);
                    const tol = (x: number): number =>
                        Math.max(1e-6, Math.abs(x) * 1e-9);

                    expect(
                        Math.abs(
                            metrics.totalInvestments - want.totalInvestments,
                        ),
                    ).toBeLessThanOrEqual(tol(want.totalInvestments));
                    expect(
                        Math.abs(
                            metrics.weeklyYieldEarnings -
                                want.weeklyYieldEarnings,
                        ),
                    ).toBeLessThanOrEqual(tol(want.weeklyYieldEarnings));
                    expect(
                        Math.abs(metrics.weightedApy - want.weightedApy),
                    ).toBeLessThanOrEqual(tol(want.weightedApy));
                    expect(
                        Math.abs(
                            metrics.totalYieldEarned - want.totalYieldEarned,
                        ),
                    ).toBeLessThanOrEqual(tol(want.totalYieldEarned));
                },
            ),
        );
    });
});
