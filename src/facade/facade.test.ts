/**
 * Offline facade specs — a mock provider and pure helpers, no network. Moved
 * here from `src/tests/` so it runs beside the code it covers, and so the
 * opt-in `LIVE_TESTS` gate on `src/tests/` does not take it out of CI.
 */
import { DataService } from '../services/DataService/data-service';
import { NO_DIRECTUS_URL_MESSAGE } from '../services/DataService/directus-client';
import { Portfolio } from '../services/Portfolio/portfolio';
import { UserRequestStatus } from '../services/UserLending/subgraph-types';
import { UserRequest } from '../services/UserLending/types';
import { UserLending } from '../services/UserLending/user-lending';

import { CHAIN_CONFIGS } from './chain-configs';
import { DepositsFacade } from './deposits';
import { Kasu } from './kasu';
import { StrategiesFacade } from './strategies';
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
        getNetwork: jest.fn().mockResolvedValue({ chainId: 8453, name: 'base' }),
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
        maxApy: 0.10,
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
        lendingPool: { id: '0xpool', name: 'Pool', tranches: [{ orderId: '0' }] },
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
