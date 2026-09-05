/**
 * The refusal every write path shares when the instance holds a Provider
 * rather than a Signer.
 *
 * One constant, because the message's job is to name the fix — `kasu.connect`
 * — and three near-identical wordings across the facades would be three
 * different pieces of advice for one problem. ethers' own
 * "sending a transaction requires a signer" arrives several frames deeper,
 * after the params have been encoded, and says nothing about how to get a
 * signer onto THIS object.
 */
export const READ_ONLY_MESSAGE =
    'Kasu: this instance is read-only; call kasu.connect(signer) first';
