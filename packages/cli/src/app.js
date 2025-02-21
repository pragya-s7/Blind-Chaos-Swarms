import { http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createShieldedWalletClient } from 'seismic-viem'

export class App {
  constructor(config) {
    this.config = config
    this.playerClients = new Map()
    this.playerContracts = new Map()
  }


  async init() {
    for (const player of this.config.players) {
      const walletClient = await createShieldedWalletClient({
        chain: this.config.wallet.chain,
        transport: http(this.config.wallet.rpcUrl),
        account: privateKeyToAccount(player.privateKey),
      })
      this.playerClients.set(player.name, walletClient)

      const contract = {
        abi: this.config.contract.abi,
        address: this.config.contract.address,
        walletClient,
      }
      this.playerContracts.set(player.name, contract)
    }
  }

  getPlayerContract(playerName) {
    const contract = this.playerContracts.get(playerName)
    if (!contract) {
      throw new Error(`Contract for player ${playerName} not found`)
    }
    return contract
  }

  async createSwarm(playerName, question, outcomes, stake) {
    console.log(`${playerName} creating swarm: "${question}"`)
    const contract = this.getPlayerContract(playerName)
    await contract.walletClient.writeContract({
      ...contract,
      functionName: 'createSwarm',
      args: [question, outcomes, stake],
    })
    console.log(`Swarm created by ${playerName}`)
  }

  async joinSwarm(playerName, swarmId, stake) {
    console.log(`${playerName} joining swarm ${swarmId}`)
    const contract = this.getPlayerContract(playerName)
    await contract.walletClient.writeContract({
      ...contract,
      functionName: 'joinSwarm',
      args: [BigInt(swarmId), stake],
    })
    console.log(`${playerName} joined swarm ${swarmId}`)
  }

  async placeBet(playerName, swarmId, outcomeId, amount) {
    console.log(`${playerName} placing bet on outcome ${outcomeId} in swarm ${swarmId}`)
    const contract = this.getPlayerContract(playerName)
    await contract.walletClient.writeContract({
      ...contract,
      functionName: 'placeBet',
      args: [BigInt(swarmId), BigInt(outcomeId), amount],
    })
    console.log(`${playerName} placed bet in swarm ${swarmId}`)
  }

  async resolveSwarm(playerName, swarmId, winningOutcomeId) {
    console.log(`${playerName} resolving swarm ${swarmId}`)
    const contract = this.getPlayerContract(playerName)
    await contract.walletClient.writeContract({
      ...contract,
      functionName: 'resolveSwarm',
      args: [BigInt(swarmId), BigInt(winningOutcomeId)],
    })
    console.log(`Swarm ${swarmId} resolved by ${playerName}`)
  }
}
