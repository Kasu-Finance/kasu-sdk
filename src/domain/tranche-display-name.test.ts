import { getTrancheDisplayName, UPPER_MEZZANINE } from './tranche-display-name';

// Ported from kasu-ui `src/features/lending/lib/tranche-display-name.test.ts`.

describe('getTrancheDisplayName', () => {
    it('renames Senior to Upper Mezzanine on Apxium pools', () => {
        expect(
            getTrancheDisplayName('Senior', {
                poolName: 'Taxation Funding (Tax Pay)',
            }),
        ).toBe(UPPER_MEZZANINE);
        expect(
            getTrancheDisplayName('Senior', {
                poolName: 'Professional Fee Funding',
            }),
        ).toBe(UPPER_MEZZANINE);
        expect(
            getTrancheDisplayName('Senior', { poolName: 'Whole Ledger Funding' }),
        ).toBe(UPPER_MEZZANINE);
    });

    it('keeps Senior on non-Apxium (InvoiceMate) pools', () => {
        expect(
            getTrancheDisplayName('Senior', {
                poolName: 'Payment Finance (PayFi) - Clearing Houses',
            }),
        ).toBe('Senior');
    });

    it('never touches other tranche names, on any pool', () => {
        expect(
            getTrancheDisplayName('Mezzanine', { poolName: 'Taxation Funding' }),
        ).toBe('Mezzanine');
        expect(
            getTrancheDisplayName('Junior', { poolName: 'Taxation Funding' }),
        ).toBe('Junior');
        expect(
            getTrancheDisplayName('Mezzanine', {
                poolName: 'Payment Finance (PayFi)',
            }),
        ).toBe('Mezzanine');
    });

    it('matches the Senior name case-insensitively but preserves unknown names verbatim', () => {
        expect(
            getTrancheDisplayName('SENIOR', { poolName: 'Taxation Funding' }),
        ).toBe(UPPER_MEZZANINE);
        expect(
            getTrancheDisplayName('Senior Plus', { poolName: 'Taxation Funding' }),
        ).toBe('Senior Plus');
    });

    it('treats missing pool names as Apxium (matches getCreditOriginator default)', () => {
        // getCreditOriginator defaults unknown pools to Apxium; the display
        // name must follow the same rule or the two surfaces would disagree.
        expect(getTrancheDisplayName('Senior', { poolName: '' })).toBe(
            UPPER_MEZZANINE,
        );
        expect(getTrancheDisplayName('Senior', {})).toBe(UPPER_MEZZANINE);
    });
});

describe('getTrancheDisplayName — the widened PoolNameSignal', () => {
    it('accepts the facade Strategy shape (`name`)', () => {
        expect(getTrancheDisplayName('Senior', { name: 'Taxation Funding' })).toBe(
            UPPER_MEZZANINE,
        );
        expect(
            getTrancheDisplayName('Senior', {
                name: 'Payment Finance (PayFi)',
            }),
        ).toBe('Senior');
    });

    it('accepts a bare pool name', () => {
        expect(getTrancheDisplayName('Senior', 'Whole Ledger Funding')).toBe(
            UPPER_MEZZANINE,
        );
        expect(getTrancheDisplayName('Senior', 'Payment Finance (PayFi)')).toBe(
            'Senior',
        );
    });

    it('gives the same answer for the raw and facade shapes of one pool', () => {
        for (const poolName of [
            'Taxation Funding (Tax Pay)',
            'Payment Finance (PayFi)',
            'Whole Ledger Funding',
            '',
        ]) {
            expect(getTrancheDisplayName('Senior', { poolName })).toBe(
                getTrancheDisplayName('Senior', { name: poolName }),
            );
        }
    });
});
