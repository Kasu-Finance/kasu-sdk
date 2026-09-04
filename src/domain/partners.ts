// Credit Originator + Institutional (senior) Lender are not exposed as Directus
// or subgraph pool fields, so we derive them from the pool name. Confirmed
// mapping (2026-06): the only InvoiceMate strategy is "Payment Finance
// (PayFi)"; every other pool — Whole Ledger / Taxation / Professional Fee
// Funding — is Apxium. Apxium → Rixon Capital (senior lender); InvoiceMate →
// none. Replace this with a real Directus field if/when one ships.
export interface StrategyPartner {
    name: string;
    url: string;
}

export const APXIUM: StrategyPartner = {
    name: 'Apxium',
    url: 'https://www.apxium.com/',
};
export const INVOICEMATE: StrategyPartner = {
    name: 'InvoiceMate',
    url: 'https://invoicemate.net/',
};
export const RIXON_CAPITAL: StrategyPartner = {
    name: 'Rixon Capital',
    url: 'https://rixon.capital/',
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
