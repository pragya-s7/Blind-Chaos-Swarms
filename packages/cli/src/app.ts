import { http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createShieldedWalletClient } from 'seismic-viem'

interface PlayerConfig {
  name: string
  privateKey: string
}

interface WalletConfig {
  chain: any
  rpcUrl: string
}

interface ContractConfig {
  abi: any
  address: string
}

interface AppConfig {
  players: PlayerConfig[]
  wallet: WalletConfig
  contract: ContractConfig
}

export class App {
  private config: AppConfig
  private playerClients: Map<string, any>
  private playerContracts: Map<string, any>

  constructor(config: AppConfig) {
    this.config = config
    this.playerClients = new Map()
    this.playerContracts = new Map()
  }

  async init() {
    console.log('Initializing app with config:', {
      chain: {
        id: this.config.wallet.chain.id,
        rpcUrls: this.config.wallet.chain.rpcUrls,
      },
      rpcUrl: this.config.wallet.rpcUrl,
      contractAddress: this.config.contract.address,
    })

    for (const player of this.config.players) {
      try {
        console.log(`Creating shielded wallet client for ${player.name}...`)
        const account = privateKeyToAccount(player.privateKey as `0x${string}`)
        console.log(`Account created for ${player.name}:`, account.address)

        const walletClient = await createShieldedWalletClient({
          chain: this.config.wallet.chain,
          transport: http(this.config.wallet.rpcUrl),
          account,
        })
        console.log(`Wallet client created for ${player.name}`)
        this.playerClients.set(player.name, walletClient)

        const contract = {
          abi: this.config.contract.abi,
          address: this.config.contract.address,
          walletClient,
        }
        this.playerContracts.set(player.name, contract)
        console.log(`Contract setup complete for ${player.name}`)
      } catch (error) {
        console.error(`Error initializing player ${player.name}:`, error)
        if (error instanceof Error) {
          console.error('Error details:', error.message)
          console.error('Stack trace:', error.stack)
        }
        throw error
      }
    }
  }

  private getPlayerContract(playerName: string) {
    const contract = this.playerContracts.get(playerName)
    if (!contract) {
      throw new Error(`Contract for player ${playerName} not found`)
    }
    return contract
  }

  async createSwarm(playerName: string, question: string, outcomes: string[], stake: bigint) {
    console.log(`${playerName} creating swarm: "${question}"`)
    try {
      const contract = this.getPlayerContract(playerName)
      await contract.walletClient.writeContract({
        ...contract,
        functionName: 'createSwarm',
        args: [question, outcomes, stake],
      })
      console.log(`Swarm created by ${playerName}`)
    } catch (error) {
      console.error(`Error creating swarm:`, error)
      throw error
    }
  }

  async joinSwarm(playerName: string, swarmId: number, stake: bigint) {
    console.log(`${playerName} joining swarm ${swarmId}`)
    try {
      const contract = this.getPlayerContract(playerName)
      await contract.walletClient.writeContract({
        ...contract,
        functionName: 'joinSwarm',
        args: [BigInt(swarmId), stake],
      })
      console.log(`${playerName} joined swarm ${swarmId}`)
    } catch (error) {
      console.error(`Error joining swarm:`, error)
      throw error
    }
  }

  async placeBet(playerName: string, swarmId: number, outcomeId: number, amount: bigint) {
    console.log(`${playerName} placing bet on outcome ${outcomeId} in swarm ${swarmId}`)
    try {
      const contract = this.getPlayerContract(playerName)
      await contract.walletClient.writeContract({
        ...contract,
        functionName: 'placeBet',
        args: [BigInt(swarmId), BigInt(outcomeId), amount],
      })
      console.log(`${playerName} placed bet in swarm ${swarmId}`)
    } catch (error) {
      console.error(`Error placing bet:`, error)
      throw error
    }
  }

  async resolveSwarm(playerName: string, swarmId: number, winningOutcomeId: number) {
    console.log(`${playerName} resolving swarm ${swarmId}`)
    try {
      const contract = this.getPlayerContract(playerName)
      await contract.walletClient.writeContract({
        ...contract,
        functionName: 'resolveSwarm',
        args: [BigInt(swarmId), BigInt(winningOutcomeId)],
      })
      console.log(`Swarm ${swarmId} resolved by ${playerName}`)
    } catch (error) {
      console.error(`Error resolving swarm:`, error)
      throw error
    }
  }
}
