# Multi-Chain Integration Plan (Base + XDC + Future Chains)

## Overview

Single deployment supporting multiple EVM chains with user-selectable chain switching. Users can connect their wallet, switch chains, and interact with Kasu on any supported network.

**Supported Chains:**

- Base Mainnet (Chain ID: 8453) - Full deployment (KSU token)
- XDC Mainnet (Chain ID: 50) - Lite deployment (no KSU token)
- Future chains can be added following this pattern

**Key Principle:** Chain-specific data (contracts, subgraph) vs chain-agnostic data (pool descriptions from Directus CMS).

---

## Architecture

### Current (Single Chain)

```
NEXT_PUBLIC_CURRENT_NETWORK → selects config → SDK initialized once
```

### Target (Multi-Chain)

```
User selects chain → SDK re-initialized with chain config → UI adapts to chain features
```

### State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  ChainProvider (new)                                            │
│  - currentChainId: number                                       │
│  - chainConfig: ChainConfig                                     │
│  - isLiteDeployment: boolean                                    │
│  - switchChain(chainId): void                                   │
├─────────────────────────────────────────────────────────────────┤
│  SDK Provider                                                   │
│  - Recreates SDK when chainConfig changes                       │
│  - Passes chain-specific contract addresses & subgraph URL      │
├─────────────────────────────────────────────────────────────────┤
│  UI Components                                                  │
│  - Use useChain() to get current chain & features               │
│  - Conditionally render based on isLiteDeployment               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: SDK Changes (@kasufinance/kasu-sdk)

### 1.1 Update SdkConfig Interface

**File:** `src/sdk-config.ts`

```typescript
export interface ContractAddresses {
  KSUToken?: string // Optional - not present on Lite chains
  IKSULocking: string
  IKSULockBonus: string
  UserManager: string
  LendingPoolManager: string
  KasuAllowList: string
  SystemVariables: string
  UserLoyaltyRewards: string
  KsuPrice: string
  ClearingCoordinator: string
  KasuNFTs?: string // Optional - not present on Lite chains
  ExternalTVL: string
  FixedTermDeposit?: string // Add if not present
}

export interface SdkConfig {
  chainId: number // NEW: Required chain identifier
  subgraphUrl: string
  contracts: ContractAddresses
  directusUrl: string
  UNUSED_LENDING_POOL_IDS: string[]
  isLiteDeployment: boolean // NEW: Required flag for feature detection
}
```

### 1.2 Update Locking Service

**File:** `src/services/Locking/locking.ts`

Add Lite mode guards to all KSU-dependent methods:

```typescript
export class KSULocking {
  private readonly _isLiteDeployment: boolean

  constructor(config: SdkConfig, signerOrProvider: Signer | Provider) {
    this._isLiteDeployment = config.isLiteDeployment

    // Only initialize KSU token contract if not Lite
    if (!this._isLiteDeployment && config.contracts.KSUToken) {
      this._kasuToken = IERC20MetadataAbi__factory.connect(
        config.contracts.KSUToken,
        signerOrProvider
      )
    }
    // ... rest of initialization
  }

  async getUserKsuBalance(userAddress: string): Promise<string> {
    if (this._isLiteDeployment || !this._kasuToken) {
      return '0'
    }
    const balance = await this._kasuToken.balanceOf(userAddress)
    return formatEther(balance)
  }

  async getAvailableKsuBonus(): Promise<string> {
    if (this._isLiteDeployment || !this._kasuToken) {
      return '0'
    }
    // ... existing implementation
  }

  async getUserLocks(userAddress: string): Promise<UserLock[]> {
    if (this._isLiteDeployment) {
      return []
    }
    // ... existing implementation
  }

  async getUserBonusData(userAddress: string): Promise<UserBonusData> {
    if (this._isLiteDeployment) {
      return {
        ksuBonusAndRewards: '0',
        ksuBonusAndRewardsLifetime: '0',
        protocolFeesEarned: '0',
        totalLockedAmount: '0',
      }
    }
    // ... existing implementation
  }

  // Apply similar guards to all KSU-dependent methods
}
```

### 1.3 Update DataService

**File:** `src/services/DataService/data-service.ts`

Remove hardcoded Plume subgraph - external TVL sources should be passed in config or fetched differently per chain:

```typescript
export class DataService {
  private readonly _chainId: number

  constructor(config: SdkConfig, signerOrProvider: Signer | Provider) {
    this._chainId = config.chainId
    this._graph = new GraphQLClient(config.subgraphUrl)
    // ... rest
  }

  // External TVL handling may need refactoring for multi-chain
}
```

### 1.4 Publish New SDK Version

Bump to `2.0.0` (breaking change due to required `chainId` and `isLiteDeployment`).

---

## Phase 2: Chain Configuration System

### 2.1 Chain Registry

**File:** `src/config/chains/index.ts` (NEW)

```typescript
import { Chain } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { xdc } from './xdc'

import baseAddresses from '../sdk/addresses-base-mainnet.json'
import xdcAddresses from '../sdk/addresses-xdc.json'

export interface ChainConfig {
  chain: Chain
  chainId: number
  name: string
  isLiteDeployment: boolean
  contracts: ContractAddresses
  subgraphUrl: string
  usdc: string
  blockExplorer: string
  rpcUrls: string[]
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  [base.id]: {
    chain: base,
    chainId: base.id,
    name: 'Base',
    isLiteDeployment: false,
    contracts: {
      KSUToken: baseAddresses.KSU.address,
      IKSULocking: baseAddresses.KSULocking.address,
      IKSULockBonus: baseAddresses.KSULocking.address,
      LendingPoolManager: baseAddresses.LendingPoolManager.address,
      UserManager: baseAddresses.UserManager.address,
      KasuAllowList: baseAddresses.KasuAllowList.address,
      SystemVariables: baseAddresses.SystemVariables.address,
      KsuPrice: baseAddresses.KsuPrice.address,
      UserLoyaltyRewards: baseAddresses.UserLoyaltyRewards.address,
      ClearingCoordinator: baseAddresses.ClearingCoordinator.address,
      KasuNFTs: baseAddresses.KasuNFTs.address,
      ExternalTVL: baseAddresses.ExternalTVL.address,
    },
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    blockExplorer: 'https://basescan.org',
    rpcUrls: ['https://base-rpc.publicnode.com', 'https://mainnet.base.org'],
  },
  [xdc.id]: {
    chain: xdc,
    chainId: xdc.id,
    name: 'XDC',
    isLiteDeployment: true,
    contracts: {
      // No KSUToken
      IKSULocking: xdcAddresses.KSULocking.address,
      IKSULockBonus: xdcAddresses.KSULocking.address,
      LendingPoolManager: xdcAddresses.LendingPoolManager.address,
      UserManager: xdcAddresses.UserManager.address,
      KasuAllowList: xdcAddresses.KasuAllowList.address,
      SystemVariables: xdcAddresses.SystemVariables.address,
      KsuPrice: xdcAddresses.KsuPrice.address,
      UserLoyaltyRewards: xdcAddresses.UserLoyaltyRewards.address,
      ClearingCoordinator: xdcAddresses.ClearingCoordinator.address,
      ExternalTVL: xdcAddresses.KasuPoolExternalTVL.address,
    },
    subgraphUrl:
      'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn',
    usdc: '0xfa2958cb79b0491cc627c1557f441ef849ca8eb1',
    blockExplorer: 'https://xdcscan.com',
    rpcUrls: ['https://rpc.xdc.org', 'https://erpc.xdc.org'],
  },
}

export const DEFAULT_CHAIN_ID = base.id

export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS).map(Number)

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId]
}

export function isChainSupported(chainId: number): boolean {
  return chainId in SUPPORTED_CHAINS
}
```

### 2.2 XDC Chain Definition

**File:** `src/config/chains/xdc.ts` (NEW)

```typescript
import { defineChain } from 'viem'

export const xdc = defineChain({
  id: 50,
  name: 'XDC Network',
  nativeCurrency: {
    decimals: 18,
    name: 'XDC',
    symbol: 'XDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xdc.org'] },
  },
  blockExplorers: {
    default: { name: 'XDCScan', url: 'https://xdcscan.com' },
  },
  contracts: {},
})
```

---

## Phase 3: Chain Context Provider

### 3.1 Chain Context

**File:** `src/context/chain/chain.context.ts` (NEW)

```typescript
import { createContext } from 'react'
import {
  ChainConfig,
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
} from '@/config/chains'

export interface ChainContextValue {
  // Current chain state
  currentChainId: number
  chainConfig: ChainConfig

  // Feature flags derived from chain
  isLiteDeployment: boolean
  hasKsuToken: boolean
  hasLocking: boolean
  hasLoyalty: boolean
  hasNfts: boolean

  // Actions
  switchChain: (chainId: number) => Promise<void>

  // All supported chains for UI
  supportedChains: ChainConfig[]
}

export const ChainContext = createContext<ChainContextValue>({
  currentChainId: DEFAULT_CHAIN_ID,
  chainConfig: SUPPORTED_CHAINS[DEFAULT_CHAIN_ID],
  isLiteDeployment: false,
  hasKsuToken: true,
  hasLocking: true,
  hasLoyalty: true,
  hasNfts: true,
  switchChain: async () => {},
  supportedChains: Object.values(SUPPORTED_CHAINS),
})
```

### 3.2 Chain Provider

**File:** `src/context/chain/chain.provider.tsx` (NEW)

```typescript
'use client'

import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'

import { ChainContext, ChainContextValue } from './chain.context'
import {
    ChainConfig,
    DEFAULT_CHAIN_ID,
    getChainConfig,
    isChainSupported,
    SUPPORTED_CHAINS
} from '@/config/chains'

const CHAIN_STORAGE_KEY = 'kasu-selected-chain'

export const ChainProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { chain: walletChain } = useAccount()
    const { switchChainAsync } = useSwitchChain()

    // Initialize from localStorage or wallet chain or default
    const [currentChainId, setCurrentChainId] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(CHAIN_STORAGE_KEY)
            if (stored && isChainSupported(Number(stored))) {
                return Number(stored)
            }
        }
        return DEFAULT_CHAIN_ID
    })

    // Sync with wallet chain when it changes
    useEffect(() => {
        if (walletChain && isChainSupported(walletChain.id)) {
            setCurrentChainId(walletChain.id)
            localStorage.setItem(CHAIN_STORAGE_KEY, String(walletChain.id))
        }
    }, [walletChain?.id])

    const chainConfig = useMemo(() =>
        getChainConfig(currentChainId) || SUPPORTED_CHAINS[DEFAULT_CHAIN_ID],
        [currentChainId]
    )

    const switchChain = useCallback(async (chainId: number) => {
        if (!isChainSupported(chainId)) {
            throw new Error(`Chain ${chainId} is not supported`)
        }

        // Switch wallet chain
        if (switchChainAsync) {
            await switchChainAsync({ chainId })
        }

        // Update state and persist
        setCurrentChainId(chainId)
        localStorage.setItem(CHAIN_STORAGE_KEY, String(chainId))
    }, [switchChainAsync])

    const value: ChainContextValue = useMemo(() => ({
        currentChainId,
        chainConfig,
        isLiteDeployment: chainConfig.isLiteDeployment,
        hasKsuToken: !chainConfig.isLiteDeployment,
        hasLocking: !chainConfig.isLiteDeployment,
        hasLoyalty: !chainConfig.isLiteDeployment,
        hasNfts: !chainConfig.isLiteDeployment,
        switchChain,
        supportedChains: Object.values(SUPPORTED_CHAINS),
    }), [currentChainId, chainConfig, switchChain])

    return (
        <ChainContext.Provider value={value}>
            {children}
        </ChainContext.Provider>
    )
}
```

### 3.3 useChain Hook

**File:** `src/hooks/useChain.ts` (NEW)

```typescript
import { useContext } from 'react'
import { ChainContext } from '@/context/chain/chain.context'

export const useChain = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useChain must be used within ChainProvider')
  }
  return context
}
```

---

## Phase 4: Update Privy/Wagmi Configuration

### 4.1 Update Privy Provider

**File:** `src/context/privy.provider.tsx`

```typescript
'use client'

import { PrivyProvider as PrivyRootProvider } from '@privy-io/react-auth'
import { createConfig, WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { http } from 'wagmi'

import { SUPPORTED_CHAINS } from '@/config/chains'
import { ChainProvider } from '@/context/chain/chain.provider'

const queryClient = new QueryClient()

// Build chains and transports from registry
const chains = Object.values(SUPPORTED_CHAINS).map(c => c.chain)
const transports = Object.fromEntries(
    Object.values(SUPPORTED_CHAINS).map(c => [
        c.chainId,
        http(c.rpcUrls[0])
    ])
)

export const wagmiConfig = createConfig({
    chains: chains as any,
    transports,
})

const PRIVY_CONFIG = {
    appearance: {
        accentColor: '#c4996c' as `#${string}`,
        theme: 'light' as const,
        logo: PRIVY_LOGO_URL,
        walletList: ['detected_ethereum_wallets', 'metamask', 'wallet_connect', 'coinbase_wallet'],
    },
    loginMethods: ['wallet', 'google', 'email'] as const,
    embeddedWallets: {
        ethereum: {
            createOnLogin: 'users-without-wallets' as const,
        },
    },
    supportedChains: chains,
}

const PrivyProvider: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <PrivyRootProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
            config={PRIVY_CONFIG}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
                    <ChainProvider>
                        {children}
                    </ChainProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyRootProvider>
    )
}

export default PrivyProvider
```

---

## Phase 5: Update SDK Provider

### 5.1 SDK Provider with Chain Awareness

**File:** `src/context/sdk/sdk.provider.tsx`

```typescript
'use client'

import { KasuSdk } from '@kasufinance/kasu-sdk'
import { useEffect, useState, useMemo } from 'react'
import { useWallets } from '@privy-io/react-auth'

import { useChain } from '@/hooks/useChain'

export const SdkProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { chainConfig, currentChainId } = useChain()
    const { wallets } = useWallets()
    const wallet = wallets[0]

    const [sdk, setSdk] = useState<KasuSdk | null>(null)

    // Build SDK config from chain config
    const sdkConfig = useMemo(() => ({
        chainId: chainConfig.chainId,
        contracts: chainConfig.contracts,
        subgraphUrl: chainConfig.subgraphUrl,
        directusUrl: 'https://kasu-finance.directus.app/',
        UNUSED_LENDING_POOL_IDS: [], // Fetch from Directus
        isLiteDeployment: chainConfig.isLiteDeployment,
    }), [chainConfig])

    // Recreate SDK when chain or wallet changes
    useEffect(() => {
        if (!wallet) {
            setSdk(null)
            return
        }

        const initSdk = async () => {
            const provider = await wallet.getEthereumProvider()
            const ethersProvider = new ethers.providers.Web3Provider(provider)
            const signer = ethersProvider.getSigner()

            const newSdk = new KasuSdk(sdkConfig, signer)
            setSdk(newSdk)
        }

        initSdk()
    }, [wallet, sdkConfig, currentChainId])

    return (
        <SdkContext.Provider value={sdk}>
            {children}
        </SdkContext.Provider>
    )
}
```

---

## Phase 6: Chain Switcher UI Component

### 6.1 Chain Switcher

**File:** `src/components/molecules/ChainSwitcher/index.tsx` (NEW)

```typescript
'use client'

import { useState } from 'react'
import { Menu, MenuItem, Button, ListItemIcon, ListItemText } from '@mui/material'
import { useChain } from '@/hooks/useChain'

// Chain icons (add to assets)
import BaseIcon from '@/assets/icons/chains/BaseIcon'
import XdcIcon from '@/assets/icons/chains/XdcIcon'

const CHAIN_ICONS: Record<number, React.FC> = {
    8453: BaseIcon,
    50: XdcIcon,
}

export const ChainSwitcher: React.FC = () => {
    const { currentChainId, chainConfig, supportedChains, switchChain } = useChain()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const CurrentIcon = CHAIN_ICONS[currentChainId]

    const handleSwitch = async (chainId: number) => {
        setAnchorEl(null)
        if (chainId !== currentChainId) {
            await switchChain(chainId)
        }
    }

    return (
        <>
            <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                startIcon={CurrentIcon && <CurrentIcon />}
            >
                {chainConfig.name}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {supportedChains.map((chain) => {
                    const Icon = CHAIN_ICONS[chain.chainId]
                    return (
                        <MenuItem
                            key={chain.chainId}
                            onClick={() => handleSwitch(chain.chainId)}
                            selected={chain.chainId === currentChainId}
                        >
                            <ListItemIcon>
                                {Icon && <Icon />}
                            </ListItemIcon>
                            <ListItemText>{chain.name}</ListItemText>
                        </MenuItem>
                    )
                })}
            </Menu>
        </>
    )
}
```

### 6.2 Add to Header

Add `<ChainSwitcher />` to the header/navigation component next to wallet button.

---

## Phase 7: Conditional UI Rendering

### 7.1 Components to Update

| Component         | Location                                    | Change                                         |
| ----------------- | ------------------------------------------- | ---------------------------------------------- |
| Navigation        | `src/components/organisms/Navigation`       | Hide "Locking" tab when `!hasLocking`          |
| Pool Card         | `src/components/molecules/PoolCard`         | Hide loyalty badges when `!hasLoyalty`         |
| Tranche APY       | `src/components/molecules/TrancheCard`      | Hide bonus APY when `!hasLoyalty`              |
| Portfolio Rewards | `src/components/organisms/PortfolioRewards` | Hide KSU rewards section when `!hasKsuToken`   |
| Header Balance    | `src/components/molecules/HeaderBalance`    | Hide rKSU balance when `!hasKsuToken`          |
| Lock CTA          | Various                                     | Hide "Lock to earn" banners when `!hasLocking` |

### 7.2 Example: Navigation

```typescript
import { useChain } from '@/hooks/useChain'

export const Navigation = () => {
    const { hasLocking } = useChain()

    return (
        <nav>
            <Link href="/lending">Lending</Link>
            {hasLocking && <Link href="/locking">Locking</Link>}
            <Link href="/portfolio">Portfolio</Link>
        </nav>
    )
}
```

### 7.3 Example: Pool Card

```typescript
import { useChain } from '@/hooks/useChain'

export const PoolCard = ({ pool }) => {
    const { hasLoyalty } = useChain()

    return (
        <Card>
            <h3>{pool.name}</h3>
            <p>APY: {pool.apy}%</p>
            {hasLoyalty && pool.loyaltyBonus > 0 && (
                <Badge>+{pool.loyaltyBonus}% Loyalty Bonus</Badge>
            )}
        </Card>
    )
}
```

---

## Phase 8: SWR Cache Keys with Chain

Update all SWR cache keys to include chainId for proper cache isolation:

```typescript
// Before
useSWR(['poolOverviews'], () => sdk.DataService.getPoolOverview())

// After
useSWR(sdk ? ['poolOverviews', currentChainId] : null, () =>
  sdk.DataService.getPoolOverview()
)
```

**All hooks to update:**

- usePoolOverviews
- usePoolOverview
- useTransactionHistory
- useUserLendingBalance
- useLoanTickets
- useLatestClearingTimestamp
- ... (all hooks that fetch chain-specific data)

---

## Phase 9: Block Explorer Links

### 9.1 Explorer URL Helper

**File:** `src/utils/explorer.ts` (NEW)

```typescript
import { useChain } from '@/hooks/useChain'

export const useExplorerUrl = () => {
  const { chainConfig } = useChain()

  return {
    tx: (hash: string) => `${chainConfig.blockExplorer}/tx/${hash}`,
    address: (addr: string) => `${chainConfig.blockExplorer}/address/${addr}`,
    token: (addr: string) => `${chainConfig.blockExplorer}/token/${addr}`,
  }
}
```

### 9.2 Update Transaction Links

Replace hardcoded basescan.org links with dynamic explorer URLs.

---

## Implementation Order

| Phase | Description                                | Status |
| ----- | ------------------------------------------ | ------ |
| 1     | SDK changes (optional fields, Lite guards) | DONE   |
| 2     | Chain configuration system                 | DONE   |
| 3     | Chain context provider                     | DONE   |
| 4     | Update Privy/Wagmi config                  | DONE   |
| 5     | Update SDK provider                        | DONE   |
| 6     | Chain switcher UI                          | DONE   |
| 7     | Conditional UI rendering (navigation)      | DONE   |
| 8     | SWR cache keys                             | DONE   |
| 9     | Block explorer links                       | DONE   |
| 10    | Testing                                    | TODO   |

---

## Testing Checklist

### Chain Switching

- [ ] Switch from Base to XDC
- [ ] Switch from XDC to Base
- [ ] Chain persists after page refresh
- [ ] Wallet prompts to switch network
- [ ] SDK reinitializes with correct config

### Base (Full Deployment)

- [ ] Locking tab visible
- [ ] Loyalty badges visible
- [ ] APY bonus displayed
- [ ] KSU balance shown
- [ ] Lock to earn CTAs visible

### XDC (Lite Deployment)

- [ ] Locking tab hidden
- [ ] Loyalty badges hidden
- [ ] APY shows base rate only
- [ ] KSU balance hidden
- [ ] Lock CTAs hidden
- [ ] Pool descriptions load from Directus
- [ ] Deposits work
- [ ] Withdrawals work

### Data Isolation

- [ ] Pools load correctly per chain
- [ ] Transaction history is chain-specific
- [ ] Portfolio shows chain-specific data
- [ ] Switching chains clears/refreshes data

---

## XDC Contract Addresses

```
USDC:                 0xfa2958cb79b0491cc627c1557f441ef849ca8eb1
KasuController:       0xe81D1C0E031da0E357928ED19aA1EbF6A2f5C904
KSULocking:           0x7fF469f8c5fba92A9051B8D28794CBb891760e81
KsuPrice:             0x666b589933965bF8B378eD973f0404b6cae0eb52
SystemVariables:      0x34d17c9DD1f31Fb34757DE923EC083601d0eDFFe
LendingPoolManager:   0xa46143db92aBe5bB1f61d13d8C1cCd50fc40Ca10
UserManager:          0x9b57dF89e59235f0481A5Fae942302c8831e1B81
KasuAllowList:        0x32c1Ff5FbBe6D28503ddc46E5001C0D13d6E9B2A
ClearingCoordinator:  0xAF0a66953Eba1c5353eB7425b398B213Bb2c6121
UserLoyaltyRewards:   0xb95834C5610A178be9065Dd1EF78258D29879CDb
ExternalTVL:          0xCCB4156964377CF36441f3775A2A800dbeCB8094
FixedTermDeposit:     0xD498baBCF8D0eC89E129fB874DAB9e4C35cD2a52
```

## URLs

| Resource            | URL                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| XDC Block Explorer  | https://xdcscan.com                                                                                 |
| XDC Subgraph        | https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn   |
| Base Block Explorer | https://basescan.org                                                                                |
| Base Subgraph       | https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn |

---

## Adding Future Chains

To add a new chain (e.g., Plume):

1. Create chain definition in `src/config/chains/plume.ts`
2. Add addresses file `src/config/sdk/addresses-plume.json`
3. Add to `SUPPORTED_CHAINS` in `src/config/chains/index.ts`
4. Add chain icon to `src/assets/icons/chains/`
5. Deploy subgraph for the chain
6. Test chain switching and all features
