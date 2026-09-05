import {
    APXIUM,
    getCreditOriginator,
    getInstitutionalLender,
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
