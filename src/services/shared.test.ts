import { isBlockUnavailableError } from './shared';

describe('isBlockUnavailableError', () => {
    it.each([
        // geth / Nethermind: pruned state
        new Error('missing trie node 1a2b… (path ) state 0x… is not available'),
        // a node behind the subgraph
        new Error('header not found'),
        // ethers v5 wraps the node's answer in `error` / `body`
        Object.assign(new Error('processing response error'), {
            body: '{"jsonrpc":"2.0","id":1,"error":{"code":-32000,"message":"missing trie node"}}',
        }),
        Object.assign(new Error('call revert exception'), {
            error: { message: 'Unknown block number' },
        }),
        new Error('historical state abc is not available'),
        new Error('block number out of range'),
    ])('true for a node that cannot serve the block: %s', (error) => {
        expect(isBlockUnavailableError(error)).toBe(true);
    });

    it.each([
        new Error('429 Too Many Requests'),
        Object.assign(new Error('processing response error'), {
            body: '{"error":{"code":-32005,"message":"request limit reached"}}',
        }),
        new Error('timeout exceeded'),
        new Error('could not detect network (event="noNetwork")'),
        new Error('execution reverted'),
        null,
        undefined,
        'fetch failed',
    ])('false for every other failure: %s', (error) => {
        expect(isBlockUnavailableError(error)).toBe(false);
    });
});
