import fc from 'fast-check';

import { buildLoanAgreementSignMessage } from './loan-contract';
import {
    APXIUM,
    getCreditOriginator,
    getInstitutionalLender,
    getStrategyRegion,
    INVOICEMATE,
    RIXON_CAPITAL,
} from './partners';

// Ported from kasu-ui `src/features/lending/lib/strategy-partners.test.ts`.

describe('getCreditOriginator', () => {
    it('maps "Payment Finance (PayFi)" to InvoiceMate', () => {
        expect(getCreditOriginator({ poolName: 'Payment Finance (PayFi)' })).toBe(
            INVOICEMATE,
        );
    });

    it('keeps Apxium receivables pools as Apxium (regression: do not match "invoice")', () => {
        // The bug: matching the asset class ("invoice financing") wrongly
        // classified Apxium receivables pools as InvoiceMate. Name-only
        // matching fixes it — none of these names contain payfi/payment
        // finance.
        expect(getCreditOriginator({ poolName: 'Professional Fee Funding' })).toBe(
            APXIUM,
        );
        expect(getCreditOriginator({ poolName: 'Whole Ledger Funding' })).toBe(
            APXIUM,
        );
        expect(
            getCreditOriginator({ poolName: 'Taxation Funding (Tax Pay)' }),
        ).toBe(APXIUM);
    });

    it('is case-insensitive and matches the "payfi" / "payment finance" name', () => {
        expect(getCreditOriginator({ poolName: 'payment finance' })).toBe(
            INVOICEMATE,
        );
        expect(getCreditOriginator({ poolName: 'PAYFI Strategy' })).toBe(
            INVOICEMATE,
        );
    });

    it('defaults to Apxium for empty / missing names', () => {
        expect(getCreditOriginator({ poolName: '' })).toBe(APXIUM);
        expect(getCreditOriginator({})).toBe(APXIUM);
    });
});

describe('getCreditOriginator — the widened PoolNameSignal', () => {
    it('reads the facade Strategy shape (`name`)', () => {
        expect(getCreditOriginator({ name: 'Payment Finance (PayFi)' })).toBe(
            INVOICEMATE,
        );
        expect(getCreditOriginator({ name: 'Taxation Funding' })).toBe(APXIUM);
        expect(getCreditOriginator({ name: null })).toBe(APXIUM);
    });

    it('reads a bare string', () => {
        expect(getCreditOriginator('Payment Finance (PayFi)')).toBe(INVOICEMATE);
        expect(getCreditOriginator('Whole Ledger Funding')).toBe(APXIUM);
        expect(getCreditOriginator('')).toBe(APXIUM);
    });

    it('prefers poolName when an object carries both', () => {
        const both = { poolName: 'Taxation Funding', name: 'Payment Finance' };
        expect(getCreditOriginator(both)).toBe(APXIUM);
    });

    it('treats an explicitly null poolName as missing, not as a match', () => {
        expect(getCreditOriginator({ poolName: null })).toBe(APXIUM);
        expect(getCreditOriginator({ poolName: undefined })).toBe(APXIUM);
    });
});

describe('getInstitutionalLender', () => {
    it('gives Apxium pools Rixon Capital', () => {
        expect(getInstitutionalLender(APXIUM)).toBe(RIXON_CAPITAL);
    });

    it('gives InvoiceMate pools no senior lender', () => {
        expect(getInstitutionalLender(INVOICEMATE)).toBeNull();
    });
});

// Ported from kasu-ui `src/features/lending/lib/details-regions.test.ts`
// (`getStrategyRegionLabel`). The expected words are PINNED, not derived: they
// are what kasu-ui renders — and what its lenders sign — for each strategy
// today, and a lender who signs through another app must sign the same word.
describe('StrategyPartner.region', () => {
    it('names each partner region', () => {
        expect(APXIUM.region).toBe('Australia');
        expect(INVOICEMATE.region).toBe('Global');
        expect(RIXON_CAPITAL.region).toBe('Australia');
    });
});

describe('getStrategyRegion', () => {
    const APXIUM_POOLS = [
        'Taxation Funding (Tax Pay)',
        'Whole Ledger Funding',
        'Professional Fee Funding',
        'Professional Fee Funding (Genesis Tranche)',
    ];
    const PAYFI_POOLS = [
        'Payment Finance (PayFi)',
        'Payment Finance (PayFi) - Clearing Houses',
    ];

    it('gives every Apxium strategy its Australian region', () => {
        for (const poolName of APXIUM_POOLS) {
            expect(getStrategyRegion({ poolName })).toBe('Australia');
        }
    });

    it('gives PayFi "Global" — never "Australia"', () => {
        // The defect this pins: a hardcoded 'Australia' had a PayFi lender
        // read "Global" in the option list and sign "Australia".
        for (const poolName of PAYFI_POOLS) {
            expect(getStrategyRegion({ poolName })).toBe('Global');
            expect(getStrategyRegion({ poolName })).not.toBe('Australia');
        }
    });

    it('reads every PoolNameSignal shape the originator inference reads', () => {
        expect(getStrategyRegion('Payment Finance (PayFi)')).toBe('Global');
        expect(getStrategyRegion({ name: 'Payment Finance (PayFi)' })).toBe(
            'Global',
        );
        expect(getStrategyRegion({ name: 'Whole Ledger Funding' })).toBe(
            'Australia',
        );
        expect(getStrategyRegion({})).toBe('Australia');
    });

    it('is always the credit originator region, for any pool name', () => {
        fc.assert(
            fc.property(fc.string(), (poolName) => {
                const region = getStrategyRegion({ poolName });
                expect(region).toBe(getCreditOriginator({ poolName }).region);
                expect(['Australia', 'Global']).toContain(region);
            }),
        );
    });

    it('is the word a PayFi lender signs in the loan-agreement message', () => {
        const pool = { poolName: 'Payment Finance (PayFi)' };
        const message = buildLoanAgreementSignMessage({
            strategyName: pool.poolName,
            region: getStrategyRegion(pool),
            optionName: 'Junior',
            amountLabel: 'US$1,000.00',
            timestamp: Date.UTC(2026, 9, 20, 6, 0, 0),
        });
        expect(message.split('\n')[1]).toBe(
            'Payment Finance (PayFi) · Global · Junior · US$1,000.00.',
        );
    });
});
