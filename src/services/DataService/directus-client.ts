import {
    authentication,
    AuthenticationClient,
    createDirectus,
    DirectusClient,
    rest,
    RestClient,
} from '@directus/sdk';

import { DirectusSchema } from './directus-types';

/** The Directus client shape both services hold. */
export type KasuDirectusClient = DirectusClient<DirectusSchema> &
    AuthenticationClient<DirectusSchema> &
    RestClient<DirectusSchema>;

/**
 * The error a CMS-only call raises on a deployment configured without
 * Directus. Named so a caller can match on it rather than on the message.
 */
export const NO_DIRECTUS_URL_MESSAGE =
    'Kasu: this call needs Directus, but the SDK was configured without a ' +
    '`directusUrl`. On-chain data (pools, tranches, positions, requests) ' +
    'works without one; CMS content does not.';

/**
 * Build the Directus client, or a stand-in that refuses clearly.
 *
 * `directusUrl` is documented optional, and most of the SDK genuinely does not
 * need it — pools, tranches, positions and request history all come from the
 * subgraph and the chain. But `createDirectus('')` throws `Invalid URL` inside
 * the constructor, so omitting the URL used to make the whole SDK
 * unconstructable rather than merely CMS-less.
 *
 * With no URL, the services skip Directus where they can degrade (pool
 * descriptions, images and Directus pool names simply do not appear, and the
 * raw subgraph names are used instead), and a call that exists ONLY to read
 * CMS content rejects with `NO_DIRECTUS_URL_MESSAGE` — a sentence that says
 * what to configure, rather than a `null` dereference thrown from inside a
 * vendor SDK.
 */
export function createDirectusClient(directusUrl: string): KasuDirectusClient {
    if (directusUrl) {
        return createDirectus<DirectusSchema>(directusUrl)
            .with(authentication())
            .with(rest());
    }
    const refuse = (): never => {
        throw new Error(NO_DIRECTUS_URL_MESSAGE);
    };
    // A stand-in, not a client: every entry point the services use goes
    // through `request`, so refusing there covers all of them.
    return { request: refuse } as unknown as KasuDirectusClient;
}
