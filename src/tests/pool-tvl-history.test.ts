/**
 * Live-network spec for `getPoolTvlHistory`: real subgraphs and the built-in
 * history RPCs. OPT-IN — it runs only under `LIVE_TESTS=1`
 * (`npm run test:live`), so a network problem can never fail a pull request.
 *
 * It discovers the pools through `getVisible()` rather than naming any, and
 * checks the one property that matters to a chart: the last point equals the
 * strategy's own `tvl.total`, and the series is ascending in time.
 */
import { Kasu } from '../facade/kasu';
import { SupportedChain } from '../facade/types';

const live = process.env.LIVE_TESTS === '1';

const CHAINS: SupportedChain[] = ['base', 'xdc', 'xdc-usdc'];

(live ? describe : describe.skip)('live network — pool TVL history', () => {
    it.each(CHAINS)(
        '%s: every visible strategy ends at its current TVL',
        async (chain) => {
            const kasu = Kasu.create({ chain });
            const strategies = await kasu.strategies.getAll();
            expect(strategies.length).toBeGreaterThan(0);

            for (const strategy of strategies) {
                const started = Date.now();
                const history = await kasu.strategies.getPoolTvlHistory(
                    strategy.id,
                );
                const last = history.at(-1);
                const clearings = history.filter((p) => p.kind === 'clearing');
                // eslint-disable-next-line no-console
                console.log(
                    chain,
                    strategy.id,
                    `${String(clearings.length)} clearings`,
                    `last ${String(last?.tvl)} vs ${strategy.tvl.total}`,
                    `${String(Date.now() - started)} ms`,
                );

                expect(last?.kind).toBe('current');
                // Both reads are "now"; a deposit cleared between them would
                // move one and not the other, so allow a cent.
                expect(
                    Math.abs(
                        (last?.tvl ?? NaN) - parseFloat(strategy.tvl.total),
                    ),
                ).toBeLessThan(0.01);
                for (let i = 1; i < history.length; i++) {
                    expect(history[i].timestamp).toBeGreaterThanOrEqual(
                        history[i - 1].timestamp,
                    );
                }
            }
        },
        300_000,
    );
});
