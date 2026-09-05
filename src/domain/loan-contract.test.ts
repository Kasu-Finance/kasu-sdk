import { ethers } from 'ethers';

import {
    asContractType,
    buildContractVersionType,
    buildFullNameRequestMessage,
    buildLegacyContractRequestMessage,
    buildLoanAgreementSignMessage,
    ContractType,
    encodeDepositData,
    formatSignTimestampUtc,
    parseFormattedMessage,
} from './loan-contract';

/**
 * Ported from kasu-ui `src/features/lending/lib/encode-deposit-data.test.ts`
 * and `sign-message.test.ts`.
 *
 * PINNED CROSS-REPO CONTRACT. The expected strings and byte strings here are
 * what kasu-backend reconstructs and verifies against. A diff in this file
 * without a matching kasu-backend diff means signatures stop verifying in
 * production.
 */

describe('buildContractVersionType', () => {
    it('packs version 1 retail as 0x0100 (256)', () => {
        expect(buildContractVersionType(1, 'retail')).toBe(256);
    });

    it('packs version 1 exempt as 0x0101 (257)', () => {
        expect(buildContractVersionType(1, 'exempt')).toBe(257);
    });

    it('packs version 0 retail as 0', () => {
        expect(buildContractVersionType(0, 'retail')).toBe(0);
    });

    it('packs version 2 exempt as 0x0201 (513)', () => {
        expect(buildContractVersionType(2, 'exempt')).toBe(513);
    });
});

const SIG_65 =
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' +
    'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef1c';
const SIG_65_B =
    '0x4a1e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8' +
    '4a1e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f81b';

/**
 * BYTE FIXTURES — produced by the viem implementation kasu-ui runs
 * (`encodeAbiParameters(parseAbiParameters('bytes, uint256, uint256'), …)`)
 * and pasted here verbatim. This is the whole point of the port: the ethers v5
 * encoder in `loan-contract.ts` must emit exactly these bytes, because kasu-ui
 * and kasu-mobile write the same `depositData` field on the same contract.
 *
 * Covers both contract types, a contract version >= 2, a short signature and
 * the empty-signature/zero-timestamp floor.
 */
const VIEM_FIXTURES: {
    name: string;
    signature: string;
    timestamp: number;
    contractVersion: number;
    contractType: ContractType;
    expected: string;
}[] = [
    {
        name: 'v1 retail, ms timestamp',
        signature: SIG_65,
        timestamp: 1_700_000_000_000,
        contractVersion: 1,
        contractType: 'retail',
        expected:
            '0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000018bcfe5680000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000041deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef1c00000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'v1 exempt, ms timestamp',
        signature: SIG_65,
        timestamp: 1_700_000_000_000,
        contractVersion: 1,
        contractType: 'exempt',
        expected:
            '0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000018bcfe5680000000000000000000000000000000000000000000000000000000000000001010000000000000000000000000000000000000000000000000000000000000041deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef1c00000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'v2 retail, deck timestamp',
        signature: SIG_65_B,
        timestamp: 1_785_313_320_000,
        contractVersion: 2,
        contractType: 'retail',
        expected:
            '0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000019facf75c40000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000414a1e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f84a1e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f81b00000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'v2 exempt, deck timestamp',
        signature: SIG_65_B,
        timestamp: 1_785_313_320_000,
        contractVersion: 2,
        contractType: 'exempt',
        expected:
            '0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000019facf75c40000000000000000000000000000000000000000000000000000000000000020100000000000000000000000000000000000000000000000000000000000000414a1e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f84a1e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f81b00000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'short signature, v3 exempt, timestamp 1',
        signature: '0x1234',
        timestamp: 1,
        contractVersion: 3,
        contractType: 'exempt',
        expected:
            '0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000030100000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'empty signature, v0 retail, timestamp 0',
        signature: '0x',
        timestamp: 0,
        contractVersion: 0,
        contractType: 'retail',
        expected:
            '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
];

describe('encodeDepositData — byte-identical to the viem implementation', () => {
    for (const fixture of VIEM_FIXTURES) {
        it(`matches the viem fixture: ${fixture.name}`, () => {
            expect(
                encodeDepositData({
                    signature: fixture.signature,
                    timestamp: fixture.timestamp,
                    contractVersion: fixture.contractVersion,
                    contractType: fixture.contractType,
                }),
            ).toBe(fixture.expected);
        });
    }

    it('produces a 0x-prefixed hex string', () => {
        const out = encodeDepositData({
            signature: SIG_65,
            timestamp: 1_700_000_000_000,
            contractVersion: 1,
            contractType: 'retail',
        });
        expect(out).toMatch(/^0x[0-9a-f]+$/i);
    });

    it('round-trips through the same ABI tuple', () => {
        const out = encodeDepositData({
            signature: SIG_65,
            timestamp: 1_700_000_000_000,
            contractVersion: 1,
            contractType: 'exempt',
        });
        const [sigOut, tsOut, vtOut] = ethers.utils.defaultAbiCoder.decode(
            ['bytes', 'uint256', 'uint256'],
            out,
        ) as [string, ethers.BigNumber, ethers.BigNumber];
        expect(sigOut).toBe(SIG_65);
        expect(tsOut.toString()).toBe('1700000000000');
        expect(vtOut.toString()).toBe('257'); // version 1 exempt
    });

    it('encodes retail with low-byte 0 and exempt with low-byte 1', () => {
        const vt = (contractType: ContractType): string => {
            const [, , v] = ethers.utils.defaultAbiCoder.decode(
                ['bytes', 'uint256', 'uint256'],
                encodeDepositData({
                    signature: SIG_65,
                    timestamp: 1,
                    contractVersion: 1,
                    contractType,
                }),
            ) as [string, ethers.BigNumber, ethers.BigNumber];
            return v.toString();
        };
        expect(vt('retail')).toBe('256');
        expect(vt('exempt')).toBe('257');
    });
});

describe('formatSignTimestampUtc', () => {
    // 29 July 2026, 08:22:00 UTC.
    const ms = 1785313320000; // 13 digits → milliseconds
    const seconds = 1785313320; // 10 digits → seconds

    it('formats a millisecond timestamp (>= 13 digits)', () => {
        expect(formatSignTimestampUtc(ms)).toBe('29 July 2026, 08:22');
    });

    it('formats a second timestamp (< 13 digits) to the same instant', () => {
        expect(formatSignTimestampUtc(seconds)).toBe('29 July 2026, 08:22');
    });

    it('pads hour/minute but not the day, at a month-boundary midnight', () => {
        // 1 August 2026, 00:05:00 UTC — day non-padded ("1"), minute padded.
        const midnight = Date.UTC(2026, 7, 1, 0, 5, 0);
        expect(formatSignTimestampUtc(midnight)).toBe('1 August 2026, 00:05');
    });
});

describe('buildLoanAgreementSignMessage', () => {
    it('builds the exact 4-line message from a millisecond timestamp', () => {
        expect(
            buildLoanAgreementSignMessage({
                strategyName: 'Taxation Funding (Tax Pay)',
                region: 'Australia',
                optionName: 'Upper Mezzanine',
                amountLabel: '500 AUDD',
                timestamp: 1785313320000,
            }),
        ).toBe(
            'Generate my Loan Agreement for review:\n' +
                'Taxation Funding (Tax Pay) · Australia · Upper Mezzanine · 500 AUDD.\n' +
                'Request made 29 July 2026, 08:22 UTC.\n' +
                'This request does not commit me to lend.',
        );
    });

    it('builds the identical message from the equivalent second timestamp', () => {
        expect(
            buildLoanAgreementSignMessage({
                strategyName: 'Whole Ledger Funding',
                region: 'Australia',
                optionName: 'Mezzanine',
                amountLabel: '1,260.37 USDC',
                timestamp: 1785313320, // seconds form of the same instant
            }),
        ).toBe(
            'Generate my Loan Agreement for review:\n' +
                'Whole Ledger Funding · Australia · Mezzanine · 1,260.37 USDC.\n' +
                'Request made 29 July 2026, 08:22 UTC.\n' +
                'This request does not commit me to lend.',
        );
    });

    it('formats a month-boundary/midnight request line', () => {
        expect(
            buildLoanAgreementSignMessage({
                strategyName: 'Professional Fee Funding',
                region: 'Australia',
                optionName: 'Junior',
                amountLabel: '10 USDC',
                timestamp: Date.UTC(2026, 7, 1, 0, 5, 0),
            }),
        ).toBe(
            'Generate my Loan Agreement for review:\n' +
                'Professional Fee Funding · Australia · Junior · 10 USDC.\n' +
                'Request made 1 August 2026, 00:05 UTC.\n' +
                'This request does not commit me to lend.',
        );
    });

    it('separates the line-2 fields with U+00B7 surrounded by single spaces', () => {
        const message = buildLoanAgreementSignMessage({
            strategyName: 'A',
            region: 'B',
            optionName: 'C',
            amountLabel: 'D',
            timestamp: 1785313320000,
        });
        expect(message.split('\n')[1]).toBe('A · B · C · D.');
        expect(message.split('\n')).toHaveLength(4);
    });
});

describe('buildLegacyContractRequestMessage', () => {
    const ADDRESS = '0x4c0d92e9c862B58b0FFeAAD031004A049d2c360D';

    it('builds the exact legacy template with a lowercased address', () => {
        expect(buildLegacyContractRequestMessage(ADDRESS, 1785313320000)).toBe(
            'I request contract content for ' +
                '0x4c0d92e9c862b58b0ffeaad031004a049d2c360d at 1785313320000.',
        );
    });

    it('is insensitive to the casing the caller hands over', () => {
        expect(buildLegacyContractRequestMessage(ADDRESS, 1)).toBe(
            buildLegacyContractRequestMessage(ADDRESS.toLowerCase(), 1),
        );
    });

    it('prints the timestamp verbatim — no seconds/ms normalisation', () => {
        // The backend echoes the body's `timestamp` into the string it
        // verifies, so whatever is signed must be what is sent.
        expect(buildLegacyContractRequestMessage(ADDRESS, 1785313320)).toBe(
            'I request contract content for ' +
                '0x4c0d92e9c862b58b0ffeaad031004a049d2c360d at 1785313320.',
        );
    });
});

describe('buildFullNameRequestMessage', () => {
    const ADDRESS = '0x26b5b8060A704b0420734d5Ccd657384fb1366C2';

    it('builds the exact full-name template with a lowercased address', () => {
        expect(buildFullNameRequestMessage(ADDRESS, 1785313320000)).toBe(
            'I request my full name for ' +
                '0x26b5b8060a704b0420734d5ccd657384fb1366c2 at 1785313320000.',
        );
    });

    it('is a different message from the contract-content one', () => {
        expect(buildFullNameRequestMessage(ADDRESS, 1)).not.toBe(
            buildLegacyContractRequestMessage(ADDRESS, 1),
        );
    });
});

describe('parseFormattedMessage', () => {
    it('parses the server’s JSON-encoded tree', () => {
        const parsed = parseFormattedMessage(
            JSON.stringify({ intro: 'x', 'subheader-1': { title: 't' } }),
        );
        expect(parsed?.intro).toBe('x');
    });

    it('returns null on malformed JSON so a renderer can fall back', () => {
        expect(parseFormattedMessage('not json')).toBeNull();
        expect(parseFormattedMessage('')).toBeNull();
    });

    it('returns null for a JSON scalar, which is not a contract tree', () => {
        expect(parseFormattedMessage('42')).toBeNull();
        expect(parseFormattedMessage('null')).toBeNull();
        expect(parseFormattedMessage('"a string"')).toBeNull();
    });
});

describe('asContractType', () => {
    it('narrows the wire string to the two encoded types', () => {
        expect(asContractType('exempt')).toBe('exempt');
        expect(asContractType('retail')).toBe('retail');
    });

    it('falls back to retail for anything else', () => {
        // Retail is the stricter contract; an unrecognised type must not be
        // silently treated as the exempt one.
        expect(asContractType('')).toBe('retail');
        expect(asContractType('Exempt')).toBe('retail');
        expect(asContractType('whatever')).toBe('retail');
    });
});
