import {
    finiteOrUndefined,
    groupRiskManagementItems,
    parseFacility,
    readCmsStartDate,
    RISK_GROUP_ORDER,
    securityStructureOf,
    splitBusinessTypes,
    splitNumberedClauses,
    strategyTotalsUsd,
} from './strategy-details';

// Lifted from kasu-ui's Details tab (`lib/details-fields.ts`,
// `lib/directus-text.ts`, `deposit-dialog/details-tab.tsx`). The LIVE rows
// below are the shapes the CMS holds today (2026-11-05); every `expected`
// is what kasu-ui renders for the same input. Cases marked REFINED differ from
// kasu-ui on purpose, and no live row reaches them.

const NOW = new Date('2026-11-05T12:00:00Z');

describe('readCmsStartDate', () => {
    it.each<[string, unknown, string | undefined]>([
        // LIVE: PoolOverview.operatingSince is a date column.
        ['a date', '2024-06-01', '2024-06-01'],
        // LIVE: PoolDelegateProfileAndHistory.delegateLendingHistory.
        ['a UTC-midnight datetime', '2016-12-13T00:00:00.000Z', '2016-12-13'],
        ['a datetime with a space', '2024-06-01 09:30:00', '2024-06-01'],
        ['surrounding blanks', '  2024-06-01 ', '2024-06-01'],
        ['today', '2026-11-05', '2026-11-05'],
        // Unauthored.
        ['null', null, undefined],
        ['undefined', undefined, undefined],
        ['empty', '', undefined],
        ['blank', '   ', undefined],
        // Refused: would claim a history nobody authored.
        ['a display string', 'Jun 2024', undefined],
        ['a year only', '2024', undefined],
        ['a month that does not exist', '2024-13-01', undefined],
        ['a day that does not exist', '2024-02-30', undefined],
        ['a leap day in a common year', '2025-02-29', undefined],
        ['a year before 2000', '1999-12-31', undefined],
        ['a date in the future', '2062-01-01', undefined],
        ['tomorrow', '2026-11-06', undefined],
        ['an object', { date: '2024-06-01' }, undefined],
        // Numbers are refused unless asked for (a date column never is one).
        ['a number, by default', 1481587200, undefined],
    ])('%s', (_label, raw, expected) => {
        expect(readCmsStartDate(raw, NOW)).toBe(expected);
    });

    it('keeps a real leap day', () => {
        expect(readCmsStartDate('2024-02-29', NOW)).toBe('2024-02-29');
    });

    it('reads unix seconds when asked, as kasu-ui formats a numeric value', () => {
        const opts = { unixSeconds: true };
        expect(readCmsStartDate(1481587200, NOW, opts)).toBe('2016-12-13');
        expect(readCmsStartDate('2016-12-13', NOW, opts)).toBe('2016-12-13');
        // `0` is formatDuration's "unset" sentinel, not 1970.
        expect(readCmsStartDate(0, NOW, opts)).toBeUndefined();
        expect(readCmsStartDate(-1, NOW, opts)).toBeUndefined();
        expect(readCmsStartDate(Number.NaN, NOW, opts)).toBeUndefined();
        expect(
            readCmsStartDate(Number.POSITIVE_INFINITY, NOW, opts),
        ).toBeUndefined();
        // Before 2000, and in the future.
        expect(readCmsStartDate(915148800, NOW, opts)).toBeUndefined();
        expect(readCmsStartDate(4102444800, NOW, opts)).toBeUndefined();
        // Out of Date's range.
        expect(readCmsStartDate(1e20, NOW, opts)).toBeUndefined();
    });
});

describe('splitBusinessTypes', () => {
    it.each<[string, unknown, ReturnType<typeof splitBusinessTypes>]>([
        // LIVE: a parenthesised clause.
        [
            'a parenthesised clause',
            'SMEs & Large Businesses (Diversified industries – exclusions for high risk industries apply)',
            {
                primary: 'SMEs & Large Businesses',
                detail: 'Diversified industries – exclusions for high risk industries apply',
            },
        ],
        // LIVE: a newline wins over a parenthesis.
        [
            'a newline',
            'Payment Service Providers (PSPs)\nRemittance service providers, money transmitters and payout partners.',
            {
                primary: 'Payment Service Providers (PSPs)',
                detail: 'Remittance service providers, money transmitters and payout partners.',
            },
        ],
        // LIVE: one line, no clause.
        ['one line', 'Accounting Firms', { primary: 'Accounting Firms' }],
        [
            'a dash is not a delimiter',
            'Professional Services Firms – Accounting, Law and Other',
            {
                primary:
                    'Professional Services Firms – Accounting, Law and Other',
            },
        ],
        [
            'an unclosed parenthesis',
            'SMEs (diversified',
            { primary: 'SMEs', detail: 'diversified' },
        ],
        ['an empty clause is no clause', 'SMEs ()', { primary: 'SMEs' }],
        [
            'trailing newline only',
            'Accounting Firms\n',
            { primary: 'Accounting Firms' },
        ],
        // REFINED: kasu-ui would split to an empty primary.
        ['opens with a parenthesis', '(PSPs)', { primary: '(PSPs)' }],
        ['empty', '', undefined],
        ['blank', ' \n ', undefined],
        ['null', null, undefined],
        ['not a string', 42, undefined],
    ])('%s', (_label, raw, expected) => {
        expect(splitBusinessTypes(raw)).toEqual(expected);
    });
});

describe('parseFacility', () => {
    it.each<[string, unknown, ReturnType<typeof parseFacility>]>([
        // LIVE.
        [
            'a label and its clause',
            'Revolving Instalment Facility\n12-24 months instalment loan, subject to annual review',
            {
                label: 'Revolving Instalment Facility',
                detail: '12-24 months instalment loan, subject to annual review',
                revolving: true,
            },
        ],
        // LIVE.
        [
            'a one-word label and its clause',
            'Revolving\n30 day rolling; 90 days formal limit review',
            {
                label: 'Revolving',
                detail: '30 day rolling; 90 days formal limit review',
                revolving: true,
            },
        ],
        // LIVE (disabled pools).
        ['a bare label', 'Revolving', { label: 'Revolving', revolving: true }],
        [
            'a clause with its own line breaks stays whole',
            'Term Loan\nLine one\nLine two',
            {
                label: 'Term Loan',
                detail: 'Line one\nLine two',
                revolving: false,
            },
        ],
        [
            'a leading blank line still yields a label',
            '\n  Revolving\nannual review',
            { label: 'Revolving', detail: 'annual review', revolving: true },
        ],
        [
            'a negated label does not revolve',
            'Non-Revolving Term Facility',
            { label: 'Non-Revolving Term Facility', revolving: false },
        ],
        [
            'a word merely containing it does not revolve',
            'Irrevolvable Facility',
            { label: 'Irrevolvable Facility', revolving: false },
        ],
        [
            'any case, mid-label',
            'Secured REVOLVING line',
            { label: 'Secured REVOLVING line', revolving: true },
        ],
        [
            'only the label is read',
            'Term Loan\nrevolving redraw available',
            {
                label: 'Term Loan',
                detail: 'revolving redraw available',
                revolving: false,
            },
        ],
        ['empty', '', undefined],
        ['blank', '  \n ', undefined],
        ['null', null, undefined],
        ['not a string', ['Revolving'], undefined],
    ])('%s', (_label, raw, expected) => {
        expect(parseFacility(raw)).toEqual(expected);
    });
});

describe('splitNumberedClauses', () => {
    const zwsp = String.fromCharCode(0x200b);
    it.each<[string, unknown, string[]]>([
        // Unauthored is NO lines — kasu-ui's "—" stub never reaches a caller.
        ['undefined', undefined, []],
        ['null', null, []],
        ['empty', '', []],
        ['blank', '   ', []],
        ['a lone dash', '—', []],
        ['zero-width only', zwsp, []],
        ['not a string', 7, []],
        // LIVE: plain descriptions.
        [
            'one clause',
            'at least 1.1x (1.2x for services businesses)',
            ['at least 1.1x (1.2x for services businesses)'],
        ],
        // LIVE: roman numerals are not markers.
        [
            'roman numerals are not split',
            'up to 100%, subject to: i) services performed in full only; ii) business debtors',
            [
                'up to 100%, subject to: i) services performed in full only; ii) business debtors',
            ],
        ],
        ['a numbered enumeration', '1) Foo; and, 2) Bar', ['Foo', 'Bar']],
        [
            'the first clause without its marker',
            'Direct Debit Authority; 2) Right of Offset',
            ['Direct Debit Authority', 'Right of Offset'],
        ],
        [
            'a zero-width paste artifact before a marker',
            `1) Foo;${zwsp}2) Bar`,
            ['Foo', 'Bar'],
        ],
        ['three clauses', '1) A; 2) B; and 3) C', ['A', 'B', 'C']],
    ])('%s', (_label, raw, expected) => {
        expect(splitNumberedClauses(raw)).toEqual(expected);
    });
});

describe('groupRiskManagementItems', () => {
    // The live CMS order for a strategy: authored interleaved, not by group.
    const items = [
        {
            name: 'Guarantee & Indemnity',
            group: 'Security & Recourse',
            description: '',
            tooltip: 'A promise to repay.',
        },
        {
            name: 'Minimum trading history',
            group: 'Key Eligibility Criteria',
            description: 'three years',
            tooltip: '',
        },
        {
            name: 'Debt Ratio',
            group: 'Financial Covenants',
            description: 'must be below 1',
            tooltip: 'Debt over assets.',
        },
        {
            name: 'Step-in Rights',
            group: 'Security & Recourse',
            description: '',
            tooltip: '',
        },
        {
            name: 'Loan funds drawn directly to the tax authority',
            group: 'Structural Controls',
            description: '',
            tooltip: '',
        },
        {
            name: 'Annual Financials',
            group: 'Reporting Covenants',
            description: '1) Audited; and, 2) Lodged',
            tooltip: '',
        },
        {
            name: 'Charge over Business Assets',
            group: 'Security Structure over End Borrowers',
            description: 'No',
            tooltip: '',
        },
        {
            name: 'AML and CTF',
            group: 'Key Eligibility Criteria',
            description: 'KYC and KYB',
            tooltip: '',
        },
    ];

    it('orders the groups canonically, then unlisted groups, items in CMS order', () => {
        const groups = groupRiskManagementItems(items);
        expect(groups.map((g) => g.group)).toEqual([
            'Security & Recourse',
            'Structural Controls',
            'Financial Covenants',
            'Reporting Covenants',
            'Key Eligibility Criteria',
            'Security Structure over End Borrowers',
        ]);
        expect(groups[0].items.map((i) => i.name)).toEqual([
            'Guarantee & Indemnity',
            'Step-in Rights',
        ]);
        expect(groups[4].items.map((i) => i.name)).toEqual([
            'Minimum trading history',
            'AML and CTF',
        ]);
    });

    it('carries the description, its lines, and the tooltip; an unauthored one is absent', () => {
        const groups = groupRiskManagementItems(items);
        expect(groups[0].items[0]).toEqual({
            name: 'Guarantee & Indemnity',
            clauses: [],
            tooltip: 'A promise to repay.',
        });
        expect(groups[0].items[1]).toEqual({
            name: 'Step-in Rights',
            clauses: [],
        });
        expect(groups[3].items[0]).toEqual({
            name: 'Annual Financials',
            description: '1) Audited; and, 2) Lodged',
            clauses: ['Audited', 'Lodged'],
        });
        expect(groups[2].items[0]).toEqual({
            name: 'Debt Ratio',
            description: 'must be below 1',
            clauses: ['must be below 1'],
            tooltip: 'Debt over assets.',
        });
    });

    it('matches group names trimmed and case-insensitively for the order', () => {
        const groups = groupRiskManagementItems([
            { name: 'B', group: 'Other' },
            { name: 'A', group: ' key eligibility criteria ' },
            { name: 'C', group: 'SECURITY & RECOURSE' },
        ]);
        expect(groups.map((g) => g.group)).toEqual([
            'SECURITY & RECOURSE',
            'key eligibility criteria',
            'Other',
        ]);
    });

    it('keeps several unlisted groups in CMS order', () => {
        const groups = groupRiskManagementItems([
            { name: 'x', group: 'Zeta' },
            { name: 'y', group: 'Alpha' },
            { name: 'z', group: 'Structural Controls' },
        ]);
        expect(groups.map((g) => g.group)).toEqual([
            'Structural Controls',
            'Zeta',
            'Alpha',
        ]);
    });

    it('leaves out an item with no name or no group, and never yields an empty group', () => {
        expect(
            groupRiskManagementItems([
                { name: '', group: 'Security & Recourse', description: 'x' },
                { name: '  ', group: 'Security & Recourse' },
                { name: 'Orphan', group: '' },
                { name: 'Orphan', group: null },
                { name: 42, group: 'Structural Controls' },
            ]),
        ).toEqual([]);
        expect(groupRiskManagementItems([])).toEqual([]);
    });

    it('names the five canonical groups', () => {
        expect(RISK_GROUP_ORDER).toEqual([
            'Security & Recourse',
            'Structural Controls',
            'Financial Covenants',
            'Reporting Covenants',
            'Key Eligibility Criteria',
        ]);
    });
});

describe('securityStructureOf', () => {
    it('trims and drops blanks', () => {
        expect(
            securityStructureOf([
                ' Corporate Guarantee ',
                '',
                '   ',
                null,
                'Post-Dated Cheque',
            ]),
        ).toEqual(['Corporate Guarantee', 'Post-Dated Cheque']);
    });

    it('is undefined when nothing remains', () => {
        expect(securityStructureOf([])).toBeUndefined();
        expect(securityStructureOf(['', ' '])).toBeUndefined();
        expect(securityStructureOf(undefined)).toBeUndefined();
        expect(securityStructureOf('Guarantee')).toBeUndefined();
    });
});

describe('finiteOrUndefined', () => {
    it.each<[unknown, number | undefined]>([
        [0, 0],
        ['0', 0],
        ['0.00200', 0.002],
        [50446371, 50446371],
        ['514912.5', 514912.5],
        ['', undefined],
        ['  ', undefined],
        ['abc', undefined],
        [null, undefined],
        [undefined, undefined],
        [Number.NaN, undefined],
        [Number.POSITIVE_INFINITY, undefined],
        [{}, undefined],
    ])('%p → %p', (raw, expected) => {
        expect(finiteOrUndefined(raw)).toBe(expected);
    });
});

describe('strategyTotalsUsd', () => {
    it('sums each leg at its own rate', () => {
        expect(
            strategyTotalsUsd([
                {
                    totalActiveLending: '1000000',
                    lenderInterestEarned: 50000,
                    usdRate: 1,
                },
                {
                    totalActiveLending: 2000000,
                    lenderInterestEarned: '10000',
                    usdRate: 0.65,
                },
            ]),
        ).toEqual({
            totalActiveLendingUsd: 1000000 + 2000000 * 0.65,
            lenderInterestEarnedUsd: 50000 + 10000 * 0.65,
        });
    });

    it('is the single pool converted, for a strategy of one', () => {
        expect(
            strategyTotalsUsd([
                {
                    totalActiveLending: '200',
                    lenderInterestEarned: 4,
                    usdRate: 0.5,
                },
            ]),
        ).toEqual({ totalActiveLendingUsd: 100, lenderInterestEarnedUsd: 2 });
    });

    it('withholds the total when any leg has no usable rate', () => {
        for (const usdRate of [
            undefined,
            0,
            -1,
            Number.NaN,
            Number.POSITIVE_INFINITY,
        ]) {
            expect(
                strategyTotalsUsd([
                    {
                        totalActiveLending: '1',
                        lenderInterestEarned: 1,
                        usdRate: 1,
                    },
                    {
                        totalActiveLending: '1',
                        lenderInterestEarned: 1,
                        usdRate,
                    },
                ]),
            ).toBeNull();
        }
    });

    it('is null with no legs', () => {
        expect(strategyTotalsUsd([])).toBeNull();
    });

    it('counts an absent or malformed amount as nothing, a real 0 as 0', () => {
        expect(
            strategyTotalsUsd([
                { totalActiveLending: '', usdRate: 1 },
                {
                    totalActiveLending: 'abc',
                    lenderInterestEarned: 'x',
                    usdRate: 1,
                },
                {
                    totalActiveLending: '0',
                    lenderInterestEarned: 0,
                    usdRate: 1,
                },
                {
                    totalActiveLending: '5',
                    lenderInterestEarned: 3,
                    usdRate: 1,
                },
            ]),
        ).toEqual({ totalActiveLendingUsd: 5, lenderInterestEarnedUsd: 3 });
    });
});
