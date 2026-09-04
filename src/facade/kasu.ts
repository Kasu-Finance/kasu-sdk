import { Provider } from '@ethersproject/providers';
import { providers, Signer } from 'ethers';

import { KasuSdk } from '../kasu-sdk';
import { SdkConfig, SdkConfigOptions } from '../sdk-config';

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
 * // Read-only — no wallet needed, uses the chain's default RPC
 * const kasu = Kasu.create({ chain: 'base' });
 * const strategies = await kasu.strategies.getAll();
 *
 * // Writable — same config, bound to a signer
 * const signed = kasu.connect(signer);
 * const tx = await signed.deposits.deposit({ poolId, trancheId, amount, kycSignature });
 *
 * // User positions (read-only is enough)
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
    private readonly _signerOrProvider: Provider | Signer;
    /**
     * Kept so `connect(signer)` can rebuild an identical instance. A connected
     * instance that silently dropped the overrides would query a different set
     * of pools than the read-only one it came from.
     */
    private readonly _configOverrides: Partial<SdkConfigOptions>;

    private constructor(
        sdk: KasuSdk,
        chainConfig: ChainConfigEntry,
        signerOrProvider: Provider | Signer,
        configOverrides: Partial<SdkConfigOptions>,
    ) {
        this._sdk = sdk;
        this._chainConfig = chainConfig;
        this._signerOrProvider = signerOrProvider;
        this._configOverrides = configOverrides;

        this.strategies = new StrategiesFacade(
            sdk.DataService,
            sdk.UserLending,
        );

        this.deposits = new DepositsFacade(
            sdk.UserLending,
            chainConfig.chainId.toString(),
            !Signer.isSigner(signerOrProvider),
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
     * `signerOrProvider` is optional: without one the instance is READ-ONLY on
     * `chainConfig.rpcUrls[0]`. Use `connect(signer)` when a wallet arrives.
     *
     * ```ts
     * // Minimal setup — read-only, built-in Base mainnet config
     * const kasu = Kasu.create({ chain: 'base' });
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
            // Follow the chain's own token rather than `SdkConfig`'s default
            // of 6. Every live deployment happens to be 6dp today, so the
            // default was right by luck; the next one need not be.
            stableAssetDecimals:
                overrides.stableAssetDecimals ??
                chainConfig.stableAsset.decimals,
        });

        const signerOrProvider =
            options.signerOrProvider ??
            defaultProvider(
                chainConfig,
                typeof options.chain === 'string'
                    ? options.chain
                    : chainConfig.name,
            );

        const sdk = new KasuSdk(sdkConfig, signerOrProvider);
        return new Kasu(sdk, chainConfig, signerOrProvider, overrides);
    }

    /**
     * A NEW instance bound to `signer`, with the same chain config and the same
     * `configOverrides` — the writable counterpart of a read-only instance.
     *
     * Named after `contract.connect(signer)` in ethers, and behaves the same
     * way: the receiver is not mutated, so a read-only `Kasu` stays read-only
     * and can keep serving public data after a wallet connects.
     *
     * ```ts
     * const kasu = Kasu.create({ chain: 'base' });        // read-only
     * const signed = kasu.connect(await getSigner());     // writable
     * ```
     */
    connect(signer: Signer): Kasu {
        return Kasu.create({
            chain: this._chainConfig,
            signerOrProvider: signer,
            configOverrides: this._configOverrides,
        });
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

    /**
     * True when this instance was built from a Provider rather than a Signer,
     * so every read works and every write is refused. Call `connect(signer)`
     * for a writable instance.
     */
    get isReadOnly(): boolean {
        return !Signer.isSigner(this._signerOrProvider);
    }

    /**
     * The provider this instance reads through — the signer's own provider when
     * it was created from a signer.
     *
     * Throws for a signer with no provider attached (an offline signer can sign
     * but cannot read), because there is no provider to hand back and returning
     * `undefined` would only move the failure somewhere less obvious.
     */
    get provider(): Provider {
        if (Signer.isSigner(this._signerOrProvider)) {
            const provider = this._signerOrProvider.provider;
            if (!provider) {
                throw new Error(
                    'Kasu: the signer this instance was created with has no provider attached',
                );
            }
            return provider;
        }
        return this._signerOrProvider;
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * The read-only provider used when the caller passes no `signerOrProvider`.
 *
 * `StaticJsonRpcProvider` rather than `JsonRpcProvider`: the chain id is known
 * from the config, so it skips the `eth_chainId` round trip on every call and
 * never re-detects the network — the right choice for an endpoint that serves
 * exactly one chain.
 *
 * Only `rpcUrls[0]` is used. The list is a starting preference, not a failover
 * strategy: an app that needs failover builds its own provider and passes it
 * in, and baking a retry policy in here would hide outages from the app that
 * has to report them.
 *
 * Constructed through the `ethers` namespace rather than by importing
 * `StaticJsonRpcProvider` from `@ethersproject/providers` directly. `ethers` is
 * the only provider package the rollup config marks external, so this picks up
 * the CONSUMER's build — the Node one under Node, the browser one in a browser.
 * Importing the class directly would inline the browser transport into the
 * bundle, and its `fetch` call carries `referrer: 'client'`, which Node rejects
 * outright ("Referrer \"client\" is not a valid URL"). It would also give the
 * SDK a second provider implementation, so `instanceof` against the consumer's
 * ethers would quietly fail.
 */
function defaultProvider(
    chainConfig: ChainConfigEntry,
    chainLabel: string,
): Provider {
    const url = chainConfig.rpcUrls[0];
    if (!url) {
        throw new Error(
            `Kasu.create: chain "${chainLabel}" has no default RPC (retired); pass signerOrProvider`,
        );
    }
    return new providers.StaticJsonRpcProvider(url, chainConfig.chainId);
}

function resolveChainConfig(
    chain: SupportedChain | ChainConfigEntry,
): ChainConfigEntry {
    if (typeof chain === 'string') {
        return CHAIN_CONFIGS[chain];
    }
    return chain;
}
