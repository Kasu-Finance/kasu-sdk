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

### 6. Configure Nexera/Compilot

Add the new chain to the Nexera Signature Gating Workflow:

1. Go to Compilot Dashboard → Signature Gating Workflows
2. Add new chain with:
   - Chain ID (e.g., 50 for XDC)
   - KasuAllowList contract address for that chain
3. Or create a separate workflow per chain

**Note:** Without this, deposit transactions will fail with `invalid input value for enum chain_id`.

### 7. Add Pool Metadata Mapping (if sharing Directus data)

If the new chain's pools should share metadata with Base pools in Directus:

```typescript
// In src/config/chains/index.ts
poolMetadataMapping: {
  // New chain pool address → Base pool address
  '0xNewChainPoolAddress': '0xBasePoolAddress',
}
```

### 8. Verify Chain Wrapper Components

Ensure all chain wrapper components work with the new chain. They should automatically:

- Fetch data client-side via hooks
- Use pool mapping for Directus lookups
- Show loading states while fetching

Key wrappers to verify:

- `PageHeaderChainWrapper` - Pool header
- `PoolOverviewTabChainWrapper` - Overview tab with delegate data
- `DetailsTabChainWrapper` - Details tab
- `RepaymentsTabChainWrapper` - Repayments data
- `RiskReportingTabChainWrapper` - Risk reports
- `LiteHomeChainWrapper` - Home page pools

### 9. Test Checklist

**Basic Functionality:**

- [ ] Chain switching works from Base to new chain
- [ ] Pool overview loads correctly
- [ ] Pool details page loads with correct data
- [ ] Portfolio shows user's positions
- [ ] Deposit flow works
- [ ] Withdrawal flow works

**Directus Data (if using pool mapping):**

- [ ] Delegate info loads on pool overview
- [ ] Pool descriptions load correctly
- [ ] Repayments tab shows data (not "Coming Soon")
- [ ] Risk reporting tab shows data (not "Coming Soon")
- [ ] Lending History shows correct duration (not "56 years")

**Lite Deployment Specifics:**

- [ ] No KSU-related UI elements appear
- [ ] Locking tab hidden in navigation
- [ ] Loyalty badges hidden
- [ ] Subgraph data loads (check network tab for single GraphQL query)
- [ ] No excessive RPC calls (should be minimal, not 49+)

**Edge Cases:**

- [ ] Chain switch doesn't show stale data
- [ ] Token approvals complete (check for timeout fallback)
- [ ] Empty portfolio shows appropriate message
- [ ] Loading states appear correctly

## Chain Wrapper Components Pattern

Server components fetch data from the default chain (Base). For multi-chain support, we use "ChainWrapper" client components that:

1. Accept server-rendered data as props
2. Check if current chain is default chain
3. If non-default chain: fetch data client-side with chain-aware hooks
4. Handle loading states for non-default chains

### Pattern Structure

```typescript
// Server component (index.tsx)
const RepaymentsTab: React.FC<{ poolId: string }> = async ({ poolId }) => {
  const serverData = await getRepayments(poolId) // Always fetches from DEFAULT_CHAIN
  return (
    <RepaymentsTabChainWrapper
      poolId={poolId}
      serverRepayment={serverData}
    />
  )
}

// Client wrapper component (*ChainWrapper.tsx)
const RepaymentsTabChainWrapper: React.FC<Props> = ({ poolId, serverRepayment }) => {
  const { currentChainId } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID
  const [hasMounted, setHasMounted] = useState(false)

  // Fetch client-side for non-default chains
  const { repayment: clientRepayment, isLoading } = usePoolRepayment(poolId)

  useEffect(() => setHasMounted(true), [])

  // Before mount: render server data (prevents hydration mismatch)
  if (!hasMounted) return renderContent(serverRepayment)

  // Default chain: use server data
  if (isDefaultChain) return renderContent(serverRepayment)

  // Non-default chain: loading state
  if (isLoading) return renderLoading()

  // Non-default chain: use client data
  return renderContent(clientRepayment)
}
```

### Existing Chain Wrappers

| Component                      | Location                    | Purpose                          |
| ------------------------------ | --------------------------- | -------------------------------- |
| `PageHeaderChainWrapper`       | `lending/`                  | Pool header with name/image      |
| `PoolOverviewTabChainWrapper`  | `lending/OverviewTab/`      | Pool overview with delegate data |
| `DetailsTabChainWrapper`       | `lending/DetailsTab/`       | Pool details tab                 |
| `RepaymentsTabChainWrapper`    | `lending/RepaymentsTab/`    | Pool repayments data             |
| `RiskReportingTabChainWrapper` | `lending/RiskReportingTab/` | Risk report data                 |
| `LiteHomeChainWrapper`         | `lite/`                     | Lite mode home pools             |
| `PoolLayoutChainWrapper`       | `home/`                     | Homepage pool layout             |

## Directus Data Fetching Hooks

Pool metadata (descriptions, images, delegate info, repayments, risk reports) is stored in Directus and indexed by **Base pool addresses**. For non-default chains, we need to map their pool addresses to Base addresses.

### Pool Metadata Mapping

In `src/config/chains/index.ts`, each chain config can define `poolMetadataMapping`:

```typescript
poolMetadataMapping: {
  // XDC pool address → Base pool address (for Directus lookup)
  '0x20f42fb45f91657acf9528b99a5a16d0229c7800':
    '0xc987350716fe4a7d674c3591c391d29eba26b8ce',
  '0x3b7cb493aa22f731db2ab424d918e7375e00f6a9':
    '0x03f93c8caa9a82e000d35673ba34a4c0e6e117a2',
}
```

### Hooks Using Pool Mapping

| Hook                   | File                                         | Purpose                                   |
| ---------------------- | -------------------------------------------- | ----------------------------------------- |
| `usePoolDelegate`      | `src/hooks/lending/usePoolDelegate.tsx`      | Fetches delegate data from Directus       |
| `usePoolRepayment`     | `src/hooks/lending/usePoolRepayment.tsx`     | Fetches repayment data from Directus      |
| `usePoolRiskReport`    | `src/hooks/lending/usePoolRiskReport.tsx`    | Fetches risk report (uses pool name/type) |
| `usePoolsWithDelegate` | `src/hooks/lending/usePoolsWithDelegate.tsx` | Fetches pools with delegate data          |

### Hook Pattern for Directus Data

```typescript
const usePoolDelegate = (poolId: string | undefined) => {
  const sdk = useSdk()
  const { currentChainId, chainConfig } = useChain()

  // Map pool ID to Base pool ID for Directus lookup
  const poolMetadataMapping = chainConfig.poolMetadataMapping
  const lookupPoolId = poolId
    ? (poolMetadataMapping?.[poolId.toLowerCase()] ?? poolId)
    : undefined

  const { data, isLoading } = useSWR(
    sdk && currentChainId
      ? ['poolDelegate', currentChainId, lookupPoolId]
      : null,
    async () => {
      const delegates = await sdk.DataService.getPoolDelegateProfileAndHistory()
      // Find delegate using MAPPED Base pool ID
      return delegates.find((d) =>
        d.otherKASUPools.some(
          (p) => p.id.toLowerCase() === lookupPoolId?.toLowerCase()
        )
      )
    }
  )

  return { delegate: data, isLoading }
}
```

### When to Use Pool Mapping

Use `poolMetadataMapping` when fetching data that is:

1. **Stored in Directus** (delegate profiles, repayments, pool descriptions)
2. **Indexed by Base pool addresses**
3. **Needed for non-Base chains that share pool metadata**

Data that does NOT need mapping:

- Subgraph data (uses chain's own pool addresses)
- On-chain data via SDK (uses chain's own addresses)
- Risk reports (use pool name/assetClass, not address)

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

### Deposit fails with "Error generating signature"

**Cause:** Nexera/Compilot doesn't support the chain ID
**Solution:** Add chain to Compilot Signature Gating Workflow with correct KasuAllowList address

### Token approval hangs / waitForTransactionReceipt times out

**Cause:** Some RPCs (like XDC) don't support wagmi's polling mechanism well
**Solution:** The `useApproveToken` hook has a fallback to ethers.js `waitForTransaction`. If wagmi times out after 30s, it falls back to ethers.

### RPC returns stale allowance data

**Cause:** Some RPC endpoints cache or return stale state
**Solution:** Try different RPC endpoint, or add manual delay/retry after transactions

### Token details (symbol/decimals) not loading

**Cause:** `readContracts` missing chainId parameter
**Solution:** All wagmi `readContract`/`readContracts` calls must include `chainId` in each contract object

### "Lending History 56 years" on non-Base chains

**Cause:** `delegateLendingHistory` is 0, causing `dayjs.unix(0)` to return 1970
**Solution:** Use `usePoolDelegate` hook which applies pool mapping to fetch actual delegate data from Directus

### Repayments/Risk Reporting shows "Coming Soon to XDC"

**Cause:** ChainWrapper component not fetching data client-side for non-default chains
**Solution:** Create hooks (`usePoolRepayment`, `usePoolRiskReport`) that fetch data client-side and update wrapper to use them

### Repayments download button not showing on XDC (but tab loads)

**Cause:** SDK's `getRepayments()` method was comparing Directus `poolIdFK` (Base addresses) with subgraph pool IDs (current chain addresses) directly. On XDC, these don't match, so repayments were filtered out.
**Solution:** Fixed in SDK - `getRepayments()` now uses `getMetadataPoolId()` to map subgraph pool IDs to their Directus metadata source before comparison. This allows proper matching on non-Base chains.

### Empty tranches under pool names on portfolio

**Cause:** Pending deposits have empty `lendingPoolTrancheUserDetails` or zero-balance tranches
**Solution:** Check for visible tranches (with invested amount, yield earnings, or fixed loans) and show appropriate message for pending deposits

### Delegate data not loading for non-Base pools

**Cause:** Hook looking up delegate by wrong pool address (not mapped to Base)
**Solution:** Use `poolMetadataMapping` to map chain pool address to Base pool address before Directus lookup, fall back to first delegate if no match
