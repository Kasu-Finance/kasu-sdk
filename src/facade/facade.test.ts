/**
 * Offline facade specs — a mock provider and pure helpers, no network. Moved
 * here from `src/tests/` so it runs beside the code it covers, and so the
 * opt-in `LIVE_TESTS` gate on `src/tests/` does not take it out of CI.
 */
import { DataService } from '../services/DataService/data-service';
import { NO_DIRECTUS_URL_MESSAGE } from '../services/DataService/directus-client';
import {
    PoolDelegateProfileAndHistory,
    PoolOverview,
    RiskManagement,
} from '../services/DataService/types';
import { Portfolio } from '../services/Portfolio/portfolio';
import { UserRequestStatus } from '../services/UserLending/subgraph-types';
import { UserRequest } from '../services/UserLending/types';
import { UserLending } from '../services/UserLending/user-lending';

import { CHAIN_CONFIGS } from './chain-configs';
import { DepositsFacade } from './deposits';
import { Kasu } from './kasu';
import { StrategiesFacade } from './strategies';
import { Strategy } from './types';
import { PortfolioFacade } from './user-portfolio';

// ---------------------------------------------------------------------------
// Chain configs
// ---------------------------------------------------------------------------

describe('CHAIN_CONFIGS', () => {
    it('should have base, xdc, and plume entries', () => {
        expect(CHAIN_CONFIGS).toHaveProperty('base');
        expect(CHAIN_CONFIGS).toHaveProperty('xdc');
        expect(CHAIN_CONFIGS).toHaveProperty('plume');
    });

    it('base should be a full deployment', () => {
        const base = CHAIN_CONFIGS.base;
        expect(base.chainId).toBe(8453);
        expect(base.isLiteDeployment).toBe(false);
        expect(base.contracts.KSUToken).toBeDefined();
        expect(base.contracts.KasuNFTs).toBeDefined();
    });

    it('xdc should be a lite deployment without KSU token', () => {
        const xdc = CHAIN_CONFIGS.xdc;
        expect(xdc.chainId).toBe(50);
        expect(xdc.isLiteDeployment).toBe(true);
        expect(xdc.contracts.KSUToken).toBeUndefined();
        expect(xdc.contracts.KasuNFTs).toBeUndefined();
    });

    it('plume should be a lite deployment', () => {
        const plume = CHAIN_CONFIGS.plume;
        expect(plume.chainId).toBe(98866);
        expect(plume.isLiteDeployment).toBe(true);
    });

    it('all chains should have required contract addresses', () => {
        for (const [, config] of Object.entries(CHAIN_CONFIGS)) {
            expect(config.contracts.LendingPoolManager).toBeDefined();
            expect(config.contracts.UserManager).toBeDefined();
            expect(config.contracts.KasuAllowList).toBeDefined();
            expect(config.contracts.SystemVariables).toBeDefined();
            expect(config.subgraphUrl).toContain('goldsky.com');
        }
    });

    it('plume points at the LEGACY goldsky project its frozen history is on', () => {
        // Plume was indexed before the live chains moved to the current
        // project; the same path under that project returns HTTP 404, so the
        // retired deployment's history is only readable at this spelling —
        // note the `/gn` suffix the current project's URLs do not carry.
        const projectOf = (url: string): string => url.split('/')[5] ?? '';
        expect(projectOf(CHAIN_CONFIGS.plume.subgraphUrl)).not.toBe(
            projectOf(CHAIN_CONFIGS.base.subgraphUrl),
        );
        expect(CHAIN_CONFIGS.plume.subgraphUrl.endsWith('/gn')).toBe(true);
    });

    it('xdc should have poolMetadataMapping', () => {
        const mapping = CHAIN_CONFIGS.xdc.poolMetadataMapping;
        expect(mapping).toBeDefined();
        expect(Object.keys(mapping ?? {}).length).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// Kasu.create()
// ---------------------------------------------------------------------------

describe('Kasu.create()', () => {
    // Mock provider — enough to construct the SDK without network calls
    const mockProvider = {
        getNetwork: jest
            .fn()
            .mockResolvedValue({ chainId: 8453, name: 'base' }),
        call: jest.fn(),
        estimateGas: jest.fn(),
        getBlockNumber: jest.fn(),
        getBlock: jest.fn(),
        getTransaction: jest.fn(),
        getTransactionReceipt: jest.fn(),
        getLogs: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        off: jest.fn(),
        removeAllListeners: jest.fn(),
        _isProvider: true,
    };

    it('should create an instance from a chain name', () => {
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: mockProvider as never,
        });

        expect(kasu).toBeInstanceOf(Kasu);
        expect(kasu.strategies).toBeInstanceOf(StrategiesFacade);
        expect(kasu.deposits).toBeInstanceOf(DepositsFacade);
        expect(kasu.portfolio).toBeInstanceOf(PortfolioFacade);
    });

    it('should expose chainConfig for the selected chain', () => {
        const kasu = Kasu.create({
            chain: 'xdc',
            signerOrProvider: mockProvider as never,
        });

        expect(kasu.chainConfig.chainId).toBe(50);
        expect(kasu.isLiteDeployment).toBe(true);
    });

    it('should accept a custom ChainConfigEntry', () => {
        const custom = {
            ...CHAIN_CONFIGS.base,
            chainId: 999,
            name: 'CustomChain',
        };

        const kasu = Kasu.create({
            chain: custom,
            signerOrProvider: mockProvider as never,
        });

        expect(kasu.chainConfig.chainId).toBe(999);
        expect(kasu.chainConfig.name).toBe('CustomChain');
    });

    it('should accept configOverrides', () => {
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: mockProvider as never,
            configOverrides: {
                UNUSED_LENDING_POOL_IDS: ['0xdead'],
            },
        });

        expect(kasu).toBeInstanceOf(Kasu);
    });

    it('constructs without a directusUrl — on-chain data does not need one', () => {
        // `createDirectus('')` throws `Invalid URL`, so an SDK configured
        // without the (documented-optional) CMS URL used to be
        // unconstructable rather than merely CMS-less.
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: mockProvider as never,
            configOverrides: { directusUrl: '' },
        });

        expect(kasu).toBeInstanceOf(Kasu);
        expect(kasu.services.DataService).toBeDefined();
        expect(kasu.services.UserLending).toBeDefined();
    });

    it('refuses a CMS-only call clearly when no directusUrl is configured', async () => {
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: mockProvider as never,
            configOverrides: { directusUrl: '' },
        });

        // A sentence naming what to configure, not a null dereference thrown
        // from inside the vendor SDK.
        await expect(
            kasu.services.DataService.getPlatformOverview(),
        ).rejects.toThrow(NO_DIRECTUS_URL_MESSAGE);
    });

    it('should expose the underlying KasuSdk via .services', () => {
        const kasu = Kasu.create({
            chain: 'base',
            signerOrProvider: mockProvider as never,
        });

        expect(kasu.services).toBeDefined();
        expect(kasu.services.DataService).toBeDefined();
        expect(kasu.services.UserLending).toBeDefined();
        expect(kasu.services.Locking).toBeDefined();
        expect(kasu.services.Portfolio).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// StrategiesFacade — the CMS text fields on Strategy
// ---------------------------------------------------------------------------

describe('StrategiesFacade — subheading and liteDescription', () => {
    function pool(over: Record<string, unknown>): PoolOverview {
        return {
            id: '0x0000000000000000000000000000000000000005',
            poolName: 'Pool',
            description: 'Long description',
            liteDescription: '',
            isActive: true,
            apy: 0.1,
            totalValueLocked: { total: '0', offchain: '0' },
            poolCapacity: '0',
            poolCapacityPercentage: '0',
            tranches: [],
            assetClass: 'Receivables',
            poolApyStructure: 'Variable',
            thumbnailImageUrl: '',
            bannerImageUrl: '',
            ...over,
        } as unknown as PoolOverview;
    }

    async function strategyOf(
        over: Record<string, unknown>,
    ): Promise<Strategy> {
        const facade = new StrategiesFacade(
            {
                getPoolOverview: jest.fn().mockResolvedValue([pool(over)]),
            } as unknown as DataService,
            {
                getCurrentEpoch: jest.fn().mockResolvedValue('1'),
            } as unknown as UserLending,
        );
        const [strategy] = await facade.getAll();
        return strategy;
    }

    it('exposes both when the CMS record has them, from the same source as `_raw`', async () => {
        const strategy = await strategyOf({
            subheading: 'Tax receivables',
            liteDescription: 'Short description',
        });
        expect(strategy.subheading).toBe('Tax receivables');
        expect(strategy.liteDescription).toBe('Short description');
        expect(strategy.subheading).toBe(strategy._raw.subheading);
        expect(strategy.liteDescription).toBe(strategy._raw.liteDescription);
    });

    it('leaves both undefined when absent', async () => {
        const strategy = await strategyOf({ liteDescription: undefined });
        expect(strategy.subheading).toBeUndefined();
        expect(strategy.liteDescription).toBeUndefined();
        expect('subheading' in strategy._raw).toBe(false);
    });

    it('normalises an empty or blank string to undefined (the service maps a missing liteDescription to "")', async () => {
        for (const empty of ['', '   ']) {
            const strategy = await strategyOf({
                subheading: empty,
                liteDescription: empty,
            });
            expect(strategy.subheading).toBeUndefined();
            expect(strategy.liteDescription).toBeUndefined();
        }
    });
});

describe('StrategiesFacade — summary', () => {
    function pool(over: Record<string, unknown>): PoolOverview {
        return {
            id: '0x0000000000000000000000000000000000000006',
            poolName: 'Pool',
            description: '',
            liteDescription: '',
            isActive: true,
            apy: 0.1,
            totalValueLocked: { total: '0', offchain: '0' },
            poolCapacity: '0',
            poolCapacityPercentage: '0',
            tranches: [],
            assetClass: 'Receivables',
            poolApyStructure: 'Variable',
            thumbnailImageUrl: '',
            bannerImageUrl: '',
            ...over,
        } as unknown as PoolOverview;
    }

    async function strategyOf(
        over: Record<string, unknown>,
    ): Promise<Strategy> {
        const facade = new StrategiesFacade(
            {
                getPoolOverview: jest.fn().mockResolvedValue([pool(over)]),
            } as unknown as DataService,
            {
                getCurrentEpoch: jest.fn().mockResolvedValue('1'),
            } as unknown as UserLending,
        );
        const [strategy] = await facade.getAll();
        return strategy;
    }

    it('is liteDescription as one line of plain text', async () => {
        const strategy = await strategyOf({
            liteDescription: '**Lead.**\n\nMore text.',
            description: 'Profile.\n\nSecond.',
        });
        expect(strategy.summary).toBe('Lead. More text.');
        // The raw fields are untouched.
        expect(strategy.liteDescription).toBe('**Lead.**\n\nMore text.');
        expect(strategy._raw.liteDescription).toBe('**Lead.**\n\nMore text.');
    });

    it('falls back to the first paragraph of description for the "Not Available" placeholder', async () => {
        const strategy = await strategyOf({
            liteDescription: 'Not Available',
            description: 'Profile.\n\nSecond.',
        });
        expect(strategy.summary).toBe('Profile.');
        // liteDescription stays the raw CMS value; only summary reads the placeholder.
        expect(strategy.liteDescription).toBe('Not Available');
    });

    it('is undefined for a pool with no CMS record', async () => {
        const strategy = await strategyOf({});
        expect(strategy.summary).toBeUndefined();
    });

    it('is undefined, never "", when both fields are blank', async () => {
        const strategy = await strategyOf({
            liteDescription: '  ',
            description: '\n\n',
        });
        expect(strategy.summary).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// StrategiesFacade.calculateDepositLimits()
// ---------------------------------------------------------------------------

describe('StrategiesFacade.calculateDepositLimits()', () => {
    // We can test this pure function without network calls by constructing
    // a StrategiesFacade with null services and calling calculateDepositLimits directly.
    const facade = new StrategiesFacade(null as never, null as never);

    it('should enforce minimum of 1 USDC', () => {
        const tranche = makeTranche({
            minimumDeposit: '0.5',
            maximumDeposit: '10000',
            poolCapacity: '50000',
        });

        const limits = facade.calculateDepositLimits(tranche);
        expect(limits.min).toBe('1');
        expect(limits.max).toBe('10000');
        expect(limits.availableCapacity).toBe('50000');
    });

    it('should pass through minimum when >= 1', () => {
        const tranche = makeTranche({
            minimumDeposit: '100',
            maximumDeposit: '10000',
            poolCapacity: '50000',
        });

        const limits = facade.calculateDepositLimits(tranche);
        expect(limits.min).toBe('100');
    });

    it('should cap max at pool capacity when capacity is lower', () => {
        const tranche = makeTranche({
            minimumDeposit: '100',
            maximumDeposit: '50000',
            poolCapacity: '10000',
        });

        const limits = facade.calculateDepositLimits(tranche);
        expect(limits.max).toBe('10000');
    });

    it('should use maximumDeposit when capacity is higher', () => {
        const tranche = makeTranche({
            minimumDeposit: '100',
            maximumDeposit: '5000',
            poolCapacity: '50000',
        });

        const limits = facade.calculateDepositLimits(tranche);
        expect(limits.max).toBe('5000');
    });
});

// ---------------------------------------------------------------------------
// StrategiesFacade.getRiskPerformance() / getOriginator()
// ---------------------------------------------------------------------------

describe('StrategiesFacade risk and originator accessors', () => {
    const BASE_POOL = '0x00000000000000000000000000000000000000aa';
    const XDC_POOL = '0x00000000000000000000000000000000000000BB';
    const OTHER_POOL = '0x00000000000000000000000000000000000000cc';

    function riskRecord(
        poolIdFK: string,
        riskPerformance: Record<string, unknown>,
    ): RiskManagement {
        return {
            id: `risk-${poolIdFK}`,
            poolIdFK,
            items: [],
            riskPerformance,
        } as unknown as RiskManagement;
    }

    function delegate(
        id: string,
        poolIds: (string | number)[],
    ): PoolDelegateProfileAndHistory {
        return {
            id,
            delegateLendingHistory: 9,
            assetClasses: 'Receivables',
            otherKASUPools: poolIds.map((pid) => ({
                id: pid as string,
                name: 'Strategy',
                isActive: true,
                isOversubscribed: false,
            })),
            totalLoanFundsOriginated: 1,
            totalLoansOriginated: 1,
            loansUnderManagement: 1,
            historicLossRate: 0.001,
        };
    }

    function facadeWith(
        data: Partial<
            Pick<
                DataService,
                'getRiskManagement' | 'getPoolDelegateProfileAndHistory'
            >
        >,
        mapping: Record<string, string> = {},
    ): StrategiesFacade {
        return new StrategiesFacade(
            data as unknown as DataService,
            null as never,
            mapping,
        );
    }

    it("reads a pool's loss rate and first-loss capital", async () => {
        const facade = facadeWith({
            getRiskManagement: jest.fn().mockResolvedValue([
                riskRecord(OTHER_POOL, {
                    poolLossRate: 0.5,
                    firstLossCapital: 1,
                }),
                riskRecord(BASE_POOL, {
                    poolLossRate: 0.0012,
                    firstLossCapital: 250000,
                }),
            ]),
        });
        await expect(
            facade.getRiskPerformance(
                BASE_POOL.toUpperCase().replace('0X', '0x'),
            ),
        ).resolves.toEqual({
            poolLossRate: 0.0012,
            firstLossCapital: 250000,
        });
    });

    it('resolves an XDC pool through the metadata mapping', async () => {
        const facade = facadeWith(
            {
                getRiskManagement: jest.fn().mockResolvedValue([
                    riskRecord(BASE_POOL, {
                        poolLossRate: 0.01,
                        firstLossCapital: 5,
                    }),
                ]),
            },
            { [XDC_POOL.toLowerCase()]: BASE_POOL },
        );
        await expect(facade.getRiskPerformance(XDC_POOL)).resolves.toEqual({
            poolLossRate: 0.01,
            firstLossCapital: 5,
        });
    });

    it('never turns an unauthored or malformed figure into a confident 0', async () => {
        const cases: [unknown, number | null][] = [
            ['', null],
            ['   ', null],
            [null, null],
            [undefined, null],
            ['abc', null],
            [Number.NaN, null],
            [Number.POSITIVE_INFINITY, null],
            ['0.004', 0.004],
            [0, 0],
        ];
        for (const [raw, expected] of cases) {
            const facade = facadeWith({
                getRiskManagement: jest.fn().mockResolvedValue([
                    riskRecord(BASE_POOL, {
                        poolLossRate: raw,
                        firstLossCapital: raw,
                    }),
                ]),
            });
            await expect(facade.getRiskPerformance(BASE_POOL)).resolves.toEqual(
                {
                    poolLossRate: expected,
                    firstLossCapital: expected,
                },
            );
        }
    });

    it('returns null for a pool with no risk record', async () => {
        const facade = facadeWith({
            getRiskManagement: jest
                .fn()
                .mockResolvedValue([riskRecord(OTHER_POOL, {})]),
        });
        await expect(facade.getRiskPerformance(BASE_POOL)).resolves.toBeNull();
    });

    it('finds the originator whose record lists the pool, case-insensitively', async () => {
        const apx = delegate('apx', [
            BASE_POOL.toUpperCase().replace('0X', '0x'),
        ]);
        const facade = facadeWith({
            getPoolDelegateProfileAndHistory: jest
                .fn()
                .mockResolvedValue([delegate('other', [OTHER_POOL]), apx]),
        });
        await expect(facade.getOriginator(BASE_POOL)).resolves.toBe(apx);
    });

    it('falls back to the metadata id, and tolerates numeric ids', async () => {
        const viaMapping = delegate('apx', [BASE_POOL]);
        const facade = facadeWith(
            {
                getPoolDelegateProfileAndHistory: jest
                    .fn()
                    .mockResolvedValue([delegate('n', [7]), viaMapping]),
            },
            { [XDC_POOL.toLowerCase()]: BASE_POOL },
        );
        await expect(facade.getOriginator(XDC_POOL)).resolves.toBe(viaMapping);
        await expect(facade.getOriginator('7')).resolves.toMatchObject({
            id: 'n',
        });
    });

    it('returns null when no originator lists the pool', async () => {
        const facade = facadeWith({
            getPoolDelegateProfileAndHistory: jest
                .fn()
                .mockResolvedValue([delegate('other', [OTHER_POOL])]),
        });
        await expect(facade.getOriginator(BASE_POOL)).resolves.toBeNull();
    });
});

// ---------------------------------------------------------------------------
// StrategiesFacade — the Details-screen fields (2.15.0)
// ---------------------------------------------------------------------------

describe('StrategiesFacade details fields', () => {
    const NOW = new Date('2026-11-05T12:00:00Z');
    const BASE_POOL = '0x00000000000000000000000000000000000000aa';
    const XDC_POOL = '0x00000000000000000000000000000000000000BB';
    const OTHER_POOL = '0x00000000000000000000000000000000000000cc';

    // A pool as `getPoolOverview` maps it — the CMS fields the Details tab
    // reads, in their live shapes. `over` replaces any of them.
    function pool(over: Record<string, unknown> = {}): PoolOverview {
        return {
            id: BASE_POOL,
            poolName: 'Taxation Funding (Tax Pay)',
            description: '',
            liteDescription: '',
            isActive: true,
            apy: 0.1,
            totalValueLocked: { total: '2567901.5', offchain: '0' },
            yieldEarned: '514912.25',
            poolCapacity: '0',
            poolCapacityPercentage: '0',
            tranches: [],
            assetClass: 'Tax Receivables',
            poolApyStructure: 'Variable',
            thumbnailImageUrl: '',
            bannerImageUrl: '',
            operatingSince: '2024-06-01',
            industryExposure:
                'SMEs & Large Businesses (Diversified industries – exclusions for high risk industries apply)',
            loanStructure:
                'Revolving Instalment Facility\n12-24 months instalment loan, subject to annual review',
            security: ['Guarantee & Indemnity', ' Director Guarantee(s) ', ''],
            ...over,
        } as unknown as PoolOverview;
    }

    async function strategyOf(
        over: Record<string, unknown> = {},
    ): Promise<Strategy> {
        const facade = new StrategiesFacade(
            {
                getPoolOverview: jest.fn().mockResolvedValue([pool(over)]),
            } as unknown as DataService,
            {
                getCurrentEpoch: jest.fn().mockResolvedValue('1'),
            } as unknown as UserLending,
            {},
            () => NOW,
        );
        const [strategy] = await facade.getAll();
        return strategy;
    }

    describe('on Strategy', () => {
        it('maps every field from the pool overview', async () => {
            const strategy = await strategyOf();
            expect(strategy.strategyHistory).toEqual({
                since: '2024-06-01',
                lenderInterestEarned: 514912.25,
            });
            expect(strategy.endBorrowers).toEqual({
                businessTypes: {
                    primary: 'SMEs & Large Businesses',
                    detail: 'Diversified industries – exclusions for high risk industries apply',
                },
                facility: {
                    label: 'Revolving Instalment Facility',
                    detail: '12-24 months instalment loan, subject to annual review',
                    revolving: true,
                },
            });
            expect(strategy.securityStructure).toEqual([
                'Guarantee & Indemnity',
                'Director Guarantee(s)',
            ]);
            // The raw CMS values stay untouched.
            expect(strategy._raw.loanStructure).toBe(
                'Revolving Instalment Facility\n12-24 months instalment loan, subject to annual review',
            );
        });

        it('omits every field a pool with no CMS record lacks', async () => {
            // `getPoolOverview` maps a pool with no CMS record to '' / [] /
            // undefined; the subgraph still has its interest.
            const strategy = await strategyOf({
                operatingSince: undefined,
                industryExposure: '',
                loanStructure: '',
                security: [],
            });
            expect(strategy.strategyHistory).toEqual({
                lenderInterestEarned: 514912.25,
            });
            expect(strategy.strategyHistory).not.toHaveProperty('since');
            expect(strategy.endBorrowers).toBeUndefined();
            expect(strategy.securityStructure).toBeUndefined();
        });

        it('never stubs an unreadable value', async () => {
            const strategy = await strategyOf({
                operatingSince: 'Jun 2024',
                yieldEarned: '',
                industryExposure: '   ',
                loanStructure: null,
                security: null,
            });
            expect(strategy.strategyHistory).toEqual({});
            expect(strategy.endBorrowers).toBeUndefined();
            expect(strategy.securityStructure).toBeUndefined();
        });

        it('refuses a start date after the clock', async () => {
            const strategy = await strategyOf({ operatingSince: '2026-11-06' });
            expect(strategy.strategyHistory?.since).toBeUndefined();
        });

        it('keeps a genuine zero of interest', async () => {
            const strategy = await strategyOf({ yieldEarned: '0' });
            expect(strategy.strategyHistory?.lenderInterestEarned).toBe(0);
        });

        it('carries End Borrowers when only one of the two is authored', async () => {
            const onlyFacility = await strategyOf({
                industryExposure: '',
                loanStructure: 'Revolving',
            });
            expect(onlyFacility.endBorrowers).toEqual({
                facility: { label: 'Revolving', revolving: true },
            });
            const onlyTypes = await strategyOf({
                industryExposure: 'Accounting Firms',
                loanStructure: '',
            });
            expect(onlyTypes.endBorrowers).toEqual({
                businessTypes: { primary: 'Accounting Firms' },
            });
        });
    });

    function delegate(
        poolIds: string[],
        fields: Record<string, unknown>,
    ): PoolDelegateProfileAndHistory {
        return {
            id: 'apx',
            assetClasses: 'Receivables',
            otherKASUPools: poolIds.map((id) => ({
                id,
                name: 'Strategy',
                isActive: true,
                isOversubscribed: false,
            })),
            totalLoansOriginated: 1,
            ...fields,
        } as unknown as PoolDelegateProfileAndHistory;
    }

    function facadeWith(
        data: Partial<
            Pick<
                DataService,
                'getRiskManagement' | 'getPoolDelegateProfileAndHistory'
            >
        >,
        mapping: Record<string, string> = {},
    ): StrategiesFacade {
        return new StrategiesFacade(
            data as unknown as DataService,
            null as never,
            mapping,
            () => NOW,
        );
    }

    describe('getOriginatorHistory', () => {
        it('reads the four figures in their live shapes', async () => {
            // Live: the start date is an ISO datetime, the loss rate a
            // numeric string, the money figures numbers.
            const facade = facadeWith({
                getPoolDelegateProfileAndHistory: jest.fn().mockResolvedValue([
                    delegate([OTHER_POOL], { totalLoanFundsOriginated: 9 }),
                    delegate([BASE_POOL], {
                        delegateLendingHistory: '2016-12-13T00:00:00.000Z',
                        totalLoanFundsOriginated: 50446371,
                        loansUnderManagement: 10030000,
                        historicLossRate: '0.00200',
                    }),
                ]),
            });
            await expect(
                facade.getOriginatorHistory(BASE_POOL),
            ).resolves.toEqual({
                since: '2016-12-13',
                totalOriginated: 50446371,
                loansOutstanding: 10030000,
                lossRate: 0.002,
            });
        });

        it('keeps a genuine 0.00000 loss rate as 0', async () => {
            const facade = facadeWith({
                getPoolDelegateProfileAndHistory: jest
                    .fn()
                    .mockResolvedValue([
                        delegate([BASE_POOL], { historicLossRate: '0.00000' }),
                    ]),
            });
            await expect(
                facade.getOriginatorHistory(BASE_POOL),
            ).resolves.toEqual({ lossRate: 0 });
        });

        it('omits each unauthored or malformed figure', async () => {
            const facade = facadeWith({
                getPoolDelegateProfileAndHistory: jest.fn().mockResolvedValue([
                    delegate([BASE_POOL], {
                        delegateLendingHistory: 'since 2016',
                        totalLoanFundsOriginated: '',
                        loansUnderManagement: null,
                        historicLossRate: '4.5',
                    }),
                ]),
            });
            await expect(
                facade.getOriginatorHistory(BASE_POOL),
            ).resolves.toEqual({ lossRate: 4.5 });
        });

        it('reads a numeric start date as unix seconds, as kasu-ui does', async () => {
            const facade = facadeWith({
                getPoolDelegateProfileAndHistory: jest
                    .fn()
                    .mockResolvedValue([
                        delegate([BASE_POOL], {
                            delegateLendingHistory: 1481587200,
                        }),
                    ]),
            });
            await expect(
                facade.getOriginatorHistory(BASE_POOL),
            ).resolves.toEqual({ since: '2016-12-13' });
        });

        it('is null when the profile authors none of the four', async () => {
            const facade = facadeWith({
                getPoolDelegateProfileAndHistory: jest.fn().mockResolvedValue([
                    delegate([BASE_POOL], {
                        delegateLendingHistory: null,
                        totalLoanFundsOriginated: '',
                        loansUnderManagement: '  ',
                        historicLossRate: undefined,
                    }),
                ]),
            });
            await expect(
                facade.getOriginatorHistory(BASE_POOL),
            ).resolves.toBeNull();
        });

        it('is null when no profile lists the pool', async () => {
            const facade = facadeWith({
                getPoolDelegateProfileAndHistory: jest
                    .fn()
                    .mockResolvedValue([
                        delegate([OTHER_POOL], { historicLossRate: 0 }),
                    ]),
            });
            await expect(
                facade.getOriginatorHistory(BASE_POOL),
            ).resolves.toBeNull();
        });
    });

    describe('getRiskManagementGroups', () => {
        function record(poolIdFK: string, items: unknown): RiskManagement {
            return {
                id: `risk-${poolIdFK}`,
                poolIdFK,
                items,
                riskPerformance: {},
            } as unknown as RiskManagement;
        }

        const ITEMS = [
            {
                name: 'Debt Ratio',
                group: 'Financial Covenants',
                description: 'must be below 1',
                tooltip: '',
            },
            {
                name: 'Guarantee & Indemnity',
                group: 'Security & Recourse',
                description: '',
                tooltip: 'A promise to repay.',
            },
            {
                name: 'Loan funds drawn directly to the tax authority',
                group: 'Structural Controls',
                description: '',
                tooltip: '',
            },
        ];

        it("groups the pool's items in the canonical order", async () => {
            const facade = facadeWith({
                getRiskManagement: jest
                    .fn()
                    .mockResolvedValue([
                        record(OTHER_POOL, [{ name: 'x', group: 'Other' }]),
                        record(BASE_POOL, ITEMS),
                    ]),
            });
            await expect(
                facade.getRiskManagementGroups(BASE_POOL),
            ).resolves.toEqual([
                {
                    group: 'Security & Recourse',
                    items: [
                        {
                            name: 'Guarantee & Indemnity',
                            clauses: [],
                            tooltip: 'A promise to repay.',
                        },
                    ],
                },
                {
                    group: 'Structural Controls',
                    items: [
                        {
                            name: 'Loan funds drawn directly to the tax authority',
                            clauses: [],
                        },
                    ],
                },
                {
                    group: 'Financial Covenants',
                    items: [
                        {
                            name: 'Debt Ratio',
                            description: 'must be below 1',
                            clauses: ['must be below 1'],
                        },
                    ],
                },
            ]);
        });

        it('resolves an XDC pool through the metadata mapping', async () => {
            const facade = facadeWith(
                {
                    getRiskManagement: jest
                        .fn()
                        .mockResolvedValue([record(BASE_POOL, ITEMS)]),
                },
                { [XDC_POOL.toLowerCase()]: BASE_POOL },
            );
            const groups = await facade.getRiskManagementGroups(XDC_POOL);
            expect(groups?.map((g) => g.group)).toEqual([
                'Security & Recourse',
                'Structural Controls',
                'Financial Covenants',
            ]);
        });

        it('is null with no record, no items, or no usable item', async () => {
            for (const records of [
                [record(OTHER_POOL, ITEMS)],
                [record(BASE_POOL, [])],
                [record(BASE_POOL, undefined)],
                [
                    record(BASE_POOL, [
                        { name: '', group: 'Security & Recourse' },
                    ]),
                ],
            ]) {
                const facade = facadeWith({
                    getRiskManagement: jest.fn().mockResolvedValue(records),
                });
                await expect(
                    facade.getRiskManagementGroups(BASE_POOL),
                ).resolves.toBeNull();
            }
        });
    });
});

// ---------------------------------------------------------------------------
// PortfolioFacade.getRequestStates()
// ---------------------------------------------------------------------------

describe('PortfolioFacade.getRequestStates()', () => {
    it('maps the transaction history through deriveRequestState', async () => {
        const requests: UserRequest[] = [
            makeUserRequest({ id: 'req-1' }),
            makeUserRequest({
                id: 'req-2',
                requestType: 'Withdrawal',
                status: UserRequestStatus.PROCESSED,
                canCancel: false,
                acceptedAmount: '100',
            }),
        ];
        const userLending = {
            getCurrentEpoch: (): Promise<string> => Promise.resolve('42'),
            getUserRequests: (): Promise<UserRequest[]> =>
                Promise.resolve(requests),
        } as unknown as UserLending;

        const facade = new PortfolioFacade(
            {} as unknown as DataService,
            userLending,
            {} as unknown as Portfolio,
        );

        const states = await facade.getRequestStates('0xuser');

        expect(states.map((s) => s.id)).toEqual(['req-1', 'req-2']);
        expect(states[0].statusCode).toBe('pending');
        expect(states[0].amount).toBe(100);
        expect(states[1].statusCode).toBe('complete');
        expect(states[1].amount).toBe(-100);
    });

    it('returns an empty list for a wallet with no history', async () => {
        const userLending = {
            getCurrentEpoch: (): Promise<string> => Promise.resolve('42'),
            getUserRequests: (): Promise<UserRequest[]> => Promise.resolve([]),
        } as unknown as UserLending;

        const facade = new PortfolioFacade(
            {} as unknown as DataService,
            userLending,
            {} as unknown as Portfolio,
        );

        await expect(facade.getRequestStates('0xuser')).resolves.toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// Type exports — verify key facade types are importable
// ---------------------------------------------------------------------------

describe('Type re-exports', () => {
    it('should export facade classes from the main entry', () => {
        // Verify the barrel exports resolve — these would fail at compile time
        // if the re-exports were broken.
        expect(Kasu).toBeDefined();
        expect(CHAIN_CONFIGS).toBeDefined();
        expect(StrategiesFacade).toBeDefined();
        expect(DepositsFacade).toBeDefined();
        expect(PortfolioFacade).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function makeTranche(raw: {
    minimumDeposit: string;
    maximumDeposit: string;
    poolCapacity: string;
}) {
    return {
        id: '0xtest',
        name: 'Test Tranche',
        apy: 0.08,
        minApy: 0.06,
        maxApy: 0.1,
        minimumDeposit: raw.minimumDeposit,
        maximumDeposit: raw.maximumDeposit,
        availableCapacity: raw.poolCapacity,
        fixedTermOptions: [],
        _raw: {
            ...raw,
            id: '0xtest',
            name: 'Test Tranche',
            apy: '0.08',
            minApy: '0.06',
            maxApy: '0.10',
            fixedTermConfig: [],
        },
    } as never;
}

function makeUserRequest(overrides: Partial<UserRequest> = {}): UserRequest {
    return {
        id: 'req-1',
        userId: '0xuser',
        lendingPool: {
            id: '0xpool',
            name: 'Pool',
            tranches: [{ orderId: '0' }],
        },
        requestType: 'Deposit',
        trancheId: '0xtranche',
        trancheName: 'Senior',
        requestedAmount: '100',
        acceptedAmount: '0',
        rejectedAmount: '0',
        timestamp: 1_700_000_000,
        status: UserRequestStatus.REQUESTED,
        canCancel: true,
        events: [],
        nftId: '',
        apy: '0',
        fixedTermConfig: undefined,
        ...overrides,
    };
}
