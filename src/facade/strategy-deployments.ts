import { CHAIN_CONFIGS } from './chain-configs';
import { ChainConfigEntry, SupportedChain } from './types';

/**
 * Strategy ↔ deployment resolution. A lending strategy is not tied to one
 * deployment: Tax Pay runs as one pool on Base (USDC) and another on XDC
 * (AUDD), and the two share one CMS record keyed by the BASE pool id — the
 * canonical id. Each chain config's `poolMetadataMapping` maps its
 * chain-local ids to canonical ones; Base, being canonical, has none.
 *
 * Pure: it reads only the built-in `CHAIN_CONFIGS`. The same rules as
 * kasu-ui's counterpart lookup, so both apps sum a strategy over the same
 * pools.
 */

/** The pool that represents a strategy on one deployment. */
export interface StrategyDeployment {
    chain: SupportedChain;
    /**
     * Chain-local pool id, lowercase — what that chain's subgraph is keyed
     * by.
     */
    poolId: string;
}

/**
 * What `strategyDeployments` refuses, as a code:
 *
 * - `pool-id` — not a `0x` address;
 * - `chain` — not a `SupportedChain`;
 * - `wrong-chain` — the mapping places the id on ANOTHER deployment (an XDC
 *   chain-local id passed as Base, or a Base id passed as XDC). Querying one
 *   chain with another's address reads nothing, silently.
 */
export type StrategyDeploymentInputErrorCode =
    | 'pool-id'
    | 'chain'
    | 'wrong-chain';

/** What `strategyDeployments` throws for an id it cannot place. */
export class StrategyDeploymentInputError extends Error {
    readonly code: StrategyDeploymentInputErrorCode;

    constructor(code: StrategyDeploymentInputErrorCode) {
        super(`strategyDeployments: input refused (${code})`);
        this.name = 'StrategyDeploymentInputError';
        this.code = code;
        Object.setPrototypeOf(this, StrategyDeploymentInputError.prototype);
    }
}

/** The canonical deployment: its pool ids ARE the strategies' ids. */
const CANONICAL_CHAIN: SupportedChain = 'base';

const ADDRESS_RE = /^0x[0-9a-f]{40}$/;

type MappingConfigs = Readonly<
    Record<SupportedChain, Pick<ChainConfigEntry, 'poolMetadataMapping'>>
>;

/** The deployment's mapping with both sides lowercased; Base never has one. */
function mappingOf(
    configs: MappingConfigs,
    chain: SupportedChain,
): [string, string][] {
    if (chain === CANONICAL_CHAIN) return [];
    return Object.entries(configs[chain].poolMetadataMapping ?? {}).map(
        ([local, canonical]) => [local.toLowerCase(), canonical.toLowerCase()],
    );
}

/**
 * `strategyDeployments` over any configs — the export reads `CHAIN_CONFIGS`;
 * the spec passes its own to cover shapes the built-in mapping lacks.
 */
export function resolveStrategyDeployments(
    configs: MappingConfigs,
    poolId: string,
    chain: SupportedChain,
): StrategyDeployment[] {
    const id = typeof poolId === 'string' ? poolId.trim().toLowerCase() : '';
    if (!ADDRESS_RE.test(id)) {
        throw new StrategyDeploymentInputError('pool-id');
    }
    if (
        typeof chain !== 'string' ||
        !Object.prototype.hasOwnProperty.call(configs, chain)
    ) {
        throw new StrategyDeploymentInputError('chain');
    }
    const chains = Object.keys(configs) as SupportedChain[];
    const mappings = chains.map((c) => [c, mappingOf(configs, c)] as const);
    const isLocalElsewhere = mappings.some(
        ([c, mapping]) =>
            c !== chain && mapping.some(([local]) => local === id),
    );

    let canonical: string;
    if (chain === CANONICAL_CHAIN) {
        // A Base id is its own Base pool — unless the mapping says it is
        // another deployment's chain-local id, which names no Base pool.
        if (isLocalElsewhere) {
            throw new StrategyDeploymentInputError('wrong-chain');
        }
        canonical = id;
    } else {
        const own = mappingOf(configs, chain).find(([local]) => local === id);
        if (own) {
            canonical = own[1];
        } else {
            const isCanonical = mappings.some(([, mapping]) =>
                mapping.some(([, target]) => target === id),
            );
            if (isLocalElsewhere || isCanonical) {
                throw new StrategyDeploymentInputError('wrong-chain');
            }
            // Unmapped off Base: a strategy of one on its own chain (every
            // XDC USDC pool today). Claiming a Base counterpart would read
            // Base with an XDC address.
            return [{ chain, poolId: id }];
        }
    }

    const found: StrategyDeployment[] = [
        { chain: CANONICAL_CHAIN, poolId: canonical },
    ];
    for (const [c, mapping] of mappings) {
        for (const [local, target] of mapping) {
            if (target === canonical) found.push({ chain: c, poolId: local });
        }
    }
    return found;
}

/**
 * Every deployment a strategy has a pool on, canonical (Base) first, then the
 * others in `CHAIN_CONFIGS` order — the legs to fetch and pass to
 * `combineTvlHistories`. One entry for a strategy that lives on one chain
 * only (PayFi, on Base).
 *
 * `chain` is the deployment `poolId` was read on — required, because an
 * address alone does not say which chain it belongs to. From either side of
 * a mapping the answer is the same set: Tax Pay's Base id on `'base'` and
 * its XDC id on `'xdc'` both return both pools. An id the mapping does not
 * know is a strategy of one on its own chain. Ids are compared
 * case-insensitively and returned lowercase.
 *
 * Throws `StrategyDeploymentInputError` for a malformed id, an unknown chain,
 * or an id the mapping places on another deployment (`'wrong-chain'`).
 *
 * ```ts
 * strategyDeployments(strategy.id, 'base');
 * // [{ chain: 'base', poolId: '0x…' }, { chain: 'xdc', poolId: '0x…' }]
 * ```
 */
export function strategyDeployments(
    poolId: string,
    chain: SupportedChain,
): StrategyDeployment[] {
    return resolveStrategyDeployments(CHAIN_CONFIGS, poolId, chain);
}
