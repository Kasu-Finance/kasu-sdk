import { pickShortDescription } from './strategy-summary';

// Lifted from kasu-ui's `pickShortDescription`. LIVE_SHAPES covers each shape
// the live CMS holds on base, xdc and xdc-usdc (2026-10-24), and every
// `expected` there is the kasu-ui function's output for the same input. The
// text is stand-in copy; the structure (markers, newlines, placeholders,
// blanks) is the live rows'. EDGES match kasu-ui too, except the three marked
// REFINED: there the original returned a trailing space or a blank string.

interface Row {
    shape: string;
    liteDescription?: string | null;
    description?: string | null;
    expected: string | undefined;
}

const PROFILE =
    'First paragraph about the originator.\n\nSecond paragraph.\n\nThird paragraph.';

const LIVE_SHAPES: Row[] = [
    {
        shape: 'a bold lead and a paragraph break in liteDescription',
        liteDescription:
            '**Lead sentence for the strategy.**\n\nSecond sentence - with a 50% figure, and a comma.',
        description: PROFILE,
        expected:
            'Lead sentence for the strategy. Second sentence - with a 50% figure, and a comma.',
    },
    {
        shape: 'a plain one-line liteDescription',
        liteDescription:
            "Short blurb with a quote ('Plus+Mark') and a colon: then more text.",
        description: PROFILE,
        expected:
            "Short blurb with a quote ('Plus+Mark') and a colon: then more text.",
    },
    {
        shape: '"Not Available" falls back to the first paragraph of a three-paragraph description',
        liteDescription: 'Not Available',
        description: PROFILE,
        expected: 'First paragraph about the originator.',
    },
    {
        shape: '"Not Available" with a four-paragraph description ending in a space',
        liteDescription: 'Not Available',
        description:
            'Opening paragraph.\n\nSecond.\n\nThird.\n\nFourth, with a trailing space. ',
        expected: 'Opening paragraph.',
    },
    {
        shape: '"Not Available" with a one-paragraph description',
        liteDescription: 'Not Available',
        description: 'Sample pool',
        expected: 'Sample pool',
    },
    {
        shape: 'a pool with no CMS record (the service maps both to "")',
        liteDescription: '',
        description: '',
        expected: undefined,
    },
];

const EDGES: Row[] = [
    {
        shape: 'a blank liteDescription falls back to the description',
        liteDescription: '   \n  ',
        description: PROFILE,
        expected: 'First paragraph about the originator.',
    },
    {
        shape: 'both blank',
        liteDescription: ' ',
        description: '\n\n ',
        expected: undefined,
    },
    {
        shape: 'both missing',
        expected: undefined,
    },
    {
        shape: 'both null',
        liteDescription: null,
        description: null,
        expected: undefined,
    },
    {
        shape: 'the placeholder in another case',
        liteDescription: 'not available',
        description: 'Fallback.',
        expected: 'Fallback.',
    },
    {
        shape: 'the placeholder padded with whitespace',
        liteDescription: '  NOT AVAILABLE \n',
        description: 'Fallback.',
        expected: 'Fallback.',
    },
    {
        shape: 'the placeholder only as a whole value, never as a prefix',
        liteDescription: 'Not Available yet',
        description: 'Fallback.',
        expected: 'Not Available yet',
    },
    {
        shape: 'the placeholder rule applies to liteDescription only',
        liteDescription: '',
        description: 'Not Available',
        expected: 'Not Available',
    },
    {
        shape: 'the placeholder and nothing to fall back to',
        liteDescription: 'Not Available',
        description: '',
        expected: undefined,
    },
    {
        shape: 'italic, underscore and code markers',
        liteDescription: '__Bold__ then *italic*, _also_ and `code`.',
        expected: 'Bold then italic, also and code.',
    },
    {
        shape: 'a single newline inside the first paragraph',
        description: 'Line one\nline two.\n\nNext paragraph.',
        expected: 'Line one line two.',
    },
    {
        shape: 'REFINED: CRLF line endings end trimmed, not in a space',
        description: 'Para one.\r\n \r\nPara two.',
        expected: 'Para one.',
    },
    {
        shape: 'REFINED: a liteDescription of markers alone counts as missing',
        liteDescription: '** **',
        description: 'Fallback.',
        expected: 'Fallback.',
    },
    {
        shape: 'REFINED: a first paragraph of markers alone yields nothing',
        description: '** **\n\nSecond.',
        expected: undefined,
    },
    {
        shape: 'leading whitespace before the first paragraph',
        description: '\n\n  Intro.\n\nMore.',
        expected: 'Intro.',
    },
];

describe('pickShortDescription', () => {
    it.each(LIVE_SHAPES.map((row) => [row.shape, row] as const))(
        'live shape: %s',
        (_shape, row) => {
            expect(pickShortDescription(row)).toBe(row.expected);
        },
    );

    it.each(EDGES.map((row) => [row.shape, row] as const))(
        'edge: %s',
        (_shape, row) => {
            expect(pickShortDescription(row)).toBe(row.expected);
        },
    );

    it('reads a non-string field as missing instead of throwing', () => {
        const odd = { liteDescription: 7, description: { text: 'x' } };
        expect(
            pickShortDescription(
                odd as unknown as Parameters<typeof pickShortDescription>[0],
            ),
        ).toBeUndefined();
        expect(
            pickShortDescription({
                liteDescription: 7,
                description: 'Fallback.',
            } as unknown as Parameters<typeof pickShortDescription>[0]),
        ).toBe('Fallback.');
    });

    it('is not sanitised: HTML and link syntax pass through, so it must be rendered as text', () => {
        expect(
            pickShortDescription({
                liteDescription: '<script>alert(1)</script>',
            }),
        ).toBe('<script>alert(1)</script>');
        expect(
            pickShortDescription({
                liteDescription: '[a](javascript:alert(1)) &lt;b&gt;',
            }),
        ).toBe('[a](javascript:alert(1)) &lt;b&gt;');
        // Removing markers can join fragments into a tag the input never spelled.
        expect(pickShortDescription({ liteDescription: '<scr**i**pt>' })).toBe(
            '<script>',
        );
    });

    it('returns one line: no newline survives, and no run of spaces', () => {
        for (const row of [...LIVE_SHAPES, ...EDGES]) {
            const summary = pickShortDescription(row);
            if (summary === undefined) continue;
            expect(summary).not.toMatch(/\n|\r|\s{2}/);
        }
    });
});
