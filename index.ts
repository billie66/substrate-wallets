import { keyring } from '@polkadot/ui-keyring'
import { u8aToHex } from '@polkadot/util'
import {
  hdLedger,
  mnemonicGenerate,
  randomAsU8a,
  cryptoWaitReady
} from '@polkadot/util-crypto'
import { DEV_PHRASE } from '@polkadot/keyring/defaults'

const ss58Format = 42
const keypairType = 'sr25519'
const DEFAULT_PAIR_TYPE = keypairType

export enum NetworkPrefix {
  substrate = 42,
  polkadot = 0,
  kusama = 2
}

export type PairType =
  | 'ecdsa'
  | 'ed25519'
  | 'ed25519-ledger'
  | 'ethereum'
  | 'sr25519'

export type SeedType = 'bip' | 'raw' | 'dev'

export function getSuri(
  seed: string,
  derivePath: string,
  pairType: PairType
): string {
  return pairType === 'ed25519-ledger'
    ? u8aToHex(hdLedger(seed, derivePath).secretKey.slice(0, 32))
    : pairType === 'ethereum'
    ? `${seed}/${derivePath}`
    : `${seed}${derivePath}`
}

export function addressFromSeed(
  seed: string,
  derivePath: string,
  pairType: PairType = 'sr25519'
): string {
  return keyring.createFromUri(
    getSuri(seed, derivePath, pairType),
    {},
    pairType === 'ed25519-ledger' ? 'ed25519' : pairType
  ).address
}

export function newSeed(
  seed: string | undefined | null,
  seedType: SeedType
): string {
  switch (seedType) {
    case 'bip':
      return mnemonicGenerate()
    case 'dev':
      return DEV_PHRASE
    default:
      return seed || u8aToHex(randomAsU8a())
  }
}

export function generateSeed(
  _seed: string | undefined | null,
  derivePath: string,
  seedType: SeedType = 'bip',
  pairType: PairType = DEFAULT_PAIR_TYPE,
  ss58: number = ss58Format
) {
  const seed = newSeed(_seed, seedType)
  const suri = addressFromSeed(seed, derivePath, pairType)
  const address = keyring.encodeAddress(suri, ss58)

  return { address, seed }
}

function getNetworkPrefix(network: string) {
  let ss58
  switch (network) {
    case 'polkadot':
      ss58 = NetworkPrefix.polkadot
      break
    case 'kusama':
      ss58 = NetworkPrefix.kusama
      break
    default:
      ss58 = NetworkPrefix.substrate
      break
  }
  return ss58
}

cryptoWaitReady().then(() => {
  // https://polkadot.js.org/docs/ui-keyring/start/init/
  keyring.loadAll({ ss58Format: 42, type: 'sr25519' })

  const args = process.argv.slice(2)
  console.log(`args...`, args)

  const count = args[0]
  let ss58 = getNetworkPrefix(args[1])
  const seedType = args[2] && args[2] === 'bip' ? args[2] : 'raw'

  let wallets = []
  for (let i = 0; i < parseInt(count); i++) {
    const wallet = generateSeed(null, '', seedType, DEFAULT_PAIR_TYPE, ss58)
    wallets.push(wallet)
  }
  console.log(`total ${count} wallets...`, wallets)
})
