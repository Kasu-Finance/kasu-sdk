# Kasu Frontend (kasu-fe-next)

## Overview

Kasu Finance DeFi frontend built with Next.js 15. Provides lending, locking, and portfolio management functionality for users interacting with the Kasu protocol on Base chain.

## Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **UI**: MUI v6, Emotion
- **Web3**: wagmi v2, viem, ethers v5, Privy authentication
- **Data Fetching**: SWR v2.3
- **SDK**: @kasufinance/kasu-sdk

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components (atoms, molecules, organisms)
├── config/        # App configuration
├── connection/    # Web3 chain/network config
├── constants/     # App constants
├── context/       # React contexts and providers
├── hooks/         # Custom React hooks
│   ├── context/   # Context consumer hooks
│   ├── lending/   # Lending-related hooks
│   ├── locking/   # KSU locking hooks
│   ├── portfolio/ # Portfolio hooks
│   ├── referrals/ # Referral system hooks
│   └── web3/      # Web3/blockchain hooks
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Caching Mechanism (SWR)

The app uses SWR for data fetching with in-memory caching. Cache is NOT persisted across page visits.

### Cache Key Pattern

```typescript
useSWR(condition ? ['cacheKey', ...dependentParams] : null, async () =>
  sdk.method()
)
```

**Important**: Never include large objects (like `sdk`) in cache keys - this causes memory leaks.

### All Cache Keys

| Cache Key                     | Parameters                | Data Stored                              | Hook                             |
| ----------------------------- | ------------------------- | ---------------------------------------- | -------------------------------- |
| `availableKsuBonus`           | -                         | Available KSU bonus amount               | `useAvailableKsuBonus`           |
| `currentEpochDepositedAmount` | chainId, address, poolIds | User's deposited amount in current epoch | `useCurrentEpochDepositedAmount` |
| `currentEpochFtdAmount`       | chainId, address          | User's FTD amount in current epoch       | `useCurrentEpochFtdAmount`       |
| `ksuPrice`                    | -                         | KSU token price                          | `useKsuPrice`                    |
| `latestClearingTimestamp`     | chainId, poolIds          | Last clearing timestamp                  | `useLatestClearingTimestamp`     |
| `loanTickets`                 | address, chainId          | User's loan tickets                      | `useLoanTickets`                 |
| `lockingClaimableRewards`     | chainId, address          | Claimable locking rewards                | `useLockingRewards`              |
| `nextClearingPeriod`          | -                         | Next clearing period timestamp           | `useNextClearingPeriod`          |
| `nextEpochTime`               | -                         | Next epoch timestamp                     | `useNextEpochTime`               |
| `performanceFee`              | -                         | Protocol performance fee                 | `usePerformanceFee`              |
| `poolOverview`                | chainId, poolId           | Single pool overview data                | `usePoolOverview`                |
| `poolOverviews`               | chainId                   | All pools overview                       | `usePoolOverviews`               |
| `portfolioRewards`            | chainId, address          | User's portfolio rewards                 | `usePortfolioRewards`            |
| `qualifiedAirdrops`           | chainId                   | Qualified airdrop campaigns              | `useQualifiedAirdrops`           |
| `symbol`                      | tokenAddress              | ERC20 token symbol                       | `useTokenDetails`                |
| `totalPoolDeposits`           | address                   | User's total pool deposits               | `useTotalLendingPoolDeposits`    |
| `transactionHistory`          | chainId, address, epochId | User's transaction history               | `useTransactionHistory`          |
| `userApyBonus`                | chainId, address          | User's APY bonus                         | `useUserApyBonus`                |
| `userBonusData`               | chainId, address          | User bonus data                          | `useUserBonusData`               |
| `userLendingTrancheBalance`   | address, pools            | User's balance per tranche               | `useUserLendingBalance`          |
| `userLockDepositsInfo`        | chainId, address          | User's lock deposits info                | `useUserLockDepositsInfo`        |
| `userLocks`                   | chainId, address          | User's KSU locks                         | `useUserLocks`                   |
| `userNfts`                    | address                   | User's NFTs                              | `useUserNfts`                    |
| `userNftYields`               | address, chainId          | User's NFT yield boosts                  | `useUserNftYields`               |
| `userReferrals`               | address, chainId          | User's referral data                     | `useUserReferrals`               |

### Cache Invalidation

#### 1. Targeted Invalidation (by key prefix)

Used after specific operations to invalidate related cache entries:

```typescript
// After deposit/withdrawal operations
void mutate(
  (key) => Array.isArray(key) && key[0] === 'transactionHistory',
  undefined,
  { revalidate: true }
)
```

**Locations:**

- `useRequestDeposit.tsx:181` - invalidates `transactionHistory` after deposit
- `useRequestWithdrawal.tsx:72` - invalidates `transactionHistory` after withdrawal
- `useCancelDeposit.tsx:42` - invalidates `transactionHistory` after cancel
- `useCancelWithdrawal.tsx:43` - invalidates `transactionHistory` after cancel

#### 2. Global Invalidation (revalidate all)

Used after transaction confirmation to refresh all data:

```typescript
// Revalidate ALL cached data
void mutate(() => true, undefined, { revalidate: true })
```

**Locations:**

- `LendingModalConfirmedActions.tsx:35` - after lending tx confirmed
- `LockModalConfirmedActions.tsx:37` - after locking tx confirmed

#### 3. Hook-level mutate

Some hooks expose their own `mutate` function for direct cache updates:

```typescript
const { userNfts, updateUserNfts } = useUserNfts()
// Later: updateUserNfts() to refresh
```

### SWR Options Used

| Option              | Value                | Purpose                            |
| ------------------- | -------------------- | ---------------------------------- |
| `dedupingInterval`  | 5 min (FIVE_MINUTES) | Prevent duplicate requests         |
| `keepPreviousData`  | true                 | Show stale data while revalidating |
| `revalidateIfStale` | false                | Don't auto-revalidate stale data   |
| `errorRetryCount`   | 5                    | Retry failed requests              |

## Web3 Provider Architecture

### Provider Stack (top to bottom)

```
┌─────────────────────────────────────────────┐
│  KasuSdk                                    │
│  (receives ethers.js Signer)                │
├─────────────────────────────────────────────┤
│  ethers.providers.Web3Provider              │
│  (wraps the queued provider)                │
├─────────────────────────────────────────────┤
│  Queued Provider (Proxy)                    │
│  - Limits concurrent RPC calls              │
│  - Handles tx sponsorship for embedded      │
├─────────────────────────────────────────────┤
│  Privy Ethereum Provider                    │
│  (from wallet.getEthereumProvider())        │
├─────────────────────────────────────────────┤
│  wagmi + Privy                              │
│  (wallet connection, chain management)      │
└─────────────────────────────────────────────┘
```

### Privy Configuration

**File**: `src/context/privy.provider.tsx`

```typescript
// Supported login methods
loginMethods: ['wallet', 'google', 'email']

// Embedded wallet creation
embeddedWallets: {
  ethereum: {
    createOnLogin: 'users-without-wallets'  // Auto-create for new users
  }
}

// Supported external wallets
walletList: ['detected_ethereum_wallets', 'metamask', 'wallet_connect', 'coinbase_wallet']

// Chains
supportedChains: [base, baseSepolia]
defaultChain: base (mainnet) or baseSepolia (testnet)
```

### Embedded vs External Wallets

Detection utility in `src/utils/web3/isPrivyEmbeddedWallet.ts`:

```typescript
// Embedded wallet types: 'privy' or 'privy-v2'
const isEmbedded =
  wallet.walletClientType === 'privy' || wallet.walletClientType === 'privy-v2'
```

**Differences:**
| Feature | Embedded Wallet | External Wallet |
|---------|-----------------|-----------------|
| Transaction sponsorship | Yes (gas paid by Privy) | No |
| Signing method | `personal_sign` via provider | wagmi `useSignMessage` |
| RPC concurrency limit | 1 (stricter) | 1 (same) |

### RPC Queue (Rate Limiting)

**File**: `src/utils/rpc/rpcQueue.ts`

The `wrapQueuedProvider` function creates a Proxy around the Ethereum provider to:

1. **Rate limit read-only RPC calls** - Queues calls to prevent hitting rate limits
2. **Handle transaction sponsorship** - For embedded wallets, uses Privy's `sendTransaction` with `sponsor: true`
3. **Intercept `eth_sendTransaction`** - Routes through Privy's sponsored transaction flow

```typescript
wrapQueuedProvider(provider, {
  maxConcurrent: 1, // Max parallel RPC calls (default: 2)
  sponsorTransactions: true, // Enable gas sponsorship
  sendTransaction: privySendTransaction, // Privy's sendTransaction function
  sendTransactionAddress: wallet.address, // Wallet address for sponsored txs
})
```

**Read-only methods that get queued:**

- `eth_call`, `eth_getBalance`, `eth_getBlockByNumber`, `eth_getBlockByHash`
- `eth_getCode`, `eth_getLogs`, `eth_getStorageAt`, `eth_blockNumber`, `eth_chainId`

**Write methods (not queued, may use sponsorship):**

- `eth_sendTransaction` - Intercepted and routed through Privy if sponsorship enabled

### Message Signing

**File**: `src/hooks/web3/usePrivySignMessage.ts`

Custom hook to handle signing differences between wallet types:

```typescript
// For embedded wallets: use provider.request({ method: 'personal_sign' })
// For external wallets: use wagmi's useSignMessage

const { signMessage } = usePrivySignMessage()
signMessage({ message: 'Hello' }, { onSuccess, onError })
```

This avoids browser crashes that occur when using wagmi's signMessage with Privy embedded wallets.

## SDK Initialization

### When SDK is Created

The SDK is created in `src/context/sdk/sdk.provider.tsx` when:

1. User has connected a wallet (`wallet` exists)
2. Unused pools list has been fetched (`unusedPools` loaded)

```typescript
useEffect(() => {
  if (!wallet || !unusedPools) return

  const sdk = new KasuSdk(sdkConfig, provider.getSigner())
  setKasuSdk(sdk)
}, [wallet, unusedPools, sendTransaction])
```

### SDK Configuration

**Files**: `src/config/sdk/index.ts`, `mainnet.config.ts`, `testnet.config.ts`

```typescript
// Network selection via env var
NEXT_PUBLIC_CURRENT_NETWORK = 'BASE' | 'TESTNET'

// SDK config structure
{
  contracts: {
    IKSULockBonus, IKSULocking, KSUToken, LendingPoolManager,
    UserManager, KasuAllowList, SystemVariables, KsuPrice,
    UserLoyaltyRewards, ClearingCoordinator, KasuNFTs, ExternalTVL
  },
  UNUSED_LENDING_POOL_IDS: string[],  // Dynamically fetched from Directus
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl: '...',  // Goldsky subgraph for Base
}
```

### What Gets Passed to SDK

| Parameter                 | Source                 | Description                              |
| ------------------------- | ---------------------- | ---------------------------------------- |
| `sdkConfig`               | `src/config/sdk/`      | Contract addresses, API URLs             |
| `UNUSED_LENDING_POOL_IDS` | Directus API           | Pool IDs to exclude (fetched at startup) |
| `signer`                  | `provider.getSigner()` | ethers.js Signer from wrapped provider   |

### SDK Access in Components

```typescript
// Get SDK instance (undefined if not ready)
const sdk = useSdk()

// Usage pattern - always check for sdk before using
const { data } = useSWR(
  sdk ? ['cacheKey', ...params] : null, // null key = don't fetch
  async () => sdk!.SomeService.method()
)
```

## Development Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run lint:fix   # Fix linting issues
npm run types      # Type check
```
