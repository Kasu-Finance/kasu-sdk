# XDC Chain Integration

## Current Status: Pending Pools Deployment

The frontend multi-chain infrastructure for XDC is complete. Once lending pools are deployed on XDC, remove the `ChainAwareContent` wrapper to enable full functionality.

## What's Implemented

### Chain Configuration

- **`src/config/chains/index.ts`** - XDC added to `SUPPORTED_CHAINS` with:
  - Chain ID: 50
  - Lite deployment mode (no KSU token)
  - Subgraph URL: `https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn`
  - Contract addresses from `addresses-xdc.json`

### Chain Switcher (in Wallet Button)

- **`src/components/atoms/ConnectWalletButton.tsx`** - Chain selector integrated into connected wallet button:
  - Shows current chain icon (Base/XDC)
  - Dropdown to switch between supported chains
  - White background in Pro mode, dark in Lite mode

### Chain Context

- **`src/context/chain/chain.provider.tsx`** - Manages chain state:
  - Syncs with wallet chain changes
  - Persists selection to localStorage (`kasu-selected-chain`)
  - Provides `isLiteDeployment`, `hasKsuToken`, etc. flags

### Lite Mode Handling

- **`src/components/atoms/LiteModeRenderer.tsx`** - Shows lite content when:
  - User has lite mode UI preference enabled, OR
  - Current chain is a Lite deployment (XDC)

### SDK Chain Awareness

- **`src/context/sdk/sdk.provider.tsx`** - Recreates SDK when chain changes
- **`src/actions/getKasuSDK.ts`** - Server-side SDK with chain support
- Hooks updated to include chainId in SWR cache keys

### Wrong Network Modal

- **`src/components/organisms/modals/WrongNetworkModal.tsx`** - Shows switch buttons for all supported chains

## What's Blocking: No Pools on XDC

Server-side data fetching (`getPoolWithDelegate`, `getCurrentEpoch`) always fetches from Base (DEFAULT_CHAIN_ID). When user switches to XDC client-side, there's a data mismatch.

### Current Workaround

- **`src/components/atoms/ChainAwareContent.tsx`** - Shows "Coming Soon to XDC" when on non-Base chain
- Wrapped in `src/app/lending/()/layout.tsx`

## To Enable XDC When Pools Are Ready

1. **Deploy pools on XDC** via contracts

2. **Remove ChainAwareContent wrapper** from `src/app/lending/()/layout.tsx`:

   ```tsx
   // Remove ChainAwareContent wrapper, keep LiteModeRenderer
   <LiteModeRenderer
     renderOnLiteMode={children}
     otherwise={...}
   />
   ```

3. **Optional: Make server data chain-aware** (for full SSR support):

   - Pass chain ID via URL param or cookie
   - Update `getPoolWithDelegate`, `getPoolOverview`, `getCurrentEpoch` to accept chainId
   - This is complex and may not be needed if client-side fetching works well

4. **Test thoroughly**:
   - Chain switching
   - Data fetching for XDC pools
   - Deposit/withdraw flows with Nexera KYC (chain ID is passed)
   - Wrong network modal behavior

## Files Changed for XDC Support

### New Files

- `src/config/chains/index.ts` - Chain registry
- `src/config/chains/xdc.ts` - XDC chain definition
- `src/config/sdk/addresses-xdc.json` - XDC contract addresses
- `src/context/chain/chain.provider.tsx` - Chain context provider
- `src/context/chain/chain.context.ts` - Chain context definition
- `src/hooks/context/useChain.tsx` - Chain hook
- `src/hooks/web3/useExplorerUrl.tsx` - Dynamic block explorer URLs
- `src/components/atoms/ChainAwareContent.tsx` - Coming soon wrapper
- `src/assets/icons/chains/XdcIcon.tsx` - XDC chain icon
- `src/assets/icons/chains/BaseIcon.tsx` - Base chain icon

### Modified Files

- `src/components/atoms/ConnectWalletButton.tsx` - Added chain selector
- `src/components/atoms/LiteModeRenderer.tsx` - Check isLiteDeployment
- `src/components/organisms/modals/WrongNetworkModal.tsx` - Multi-chain support
- `src/components/organisms/header/HeaderActions.tsx` - Removed standalone ChainSwitcher
- `src/context/sdk/sdk.provider.tsx` - Chain-aware SDK
- `src/app/layout.tsx` - Added ChainProvider
- `src/app/lending/()/layout.tsx` - Added ChainAwareContent
- `src/hooks/lending/useCurrentEpochDepositedAmount.tsx` - SDK ready check
- `src/hooks/lending/useCurrentEpochFtdAmount.tsx` - SDK ready check
- Various hooks - Added chainId to SWR cache keys

## Block Explorer URLs

The `useExplorerUrl` hook provides chain-aware block explorer URLs:

```tsx
import useExplorerUrl from '@/hooks/web3/useExplorerUrl'

const { getTxUrl, getAddressUrl } = useExplorerUrl()

// Returns https://basescan.org/tx/0x... on Base
// Returns https://xdcscan.com/tx/0x... on XDC
<a href={getTxUrl(txHash)}>View Transaction</a>
```

Explorer URLs per chain:

- **Base**: https://basescan.org
- **XDC**: https://xdcscan.com

## KSU Token Features Hidden on XDC

Since XDC is a Lite deployment, these features are automatically hidden:

- Locking page/functionality
- Loyalty rewards
- KSU token displays
- Bonus & Rewards portfolio tab
