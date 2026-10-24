/**
 * A strategy's SHORT blurb, as plain text: the CMS `liteDescription` first,
 * else the first paragraph of the long `description`, else nothing.
 *
 * Lifted from kasu-ui (`pickShortDescription`, its deposit dialog and landing
 * strategy card) so every app shows the same line, and pinned to its output
 * for every live CMS row. The rules are facts about how the CMS is authored,
 * not formatting preferences:
 *
 *   - `liteDescription` IS THE SHORT ONE. `description` is the credit
 *     originator's several-paragraph profile; on a card it is a wall.
 *   - `"Not Available"` IS A PLACEHOLDER, not editorial. Several rows carry it
 *     verbatim, and it must read as missing, not print. Matched on the whole
 *     trimmed value, case-insensitively. It applies to `liteDescription` only.
 *   - EMPTY OR BLANK IS MISSING. The service maps a pool with no CMS record to
 *     `''`.
 *   - THE FIELDS HOLD MARKDOWN. `liteDescription` can open with a `**bold**`
 *     lead, and the surfaces this feeds render plain text, so the markers are
 *     stripped (bold, then italic, then inline code).
 *   - AND HARD NEWLINES. Every run of whitespace becomes one space, so a
 *     paragraph break inside the value is not a gap in a one-line slot.
 *
 * Two refinements over the kasu-ui original, neither reachable by any live
 * row: the cleaned text is trimmed (a CRLF value no longer ends in a space),
 * and a `liteDescription` that cleans to nothing (`** **`) counts as missing,
 * so the result is never a blank string.
 *
 * This authors no string of its own. It selects and cleans editorial the CMS
 * already holds, and an absent blurb is `undefined`, never a fallback sentence:
 * what "no blurb" means is the render site's decision.
 *
 * Pure. A value that is not a string reads as missing.
 */
export function pickShortDescription(
    source: ShortDescriptionSource,
): string | undefined {
    const lite = asTrimmed(source.liteDescription);
    if (lite && !NOT_AVAILABLE.test(lite)) {
        const summary = toOneLine(lite);
        if (summary) return summary;
    }
    const long = asTrimmed(source.description);
    if (long) {
        const firstParagraph = long.split(PARAGRAPH_BREAK, 1)[0] ?? long;
        return toOneLine(firstParagraph) || undefined;
    }
    return undefined;
}

/**
 * The two CMS fields `pickShortDescription` reads. A `PoolOverview` and a
 * facade `Strategy` both satisfy it.
 */
export interface ShortDescriptionSource {
    liteDescription?: string | null;
    description?: string | null;
}

const NOT_AVAILABLE = /^not available$/i;
const PARAGRAPH_BREAK = /\n\s*\n/;

function asTrimmed(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

/** Markers off, whitespace runs to one space, ends trimmed. `''` when nothing is left. */
function toOneLine(text: string): string {
    return stripInlineMarkdown(text).replace(/\s+/gu, ' ').trim();
}

/**
 * Inline markdown markers off, in the order bold → italic → code. The bold
 * passes consume every `**` / `__` pair first, so the italic patterns can match
 * a lone `*` / `_` without lookarounds.
 */
function stripInlineMarkdown(input: string): string {
    return input
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1');
}
