// Credit Originator + Institutional (senior) Lender are not exposed as Directus
// or subgraph pool fields, so we derive them from the pool name. Confirmed
// mapping (2026-06): the only InvoiceMate strategy is "Payment Finance
// (PayFi)"; every other pool — Whole Ledger / Taxation / Professional Fee
// Funding — is Apxium. Apxium → Rixon Capital (senior lender); InvoiceMate →
// none. Replace this with a real Directus field if/when one ships.
export interface StrategyPartner {
    name: string;
    url: string;
    /**
     * The region of the strategies this partner takes part in, as every Kasu
     * surface names it. For a credit originator it is THE strategy's region —
     * `getStrategyRegion` reads it from here — and it is the word that goes
     * into the wallet-signed loan-agreement message, so it must never be
     * stated from anywhere else.
     *
     * Apxium originates in Australia. InvoiceMate (PayFi) funds cross-border
     * payment corridors no single jurisdiction names, so its region is a
     * SCOPE — `'Global'` — rather than a country: naming one would be a claim
     * about where its End Borrowers sit. Rixon Capital is the senior lender in
     * Apxium's Australian strategies.
     */
    region: string;
}

export const APXIUM: StrategyPartner = {
    name: 'Apxium',
    url: 'https://www.apxium.com/',
    region: 'Australia',
};
export const INVOICEMATE: StrategyPartner = {
    name: 'InvoiceMate',
    url: 'https://invoicemate.net/',
    region: 'Global',
};
export const RIXON_CAPITAL: StrategyPartner = {
    name: 'Rixon Capital',
    url: 'https://rixon.capital/',
    region: 'Australia',
};

/**
 * Anything a pool name can arrive as. The raw `PoolOverview` carries
 * `poolName`, the facade's `Strategy` carries `name`, and a caller who already
 * has the string can pass it directly — one rule, whichever shape reaches it.
 * `poolName` wins when an object carries both and it is set.
 */
export type PoolNameSignal =
    | string
    | { poolName?: string | null }
    | { name?: string | null };

function poolNameOf(pool: PoolNameSignal): string {
    if (typeof pool === 'string') return pool;
    const signal: { poolName?: string | null; name?: string | null } = pool;
    return signal.poolName ?? signal.name ?? '';
}

/**
 * Credit-originator inference by pool NAME only. The sole InvoiceMate
 * strategy is "Payment Finance (PayFi)" (matched by "payfi" / "payment
 * finance"); every other pool — Whole Ledger / Taxation / Professional Fee
 * Funding — is Apxium.
 *
 * We deliberately do NOT match on asset class / subheading: Apxium's pools
 * are receivables/invoice financing, so their asset class contains
 * "invoice" and would be misclassified as InvoiceMate.
 */
export function getCreditOriginator(pool: PoolNameSignal): StrategyPartner {
    const name = poolNameOf(pool).toLowerCase();
    if (/payfi|payment finance/.test(name)) return INVOICEMATE;
    return APXIUM;
}

/**
 * Apxium pools carry an institutional senior lender (Rixon Capital);
 * InvoiceMate pools have none.
 */
export function getInstitutionalLender(
    originator: StrategyPartner,
): StrategyPartner | null {
    return originator.name === APXIUM.name ? RIXON_CAPITAL : null;
}

/**
 * The strategy's region — `'Australia'` for the Apxium family, `'Global'` for
 * PayFi — derived from its credit originator, exactly as every surface that
 * states a region must derive it.
 *
 * LOAD-BEARING ON THE MONEY PATH: this is the `region` a lender's wallet signs
 * in the loan-agreement message (`buildLoanAgreementSignMessage`). The backend
 * rebuilds that message from whatever region the client sends and treats it
 * as display-only, so nothing but this function keeps the signed word equal to
 * the word on screen. Never state a region from a constant — that is how a
 * PayFi lender came to pick "Global · Junior" and sign "Australia".
 *
 * Replace the inference with a per-pool field (in the SDK) when one ships.
 */
export function getStrategyRegion(pool: PoolNameSignal): string {
    return getCreditOriginator(pool).region;
}
