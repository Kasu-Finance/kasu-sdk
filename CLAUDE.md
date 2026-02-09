# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@kasufinance/kasu-sdk` is the shared TypeScript SDK for Kasu frontends. It provides:
- Contract wrappers (ethers.js v5) for all Kasu smart contracts
- Subgraph queries for pool data, user positions, and locking info
- Directus CMS integration for pool descriptions and KPIs
- Portfolio calculations (APY, yield, rewards)
- Support for both Full (Base) and Lite (XDC, Plume) deployments

**Current Version:** 2.0.0 (added Lite deployment support)

## Build Commands

```bash
npm install          # Install dependencies
npm run build-tc     # Regenerate typechain factories from ABIs
npm run build        # Lint + TypeScript compile
npm run rollup-build # Build distribution bundles
npm test             # Run Jest tests
npm run lint         # Fix lint issues
```

## Architecture

### Directory Structure

```
src/
├── contracts/           # Typechain-generated contract bindings
│   ├── factories/       # Contract factory classes
│   └── *.ts             # Contract type definitions
├── services/
│   ├── DataService/     # Pool data, subgraph queries, Directus
│   ├── Locking/         # KSU locking, loyalty levels, rewards
│   ├── Portfolio/       # User portfolio, balances, yields
│   ├── Swapper/         # Token swap helpers
│   └── UserLending/     # Deposit/withdraw, transaction history
├── utils/
│   └── deployment-mode.ts  # Lite/Full mode detection utility
├── index.ts             # Main exports (KasuSdk class)
└── sdk-config.ts        # Configuration types and SdkConfig class
```

### Key Files

| File | Purpose |
|------|---------|
| `src/sdk-config.ts` | `SdkConfig` class and `ContractAddresses` interface |
| `src/index.ts` | `KasuSdk` main class, exports all services |
| `src/services/Locking/locking.ts` | KSU locking service with Lite mode guards |
| `src/services/Portfolio/portfolio.ts` | Portfolio aggregation service |
| `src/services/DataService/data-service.ts` | Subgraph + Directus data fetching |
| `src/services/UserLending/user-lending.ts` | User deposit/withdraw operations |
| `src/utils/deployment-mode.ts` | `isLiteDeployment()` utility |

---

## Multi-Chain Support

### Supported Networks

| Network | Chain ID | Deployment Type | Status | Subgraph |
|---------|----------|-----------------|--------|----------|
| Base Mainnet | 8453 | Full | Production | `kasu-base/v1.0.13` |
| XDC Mainnet | 50 | Lite | WIP (frontend pending pools) | `kasu-xdc/v1.0.0` |
| Plume Mainnet | 98866 | Lite | Future | `kasu-plume/prod` |

### Full vs Lite Deployments

**Full Deployment** (Base mainnet):
- KSU token, locking, loyalty rewards enabled
- `KSUToken` and `KasuNFTs` contract addresses required
- `isLiteDeployment: false`

**Lite Deployment** (XDC, Plume):
- No KSU token or locking features
- KYC/KYB deposits still work
- `KSUToken` and `KasuNFTs` are `undefined`
- `isLiteDeployment: true`
- Locking methods return empty/zero values
- Transaction methods throw descriptive errors

### Feature Matrix

| Feature | Full (Base) | Lite (XDC, Plume) |
|---------|-------------|-------------------|
| KSU Token | Yes | No |
| KSU Locking | Yes | No |
| Loyalty Levels | Yes | No |
| APY Bonus | Yes | No |
| NFT Boosts | Yes | No |
| KYC/KYB Deposits | Yes | Yes |
| Lending Pools | Yes | Yes |
| Fixed Term Deposits | Yes | Yes |
| Pool Descriptions | Yes (Directus) | Yes (Directus) |

---

## SDK Configuration

### ContractAddresses Interface

```typescript
export interface ContractAddresses {
    /** Only on Full deployments (Base) */
    KSUToken?: string;
    /** Only on Full deployments */
    KasuNFTs?: string;

    // Always required
    IKSULocking: string;
    IKSULockBonus: string;
    UserManager: string;
    LendingPoolManager: string;
    KasuAllowList: string;
    SystemVariables: string;
    UserLoyaltyRewards: string;
    KsuPrice: string;
    ClearingCoordinator: string;
    ExternalTVL: string;
}
```

### SdkConfigOptions Interface

```typescript
export interface SdkConfigOptions {
    subgraphUrl: string;
    contracts: ContractAddresses;
    directusUrl: string;
    UNUSED_LENDING_POOL_IDS: string[];
    isLiteDeployment?: boolean;  // default: false
}
```

---

## Contract Addresses by Chain

### Base Mainnet (Chain ID: 8453)

```
USDC:                 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
KSUToken:             0x... (see kasu-fe-next config)
KSULocking:           0x...
LendingPoolManager:   0x...
UserManager:          0x...
KasuAllowList:        0x...
SystemVariables:      0x...
KsuPrice:             0x...
UserLoyaltyRewards:   0x...
ClearingCoordinator:  0x...
KasuNFTs:             0x...
ExternalTVL:          0x...
```

See `kasu-fe-next/src/config/sdk/addresses-base-mainnet.json` for full addresses.

### XDC Mainnet (Chain ID: 50)

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

See `kasu-fe-next/src/config/sdk/addresses-xdc.json` for full addresses.

### Subgraph URLs

| Chain | URL |
|-------|-----|
| Base | `https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn` |
| XDC | `https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn` |
| Plume | `https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-plume/prod` |

---

## Lite Mode Implementation

### Guard Pattern

When modifying services, check for Lite mode before accessing KSU-related functionality:

```typescript
// In service constructor
this._isLiteDeployment = config.isLiteDeployment;

// In methods that return data (silent fallback)
async getUserLockedAmount(address: string): Promise<string> {
    if (this._isLiteDeployment) {
        return '0';  // Return safe default
    }
    // ... normal implementation
}

// For transaction methods (throw error)
async lockTokens(amount: BigNumber): Promise<TransactionResponse> {
    if (this._isLiteDeployment) {
        throw new Error('Locking is not available on Lite deployments');
    }
    // ... normal implementation
}
```

### Lite Mode Behavior by Service

**Locking Service** (47+ guard clauses):
| Method | Lite Behavior |
|--------|---------------|
| `lockKSUTokens()` | Throws error |
| `unlockKSU()` | Throws error |
| `getUserLocks()` | Returns `[]` |
| `getUserTotalLockedAmount()` | Returns `'0'` |
| `getLoyaltyLevelAndApyBonusFromRatio()` | Returns `{ loyaltyLevel: 0, apyBonus: 0 }` |
| `getClaimableRewards()` | Returns `BigNumber.from(0)` |
| `getAvailableKsuBonus()` | Returns `'0'` |
| `getKasuEpochTokenPrice()` | Returns `{ price: 0, decimals: 18 }` |

**Portfolio Service** (6+ guard clauses):
| Method | Lite Behavior |
|--------|---------------|
| `getUserNfts()` | Returns `[]` |
| `getPortfolioRewards()` | Returns zeros for KSU-related fields |

**UserLending Service** (0 guard clauses):
- All lending operations work identically on all chains
- KYC/KYB deposit flows supported

**DataService** (0 guard clauses):
- Pool data queries are chain-agnostic
- Works on any subgraph

**Swapper Service** (0 guard clauses):
- Swap operations identical across chains

---

## Current Integration Status

### SDK (This Repository)

| Task | Status |
|------|--------|
| `isLiteDeployment` config flag | Done |
| Optional `KSUToken` contract address | Done |
| Optional `KasuNFTs` contract address | Done |
| Locking service Lite mode guards | Done |
| Portfolio service Lite mode guards | Done |
| README multi-chain documentation | Done |

### Frontend (kasu-fe-next)

| Task | Status |
|------|--------|
| Chain configuration system | Done |
| Chain context provider | Done |
| Chain switcher UI | Done |
| SDK provider chain awareness | Done |
| Conditional UI rendering | Done |
| SWR cache keys with chainId | Partial |
| Block explorer links | TODO |

### Blocking Issue: XDC Pools

XDC chain integration in the frontend is blocked because:
1. No lending pools are deployed on XDC yet
2. Server-side data fetching always uses Base (DEFAULT_CHAIN_ID)
3. Frontend shows "Coming Soon to XDC" when user switches to XDC

**To enable XDC:**
1. Deploy lending pools via kasu-contracts
2. Remove `ChainAwareContent` wrapper in `kasu-fe-next/src/app/lending/()/layout.tsx`
3. Test deposit/withdraw flows with Nexera KYC

---

## Contract ABIs

ABIs are stored in `abis/*.json`. When contract interfaces change:

1. Copy new ABI JSON files to `abis/`
2. Run `npm run build-tc` to regenerate typechain bindings
3. Update service code if method signatures changed

### ABI Files (21 total)

```
Core Lending:
├── ILendingPoolManager.abi.json
├── ILendingPool.abi.json
├── ILendingPoolTranche.abi.json
├── ILendingPoolFactory.abi.json

KSU Locking/Rewards:
├── IKSULocking.abi.json
├── KSULockBonus.abi.json
├── IUserLoyaltyRewards.abi.json
├── IKsuPrice.abi.json

User Management:
├── IUserManager.abi.json
├── IKasuAllowList.abi.json

System:
├── ISystemVariables.abi.json
├── IClearingCoordinator.abi.json

Full Deployments Only:
├── IKasuNFTs.abi.json

Other:
├── IERC20Metadata.abi.json
├── Swapper.abi.json
├── KasuPoolExternalTVL.abi.json
└── IKasuController.abi.json
```

---

## Testing

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
```

Tests use Jest. Test files are in `src/tests/`.

---

## Publishing

Version is in `package.json`. The SDK is published to npm as `@kasufinance/kasu-sdk`.

```bash
# Before publishing:
npm run build-tc     # Regenerate typechain
npm run build        # Type-check + lint
npm run rollup-build # Build bundles
npm test             # Run tests

# Publish:
npm version patch|minor|major
npm publish
```

---

## Related Repositories

| Repository | Path | Relationship |
|------------|------|--------------|
| `kasu-fe-next` | `/Users/kirilivanov/DEV/Kasu/kasu-fe-next` | Main consumer - imports SDK for all contract/data interactions |
| `kasu-contracts` | `/Users/kirilivanov/DEV/Kasu/kasu-contracts` | Source of ABIs and contract logic |
| `kasu-subgraph` | `/Users/kirilivanov/DEV/Kasu/kasu-subgraph` | Source of subgraph schema and queries |

---

## Adding a New Chain

1. **Determine deployment type**: Full (has KSU token) or Lite (no KSU token)

2. **Deploy contracts** via kasu-contracts:
   - For Lite: Deploy all contracts except KSU, KasuNFTs
   - Record addresses in `.openzeppelin/<chain>-addresses.json`

3. **Deploy subgraph** via kasu-subgraph:
   - Create chain config in `src/config/<chain>.json`
   - Deploy to Goldsky
   - Note subgraph URL

4. **No SDK changes needed** if contracts match existing ABIs:
   - SDK already supports `isLiteDeployment` flag
   - Just configure frontend with new chain config

5. **Frontend changes** (in kasu-fe-next):
   - Add chain to `src/config/chains/index.ts`
   - Add contract addresses to `src/config/sdk/addresses-<chain>.json`
   - Chain switcher will automatically include new chain

6. **If new ABIs needed**:
   - Copy ABIs to `abis/`
   - Run `npm run build-tc`
   - Update services if signatures changed
   - Publish new SDK version

---

## XDC Multisig Addresses

| Role | Address |
|------|---------|
| Kasu Multisig | `0x1E9ed74140DA7B81a1612AA5df33F98Eb5Ea0B4D` |
| Pool Manager Multisig | `0x21567eA21b14BEd14657e9725C2FE11C7be942B1` |
| Pool Admin Multisig | `0x880Aa2d6eEC5bD573059444cF1b3C09658f8c112` |
