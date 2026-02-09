# Kasu SDK

`@kasufinance/kasu-sdk` is the shared TypeScript/JavaScript toolkit used by Kasu
frontends to interact with the Kasu protocol. It wraps the core smart
contracts, subgraphs, and Directus CMS in a single object so that dapps can
query pool data, compute portfolio statistics, and submit locking or lending
transactions without re-implementing the plumbing.

## Installation

```bash
npm install @kasufinance/kasu-sdk
# or
yarn add @kasufinance/kasu-sdk
```

The SDK is built against `ethers@5`, so make sure your project already depends
on it (or install it alongside the SDK).

## Runtime requirements

- **Node or browser environment with fetch/XHR** – when using the SDK on the
  server (Next.js `app` router actions, serverless functions, etc.) you must
  provide an XHR implementation because Directus uses it under the hood:

  ```ts
  // server.ts
  import { XMLHttpRequest } from 'xhr2';
  global.XMLHttpRequest = XMLHttpRequest;
  ```

- **Provider/Signer** – pass an `ethers` `Signer` for write actions or a
  `Provider` for read-only usage. The SDK does not create its own provider,
  so you are free to reuse whatever the dapp already uses.

## Integrator Quick Start

The simplest way to use the SDK is via the `Kasu` facade, which bundles built-in
chain configs and provides three domain-specific interfaces:

```ts
import { JsonRpcProvider } from '@ethersproject/providers';
import { Kasu } from '@kasufinance/kasu-sdk';

const provider = new JsonRpcProvider('https://mainnet.base.org');
const kasu = Kasu.create({ chain: 'base', signerOrProvider: provider });

// 1. Browse lending strategies
const strategies = await kasu.strategies.getAll();
for (const s of strategies) {
  console.log(s.name, `${(s.apy * 100).toFixed(1)}% APY`, `TVL: $${s.tvl.total}`);
}

// 2. Get a single strategy and check deposit limits
const strategy = await kasu.strategies.getById(poolId);
const limits = kasu.strategies.calculateDepositLimits(strategy.tranches[0]);
console.log(`Min: ${limits.min} USDC, Max: ${limits.max} USDC`);

// 3. Deposit (requires a Signer and KYC signature from Nexera)
const kycParams = kasu.deposits.buildKycParams('0xYourAddress...');
// ... obtain kycSignature via your backend + Nexera signing service ...
const tx = await kasu.deposits.deposit({
  poolId: strategy.id,
  trancheId: strategy.tranches[0].id,
  amount: parseUnits('1000', 6), // 1000 USDC
  kycSignature: { blockExpiration, signature },
});

// 4. Check user positions and yield
const positions = await kasu.portfolio.getPositions('0xUserAddress...');
console.log(positions.summary.current.totalLendingPoolInvestments);

// 5. Withdraw
const withdrawTx = await kasu.deposits.withdraw({
  poolId: strategy.id,
  trancheId: strategy.tranches[0].id,
  amount: parseUnits('500', 6),
});
```

### Supported chains

| Chain | Usage | Deployment Type |
|-------|-------|-----------------|
| Base  | `Kasu.create({ chain: 'base', ... })` | Full (KSU + lending) |
| XDC   | `Kasu.create({ chain: 'xdc', ... })` | Lite (lending only) |
| Plume | `Kasu.create({ chain: 'plume', ... })` | Lite (lending only) |

You can also provide a custom `ChainConfigEntry` instead of a chain name:

```ts
const kasu = Kasu.create({
  chain: { chainId: 123, name: 'MyChain', isLiteDeployment: true, contracts: { ... }, ... },
  signerOrProvider: provider,
});
```

### Facade API overview

| Facade | Methods | Purpose |
|--------|---------|---------|
| `kasu.strategies` | `getAll()`, `getById()`, `getPlatformStats()`, `calculateDepositLimits()` | Browse pools, APY, capacity |
| `kasu.deposits` | `deposit()`, `withdraw()`, `withdrawMax()`, `buildKycParams()`, `isClearingPending()` | Submit transactions |
| `kasu.portfolio` | `getPositions()`, `getTransactionHistory()` | User balances, yield, history |

For advanced use cases (locking, swaps, NFTs), access the underlying services directly:

```ts
const locks = await kasu.services.Locking.getUserLocks('0x...');
```

---

## Low-level SDK Configuration

The sections below show how to configure the SDK manually using `SdkConfig` and
`KasuSdk` directly. Most integrators should use the `Kasu` facade above instead.

### Full Deployment (Base)

Full deployments have all features including KSU token, locking, and loyalty rewards:

```ts
import { JsonRpcProvider } from '@ethersproject/providers';
import { KasuSdk, SdkConfig } from '@kasufinance/kasu-sdk';
import { XMLHttpRequest } from 'xhr2';

global.XMLHttpRequest = XMLHttpRequest; // required on Node runtimes

const provider = new JsonRpcProvider(process.env.RPC_URL!, { skipFetchSetup: true });

const config = new SdkConfig({
  contracts: {
    KSUToken: '0x…',         // Required for Full deployment
    IKSULocking: '0x…',
    IKSULockBonus: '0x…',
    UserManager: '0x…',
    LendingPoolManager: '0x…',
    KasuAllowList: '0x…',
    SystemVariables: '0x…',
    UserLoyaltyRewards: '0x…',
    KsuPrice: '0x…',
    ClearingCoordinator: '0x…',
    KasuNFTs: '0x…',         // Required for Full deployment
    ExternalTVL: '0x…',
  },
  UNUSED_LENDING_POOL_IDS: [''],
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl: 'https://api.goldsky.com/.../kasu-base/v1/gn',
  isLiteDeployment: false,   // Full deployment (default)
});

export const kasuSdk = new KasuSdk(config, provider);
```

### Lite Deployment (XDC, Plume)

Lite deployments don't have KSU token, locking, or loyalty features. They still support
KYC/KYB gated deposits and all lending pool functionality:

```ts
const config = new SdkConfig({
  contracts: {
    // KSUToken: undefined,   // Not available on Lite
    IKSULocking: '0x…',       // Lite version contract
    IKSULockBonus: '0x…',     // Lite version contract
    UserManager: '0x…',       // Lite version contract
    LendingPoolManager: '0x…',
    KasuAllowList: '0x…',
    SystemVariables: '0x…',
    UserLoyaltyRewards: '0x…', // Lite version contract
    KsuPrice: '0x…',           // Lite version contract
    ClearingCoordinator: '0x…',
    // KasuNFTs: undefined,    // Not available on Lite
    ExternalTVL: '0x…',
  },
  UNUSED_LENDING_POOL_IDS: [''],
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl: 'https://api.goldsky.com/.../kasu-xdc/v1.0.0/gn',
  isLiteDeployment: true,     // Lite deployment - disables KSU features
});

export const kasuSdk = new KasuSdk(config, provider);
```

### Multi-Chain Configuration

For frontends supporting multiple chains, create a config per chain:

```ts
// config/chains.ts
const chainConfigs = {
  base: {
    chainId: 8453,
    subgraphUrl: 'https://api.goldsky.com/.../kasu-base/v1/gn',
    isLiteDeployment: false,
    contracts: { /* Base contract addresses */ },
  },
  xdc: {
    chainId: 50,
    subgraphUrl: 'https://api.goldsky.com/.../kasu-xdc/v1.0.0/gn',
    isLiteDeployment: true,
    contracts: { /* XDC contract addresses */ },
  },
};

// Create SDK for current chain
const chainConfig = chainConfigs[currentChain];
const config = new SdkConfig({
  ...chainConfig,
  directusUrl: 'https://kasu-finance.directus.app/',
  UNUSED_LENDING_POOL_IDS: [''],
});
const sdk = new KasuSdk(config, provider);
```

See `kasu-fe-next/src/config/sdk` in the Kasu frontend repository for full
mainnet and testnet examples, including how Kasu fetches unused pool ids before
instantiating the SDK.

### Low-level Quick start

```ts
import { JsonRpcProvider } from '@ethersproject/providers';
import { KasuSdk } from '@kasufinance/kasu-sdk';

const provider = new JsonRpcProvider(RPC_URL);
const sdk = new KasuSdk(config, provider);

const pools = await sdk.DataService.getPoolOverview(currentEpochId);
const lockingPeriods = await sdk.Locking.getLockPeriods();
const userSummary = await sdk.Portfolio.getPortfolioSummary(userAddress);
await sdk.Locking.lockKSUTokens(amountBn, lockPeriodBn); // signer required
```

`KasuSdk` exposes services as properties. Each service contains the
methods for a single protocol facet:

| Service       | Purpose                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `DataService` | Aggregates on-chain data (subgraphs/external TVL) and off-chain content from Directus (pool descriptions, KPIs). |
| `Locking`     | High-level helpers for KSU locking: read locking periods, calculate projected rewards, lock/unlock, claim fees. |
| `UserLending` | User-centric lending utilities (deposit/withdraw requests, transaction history, CSV builders).               |
| `Portfolio`   | Portfolio snapshots: balances, rewards, lending totals, APY calculations.                                    |
| `Swapper`     | Helpers for contract calls through the on-chain swapper.                                                     |

Every method is fully typed, so your editor can discover the shape of responses
(`PoolOverview`, `LockPeriod`, `PortfolioRewards`, etc.) without digging into
the implementation.

## Lite Deployment Behavior

When `isLiteDeployment: true` is set in the config, the SDK gracefully handles
missing KSU-related functionality:

| Service Method | Full Deployment | Lite Deployment |
|----------------|-----------------|-----------------|
| `Locking.lockKSUTokens()` | Works normally | Throws error |
| `Locking.getUserTotalLockedAmount()` | Returns locked amount | Returns `'0'` |
| `Locking.getLoyaltyLevelAndApyBonusFromRatio()` | Calculates level | Returns level 0, 0% bonus |
| `Locking.getKasuEpochTokenPrice()` | Returns current price | Returns `{ price: 0, decimals: 18 }` |
| `Portfolio.getUserNfts()` | Returns NFT ids | Returns `[]` |
| `Portfolio.getPortfolioRewards()` | Returns rewards | Returns zeros |

**UI Implications**: Frontends should hide KSU-related UI elements (locking panel,
loyalty badges, KSU rewards) when `config.isLiteDeployment` is true.

### Working with pool filters

Many queries accept a list of pool ids to ignore (see `UNUSED_LENDING_POOL_IDS`
in the config). In the Kasu frontend we load this list from Directus before
creating the SDK:

```ts
const unusedPools = await getUnusedPools(); // fetches Directus list
const sdk = new KasuSdk(
  { ...config, UNUSED_LENDING_POOL_IDS: unusedPools.length ? unusedPools : [''] },
  provider,
);
```

Mirroring this pattern keeps your subgraph requests aligned with the official
UI and prevents deprecated pools from leaking into calculations.

## Building & testing locally

```bash
npm install
npm run build-tc   # regenerate typechain factories
npm run build      # type-check + compile
npm run rollup-build
npm test
```

These are the same steps executed by the release workflow before publishing to
npm.

## Networks

| Network | Chain ID | Deployment Type | Subgraph |
|---------|----------|-----------------|----------|
| Base    | 8453     | Full            | `kasu-base/v1` |
| XDC     | 50       | Lite            | `kasu-xdc/v1.0.0` |
| Plume   | 98866    | Lite            | `kasu-plume/prod` |

## Support
For questions, issues, or contributions:
- GitHub Issues: [Create an issue](https://github.com/kasufinance/kasu-sdk/issues)
- Documentation: [View full docs](https://docs.kasu.finance)
- Discord: [Join our community](https://discord.gg/kasufinance)

## License
This project is licensed under the MIT License - see the LICENSE file for details.
