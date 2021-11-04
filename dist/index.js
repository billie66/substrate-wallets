"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeed = exports.newSeed = exports.addressFromSeed = exports.getSuri = exports.NetworkPrefix = void 0;
const ui_keyring_1 = require("@polkadot/ui-keyring");
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
const defaults_1 = require("@polkadot/keyring/defaults");
const ss58Format = 42;
const keypairType = 'sr25519';
const DEFAULT_PAIR_TYPE = keypairType;
var NetworkPrefix;
(function (NetworkPrefix) {
    NetworkPrefix[NetworkPrefix["substrate"] = 42] = "substrate";
    NetworkPrefix[NetworkPrefix["polkadot"] = 0] = "polkadot";
    NetworkPrefix[NetworkPrefix["kusama"] = 2] = "kusama";
})(NetworkPrefix = exports.NetworkPrefix || (exports.NetworkPrefix = {}));
function getSuri(seed, derivePath, pairType) {
    return pairType === 'ed25519-ledger'
        ? (0, util_1.u8aToHex)((0, util_crypto_1.hdLedger)(seed, derivePath).secretKey.slice(0, 32))
        : pairType === 'ethereum'
            ? `${seed}/${derivePath}`
            : `${seed}${derivePath}`;
}
exports.getSuri = getSuri;
function addressFromSeed(seed, derivePath, pairType = 'sr25519') {
    return ui_keyring_1.keyring.createFromUri(getSuri(seed, derivePath, pairType), {}, pairType === 'ed25519-ledger' ? 'ed25519' : pairType).address;
}
exports.addressFromSeed = addressFromSeed;
function newSeed(seed, seedType) {
    switch (seedType) {
        case 'bip':
            return (0, util_crypto_1.mnemonicGenerate)();
        case 'dev':
            return defaults_1.DEV_PHRASE;
        default:
            return seed || (0, util_1.u8aToHex)((0, util_crypto_1.randomAsU8a)());
    }
}
exports.newSeed = newSeed;
function generateSeed(_seed, derivePath, seedType = 'bip', pairType = DEFAULT_PAIR_TYPE, ss58 = ss58Format) {
    const seed = newSeed(_seed, seedType);
    const suri = addressFromSeed(seed, derivePath, pairType);
    const address = ui_keyring_1.keyring.encodeAddress(suri, ss58);
    return { address, seed };
}
exports.generateSeed = generateSeed;
function getNetworkPrefix(network) {
    let ss58;
    switch (network) {
        case 'polkadot':
            ss58 = NetworkPrefix.polkadot;
            break;
        case 'kusama':
            ss58 = NetworkPrefix.kusama;
            break;
        default:
            ss58 = NetworkPrefix.substrate;
            break;
    }
    return ss58;
}
(0, util_crypto_1.cryptoWaitReady)().then(() => {
    // https://polkadot.js.org/docs/ui-keyring/start/init/
    ui_keyring_1.keyring.loadAll({ ss58Format: 42, type: 'sr25519' });
    const args = process.argv.slice(2);
    console.log(`args...`, args);
    const count = args[0];
    let ss58 = getNetworkPrefix(args[1]);
    const seedType = args[2] && args[2] === 'bip' ? args[2] : 'raw';
    let wallets = [];
    for (let i = 0; i < parseInt(count); i++) {
        const wallet = generateSeed(null, '', seedType, DEFAULT_PAIR_TYPE, ss58);
        wallets.push(wallet);
    }
    console.log(`total ${count} wallets...`, wallets);
});
//# sourceMappingURL=index.js.map