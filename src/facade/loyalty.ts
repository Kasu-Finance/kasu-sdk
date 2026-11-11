import { Provider } from '@ethersproject/providers';
import { BigNumber, Contract, utils } from 'ethers';

import {
    IKSULockingAbi__factory,
    ISystemVariablesAbi__factory,
    IUserLoyaltyRewardsAbi__factory,
    IUserManagerAbi__factory,
} from '../contracts';
import {
    buildLoyaltyStatus,
    loyaltyLevelOf,
    LoyaltyStatus,
    MAX_ADDITIONAL_LOYALTY_LEVELS,
} from '../domain/loyalty';

/**
 * Multicall3 — the same address on every EVM chain it is deployed to
 * (https://www.multicall3.com). One `eth_call` to it reads everything below
 * in ONE block, which is what makes the figures consistent with each other.
 */
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const MULTICALL3_ABI = [
    'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)',
    'function getBlockNumber() view returns (uint256 blockNumber)',
];

/** The SDK's own reading disagreed with `UserManager.userLoyaltyLevel` at the same block. */
export class LoyaltyLevelMismatchError extends Error {
    constructor(
        public readonly chainLevel: number,
        public readonly computedLevel: number,
        public readonly blockNumber: number,
    ) {
        super(
            `loyalty: the contract reports level ${String(chainLevel)} but the SDK computes ${String(computedLevel)} at block ${String(blockNumber)}`,
        );
        this.name = 'LoyaltyLevelMismatchError';
    }
}

export interface LoyaltyFacadeConfig {
    /** The provider to read through (resolved per call, so `connect` is honoured). */
    provider: () => Provider;
    isLiteDeployment: boolean;
    contracts: {
        SystemVariables: string;
        UserManager: string;
        IKSULocking: string;
        UserLoyaltyRewards: string;
    };
    stableAssetDecimals: number;
    /** Defaults to `MULTICALL3_ADDRESS`. */
    multicall3Address?: string;
}

interface Aggregate3Result {
    success: boolean;
    returnData: string;
}

/**
 * Loyalty level for one lender — the level, every level's threshold, what
 * reaching each one takes, and each level's KSU bonus rate.
 *
 * Base only: Lite deployments (XDC) have no KSU, no locking and no levels, and
 * `getStatus` says so (`{ supported: false }`) without touching the network.
 */
export class LoyaltyFacade {
    constructor(private readonly _config: LoyaltyFacadeConfig) {}

    /**
     * The lender's loyalty status, read from chain in ONE call (Multicall3),
     * so every figure comes from the same block.
     *
     * Reads: `SystemVariables.loyaltyThresholds`, `ksuEpochTokenPriceFresh`
     * (the price the contract's own level read uses); `KSULocking.balanceOf`
     * (rKSU) and `userTotalDeposits` (KASU locked);
     * `UserManager.userTotalPendingAndActiveDepositedAmountForCurrentEpoch`
     * and `userLoyaltyLevel`; `UserLoyaltyRewards.loyaltyEpochRewardRates` for
     * levels 0..10. The level is computed from those inputs exactly as
     * `UserManager._userLoyaltyLevel` does and checked against
     * `userLoyaltyLevel`; a disagreement throws `LoyaltyLevelMismatchError`
     * rather than show requirements the contract would not honour.
     *
     * The level counts LOCKED KASU (rKSU), never KASU held in a wallet:
     * buying KASU alone does not change it. `levels[n].additionalKsu` is the
     * extra KASU to lock at full weight (the 720-day lock, 1 rKSU per KSU) to
     * reach level n at today's lent amount and price.
     *
     * ```ts
     * const status = await kasu.loyalty.getStatus(address);
     * if (status.supported) {
     *     const gold = status.levels[2];
     *     prefillBuy(gold.additionalKsu); // exact decimal string, or null
     * }
     * ```
     *
     * @throws on an invalid address, a failed read, or a chain state outside
     *   what the contract allows (`RangeError`).
     */
    async getStatus(user: string): Promise<LoyaltyStatus> {
        if (!utils.isAddress(user)) {
            throw new Error(`loyalty.getStatus: invalid address "${user}"`);
        }
        if (this._config.isLiteDeployment) {
            return { supported: false, reason: 'lite-deployment' };
        }
        const address = utils.getAddress(user);
        const { contracts } = this._config;
        const systemVariables = ISystemVariablesAbi__factory.createInterface();
        const userManager = IUserManagerAbi__factory.createInterface();
        const locking = IKSULockingAbi__factory.createInterface();
        const rewards = IUserLoyaltyRewardsAbi__factory.createInterface();
        const multicallAddress =
            this._config.multicall3Address ?? MULTICALL3_ADDRESS;
        const multicall = new Contract(
            multicallAddress,
            MULTICALL3_ABI,
            this._config.provider(),
        );
        const multicallInterface = multicall.interface;

        const rateLevels = Array.from(
            { length: MAX_ADDITIONAL_LOYALTY_LEVELS + 1 },
            (_, level) => level,
        );
        const calls = [
            {
                target: multicallAddress,
                callData:
                    multicallInterface.encodeFunctionData('getBlockNumber'),
            },
            {
                target: contracts.SystemVariables,
                callData:
                    systemVariables.encodeFunctionData('loyaltyThresholds'),
            },
            {
                target: contracts.SystemVariables,
                callData: systemVariables.encodeFunctionData(
                    'ksuEpochTokenPriceFresh',
                ),
            },
            {
                target: contracts.IKSULocking,
                callData: locking.encodeFunctionData('balanceOf', [address]),
            },
            {
                target: contracts.IKSULocking,
                callData: locking.encodeFunctionData('userTotalDeposits', [
                    address,
                ]),
            },
            {
                target: contracts.UserManager,
                callData: userManager.encodeFunctionData(
                    'userTotalPendingAndActiveDepositedAmountForCurrentEpoch',
                    [address],
                ),
            },
            {
                target: contracts.UserManager,
                callData: userManager.encodeFunctionData('userLoyaltyLevel', [
                    address,
                ]),
            },
            ...rateLevels.map((level) => ({
                target: contracts.UserLoyaltyRewards,
                callData: rewards.encodeFunctionData(
                    'loyaltyEpochRewardRates',
                    [level],
                ),
            })),
        ].map((call) => ({ ...call, allowFailure: false }));

        const results = (await multicall.callStatic.aggregate3(
            calls,
        )) as Aggregate3Result[];
        if (results.length !== calls.length) {
            throw new Error(
                'loyalty.getStatus: multicall returned the wrong number of results',
            );
        }
        const data = results.map((r) => r.returnData);

        const big = (v: BigNumber): bigint => BigInt(v.toString());
        const [blockNumber] = multicallInterface.decodeFunctionResult(
            'getBlockNumber',
            data[0],
        ) as unknown as [BigNumber];
        const [thresholds] = systemVariables.decodeFunctionResult(
            'loyaltyThresholds',
            data[1],
        ) as unknown as [BigNumber[]];
        const [ksuPrice] = systemVariables.decodeFunctionResult(
            'ksuEpochTokenPriceFresh',
            data[2],
        ) as unknown as [BigNumber];
        const [rKsu] = locking.decodeFunctionResult(
            'balanceOf',
            data[3],
        ) as unknown as [BigNumber];
        const [lockedKsu] = locking.decodeFunctionResult(
            'userTotalDeposits',
            data[4],
        ) as unknown as [BigNumber];
        const [activeLent, pendingLent] = userManager.decodeFunctionResult(
            'userTotalPendingAndActiveDepositedAmountForCurrentEpoch',
            data[5],
        ) as unknown as [BigNumber, BigNumber];
        const [epoch, chainLevel] = userManager.decodeFunctionResult(
            'userLoyaltyLevel',
            data[6],
        ) as unknown as [BigNumber, number];
        const epochRewardRates = rateLevels.map((level) => {
            const [rate] = rewards.decodeFunctionResult(
                'loyaltyEpochRewardRates',
                data[7 + level],
            ) as unknown as [BigNumber];
            return big(rate);
        });

        const state = {
            thresholdsBps: thresholds.map(big),
            ksuPrice: big(ksuPrice),
            rKsu: big(rKsu),
            lockedKsu: big(lockedKsu),
            activeLent: big(activeLent),
            pendingLent: big(pendingLent),
            epochRewardRates,
            stableDecimals: this._config.stableAssetDecimals,
        };
        const block = blockNumber.toNumber();
        const computed = loyaltyLevelOf(
            state.rKsu,
            state.ksuPrice,
            state.activeLent + state.pendingLent,
            state.thresholdsBps,
        );
        if (computed !== Number(chainLevel)) {
            throw new LoyaltyLevelMismatchError(
                Number(chainLevel),
                computed,
                block,
            );
        }
        return buildLoyaltyStatus(state, {
            blockNumber: block,
            epoch: epoch.toNumber(),
        });
    }
}
