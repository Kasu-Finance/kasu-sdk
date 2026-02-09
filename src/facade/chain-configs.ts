import { ChainConfigEntry } from './types';

/**
 * Built-in chain configurations for Kasu-supported networks.
 *
 * Usage:
 * ```ts
 * import { CHAIN_CONFIGS } from '@kasufinance/kasu-sdk';
 * const base = CHAIN_CONFIGS.base;
 * ```
 */
export const CHAIN_CONFIGS: Record<'base' | 'xdc' | 'plume', ChainConfigEntry> = {
    base: {
        chainId: 8453,
        name: 'Base Mainnet',
        isLiteDeployment: false,
        contracts: {
            KSUToken: '0x5D9b878744dbe721a3f33A60a6b102E289CeADBA',
            IKSULocking: '0xB145C061684C701c2C018A3f322aa14F5A553CE1',
            IKSULockBonus: '0xEEDE30AcF16caFf49c1a48F75185C67Be2e20B40',
            LendingPoolManager: '0xE1Be322323a412579b4A09fB08ff4bfcA12096B5',
            UserManager: '0x5Dc8D315a80fd99AbEF0f327B9a52a3FBC3C93f3',
            KasuAllowList: '0x807A7e119EBf0282420b5Ca0e0056c0525cBf8BB',
            SystemVariables: '0x193Bb02A24F5562b58fEB86550e6f09Bb6c41f69',
            KsuPrice: '0x221a54CbbD5f490Bd8e77CF36acBA4B1304E5c1b',
            UserLoyaltyRewards: '0xB4784f69Bb1F1076F50907cB0a815908a719D635',
            ClearingCoordinator: '0x2cF12A6d91fa4bEB5a4C17589a03e78F88f57DE2',
            KasuNFTs: '0x4946fF5f1a6550524C425479022D50446AA2968E',
            ExternalTVL: '0x662379FEBb3e4F91400B5f7d4f7F7ce4699F3c9F',
        },
        subgraphUrl:
            'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn',
        directusUrl: 'https://kasu-finance.directus.app/',
        unusedPoolIds: [],
        poolMetadataMapping: undefined,
    },

    xdc: {
        chainId: 50,
        name: 'XDC Mainnet',
        isLiteDeployment: true,
        contracts: {
            // No KSUToken on Lite deployments
            IKSULocking: '0x7fF469f8c5fba92A9051B8D28794CBb891760e81',
            IKSULockBonus: '0x7cc1434EfA50301Fdd56B7c5c6fF7e30Dc20C55c',
            LendingPoolManager: '0xa46143db92aBe5bB1f61d13d8C1cCd50fc40Ca10',
            UserManager: '0x9b57dF89e59235f0481A5Fae942302c8831e1B81',
            KasuAllowList: '0x32c1Ff5FbBe6D28503ddc46E5001C0D13d6E9B2A',
            SystemVariables: '0x34d17c9DD1f31Fb34757DE923EC083601d0eDFFe',
            KsuPrice: '0x666b589933965bF8B378eD973f0404b6cae0eb52',
            UserLoyaltyRewards: '0xb95834C5610A178be9065Dd1EF78258D29879CDb',
            ClearingCoordinator: '0xAF0a66953Eba1c5353eB7425b398B213Bb2c6121',
            // No KasuNFTs on Lite deployments
            ExternalTVL: '0xCCB4156964377CF36441f3775A2A800dbeCB8094',
        },
        subgraphUrl:
            'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn',
        directusUrl: 'https://kasu-finance.directus.app/',
        unusedPoolIds: [],
        poolMetadataMapping: {
            '0x20f42fb45f91657acf9528b99a5a16d0229c7800':
                '0xc987350716fe4a7d674c3591c391d29eba26b8ce',
            '0x3b7cb493aa22f731db2ab424d918e7375e00f6a9':
                '0x03f93c8caa9a82e000d35673ba34a4c0e6e117a2',
            '0xeda50c91a8c4ca8a83652b8542c0b3bd00a71fad':
                '0xc347a9e4aec8c8d11a149d2907deb2bf23b81c6f',
        },
    },

    plume: {
        chainId: 98866,
        name: 'Plume Mainnet',
        isLiteDeployment: true,
        contracts: {
            // Placeholder — update when Plume contracts are deployed
            IKSULocking: '',
            IKSULockBonus: '',
            LendingPoolManager: '',
            UserManager: '',
            KasuAllowList: '',
            SystemVariables: '',
            KsuPrice: '',
            UserLoyaltyRewards: '',
            ClearingCoordinator: '',
            ExternalTVL: '',
        },
        subgraphUrl:
            'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-plume/prod',
        directusUrl: 'https://kasu-finance.directus.app/',
        unusedPoolIds: [],
        poolMetadataMapping: undefined,
    },
};
