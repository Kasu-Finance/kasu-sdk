import { ethers } from 'ethers';

/**
 * Loan-contract protocol: the strings and the bytes kasu-backend verifies.
 *
 * ⚠️ THE ONE EXCEPTION TO "NUMBERS AND CODES ONLY". Everything this module
 * returns as a string is a PROTOCOL string, not copy. The backend reconstructs
 * each of these messages byte-for-byte and verifies the lender's signature
 * against it; a changed word, separator, line break or date format does not
 * read differently — it stops every signature verifying. They are here, in the
 * shared layer, for exactly the reason `getTrancheDisplayName` is: so the
 * applications cannot drift apart on them.
 *
 * Any change to a builder below is a coordinated multi-repo change that has to
 * land in kasu-backend at the same moment. Do not "tidy" this file.
 *
 * Lifted from kasu-ui's `features/lending/lib/{contract-types, sign-message}.ts`
 * and `encode-deposit-data.ts` — the last rewritten from viem to ethers v5
 * (kasu-mobile already runs that port; the tests pin the two byte-identical).
 */

// ---------------------------------------------------------------------------
// The `/contract/generate` and `/contract/resolve` payload
// ---------------------------------------------------------------------------

/** Recursive list nesting: `list-N-list`, etc. — indexed by string keys. */
export type ContractListItem = {
    label?: string;
    description?: string;
} & Record<string, unknown>;

export type ContractSection = {
    title?: string;
    description?: string;
} & Record<`list-${number}`, ContractListItem | undefined> &
    Record<string, unknown>;

export type RetailLoanContract = {
    important?: { title?: string; description?: string };
    intro?: string;
    between?: string;
    parties?: ContractSection;
    background?: ContractSection;
    witnesses?: ContractSection;
} & Record<`subheader-${number}`, ContractSection | undefined> &
    Record<string, unknown>;

/**
 * The exempt (wholesale) contract renders from the same tree as the retail
 * one; the templates differ, the SHAPE does not. Kept as its own name because
 * `contractType` distinguishes them everywhere else.
 */
export type ExemptLoanContract = RetailLoanContract;

/** Either contract, parsed. Both are the same tree. */
export type LoanContractFormatted = RetailLoanContract;

/**
 * `contractType` arrives over the wire as a free string; these are the two the
 * version byte encodes.
 */
export type ContractType = 'retail' | 'exempt';

export interface GenerateContractResponse {
    fullName: string;
    /** The plaintext the lender signs (EIP-191). */
    contractMessage: string;
    /** Returned as a JSON-encoded string; parse before rendering. */
    formattedMessage: string;
    contractType: ContractType;
    /** Template version (>= 1). */
    contractVersion: number;
    /** ms-epoch; feeds the on-chain `depositData` and the TTL guard. */
    timestamp: number;
}

export type ResolvedContractResponse = GenerateContractResponse & {
    isValid: boolean;
};

/** Narrow the backend's loose `contractType` string to the encoded union. */
export function asContractType(raw: string): ContractType {
    return raw === 'exempt' ? 'exempt' : 'retail';
}

/**
 * Parse the server's JSON-string `formattedMessage` into a tree. Returns
 * `null` on parse failure so a renderer can fall back to the plaintext.
 */
export function parseFormattedMessage(
    raw: string,
): LoanContractFormatted | null {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === 'object')
            return parsed as LoanContractFormatted;
        return null;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// The on-chain `depositData` blob
// ---------------------------------------------------------------------------

/**
 * Pack the contract version and type into the `versionType` word.
 *
 * ```
 * high byte = contract version (>= 1)
 * low byte  = 0 for retail, 1 for exempt
 * ```
 */
export function buildContractVersionType(
    contractVersion: number,
    contractType: ContractType,
): number {
    return (contractVersion << 8) + (contractType === 'retail' ? 0 : 1);
}

/**
 * Build the on-chain `depositData` blob that `requestDepositWithKyc` expects.
 *
 * The KasuController decodes the bytes as
 * `(bytes signature, uint256 timestamp, uint256 versionType)` and uses the
 * embedded acceptance signature to verify — retrospectively, via the
 * agreements service `/contract/resolve` — that the lender signed the
 * loan-contract text. The ABI tuple and the packing are consensus-critical:
 * these bytes go on chain.
 *
 * kasu-ui encodes this with viem, kasu-mobile with ethers v5 (viem is not
 * available on Expo). This is the ethers v5 implementation, and
 * `loan-contract.test.ts` pins its output byte-for-byte against fixtures
 * produced by the viem version, so the two apps can never diverge here.
 *
 * @param args.signature EIP-191 signature from the lender accepting
 *   `contractMessage`, as a 0x-prefixed hex string.
 * @param args.timestamp ms-epoch from the contract response.
 */
export function encodeDepositData(args: {
    signature: string;
    timestamp: number;
    contractVersion: number;
    contractType: ContractType;
}): string {
    const versionType = buildContractVersionType(
        args.contractVersion,
        args.contractType,
    );
    return ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'uint256', 'uint256'],
        [
            args.signature,
            ethers.BigNumber.from(args.timestamp),
            ethers.BigNumber.from(versionType),
        ],
    );
}

// ---------------------------------------------------------------------------
// The signed messages
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/**
 * Format a unix timestamp as `{day} {MonthName} {yyyy}, {HH}:{mm}` in UTC.
 * Day is non-padded; hour and minute are zero-padded to two digits (24h). A
 * timestamp with >= 13 digits is treated as milliseconds, otherwise as seconds
 * — the same auto-detection kasu-backend applies.
 *
 * Deliberately a manual formatter with English month names: no locale, no
 * `Intl`, so the output is byte-identical across runtimes and time zones. This
 * is not a display date. It goes inside a signed message.
 *
 * e.g. 1785313320000 → `"29 July 2026, 08:22"`
 */
export function formatSignTimestampUtc(timestamp: number): string {
    const ms = timestamp.toString().length >= 13 ? timestamp : timestamp * 1000;
    const date = new Date(ms);
    const day = date.getUTCDate();
    const month = MONTH_NAMES[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/**
 * The 4-line human-readable message a lender signs to generate their loan
 * agreement for review — `POST /contract/generate`.
 *
 * ⚠️ BYTE-EXACT PROTOCOL STRING. kasu-backend rebuilds this string from the
 * request body and verifies the signature against it, so the wording,
 * ordering, separators, line breaks and date format are all part of the wire
 * contract. The separator between the line-2 fields is a MIDDLE DOT U+00B7
 * (·) with a single space on each side; the four lines are joined with `\n`.
 *
 * The backend takes this format only when all four display fields are present
 * and non-empty, and it cross-checks `amountLabel`'s leading number against
 * the `depositAmount` it was sent (thousands separators stripped) — a message
 * that states an amount other than the one being executed is refused.
 */
export function buildLoanAgreementSignMessage(p: {
    strategyName: string;
    region: string;
    optionName: string;
    amountLabel: string;
    timestamp: number;
}): string {
    return [
        'Generate my Loan Agreement for review:',
        `${p.strategyName} · ${p.region} · ${p.optionName} · ${p.amountLabel}.`,
        `Request made ${formatSignTimestampUtc(p.timestamp)} UTC.`,
        'This request does not commit me to lend.',
    ].join('\n');
}

/**
 * The legacy `/contract/generate` and `/contract/resolve` message.
 *
 * ⚠️ BYTE-EXACT PROTOCOL STRING. kasu-backend rebuilds it as
 * `` `I request contract content for ${address} at ${timestamp}.` `` from the
 * `address` and `timestamp` fields of the request body — so the string signed
 * and the body sent must agree exactly, INCLUDING the address casing. This
 * builder lowercases, and the request body must carry the same lowercased
 * address; that is what both apps signing this format do today.
 *
 * The backend takes this path whenever the four human-readable display fields
 * are absent, and documents it as permanent until the legacy app is
 * decommissioned. `/contract/resolve` has no other format — every consumer
 * signs this one to retrieve an existing agreement.
 *
 * @param timestampMs ms-epoch, and the same value sent as the body's
 *   `timestamp`.
 */
export function buildLegacyContractRequestMessage(
    address: string,
    timestampMs: number,
): string {
    return `I request contract content for ${address.toLowerCase()} at ${timestampMs}.`;
}

/**
 * The `POST /contract/fullname` message.
 *
 * ⚠️ BYTE-EXACT PROTOCOL STRING, on the same terms as
 * `buildLegacyContractRequestMessage`: kasu-backend rebuilds
 * `` `I request my full name for ${address} at ${timestamp}.` `` from the
 * request body and verifies the signature against it, so the body must carry
 * the same lowercased address this builder signs.
 *
 * @param timestampMs ms-epoch, and the same value sent as the body's
 *   `timestamp`.
 */
export function buildFullNameRequestMessage(
    address: string,
    timestampMs: number,
): string {
    return `I request my full name for ${address.toLowerCase()} at ${timestampMs}.`;
}
