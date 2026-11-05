/**
 * The CMS-authored figures and text a strategy's Details screen shows, read
 * the way kasu-ui's Details tab reads them, so every app shows the same
 * thing.
 *
 * Lifted from kasu-ui (`lib/details-fields.ts`, `lib/directus-text.ts` and
 * the parsers inside `deposit-dialog/details-tab.tsx`). The rules are facts
 * about how the CMS is authored, not presentation:
 *
 *   - EMPTY IS UNAUTHORED. The CMS stores an emptied field as `''`, and its
 *     "numeric" fields arrive as a number, a numeric string, `''` or `null`.
 *     Anything that is not real data reads as `undefined` — never a `0`, a
 *     placeholder or a sentence of the SDK's own. A field the caller cannot
 *     read is a row the caller omits.
 *   - A START DATE MUST DATE. A value that is not an ISO date, or a real
 *     calendar date, or is before 2000 or in the future, is refused: rendered
 *     as elapsed time it would claim a history nobody authored.
 *   - SOME FIELDS CARRY TWO LINES IN ONE STRING. Business Types and Facility
 *     Type are a primary value and a qualifying clause; risk-item
 *     descriptions can be numbered enumerations. Splitting them is the same
 *     everywhere, so it lives here.
 *
 * Like `pickShortDescription`, this authors no string of its own: it selects,
 * splits and trims text the CMS already holds. None of it is sanitised —
 * render every string as text, never as HTML or markdown.
 *
 * Pure. No clock: the date reader takes `now` from its caller.
 */

// ---------------------------------------------------------------------------
// Start dates
// ---------------------------------------------------------------------------

/**
 * `YYYY-MM-DD`, optionally followed by a time part — the two shapes a CMS
 * date column serialises to. Checked BEFORE any parse: `new Date('Jun 2024')`
 * is a valid date in V8, so an editorial string would otherwise become a
 * confident duration.
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/;

/** Nothing on Kasu has a lending history from before this year. */
const EARLIEST_YEAR = 2000;

export interface CmsStartDateOptions {
    /**
     * Also accept a finite number as unix SECONDS. kasu-ui's duration
     * formatter reads a numeric value that way, and the originator's
     * `delegateLendingHistory` is typed as a number although the live CMS
     * serves an ISO date. Off by default: a strategy's `operatingSince` is a
     * date column, and kasu-ui refuses a number there.
     */
    unixSeconds?: boolean;
}

/**
 * A CMS start date as its `YYYY-MM-DD` date head, or `undefined`.
 *
 * Accepts an ISO date, optionally with a time part (only the date head is
 * kept — a time changes nothing at year/month granularity, and converting it
 * through a timezone could move it a day). Refused, as `undefined`:
 *
 *   - anything that is not a string (or, with `unixSeconds`, a number);
 *   - an empty or blank string (unauthored);
 *   - a string that is not ISO-shaped (`'Jun 2024'`);
 *   - a date that does not exist (`'2024-02-30'`, `'2024-13-01'`) — never
 *     rolled over into the next month;
 *   - a year before 2000;
 *   - a date after `now` (a typo such as 2062 for 2026 — no history has
 *     begun in the future).
 *
 * `now` is the caller's clock; the facade passes the current time.
 */
export function readCmsStartDate(
    value: unknown,
    now: Date,
    options: CmsStartDateOptions = {},
): string | undefined {
    let head: string;
    if (typeof value === 'number' && options.unixSeconds) {
        // `0` is formatDuration's "unset" sentinel; negatives are pre-1970.
        if (!Number.isFinite(value) || value <= 0) return undefined;
        const date = new Date(value * 1000);
        if (Number.isNaN(date.getTime())) return undefined;
        head = date.toISOString().slice(0, 10);
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!ISO_DATE.test(trimmed)) return undefined;
        head = trimmed.slice(0, 10);
    } else {
        return undefined;
    }

    const match = ISO_DATE.exec(head);
    if (!match) return undefined;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    // Round-trip through UTC: a day or month out of range comes back as a
    // different date, which is how a non-existent date is caught.
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (
        utc.getUTCFullYear() !== year ||
        utc.getUTCMonth() !== month - 1 ||
        utc.getUTCDate() !== day
    ) {
        return undefined;
    }
    if (year < EARLIEST_YEAR) return undefined;
    if (utc.getTime() > now.getTime()) return undefined;
    return head;
}

// ---------------------------------------------------------------------------
// End Borrowers
// ---------------------------------------------------------------------------

/** A CMS value split into its primary line and an optional qualifying clause. */
export interface CmsTwoLineValue {
    /** The value itself — never empty. */
    primary: string;
    /** The qualifying clause beneath it. Absent when none is authored. */
    detail?: string;
}

/**
 * Business Types (the CMS `industryExposure`), split into the value and its
 * supporting clause on the FIRST newline, else the FIRST parenthesised
 * segment (a trailing `)` dropped):
 *
 *   `'SMEs & Large Businesses (diversified industries – exclusions apply)'`
 *   → `{ primary: 'SMEs & Large Businesses', detail: 'diversified industries – exclusions apply' }`
 *
 * A value with neither delimiter is `{ primary }` alone. `undefined` for a
 * missing, non-string, empty or blank value.
 *
 * REFINED over kasu-ui: a value that OPENS with `(` would split to an empty
 * primary there; here the whole value is the primary instead, so `primary`
 * is never empty. No live record has that shape.
 */
export function splitBusinessTypes(raw: unknown): CmsTwoLineValue | undefined {
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) return undefined;

    let primary = value;
    let detail = '';
    const newlineAt = value.indexOf('\n');
    if (newlineAt !== -1) {
        primary = value.slice(0, newlineAt).trim();
        detail = value.slice(newlineAt + 1).trim();
    } else {
        const parenAt = value.indexOf('(');
        if (parenAt !== -1) {
            primary = value.slice(0, parenAt).trim();
            detail = value.slice(parenAt + 1).trim();
            if (detail.endsWith(')')) detail = detail.slice(0, -1).trim();
        }
    }
    if (!primary) return { primary: value };
    return detail ? { primary, detail } : { primary };
}

/** Facility Type: the authored label, its clause, and whether it revolves. */
export interface StrategyFacility {
    /** The facility's label (`'Revolving Instalment Facility'`) — never empty. */
    label: string;
    /** The qualifying clause beneath it. Absent when none is authored. */
    detail?: string;
    /**
     * The LABEL names a revolving facility (`'Revolving'`, `'Revolving
     * Instalment Facility'`), matched case-insensitively on a word starting
     * `revolv`. Never true for a negated label: `'Non-Revolving Term
     * Facility'` is false, because a hyphen before the word does not count as
     * a word boundary here. The clause is not read, so a clause that merely
     * mentions redraw does not make a facility revolve.
     *
     * kasu-ui hangs an explanatory ⓘ off a revolving label; that copy is the
     * app's own.
     */
    revolving: boolean;
}

/**
 * The start of the label, or a character that is neither a word character
 * nor a hyphen, before `revolv` — not `\b`, which treats a hyphen as a
 * boundary, so "Non-Revolving" would match. kasu-ui writes the same rule as
 * the lookbehind `(?<![\w-])`; this form needs no lookbehind support from the
 * JavaScript engine.
 */
const REVOLVING_FACILITY = /(?:^|[^\w-])revolv\w*\b/i;

/**
 * Facility Type (the CMS `loanStructure`): the label on the FIRST line, and
 * everything after the first newline as its clause, so a clause with line
 * breaks of its own stays whole.
 *
 *   `'Revolving Instalment Facility\n12-24 months instalment loan, subject to annual review'`
 *   → `{ label: 'Revolving Instalment Facility', detail: '12-24 months …', revolving: true }`
 *
 * `undefined` for a missing, non-string, empty or blank value. The value is
 * trimmed first, so a leading blank line still yields a label.
 */
export function parseFacility(raw: unknown): StrategyFacility | undefined {
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) return undefined;
    const breakAt = value.indexOf('\n');
    const label = (breakAt === -1 ? value : value.slice(0, breakAt)).trim();
    const detail = breakAt === -1 ? '' : value.slice(breakAt + 1).trim();
    const revolving = REVOLVING_FACILITY.test(label);
    return detail ? { label, detail, revolving } : { label, revolving };
}

// ---------------------------------------------------------------------------
// Risk Management
// ---------------------------------------------------------------------------

/**
 * The order the Risk Management groups read in, by group name (compared
 * trimmed, case-insensitively). The CMS returns items in authoring order,
 * which is not this. A group not listed still appears — after these, in CMS
 * order.
 */
export const RISK_GROUP_ORDER: readonly string[] = Object.freeze([
    'Security & Recourse',
    'Structural Controls',
    'Financial Covenants',
    'Reporting Covenants',
    'Key Eligibility Criteria',
]);

/** Zero-width paste artifacts, which `\s` does not match. */
const ZERO_WIDTH = /[​-‍﻿]/g;
/** An `N)` marker at the start, or after a `;` / `; and,` separator. */
const HAS_ENUMERATION = /(?:^\d+\)|;\s*(?:and,?\s*)?\d+\))/;
const ENUMERATION_SPLIT = /(?:^|\s*;\s*(?:and,?\s*)?)\d+\)\s*/;
/** kasu-ui's stub for an unauthored description; never a clause. */
const EMPTY_DESCRIPTION = '—';

/**
 * A risk-item description as the lines beneath the item's name.
 *
 * A numbered enumeration (`'1) Foo; and, 2) Bar'`, or one that omits its
 * leading `1)`: `'Foo; 2) Bar'`) is one line per clause; anything else is
 * one line. Zero-width characters are stripped first. An unauthored
 * description is NO lines (`[]`), never a dash.
 */
export function splitNumberedClauses(description: unknown): string[] {
    const raw = cleanDescription(description);
    if (!raw) return [];
    const clauses = HAS_ENUMERATION.test(raw)
        ? raw
              .split(ENUMERATION_SPLIT)
              .map((part) => part.trim())
              .filter((part) => part.length > 0)
        : [raw];
    const lines = clauses.length > 0 ? clauses : [raw];
    return lines.filter((line) => line !== EMPTY_DESCRIPTION);
}

/** A description with zero-width characters stripped, trimmed; `''` when not a string. */
function cleanDescription(description: unknown): string {
    return typeof description === 'string'
        ? description.replace(ZERO_WIDTH, '').trim()
        : '';
}

/** One risk-management item as the CMS row carries it. */
export interface RiskManagementItemSource {
    name?: unknown;
    group?: unknown;
    description?: unknown;
    tooltip?: unknown;
}

/** One item in a Risk Management group. */
export interface StrategyRiskItem {
    /** The item's name (`'Guarantee & Indemnity'`) — never empty. */
    name: string;
    /**
     * The pool's own description of it — zero-width characters stripped,
     * trimmed. Present exactly when `clauses` is non-empty: a description
     * that yields no line (`''`, `'—'`, zero-width characters alone) is
     * absent.
     */
    description?: string;
    /** `description` as the lines beneath the name; `[]` when unauthored. */
    clauses: string[];
    /** The CMS explanation of the item (shared by every pool). Absent when unauthored. */
    tooltip?: string;
}

/** One Risk Management group and its items, in CMS order. */
export interface StrategyRiskGroup {
    /** The group's name as the CMS authors it (`'Security & Recourse'`). */
    group: string;
    /** Never empty. */
    items: StrategyRiskItem[];
}

/**
 * Risk-management items grouped by their group, the groups in
 * `RISK_GROUP_ORDER` and, within a group, the items in CMS order.
 *
 * An item with no name, or no group, is left out: there is nothing to head
 * its lines with, or no group to place it in. (The CMS joins items to groups
 * by name, so neither occurs in live data.) No group is ever empty, so an
 * item list with nothing usable gives `[]`.
 */
export function groupRiskManagementItems(
    items: readonly RiskManagementItemSource[],
): StrategyRiskGroup[] {
    const groups = new Map<string, StrategyRiskGroup>();
    for (const source of items) {
        const name = trimmedOrUndefined(source.name);
        const group = trimmedOrUndefined(source.group);
        if (!name || !group) continue;
        const clauses = splitNumberedClauses(source.description);
        // The same cleaned text the clauses come from, and only when they
        // say something: a description of "—" or of zero-width characters
        // alone is unauthored, so it is absent here too, never a stray dash.
        const description =
            clauses.length > 0 ? cleanDescription(source.description) : '';
        const tooltip = trimmedOrUndefined(source.tooltip);
        const item: StrategyRiskItem = {
            name,
            ...(description ? { description } : {}),
            clauses,
            ...(tooltip ? { tooltip } : {}),
        };
        const existing = groups.get(group);
        if (existing) existing.items.push(item);
        else groups.set(group, { group, items: [item] });
    }
    // Array.prototype.sort is stable, so unlisted groups keep CMS order.
    return [...groups.values()].sort(
        (a, b) => riskGroupRank(a.group) - riskGroupRank(b.group),
    );
}

const RISK_GROUP_RANK = new Map(
    RISK_GROUP_ORDER.map((group, index) => [group.toLowerCase(), index]),
);

function riskGroupRank(group: string): number {
    return (
        RISK_GROUP_RANK.get(group.trim().toLowerCase()) ??
        RISK_GROUP_ORDER.length
    );
}

/**
 * The pool's security tags (the CMS `security` list), trimmed, blanks
 * dropped. `undefined` when none remain.
 *
 * kasu-ui shows these under "Security Structure over End Borrowers" ONLY
 * when the pool has no risk-management items.
 */
export function securityStructureOf(raw: unknown): string[] | undefined {
    if (!Array.isArray(raw)) return undefined;
    const tags = raw
        .map((tag) => trimmedOrUndefined(tag))
        .filter((tag): tag is string => tag !== undefined);
    return tags.length > 0 ? tags : undefined;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * A CMS or subgraph "numeric" value as a finite number, or `undefined`. An
 * empty or blank string is UNAUTHORED, not zero; a genuine `0` survives.
 */
export function finiteOrUndefined(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'string') {
        if (value.trim() === '') return undefined;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : undefined;
    }
    return undefined;
}

// ---------------------------------------------------------------------------
// A strategy's money across deployments
// ---------------------------------------------------------------------------

/** One deployment's pool of a strategy, for `strategyTotalsUsd`. */
export interface StrategyTotalsLeg {
    /**
     * Which deployment this leg is — the same key the caller lists in
     * `expectedDeployments` (e.g. `StrategyDeployment.chain`: `'base'`,
     * `'xdc'`). Compared exactly.
     */
    deployment: string;
    /** The pool's TVL (`Strategy.tvl.total`), in its own stable token. */
    totalActiveLending: string | number;
    /**
     * The pool's lender interest earned
     * (`Strategy.strategyHistory.lenderInterestEarned`), in its own stable
     * token.
     */
    lenderInterestEarned?: string | number;
    /**
     * USD per 1 unit of this deployment's stable token (`1` for USDC).
     * `undefined` while the rate is not known.
     */
    usdRate: number | undefined;
}

/** A strategy's two money figures, summed over the legs given, in USD. */
export interface StrategyTotalsUsd {
    totalActiveLendingUsd: number;
    lenderInterestEarnedUsd: number;
    /**
     * `true` when some expected deployment has no leg — it failed to load,
     * or has not loaded yet — so both figures cover only `legs`, NOT the
     * whole strategy. A caller stating them as the strategy-wide figure must
     * say so (kasu-ui adds a partial-regions note) or fall back.
     */
    isPartial: boolean;
    /**
     * The expected deployments with no leg, in `expectedDeployments` order.
     * Empty exactly when `isPartial` is `false`.
     */
    missingDeployments: string[];
}

export type StrategyTotalsInputErrorCode = 'duplicate-leg' | 'unexpected-leg';

/**
 * A leg `strategyTotalsUsd` cannot place: two legs for one deployment
 * (`duplicate-leg`, which would double-count it), or a leg for a deployment
 * not in `expectedDeployments` (`unexpected-leg`, a pool of some other
 * strategy). Thrown, because both are caller bugs, not data states.
 */
export class StrategyTotalsInputError extends Error {
    constructor(
        readonly code: StrategyTotalsInputErrorCode,
        readonly deployment: string,
    ) {
        super(
            code === 'duplicate-leg'
                ? `strategyTotalsUsd: two legs for deployment "${deployment}"`
                : `strategyTotalsUsd: leg for deployment "${deployment}" is not in expectedDeployments`,
        );
        this.name = 'StrategyTotalsInputError';
    }
}

/**
 * Total Active Lending and Lender Interest Earned for a strategy across the
 * deployments it lends on, in USD: each leg's native amount times that leg's
 * own `usdRate`, summed. Tax Pay lends on Base (USDC) and XDC (AUDD);
 * 2,567,901 AUDD is not US$2,567,901.
 *
 * `expectedDeployments` is every deployment the strategy has a pool on —
 * `strategyDeployments(poolId, chain).map((d) => d.chain)` — and `legs` the
 * ones whose pool the caller actually loaded. What is guaranteed:
 *
 *   - **`null` — WITHHELD** when there are no legs, or ANY leg's rate is
 *     missing or unusable (not a finite number above 0). The total is never
 *     built on a guessed rate, and never silently drops a loaded leg; the
 *     caller shows the held pool's own figure, or nothing.
 *   - **Otherwise the sum over `legs`**, with `isPartial` /
 *     `missingDeployments` stating exactly which expected deployments it
 *     does NOT cover. `isPartial: false` is the only case in which the
 *     figures are the whole strategy.
 *   - An amount that is absent or malformed contributes nothing (a real `0`
 *     is still `0`).
 *   - Throws `StrategyTotalsInputError` for a duplicated leg or one not in
 *     `expectedDeployments`, before summing anything.
 *
 * Only these two figures are summed. The CMS-authored ones — every
 * originator figure, `operatingSince`, the loss rates — are shared by a
 * strategy's pools and already strategy-wide: summing them double-counts.
 *
 * Mirrors the money half of kasu-ui's `aggregateStrategyPools` and its
 * withhold gate.
 */
export function strategyTotalsUsd(
    legs: readonly StrategyTotalsLeg[],
    expectedDeployments: readonly string[],
): StrategyTotalsUsd | null {
    const expected = new Set(expectedDeployments);
    const seen = new Set<string>();
    for (const leg of legs) {
        if (seen.has(leg.deployment)) {
            throw new StrategyTotalsInputError('duplicate-leg', leg.deployment);
        }
        if (!expected.has(leg.deployment)) {
            throw new StrategyTotalsInputError(
                'unexpected-leg',
                leg.deployment,
            );
        }
        seen.add(leg.deployment);
    }
    if (legs.length === 0) return null;

    let totalActiveLendingUsd = 0;
    let lenderInterestEarnedUsd = 0;
    for (const leg of legs) {
        const rate = leg.usdRate;
        if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
            return null;
        }
        totalActiveLendingUsd +=
            (finiteOrUndefined(leg.totalActiveLending) ?? 0) * rate;
        lenderInterestEarnedUsd +=
            (finiteOrUndefined(leg.lenderInterestEarned) ?? 0) * rate;
    }
    const missingDeployments = [...expected].filter((d) => !seen.has(d));
    return {
        totalActiveLendingUsd,
        lenderInterestEarnedUsd,
        isPartial: missingDeployments.length > 0,
        missingDeployments,
    };
}

function trimmedOrUndefined(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
