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

## Configuring the SDK

The `SdkConfig` object wires the SDK to the right contracts and backends:

```ts
import { JsonRpcProvider } from '@ethersproject/providers';
import { KasuSdk, SdkConfig } from '@kasufinance/kasu-sdk';
import { XMLHttpRequest } from 'xhr2';

global.XMLHttpRequest = XMLHttpRequest; // required on Node runtimes

const provider = new JsonRpcProvider(process.env.RPC_URL!, { skipFetchSetup: true });

const config: SdkConfig = {
  contracts: {
    KSUToken: '0x…',
    IKSULocking: '0x…',
    IKSULockBonus: '0x…',
    UserManager: '0x…',
    LendingPoolManager: '0x…',
    KasuAllowList: '0x…',
    SystemVariables: '0x…',
    UserLoyaltyRewards: '0x…',
    KsuPrice: '0x…',
    ClearingCoordinator: '0x…',
    KasuNFTs: '0x…',
    ExternalTVL: '0x…',
  },
  // If certain pools should be hidden from users, provide their ids. Empty string
  // keeps the Graph queries happy when nothing is filtered out.
  UNUSED_LENDING_POOL_IDS: [''],
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl: 'https://subgraph.satsuma-prod.com/.../api',
  plumeSubgraphUrl: 'https://api.goldsky.com/.../kasu-plume/prod/gn',
};

export const kasuSdk = new KasuSdk(config, provider);
```

See `kasu-fe-next/src/config/sdk` in the Kasu frontend repository for full
mainnet and testnet examples, including how Kasu fetches unused pool ids before
instantiating the SDK.

## Quick start

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

The SDK exposes services as properties on `KasuSdk`. Each service contains the
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

## Support
For questions, issues, or contributions:
- GitHub Issues: [Create an issue](https://github.com/kasufinance/kasu-sdk/issues)
- Documentation: [View full docs](https://docs.kasu.finance)
- Discord: [Join our community](https://discord.gg/kasufinance)

## License
This project is licensed under the MIT License - see the LICENSE file for details.
