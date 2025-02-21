import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { sanvil, seismicDevnet } from 'seismic-viem'

import { CONTRACT_DIR, CONTRACT_NAME } from '../lib/constants.js'
import { readContractABI, readContractAddress } from '../lib/utils.js'
import { App } from './app.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env')
console.log('Loading environment variables from:', envPath)
dotenv.config({ path: envPath })

// Verify environment variables
console.log('Environment variables loaded:', {
  CHAIN_ID: process.env.CHAIN_ID,
  RPC_URL: process.env.RPC_URL?.substring(0, 10) + '...',
  ALICE_PRIVKEY: process.env.ALICE_PRIVKEY?.substring(0, 10) + '...',
  BOB_PRIVKEY: process.env.BOB_PRIVKEY?.substring(0, 10) + '...',
})

async function main() {
  if (!process.env.CHAIN_ID || !process.env.RPC_URL) {
    console.error('Please set your environment variables.')
    process.exit(1)
  }

  const broadcastFile = join(
    CONTRACT_DIR,
    'broadcast',
    `${CONTRACT_NAME}.s.sol`,
    process.env.CHAIN_ID,
    'run-latest.json'
  )
  const abiFile = join(
    CONTRACT_DIR,
    'out',
    `${CONTRACT_NAME}.sol`,
    `${CONTRACT_NAME}.json`
  )

  // Use sanvil (local node) for development
  const chain = {
    ...sanvil,
    id: parseInt(process.env.CHAIN_ID),
    rpcUrls: {
      default: {
        http: [process.env.RPC_URL],
      },
      public: {
        http: [process.env.RPC_URL],
      },
    },
  }

  if (!process.env.ALICE_PRIVKEY || !process.env.BOB_PRIVKEY) {
    throw new Error('Player private keys not set in environment variables')
  }

  const players = [
    { name: 'Alice', privateKey: `0x${process.env.ALICE_PRIVKEY.replace('0x', '')}` },
    { name: 'Bob', privateKey: `0x${process.env.BOB_PRIVKEY.replace('0x', '')}` },
  ]

  const app = new App({
    players,
    wallet: {
      chain,
      rpcUrl: process.env.RPC_URL,
    },
    contract: {
      abi: readContractABI(abiFile),
      address: readContractAddress(broadcastFile),
    },
  })

  await app.init()

  // Demo: Create and interact with a prediction swarm
  console.log('=== Creating Prediction Swarm ===')
  await app.createSwarm(
    'Alice',
    'Will it rain tomorrow?',
    ['Yes', 'No'],
    BigInt('1000000000000000000') // 1 ETH in wei
  )

  console.log('=== Bob Joins Swarm ===')
  await app.joinSwarm(
    'Bob',
    1, // First swarm (IDs start from 1)
    BigInt('1000000000000000000') // 1 ETH in wei
  )

  console.log('=== Players Place Bets ===')
  await app.placeBet(
    'Alice',
    1, // First swarm (IDs start from 1)
    0, // Yes
    BigInt('500000000000000000') // 0.5 ETH in wei
  )
  await app.placeBet(
    'Bob',
    1, // First swarm (IDs start from 1)
    1, // No
    BigInt('750000000000000000') // 0.75 ETH in wei
  )

  console.log('=== Resolving Swarm ===')
  await app.resolveSwarm(
    'Alice', // Creator resolves
    1, // First swarm (IDs start from 1)
    0 // Yes wins
  )
}

main().catch(console.error)
