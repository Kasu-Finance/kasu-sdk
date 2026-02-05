# Multichain Support Documentation

This document describes how the Kasu frontend supports multiple chains with different deployment types.

## Deployment Types

### Full Deployment (Base)

Full deployments have all Kasu features enabled, including the KSU token ecosystem.

**Features:**

- KSU Token
- KSU Locking & Staking
- rKSU (reward KSU)
- Loyalty Levels & APY Bonus
- NFT Boosts
- KSU Bonus Rewards
- KYC/KYB
- Lending Pools (Variable & Fixed Term Deposits)
- Portfolio with full earnings tracking

**Current Full Deployments:**

- Base Mainnet (Chain ID: 8453)

### Lite Deployment (XDC, Plume)

Lite deployments provide core lending functionality without the KSU token ecosystem.

**Features:**

- KYC/KYB
- Lending Pools (Variable only, no FTD)
- Basic Portfolio tracking
- Subgraph-based data fetching (optimized for fewer RPC calls)

**NOT Available on Lite:**

- KSU Token
- KSU Locking & Staking
- rKSU
- Loyalty Levels & APY Bonus
- NFT Boosts
- KSU Bonus Rewards
- Fixed Term Deposits (FTD)

**Current Lite Deployments:**

- XDC Mainnet (Chain ID: 50)
- Plume Mainnet (Chain ID: 98866) - Future

## Architecture

### Chain Configuration

All chain configurations are defined in `src/config/chains/index.ts`:

```typescript
export interface ChainConfig {
  chain: Chain // viem chain definition
  chainId: number
  name: string
  isLiteDeployment: boolean // Key flag for deployment type
  contracts: ContractAddresses
  subgraphUrl: string
  usdc: string
  blockExplorer: string
  rpcUrls: string[]
  poolMetadataMapping?: Record<string, string> // Maps chain pools to Directus
}
```

### Feature Flags via useChain()

The `useChain()` hook provides deployment-aware feature flags:

```typescript
const {
  currentChainId, // Current chain ID
  chainConfig, // Full chain configuration
  isLiteDeployment, // Whether this is a Lite deployment
  hasKsuToken, // KSU token features available
  hasLocking, // Locking features available
  hasLoyalty, // Loyalty/APY bonus available
  hasNfts, // NFT features available
  switchChain, // Switch to different chain
} = useChain()
```

### Conditional UI Rendering

Use feature flags to conditionally render UI elements:

```typescript
// Hide locking section on Lite deployments
{hasLocking && <LockingSection />}

// Show different grid layouts
const gridSize = isLiteDeployment ? 6 : 4  // 2x2 vs 2x3 grid

// Hide KSU-specific metrics
{!isLiteDeployment && (
  <InfoColumn title="Total KSU Locked" metric={<TotalKsuLocked />} />
)}
```

## Data Fetching Strategies

### Full Deployment (Base)

1. **Server-Side Rendering**: Pool overviews and epoch data fetched server-side
2. **SDK RPC Calls**: Portfolio data via `useLendingPortfolioData` hook
3. **SWR Caching**: Client-side caching with chain-aware keys

### Lite Deployment (XDC)

1. **Subgraph Queries**: Single GraphQL query via `useLiteModeSubgraph` replaces ~15 RPC calls
2. **Client-Side Pool Data**: `usePoolOverviews` and `useCurrentEpoch` hooks
3. **Data Mapping**: Subgraph data mapped to SDK types for component compatibility

```typescript
// Lite deployment uses subgraph
const { liteModeData } = useLiteModeSubgraph({ enabled: isLiteDeployment })

// Full deployment uses SDK
const { portfolioLendingPools } = useLendingPortfolioData(pools, epoch, {
  enabled: !isLiteDeployment,
})
```

### Why Subgraph for Lite?

The SDK's `getPortfolioLendingData` makes 49+ RPC calls (per pool, per tranche). On chains with slower/rate-limited RPCs (like XDC), this causes:

- Slow page loads
- Rate limiting errors
- Poor user experience

The subgraph consolidates all data into 1 GraphQL query.

## SDK Configuration

### Full Deployment SDK

```typescript
new SdkConfig({
  subgraphUrl: chainConfig.subgraphUrl,
  contracts: {
    KSUToken: '0x...', // Required for full
    IKSULocking: '0x...',
    IKSULockBonus: '0x...',
    // ... all contracts
  },
  isLiteDeployment: false,
})
```

### Lite Deployment SDK

```typescript
new SdkConfig({
  subgraphUrl: chainConfig.subgraphUrl,
  contracts: {
    // No KSUToken
    IKSULocking: '0x...', // Contract exists but not used
    LendingPoolManager: '0x...',
    // ... subset of contracts
  },
  isLiteDeployment: true,
})
```

## Pool Metadata Mapping

Lite deployments can share pool descriptions with Base pools via Directus mapping:

```typescript
poolMetadataMapping: {
  // XDC pool address → Base pool address (for Directus lookup)
  '0x20f42fb45f91657acf9528b99a5a16d0229c7800':
    '0xc987350716fe4a7d674c3591c391d29eba26b8ce',
}
```

## Adding a New Lite Deployment

### 1. Define Chain Configuration

Create chain definition in `src/config/chains/`:

```typescript
// src/config/chains/plume.ts
export const plume = {
  id: 98866,
  name: 'Plume',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.plume.org'] } },
  blockExplorers: {
    default: { name: 'Plume Explorer', url: 'https://explorer.plume.org' },
  },
} as const satisfies Chain
```

### 2. Add Chain to Registry

In `src/config/chains/index.ts`:

```typescript
import { plume } from './plume'
import plumeAddresses from '../sdk/addresses-plume.json'

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // ... existing chains
  [plume.id]: {
    chain: plume,
    chainId: plume.id,
    name: 'Plume',
    isLiteDeployment: true, // Mark as Lite
    contracts: {
      // No KSUToken
      LendingPoolManager: plumeAddresses.LendingPoolManager.address,
      // ... other contracts
    },
    subgraphUrl: 'https://api.goldsky.com/.../kasu-plume/...',
    usdc: '0x...',
    blockExplorer: 'https://explorer.plume.org',
    rpcUrls: ['https://rpc.plume.org'],
    poolMetadataMapping: {
      // Map Plume pools to Base/Directus pools if sharing descriptions
    },
  },
}
```

### 3. Deploy Contracts

Ensure contracts are deployed on the new chain:

- LendingPoolManager
- UserManager
- KasuAllowList
- SystemVariables
- ClearingCoordinator
- (Other lending-related contracts)

### 4. Deploy Subgraph

Deploy a Goldsky subgraph for the new chain with the Kasu schema.

### 5. Configure Privy (if needed)

Add chain to Privy's supported chains in `src/context/privy.provider.tsx`.

### 6. Test

- [ ] Chain switching works from Base to new chain
- [ ] Pool overview loads correctly
- [ ] Portfolio shows user's positions
- [ ] Deposit/withdrawal flows work
- [ ] No KSU-related UI elements appear

## Components with Deployment-Aware Logic

| Component                    | Location                                                  | Deployment Logic                |
| ---------------------------- | --------------------------------------------------------- | ------------------------------- |
| PortfolioSummaryClient       | `src/components/organisms/portfolio/PortfolioSummary/`    | Grid layout, KSU metrics hidden |
| LendingPortfolioTableWrapper | `src/components/organisms/portfolio/LendingPortfolioTab/` | Subgraph vs SDK data source     |
| LendingPortfolioTableFilter  | `src/components/organisms/portfolio/LendingPortfolioTab/` | Subgraph vs SDK data source     |
| PortfolioSummaryProvider     | `src/context/portfolioSummary/`                           | Chain-specific SDK config       |
| Navigation                   | Various                                                   | Locking tab hidden              |
| LoyaltyBadge                 | Various                                                   | Hidden on Lite                  |

## Troubleshooting

### "Total Lending Balance" stuck loading on Lite

**Cause:** PortfolioSummaryProvider using wrong SDK config
**Solution:** Ensure provider uses `chainConfig` from `useChain()`, not static `sdkConfig`

### 49+ RPC calls on Lite deployment

**Cause:** SDK portfolio hook enabled instead of subgraph
**Solution:** Check `isLiteDeployment` flag in `useLendingPortfolioData` enabled condition

### Stale data after chain switch

**Cause:** SWR cache contains data from previous chain
**Solution:** Cache keys must include `chainId`, and SDK provider should clear cache on chain change

### Pool descriptions not loading

**Cause:** Pool addresses don't match Directus
**Solution:** Add `poolMetadataMapping` in chain config to map chain pools to Directus pools
