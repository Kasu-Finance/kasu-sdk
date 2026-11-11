import { BigNumber, providers, utils } from 'ethers';

import {
    IKSULockingAbi__factory,
    ISystemVariablesAbi__factory,
    IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi__factory,
} from '../contracts';

import { CHAIN_CONFIGS } from './chain-configs';
import { Kasu } from './kasu';
import {
    LoyaltyFacade,
    LoyaltyLevelMismatchError,
    MULTICALL3_ADDRESS,
} from './loyalty';

const USER = utils.getAddress('0xabcdef0000000000000000000000000000000001');
const E18 = BigNumber.from(10).pow(18);
const base = CHAIN_CONFIGS.base.contracts;

const multicallInterface = new utils.Interface([
    'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)',
    'function getBlockNumber() view returns (uint256 blockNumber)',
]);
const sv = ISystemVariablesAbi__factory.createInterface();
const um = IUserManagerAbi__factory.createInterface();
const kl = IKSULockingAbi__factory.createInterface();
const ulr = IUserLoyaltyRewardsAbi__factory.createInterface();

interface ChainState {
    block: number;
    thresholds: number[];
    price: BigNumber;
    rKsu: BigNumber;
    lockedKsu: BigNumber;
    active: BigNumber;
    pending: BigNumber;
    epoch: number;
    chainLevel: number;
    rates: BigNumber[];
}

const BASE_TODAY: ChainState = {
    block: 38_000_000,
    thresholds: [100, 500],
    price: E18.mul(2),
    rKsu: BigNumber.from(0),
    lockedKsu: BigNumber.from(0),
    active: BigNumber.from(10_000_000_000),
    pending: BigNumber.from(0),
    epoch: 126,
    chainLevel: 0,
    rates: [
        BigNumber.from(0),
        BigNumber.from('19164956034632'),
        BigNumber.from('38329912069265'),
    ],
};

interface Seen {
    calls: { target: string; allowFailure: boolean; callData: string }[];
    to: string;
}

/**
 * A provider that answers one `aggregate3` by decoding each inner call and
 * replying from `chain` — so the spec checks what is ASKED as well as what is
 * done with the answers.
 */
function fakeProvider(
    chain: ChainState,
    seen: Seen[] = [],
): providers.Provider {
    const provider = new providers.StaticJsonRpcProvider(
        'http://example.invalid',
        8453,
    );
    const answer = (target: string, callData: string): string => {
        const t = target.toLowerCase();
        const selector = callData.slice(0, 10);
        if (t === MULTICALL3_ADDRESS.toLowerCase()) {
            return multicallInterface.encodeFunctionResult('getBlockNumber', [
                chain.block,
            ]);
        }
        if (t === base.SystemVariables.toLowerCase()) {
            if (selector === sv.getSighash('loyaltyThresholds')) {
                return sv.encodeFunctionResult('loyaltyThresholds', [
                    chain.thresholds,
                ]);
            }
            if (selector === sv.getSighash('ksuEpochTokenPriceFresh')) {
                return sv.encodeFunctionResult('ksuEpochTokenPriceFresh', [
                    chain.price,
                ]);
            }
        }
        if (t === base.IKSULocking.toLowerCase()) {
            if (selector === kl.getSighash('balanceOf')) {
                expect(kl.decodeFunctionData('balanceOf', callData)[0]).toBe(
                    USER,
                );
                return kl.encodeFunctionResult('balanceOf', [chain.rKsu]);
            }
            if (selector === kl.getSighash('userTotalDeposits')) {
                expect(
                    kl.decodeFunctionData('userTotalDeposits', callData)[0],
                ).toBe(USER);
                return kl.encodeFunctionResult('userTotalDeposits', [
                    chain.lockedKsu,
                ]);
            }
        }
        if (t === base.UserManager.toLowerCase()) {
            const fn = (um as utils.Interface).getFunction(selector);
            expect(
                (um as utils.Interface).decodeFunctionData(fn, callData)[0],
            ).toBe(USER);
            if (
                fn.name ===
                'userTotalPendingAndActiveDepositedAmountForCurrentEpoch'
            ) {
                return (um as utils.Interface).encodeFunctionResult(fn, [
                    chain.active,
                    chain.pending,
                ]);
            }
            if (fn.name === 'userLoyaltyLevel') {
                return (um as utils.Interface).encodeFunctionResult(fn, [
                    chain.epoch,
                    chain.chainLevel,
                ]);
            }
        }
        if (t === base.UserLoyaltyRewards.toLowerCase()) {
            const [level] = ulr.decodeFunctionData(
                'loyaltyEpochRewardRates',
                callData,
            ) as unknown as [BigNumber];
            return ulr.encodeFunctionResult('loyaltyEpochRewardRates', [
                chain.rates[level.toNumber()] ?? 0,
            ]);
        }
        throw new Error(`unexpected call ${target} ${selector}`);
    };
    provider.call = (tx): Promise<string> =>
        Promise.resolve(tx).then(async (resolved) => {
            const data = await resolved.data;
            const to = await resolved.to;
            const [calls] = multicallInterface.decodeFunctionData(
                'aggregate3',
                data ?? '0x',
            ) as unknown as [
                { target: string; allowFailure: boolean; callData: string }[],
            ];
            seen.push({ calls, to: to ?? '' });
            return multicallInterface.encodeFunctionResult('aggregate3', [
                calls.map((c) => ({
                    success: true,
                    returnData: answer(c.target, c.callData),
                })),
            ]);
        });
    return provider;
}

function facade(
    chain: ChainState,
    seen: Seen[] = [],
    lite = false,
): LoyaltyFacade {
    const provider = fakeProvider(chain, seen);
    return new LoyaltyFacade({
        provider: () => provider,
        isLiteDeployment: lite,
        contracts: base,
        stableAssetDecimals: 6,
    });
}

describe('LoyaltyFacade.getStatus', () => {
    it('reads everything in ONE multicall, at one block, and returns the status', async () => {
        const seen: Seen[] = [];
        const status = await facade(BASE_TODAY, seen).getStatus(
            USER.toLowerCase(),
        );

        expect(seen).toHaveLength(1);
        expect(seen[0].to.toLowerCase()).toBe(MULTICALL3_ADDRESS.toLowerCase());
        // block, thresholds, price, rKSU, locked, lent, level, 11 rates.
        expect(seen[0].calls).toHaveLength(18);
        expect(seen[0].calls.every((c) => !c.allowFailure)).toBe(true);

        expect(status.supported).toBe(true);
        if (!status.supported) return;
        expect(status.blockNumber).toBe(38_000_000);
        expect(status.epoch).toBe(126);
        expect(status.level).toBe(0);
        expect(status.levelCount).toBe(3);
        expect(status.thresholdsBps).toEqual([100, 500]);
        expect(status.ksuPriceUsd).toBe('2');
        expect(status.lentUsd.total).toBe('10000');
        expect(status.levels.map((l) => l.additionalKsu)).toEqual([
            '0',
            '50',
            '250',
        ]);
        expect(status.bonusRatePerLevel.map((r) => r.level)).toEqual([0, 1, 2]);
    });

    it('takes the price the contract uses (ksuEpochTokenPriceFresh) and the lent total incl. pending', async () => {
        const status = await facade({
            ...BASE_TODAY,
            price: E18.mul(4),
            active: BigNumber.from(4_000_000_000),
            pending: BigNumber.from(1_000_000_000),
            rKsu: E18.mul(20),
            lockedKsu: E18.mul(40),
            chainLevel: 1,
        }).getStatus(USER);
        if (!status.supported) throw new Error('expected supported');
        expect(status.level).toBe(1);
        expect(status.ratioBps).toBe(160);
        expect(status.lockedValueUsd).toBe('80');
        expect(status.lockedKsu).toBe('40');
        expect(status.rKsu).toBe('20');
        expect(status.levels[2]).toMatchObject({
            requiredLockedValueUsd: '250',
            additionalLockedValueUsd: '170',
            requiredRksu: '62.5',
            additionalKsu: '42.5',
        });
    });

    it('a third threshold on chain is a fourth level — read, never assumed', async () => {
        const status = await facade({
            ...BASE_TODAY,
            thresholds: [100, 500, 1_000],
            rates: [...BASE_TODAY.rates, BigNumber.from('57494868103897')],
        }).getStatus(USER);
        if (!status.supported) throw new Error('expected supported');
        expect(status.levelCount).toBe(4);
        expect(status.levels[3].additionalKsu).toBe('500');
        expect(status.bonusRatePerLevel[3].epochRate).toBe(
            '0.000057494868103897',
        );
    });

    it('throws when its own level disagrees with the contract', async () => {
        await expect(
            facade({ ...BASE_TODAY, chainLevel: 1 }).getStatus(USER),
        ).rejects.toBeInstanceOf(LoyaltyLevelMismatchError);
    });

    it('Lite: not supported, without touching the network', async () => {
        const seen: Seen[] = [];
        await expect(
            facade(BASE_TODAY, seen, true).getStatus(USER),
        ).resolves.toEqual({
            supported: false,
            reason: 'lite-deployment',
        });
        expect(seen).toHaveLength(0);
    });

    it('refuses an invalid address', async () => {
        await expect(facade(BASE_TODAY).getStatus('0x1234')).rejects.toThrow(
            'invalid address',
        );
    });
});

describe('kasu.loyalty', () => {
    it('is on every instance; XDC says not supported', async () => {
        expect(Kasu.create({ chain: 'base' }).loyalty).toBeInstanceOf(
            LoyaltyFacade,
        );
        for (const chain of ['xdc', 'xdc-usdc'] as const) {
            await expect(
                Kasu.create({ chain }).loyalty.getStatus(USER),
            ).resolves.toEqual({ supported: false, reason: 'lite-deployment' });
        }
    });

    it('reads through the instance provider', async () => {
        const seen: Seen[] = [];
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: fakeProvider(BASE_TODAY, seen),
        });
        const status = await kasu.loyalty.getStatus(USER);
        expect(status.supported).toBe(true);
        expect(seen).toHaveLength(1);
    });
});
