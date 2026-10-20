import { utils } from 'ethers';

/**
 * Block-explorer links, built only from a hash or address that has been
 * checked first.
 *
 * Apps used to concatenate `explorer + '/tx/' + hash` from whatever string
 * they held — a value off a receipt, a query parameter, a backend field. A
 * string that is not a hash then becomes a link that points somewhere else
 * (`/tx/../../evil`, `?x=`, a whole other URL). These helpers refuse anything
 * that is not exactly a 32-byte hash or a 20-byte address, and refuse a base
 * that is not an `https://` origin, so the only URL they can return is
 * `<https base>/tx/<hash>` or `<https base>/address/<address>`.
 *
 * A URL is a locator, not copy — no words, no locale — so it does not
 * stretch the domain layer's "numbers and codes only" rule.
 *
 * Pure: no network, no environment. They take any object with a
 * `blockExplorerUrl` — a `CHAIN_CONFIGS` entry, or a custom one.
 */

/** The one field these helpers read from a chain config. */
export interface ExplorerConfig {
    blockExplorerUrl: string;
}

const TX_HASH = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
/** `https://host[:port][/path]`, no query, fragment, credentials or space. */
const HTTPS_BASE =
    /^https:\/\/[A-Za-z0-9.-]+(:[0-9]{1,5})?(\/[A-Za-z0-9._~\-/]*)?$/;

function explorerBase(config: ExplorerConfig): string {
    // Read defensively: a custom config written before 2.10.0 has no field,
    // and TypeScript only tells its author once they bump.
    const base = (config as { blockExplorerUrl?: unknown } | undefined)
        ?.blockExplorerUrl;
    if (typeof base !== 'string' || !HTTPS_BASE.test(base)) {
        throw new Error(
            'explorer url: the chain config has no valid https blockExplorerUrl',
        );
    }
    return base.replace(/\/+$/, '');
}

/**
 * `<blockExplorerUrl>/tx/<txHash>`. Throws unless `txHash` is exactly `0x`
 * followed by 64 hex digits.
 */
export function explorerTxUrl(config: ExplorerConfig, txHash: string): string {
    if (typeof txHash !== 'string' || !TX_HASH.test(txHash)) {
        throw new Error('explorerTxUrl: not a 32-byte 0x-prefixed hex hash');
    }
    return `${explorerBase(config)}/tx/${txHash}`;
}

/**
 * `<blockExplorerUrl>/address/<address>`, the address as given. Throws unless
 * `address` is `0x` followed by 40 hex digits with a valid checksum when it
 * is mixed-case (all-lower and all-upper carry no checksum and are accepted).
 */
export function explorerAddressUrl(
    config: ExplorerConfig,
    address: string,
): string {
    if (
        typeof address !== 'string' ||
        !ADDRESS.test(address) ||
        !utils.isAddress(address)
    ) {
        throw new Error('explorerAddressUrl: not a valid 0x-prefixed address');
    }
    return `${explorerBase(config)}/address/${address}`;
}
