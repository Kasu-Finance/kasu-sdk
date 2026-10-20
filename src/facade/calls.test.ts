/**
 * `kasu.calls` — read, then encode, never send — and the sponsored withdraw
 * path `kasu.flows.withdraw({ submitCall })` wires on top of it.
 *
 * Offline: a stub provider answers the two share reads from memory and
 * records them, which is also how a spec proves the SDK read the right
 * tranche, with the right argument, through the same helper the direct
 * `UserLending` withdrawal path uses.
 */
import { BigNumber, providers, utils } from 'ethers';

import { ILendingPoolTrancheAbi__factory } from '../contracts/factories/ILendingPoolTrancheAbi__factory';
import {
    SPONSORED_CALL_SELECTORS,
    SponsoredCall,
    SponsoredCallInputError,
} from '../domain/sponsored-calls';
import { WaitableTransaction } from '../flows';

import type { RequestWithdrawalCallParams } from './calls';
import { CHAIN_CONFIGS } from './chain-configs';
import { Kasu } from './kasu';

const USER = '0xAbCdEf0000000000000000000000000000000001' as const;
const POOL = '0x0000000000000000000000000000000000000005';
const TRANCHE = '0x0000000000000000000000000000000000000006';
const ASSETS = BigNumber.from(10_077_107); // 10.077107 at 6dp
/** What the stub's `convertToShares` answers: a synthetic 1 : 0.9. */
const sharesFor = (assets: BigNumber): BigNumber => assets.mul(9).div(10);
const HELD_SHARES = BigNumber.from(123_456_789);

const TRANCHE_IFACE = ILendingPoolTrancheAbi__factory.createInterface();
const LPM_ADDRESS = CHAIN_CONFIGS.base.contracts.LendingPoolManager;

interface Read {
    to: string;
    name: string;
    args: utils.Result;
}

class StubProvider extends providers.StaticJsonRpcProvider {
    public reads: Read[] = [];

    constructor(private readonly _held: BigNumber = HELD_SHARES) {
        super('http://127.0.0.1:1/never-dialled', 8453);
    }

    override async call(
        tx: utils.Deferrable<providers.TransactionRequest>,
    ): Promise<string> {
        const { to, data } = await utils.resolveProperties(tx);
        const parsed = TRANCHE_IFACE.parseTransaction({ data: String(data) });
        this.reads.push({
            to: String(to),
            name: parsed.signature,
            args: parsed.args,
        });
        if (parsed.signature === 'convertToShares(uint256)') {
            return utils.defaultAbiCoder.encode(
                ['uint256'],
                [sharesFor(parsed.args[0] as BigNumber)],
            );
        }
        if (parsed.signature === 'balanceOf(address)') {
            return utils.defaultAbiCoder.encode(['uint256'], [this._held]);
        }
        throw new Error(`unexpected read ${parsed.signature}`);
    }
}

function kasuOn(provider: StubProvider): Kasu {
    return Kasu.create({ chain: 'base', signerOrProvider: provider });
}

/** The words after the selector, as numbers / addresses. */
function argsOf(call: SponsoredCall): utils.Result {
    return utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint256'],
        `0x${call.call.data.slice(10)}`,
    );
}

describe('kasu.calls.requestWithdrawal', () => {
    it('converts an asset amount with the tranche’s convertToShares and encodes those shares to THIS chain’s LPM', async () => {
        const provider = new StubProvider();
        const encoded = await kasuOn(provider).calls.requestWithdrawal({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: ASSETS,
            userAddress: USER,
        });

        expect(provider.reads).toHaveLength(1);
        expect(provider.reads[0].to.toLowerCase()).toBe(TRANCHE);
        expect(provider.reads[0].name).toBe('convertToShares(uint256)');
        expect((provider.reads[0].args[0] as BigNumber).eq(ASSETS)).toBe(true);

        expect(encoded.kind).toBe('withdrawal');
        expect(encoded.call.to).toBe(LPM_ADDRESS);
        expect(encoded.call.data.slice(0, 10)).toBe(
            SPONSORED_CALL_SELECTORS.withdrawal,
        );
        const [pool, tranche, shares] = argsOf(encoded);
        expect(String(pool).toLowerCase()).toBe(POOL);
        expect(String(tranche).toLowerCase()).toBe(TRANCHE);
        expect((shares as BigNumber).eq(sharesFor(ASSETS))).toBe(true);
    });

    it('`max` reads balanceOf(lender, lowercased) — every share held — and encodes exactly that', async () => {
        const provider = new StubProvider();
        const encoded = await kasuOn(provider).calls.requestWithdrawal({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: 'max',
            userAddress: USER,
        });
        expect(provider.reads).toHaveLength(1);
        expect(provider.reads[0].name).toBe('balanceOf(address)');
        expect(String(provider.reads[0].args[0])).toBe(
            utils.getAddress(USER.toLowerCase()),
        );
        expect((argsOf(encoded)[2] as BigNumber).eq(HELD_SHARES)).toBe(true);
    });

    it('converts exactly as the direct UserLending path does (the same helper)', async () => {
        const provider = new StubProvider();
        const kasu = kasuOn(provider);
        const direct =
            await kasu.services.UserLending.getWithdrawalSharesForAssets(
                TRANCHE,
                ASSETS,
            );
        const encoded = await kasu.calls.requestWithdrawal({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: ASSETS,
            userAddress: USER,
        });
        expect((argsOf(encoded)[2] as BigNumber).eq(direct)).toBe(true);
    });

    it('refuses an empty position (zero shares) — nothing would be withdrawn, the relay refuses it', async () => {
        const provider = new StubProvider(BigNumber.from(0));
        await expect(
            kasuOn(provider).calls.requestWithdrawal({
                poolId: POOL,
                trancheId: TRANCHE,
                amount: 'max',
                userAddress: USER,
            }),
        ).rejects.toMatchObject({ code: 'zero-shares' });
    });

    it('refuses a non-positive amount, or a malformed lender / tranche, without reading the chain', async () => {
        const provider = new StubProvider();
        const calls = kasuOn(provider).calls;
        for (const [params, code] of [
            [{ amount: BigNumber.from(0) }, 'non-positive-amount'],
            [{ amount: BigNumber.from(-1) }, 'non-positive-amount'],
            [{ amount: 10 as unknown as BigNumber }, 'non-positive-amount'],
            [{ userAddress: '0xuser' }, 'user'],
            [{ trancheId: '0xtranche' }, 'tranche'],
        ] as const) {
            const base: RequestWithdrawalCallParams = {
                poolId: POOL,
                trancheId: TRANCHE,
                amount: ASSETS,
                userAddress: USER,
            };
            const err = await calls
                .requestWithdrawal({ ...base, ...params })
                .catch((e: unknown) => e);
            expect(err).toBeInstanceOf(SponsoredCallInputError);
            expect((err as SponsoredCallInputError).code).toBe(code);
        }
        expect(provider.reads).toHaveLength(0);
    });

    it('works on a read-only instance — it reads, never writes', async () => {
        // `kasuOn` passes a Provider, not a Signer.
        const kasu = kasuOn(new StubProvider());
        expect(kasu.isReadOnly).toBe(true);
        await expect(
            kasu.calls.requestWithdrawal({
                poolId: POOL,
                trancheId: TRANCHE,
                amount: ASSETS,
                userAddress: USER,
            }),
        ).resolves.toMatchObject({ kind: 'withdrawal' });
    });
});

describe('kasu.calls — cancels and withdraw at expiry', () => {
    it.each([
        ['cancelDepositRequest', 'cancel_deposit'],
        ['cancelWithdrawalRequest', 'cancel_withdrawal'],
        ['withdrawAtExpiry', 'withdraw_at_expiry'],
    ] as const)('%s → %s, to THIS chain’s LPM, no read', (method, kind) => {
        const provider = new StubProvider();
        const encoded = kasuOn(provider).calls[method](POOL, 42);
        expect(encoded.kind).toBe(kind);
        expect(encoded.call.to).toBe(LPM_ADDRESS);
        expect(encoded.call.data.slice(0, 10)).toBe(
            SPONSORED_CALL_SELECTORS[kind],
        );
        const [pool, id] = utils.defaultAbiCoder.decode(
            ['address', 'uint256'],
            `0x${encoded.call.data.slice(10)}`,
        );
        expect(String(pool).toLowerCase()).toBe(POOL);
        expect((id as BigNumber).eq(42)).toBe(true);
        expect(provider.reads).toHaveLength(0);
    });

    it('targets each deployment’s own LPM', () => {
        for (const chain of ['xdc', 'xdc-usdc'] as const) {
            const kasu = Kasu.create({
                chain,
                signerOrProvider: new StubProvider(),
            });
            expect(kasu.calls.cancelDepositRequest(POOL, 1).call.to).toBe(
                CHAIN_CONFIGS[chain].contracts.LendingPoolManager,
            );
        }
    });
});

describe('kasu.flows.withdraw({ submitCall }) — the wired sponsored path', () => {
    it('encodes through kasu.calls and submits that call; withdraw/withdrawMax are never used', async () => {
        const provider = new StubProvider();
        const submitted: SponsoredCall[] = [];
        const flow = kasuOn(provider).flows.withdraw({
            submitCall: (call): Promise<WaitableTransaction> => {
                submitted.push(call);
                return Promise.resolve({
                    wait: (): Promise<unknown> => Promise.resolve({}),
                });
            },
        });
        expect(flow.state.sponsored).toBe(true);

        // A read-only instance: had the direct ports been used, they would
        // have refused with READ_ONLY_MESSAGE.
        await flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: ASSETS,
            userAddress: USER,
        });
        expect(flow.state.phase).toBe('success');
        expect(submitted).toHaveLength(1);
        expect(submitted[0].kind).toBe('withdrawal');
        expect(submitted[0].call.to).toBe(LPM_ADDRESS);
        expect(
            (argsOf(submitted[0])[2] as BigNumber).eq(sharesFor(ASSETS)),
        ).toBe(true);
    });

    it('an explicitly undefined encodeWithdrawal keeps the SDK default', async () => {
        const flow = kasuOn(new StubProvider()).flows.withdraw({
            encodeWithdrawal: undefined,
            submitCall: (): Promise<WaitableTransaction> =>
                Promise.resolve({
                    wait: (): Promise<unknown> => Promise.resolve({}),
                }),
        });
        await flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: 'max',
            userAddress: USER,
        });
        expect(flow.state.phase).toBe('success');
    });

    it('an empty position fails BEFORE anything is submitted', async () => {
        const submitCall = jest.fn();
        const flow = kasuOn(new StubProvider(BigNumber.from(0))).flows.withdraw(
            { submitCall },
        );
        await flow.start({
            poolId: POOL,
            trancheId: TRANCHE,
            amount: 'max',
            userAddress: USER,
        });
        expect(flow.state.failure).toMatchObject({
            step: 'request',
            reason: 'failed',
        });
        expect(submitCall).not.toHaveBeenCalled();
    });

    it('without submitCall the flow is the direct path, unchanged', () => {
        expect(
            kasuOn(new StubProvider()).flows.withdraw().state.sponsored,
        ).toBe(false);
    });
});
