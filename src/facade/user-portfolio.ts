import { Provider } from '@ethersproject/providers';

import { deriveRequestState, RequestState } from '../domain/requests';
import { DataService } from '../services/DataService/data-service';
import { Portfolio } from '../services/Portfolio/portfolio';
import { UserRequest } from '../services/UserLending/types';
import { UserLending } from '../services/UserLending/user-lending';

import { UserPositions } from './types';

/**
 * High-level facade for querying a user's portfolio, positions, and history.
 *
 * Orchestrates DataService, UserLending, and Portfolio services so the caller
 * only needs to provide a wallet address.
 */
export class PortfolioFacade {
    constructor(
        private _dataService: DataService,
        private _userLending: UserLending,
        private _portfolio: Portfolio,
    ) {}

    /**
     * Fetch a user's complete portfolio: per-pool positions and aggregate summary.
     *
     * ```ts
     * const positions = await kasu.portfolio.getPositions('0xUser...');
     * console.log(positions.summary.current.totalLendingPoolInvestments);
     * ```
     *
     * @param userAddress - Wallet address.
     * @param provider    - Optional separate provider for balance queries (useful when the
     *                      SDK was initialised with a Signer but you need a read-only provider).
     */
    async getPositions(
        userAddress: string,
        provider?: Provider,
    ): Promise<UserPositions> {
        const currentEpoch = await this._userLending.getCurrentEpoch();

        const poolOverviews = await this._dataService.getPoolOverview(
            currentEpoch,
        );

        const pools = await this._portfolio.getPortfolioLendingData(
            userAddress,
            poolOverviews,
            currentEpoch,
            provider,
        );

        const summary = await this._portfolio.getPortfolioSummary(
            userAddress,
            pools,
            currentEpoch,
        );

        return { pools, summary };
    }

    /**
     * Fetch a user's full transaction history (deposits, withdrawals, cancellations).
     */
    async getTransactionHistory(
        userAddress: `0x${string}`,
    ): Promise<UserRequest[]> {
        const currentEpoch = await this._userLending.getCurrentEpoch();
        return await this._userLending.getUserRequests(
            userAddress,
            currentEpoch,
        );
    }

    /**
     * The same history, already derived into `RequestState` rows — status
     * code, kind, signed amount, the cancelled-amount recovery, the bundled
     * submission count and the cycle-open signal.
     *
     * ```ts
     * const rows = await kasu.portfolio.getRequestStates('0xUser...');
     * rows.filter((r) => r.statusCode === 'pending');
     * ```
     *
     * Every application derives this from `getTransactionHistory` anyway, and
     * the derivation is the part they were each getting subtly differently.
     * Words are still the caller's: render `statusCode` in your own
     * vocabulary, and call `getTrancheDisplayName` on `trancheName` at the
     * view boundary.
     */
    async getRequestStates(
        userAddress: `0x${string}`,
    ): Promise<RequestState[]> {
        const requests = await this.getTransactionHistory(userAddress);
        return requests.map(deriveRequestState);
    }
}
