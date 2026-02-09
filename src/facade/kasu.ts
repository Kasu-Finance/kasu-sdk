import { KasuSdk } from '../kasu-sdk';
import { SdkConfig } from '../sdk-config';

import { CHAIN_CONFIGS } from './chain-configs';
import { DepositsFacade } from './deposits';
import { StrategiesFacade } from './strategies';
import { ChainConfigEntry, KasuOptions, SupportedChain } from './types';
import { PortfolioFacade } from './user-portfolio';

/**
 * High-level entry point for external integrators.
 *
 * Provides three domain facades — `strategies`, `deposits`, `portfolio` — and
 * exposes the underlying `KasuSdk` services via `.services` for power-users.
 *
 * ```ts
 * import { Kasu } from '@kasufinance/kasu-sdk';
 *
 * const kasu = Kasu.create({ chain: 'base', signerOrProvider: provider });
 *
 * // Browse strategies
 * const strategies = await kasu.strategies.getAll();
 *
 * // Deposit
 * const tx = await kasu.deposits.deposit({ poolId, trancheId, amount, kycSignature });
 *
 * // User positions
 * const positions = await kasu.portfolio.getPositions(userAddress);
 * ```
 */
export class Kasu {
    /** Browse lending strategies, APY, capacity. */
    public readonly strategies: StrategiesFacade;
    /** Deposit, withdraw, KYC helpers. */
    public readonly deposits: DepositsFacade;
    /** User positions, yields, transaction history. */
    public readonly portfolio: PortfolioFacade;

    private readonly _sdk: KasuSdk;
    private readonly _chainConfig: ChainConfigEntry;

    private constructor(
        sdk: KasuSdk,
        chainConfig: ChainConfigEntry,
    ) {
        this._sdk = sdk;
        this._chainConfig = chainConfig;

        this.strategies = new StrategiesFacade(
            sdk.DataService,
            sdk.UserLending,
        );

        this.deposits = new DepositsFacade(
            sdk.UserLending,
            chainConfig.chainId.toString(),
        );

        this.portfolio = new PortfolioFacade(
            sdk.DataService,
            sdk.UserLending,
            sdk.Portfolio,
        );
    }

    /**
     * Create a Kasu instance with built-in chain config.
     *
     * ```ts
     * // Minimal setup — uses built-in Base mainnet config
     * const kasu = Kasu.create({ chain: 'base', signerOrProvider: provider });
     *
     * // Custom config override
     * const kasu = Kasu.create({
     *   chain: 'base',
     *   signerOrProvider: signer,
     *   configOverrides: { UNUSED_LENDING_POOL_IDS: ['0x...'] },
     * });
     *
     * // Fully custom chain
     * const kasu = Kasu.create({
     *   chain: { chainId: 123, name: 'MyChain', ... },
     *   signerOrProvider: provider,
     * });
     * ```
     */
    static create(options: KasuOptions): Kasu {
        const chainConfig = resolveChainConfig(options.chain);
        const overrides = options.configOverrides ?? {};

        const sdkConfig = new SdkConfig({
            subgraphUrl: overrides.subgraphUrl ?? chainConfig.subgraphUrl,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            contracts: overrides.contracts ?? chainConfig.contracts,
            directusUrl:
                overrides.directusUrl ?? chainConfig.directusUrl,
            UNUSED_LENDING_POOL_IDS:
                overrides.UNUSED_LENDING_POOL_IDS ??
                chainConfig.unusedPoolIds,
            isLiteDeployment:
                overrides.isLiteDeployment ?? chainConfig.isLiteDeployment,
            poolMetadataMapping:
                overrides.poolMetadataMapping ??
                chainConfig.poolMetadataMapping,
        });

        const sdk = new KasuSdk(sdkConfig, options.signerOrProvider);
        return new Kasu(sdk, chainConfig);
    }

    /**
     * Access the underlying `KasuSdk` services for advanced use cases.
     *
     * ```ts
     * const locks = await kasu.services.Locking.getUserLocks(address);
     * ```
     */
    get services(): KasuSdk {
        return this._sdk;
    }

    /** The resolved chain configuration. */
    get chainConfig(): ChainConfigEntry {
        return this._chainConfig;
    }

    /** Whether this deployment has KSU token / locking features. */
    get isLiteDeployment(): boolean {
        return this._chainConfig.isLiteDeployment;
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveChainConfig(
    chain: SupportedChain | ChainConfigEntry,
): ChainConfigEntry {
    if (typeof chain === 'string') {
        return CHAIN_CONFIGS[chain];
    }
    return chain;
}
