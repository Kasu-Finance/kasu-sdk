import { ContractTransaction } from 'ethers';

import { UserLending } from '../services/UserLending/user-lending';

import { DepositParams, KycParams, WithdrawParams } from './types';

/**
 * High-level facade for deposit and withdrawal operations.
 *
 * Integrators use this to submit on-chain transactions without
 * worrying about internal encoding details.
 */
export class DepositsFacade {
    constructor(
        private _userLending: UserLending,
        private _chainId: string,
    ) {}

    /**
     * Submit a deposit request.
     *
     * The integrator must first obtain a KYC signature via the Nexera flow
     * using the params from `buildKycParams()`.
     *
     * ```ts
     * const kycParams = kasu.deposits.buildKycParams('0xUser...');
     * // ... obtain kycSignature from your backend via Nexera ...
     * const tx = await kasu.deposits.deposit({
     *   poolId: '0x...',
     *   trancheId: '0x...',
     *   amount: parseUnits('1000', 6),
     *   kycSignature: { blockExpiration, signature },
     * });
     * ```
     */
    async deposit(params: DepositParams): Promise<ContractTransaction> {
        return await this._userLending.requestDepositWithKyc(
            params.poolId,
            params.trancheId,
            params.amount,
            params.swapData ?? '0x',
            params.fixedTermConfigId ?? 0,
            params.depositData ?? '0x',
            params.kycSignature,
            params.ethValue ?? '0',
        );
    }

    /**
     * Submit a withdrawal request for a specific USDC amount.
     */
    async withdraw(params: WithdrawParams): Promise<ContractTransaction> {
        return await this._userLending.requestWithdrawalInUSDC(
            params.poolId,
            params.trancheId,
            params.amount,
        );
    }

    /**
     * Withdraw the entire balance from a tranche.
     */
    async withdrawMax(
        poolId: string,
        trancheId: string,
        userAddress: string,
    ): Promise<ContractTransaction> {
        return await this._userLending.requestWithdrawalMax(
            poolId,
            trancheId,
            userAddress,
        );
    }

    /**
     * Build KYC signature parameters for the Nexera verification flow.
     *
     * The integrator is responsible for sending these to their backend,
     * which obtains the signature from Nexera's signing service.
     */
    buildKycParams(userAddress: `0x${string}`): KycParams {
        return this._userLending.buildKycSignatureParams(
            userAddress,
            this._chainId,
        );
    }

    /**
     * Check whether the pool is currently in a clearing period
     * (deposits/withdrawals are temporarily paused).
     */
    async isClearingPending(poolId: string): Promise<boolean> {
        return await this._userLending.isClearingPending(poolId);
    }

    /**
     * Get the current epoch number.
     */
    async getCurrentEpoch(): Promise<string> {
        return await this._userLending.getCurrentEpoch();
    }
}
