# Blind Chaos Prediction Swarms

A privacy-first prediction market built on Seismic's encrypted blockchain, where users can form anonymous swarms to wager on outcomes while keeping all interactions private until resolution.

## Overview

Blind Chaos Prediction Swarms reimagines prediction markets with complete privacy using Seismic's encrypted blockchain. Key features include:

- **Encrypted Swarms**: Create and join prediction swarms with encrypted stakes
- **Blind Betting**: Place bets without revealing amounts or seeing current odds
- **Private Outcomes**: Define and vote on outcomes with complete privacy
- **Secure Resolution**: Resolve swarms with encrypted payouts

## Architecture

The project consists of two main components:

1. **Smart Contract** (`src/BlindChaosSwarm.sol`):
   - Manages encrypted swarm creation and participation
   - Handles encrypted betting and outcome resolution
   - Uses Seismic's `suint256` type for encrypted values

2. **CLI Interface** (`packages/cli/`):
   - TypeScript client for interacting with the contract
   - Uses `seismic-viem` for shielded transactions
   - Demonstrates core functionality through a simple demo

## Prerequisites

- Node.js v18+
- Rust/Cargo (for Seismic tooling)
- [Seismic Foundry](https://github.com/SeismicSystems/seismic-foundry) installed

## Installation

1. Install Seismic's development tools:
   ```bash
   # Install sfoundryup
   curl -L \
     -H "Accept: application/vnd.github.v3.raw" \
     "https://api.github.com/repos/SeismicSystems/seismic-foundry/contents/sfoundryup/install?ref=seismic" | bash
   source ~/.zshenv  # or ~/.bashrc or ~/.zshrc

   # Install sforge, sanvil, ssolc
   sfoundryup
   source ~/.zshenv  # or ~/.bashrc or ~/.zshrc
   ```

2. Clone and install dependencies:
   ```bash
   git clone https://github.com/yourusername/blind-chaos-swarms.git
   cd blind-chaos-swarms
   
   # Install CLI dependencies
   cd packages/cli
   npm install
   ```

3. Configure environment:
   ```bash
   # In packages/cli/.env
   RPC_URL=http://127.0.0.1:8545
   CHAIN_ID=31337
   ALICE_PRIVKEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   BOB_PRIVKEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```

## Testing

1. Run the Solidity tests:
   ```bash
   # From project root
   sforge test -vv
   ```

2. Run the local node:
   ```bash
   # In a separate terminal
   sanvil
   ```

3. Deploy the contract:
   ```bash
   sforge script script/BlindChaosSwarm.s.sol --broadcast --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

## Demo

Run the TypeScript demo to see the core functionality in action:

```bash
cd packages/cli
npm run dev
```

The demo will:
1. Create a prediction swarm with encrypted stakes
2. Have a second user join with an encrypted stake
3. Place encrypted bets on different outcomes
4. Resolve the swarm and determine winners

## Core Features

### Creating a Swarm

```typescript
await app.createSwarm(
  'Alice',
  'Will it rain tomorrow?',
  ['Yes', 'No'],
  BigInt('1000000000000000000') // 1 ETH in wei (encrypted)
)
```

### Joining a Swarm

```typescript
await app.joinSwarm(
  'Bob',
  swarmId,
  BigInt('1000000000000000000') // 1 ETH in wei (encrypted)
)
```

### Placing Bets

```typescript
await app.placeBet(
  'Alice',
  swarmId,
  outcomeId,
  BigInt('500000000000000000') // 0.5 ETH in wei (encrypted)
)
```

### Resolving Swarms

```typescript
await app.resolveSwarm(
  'Alice', // Creator resolves
  swarmId,
  winningOutcomeId
)
```

## Privacy Features

All sensitive data is encrypted using Seismic's privacy-preserving technology:

- Stakes and bet amounts use `suint256` for encryption
- Transaction values are shielded using `seismic-viem`
- Odds and total stakes remain private until resolution
- Only the swarm creator can resolve outcomes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
