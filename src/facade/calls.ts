import { BigNumber, BigNumberish } from 'ethers';

import {
    encodeCancelDepositCall,
    encodeCancelWithdrawalCall,
    encodeRequestWithdrawalCall,
    encodeWithdrawAtExpiryCall,
    SponsoredCall,
    SponsoredCallInputError,
} from '../domain/sponsored-calls';
import { UserLending } from '../services/UserLending/user-lending';

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/** What `kasu.calls.requestWithdrawal` takes — `WithdrawFlowInput`'s shape. */
export interface RequestWithdrawalCallParams {
    poolId: string;
    trancheId: string;
    /**
     * Base units of the stable asset, or `'max'` for every share the lender
     * holds in the tranche. Same code as `WithdrawFlowInput.amount`.
     */
    amount: BigNumber | 'max';
    /** The lender — whose shares `'max'` reads. The relay sends as them. */
    userAddress: string;
}

/**
 * Encoded, ready-to-sponsor `LendingPoolManager` calls — read, then encode,
 * NEVER send. Each returns `{ kind, call }`: post `kind` and `[call]` to a
 * sponsored relay (or `submitSponsoredCall`), unchanged.
 *
 * ```ts
 * const { kind, call } = kasu.calls.cancelDepositRequest(poolId, dNftId);
 * ```
 *
 * `call.to` is always THIS chain's `LendingPoolManager`, from the chain
 * config — the same address the deposit flow approves and calls — so no app
 * supplies the one argument whose wrong value the relay refuses outright.
 *
 * Works on a read-only instance: the only chain access is the share read a
 * withdrawal needs, and nothing is signed or sent here.
 */
export class CallsFacade {
    constructor(
        private readonly _userLending: UserLending,
        private readonly _lendingPoolManager: string,
    ) {}

    /**
     * `requestWithdrawal(pool, tranche, shares)` for an asset amount or
     * `'max'`, converted into shares exactly as the direct path does it
     * (`UserLending.requestWithdrawalInAsset` / `requestWithdrawalMax`): the
     * tranche's `convertToShares(amount)`, or the lender's whole
     * `balanceOf(userAddress)`, read now.
     *
     * Rejects with `SponsoredCallInputError` — before anything is sent — for
     * a non-positive amount, a malformed address, or a conversion that comes
     * to ZERO shares (an empty position, or dust below one share), which the
     * contract would revert and the relay refuses.
     */
    async requestWithdrawal(
        params: RequestWithdrawalCallParams,
    ): Promise<SponsoredCall> {
        const { poolId, trancheId, amount, userAddress } = params;
        if (typeof userAddress !== 'string' || !ADDRESS_RE.test(userAddress)) {
            throw new SponsoredCallInputError('user');
        }
        if (typeof trancheId !== 'string' || !ADDRESS_RE.test(trancheId)) {
            throw new SponsoredCallInputError('tranche');
        }
        let shares: BigNumber;
        if (amount === 'max') {
            // Lowercased, as `WithdrawFlow` hands `withdrawMax` the address.
            shares = await this._userLending.getWithdrawalSharesMax(
                trancheId,
                userAddress.toLowerCase(),
            );
        } else {
            if (!BigNumber.isBigNumber(amount) || amount.lte(0)) {
                throw new SponsoredCallInputError('non-positive-amount');
            }
            shares = await this._userLending.getWithdrawalSharesForAssets(
                trancheId,
                amount,
            );
        }
        return encodeRequestWithdrawalCall(
            this._lendingPoolManager,
            poolId,
            trancheId,
            shares,
        );
    }

    /** `cancelDepositRequest(pool, dNftId)` — the pending deposit's NFT id. */
    cancelDepositRequest(poolId: string, dNftId: BigNumberish): SponsoredCall {
        return encodeCancelDepositCall(
            this._lendingPoolManager,
            poolId,
            dNftId,
        );
    }

    /** `cancelWithdrawalRequest(pool, wNftId)` — the pending withdrawal's NFT id. */
    cancelWithdrawalRequest(
        poolId: string,
        wNftId: BigNumberish,
    ): SponsoredCall {
        return encodeCancelWithdrawalCall(
            this._lendingPoolManager,
            poolId,
            wNftId,
        );
    }

    /**
     * `requestFixedTermDepositWithdrawal(pool, fixedTermDepositId)` — what
     * `UserLending.withdrawAtExpiry(pool, lockId)` sends: the pool and the
     * LOCK id, no tranche.
     */
    withdrawAtExpiry(
        poolId: string,
        fixedTermDepositId: BigNumberish,
    ): SponsoredCall {
        return encodeWithdrawAtExpiryCall(
            this._lendingPoolManager,
            poolId,
            fixedTermDepositId,
        );
    }
}
