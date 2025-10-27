# Mirror Protocol

[![License: BSD-3-Clause-Clear](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](https://opensource.org/licenses/BSD-3-Clause-Clear)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.27-e6e6e6?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)
[![Powered by Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHEVM-blueviolet)](https://docs.zama.ai/)

> A fully on-chain encrypted tactics game leveraging Fully Homomorphic Encryption (FHE) to enable privacy-preserving competitive gameplay on Ethereum.

## Table of Contents

- [Overview](#overview)
- [What is Mirror Protocol?](#what-is-mirror-protocol)
- [Key Features](#key-features)
- [Why Mirror Protocol?](#why-mirror-protocol)
  - [Problems It Solves](#problems-it-solves)
  - [Advantages](#advantages)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
  - [Game Mechanics](#game-mechanics)
  - [Encryption Flow](#encryption-flow)
  - [Smart Contract Architecture](#smart-contract-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Compilation](#compilation)
  - [Testing](#testing)
  - [Deployment](#deployment)
- [Usage](#usage)
  - [Command Line Interface](#command-line-interface)
  - [Frontend Application](#frontend-application)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Performance & Gas Optimization](#performance--gas-optimization)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Resources](#resources)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**Mirror Protocol** is a groundbreaking decentralized tactics game that demonstrates the power of **Fully Homomorphic Encryption (FHE)** in blockchain applications. Built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), Mirror Protocol allows players to submit encrypted actions on-chain while maintaining complete privacy over their strategies, scores, and game state.

Unlike traditional blockchain games where all data is publicly visible, Mirror Protocol ensures that:
- Player actions remain encrypted on-chain
- Scores and outcomes are computed in encrypted form
- Only individual players can decrypt their own data
- No one—not even validators—can see other players' strategies

This creates a truly fair, private, and competitive gaming experience entirely on-chain.

---

## What is Mirror Protocol?

Mirror Protocol is a **turn-based strategy game** where players choose from three actions—Attack, Defend, or Scout—and receive probabilistic outcomes based on encrypted random rolls. The game leverages **Fully Homomorphic Encryption** to perform all game logic computations on encrypted data, ensuring that:

1. **Privacy**: Your chosen action and score remain hidden from other players
2. **Fairness**: No front-running or strategy leaking is possible
3. **Verifiability**: All game logic executes deterministically on-chain
4. **Decentralization**: No trusted third party is required

### Game Actions

- **Attack (1)**: A risky move with potential rewards
  - Roll < 50: **Fail** (no points)
  - Roll 50-59: **Death** (player dies, can no longer earn points)
  - Roll ≥ 60: **Success** (+100 points)

- **Defend (2)**: A defensive action (currently neutral outcome)

- **Scout (3)**: A reconnaissance action (currently neutral outcome)

---

## Key Features

### 1. Fully Homomorphic Encryption (FHE)
- All sensitive game data (actions, scores, outcomes) stored as **encrypted values** on-chain
- Computations performed directly on encrypted data using **Zama's FHEVM**
- Client-side encryption/decryption via **Zama's Relayer SDK**

### 2. Privacy-Preserving Gameplay
- Players submit encrypted actions that remain hidden from others
- Scores accumulate in encrypted form
- Only the player can decrypt their own state using their wallet signature

### 3. Fair Competition
- No information leakage prevents front-running attacks
- Encrypted random rolls ensure unpredictable outcomes
- Deterministic game logic guarantees fairness

### 4. On-Chain Execution
- All game logic runs in smart contracts on Sepolia testnet
- Transparent rules encoded in Solidity
- Verifiable outcomes without trusted intermediaries

### 5. Modern Web3 Frontend
- Built with **Vite + React** for fast, responsive UI
- **RainbowKit** integration for seamless wallet connection
- **Wagmi** hooks for efficient blockchain interactions
- **Zama Relayer SDK** for encryption/decryption in the browser

### 6. Developer-Friendly Infrastructure
- Comprehensive **Hardhat** development environment
- **TypeChain** for type-safe contract interactions
- Custom CLI tasks for testing encrypted workflows
- Full test coverage with mock and live network tests

---

## Why Mirror Protocol?

### Problems It Solves

#### 1. On-Chain Privacy Problem
**Challenge**: Traditional smart contracts expose all state variables publicly, making it impossible to build games with hidden information (poker, strategy games, auctions, etc.).

**Solution**: Mirror Protocol uses FHE to keep game state encrypted on-chain while still allowing trustless computation. This enables a new category of privacy-preserving dApps.

#### 2. Front-Running & MEV Exploitation
**Challenge**: In public blockchain games, miners/validators can see pending transactions and front-run players or manipulate outcomes.

**Solution**: Encrypted actions prevent front-running since validators cannot read the encrypted payload. This creates a level playing field for all participants.

#### 3. Strategy Leakage
**Challenge**: Competitive games require hidden information. In transparent blockchains, players can analyze others' moves and adjust their strategies unfairly.

**Solution**: FHE ensures that player strategies remain hidden throughout the game, preserving the competitive integrity of gameplay.

#### 4. Trusted Third Parties
**Challenge**: Traditional solutions rely on commit-reveal schemes or trusted oracles, which introduce centralization risks.

**Solution**: FHE eliminates the need for trusted intermediaries by enabling encrypted computation directly on-chain.

### Advantages

#### For Players
- **True Privacy**: Your actions and scores remain confidential
- **Fair Competition**: No player has an unfair information advantage
- **Trustless**: No need to trust game operators or centralized servers
- **Wallet-Based Decryption**: Only you can decrypt your data using your private key

#### For Developers
- **New Design Space**: FHE enables game mechanics previously impossible on-chain
- **Reusable Patterns**: Learn FHE development applicable to DeFi, governance, voting, etc.
- **Modern Tooling**: Hardhat, TypeScript, and React ecosystem integration
- **Extensive Examples**: Comprehensive test suite and documentation

#### For the Ecosystem
- **FHE Adoption**: Demonstrates real-world FHE use cases beyond finance
- **Open Source**: BSD-3-Clause-Clear license encourages experimentation
- **Educational Value**: Serves as a reference implementation for FHE gaming
- **Privacy Primitive**: Establishes patterns for future privacy-preserving dApps

---

## Technology Stack

### Smart Contract Layer

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.27 | Smart contract programming language |
| **Zama FHEVM** | 0.8.0 | FHE library for encrypted computations |
| **Hardhat** | 2.26.0 | Development environment & task runner |
| **TypeChain** | 8.3.2 | TypeScript bindings for contracts |
| **hardhat-deploy** | 0.11.45 | Deployment management |
| **Ethers.js** | 6.15.0 | Ethereum library for signing & transactions |

### Frontend Layer

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **Vite** | 7.1.6 | Build tool & dev server |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **RainbowKit** | 2.2.8 | Wallet connection UI |
| **Wagmi** | 2.17.0 | React hooks for Ethereum |
| **Viem** | 2.37.6 | TypeScript Ethereum library |
| **Zama Relayer SDK** | 0.2.0 | Client-side FHE encryption/decryption |

### Testing & Development

- **Mocha** + **Chai**: Unit testing framework
- **@fhevm/hardhat-plugin**: Mock FHE environment for local testing
- **ESLint** + **Prettier**: Code quality & formatting
- **Solhint**: Solidity linting
- **Gas Reporter**: Gas usage analysis

---

## How It Works

### Game Mechanics

1. **Player Registration**: On first interaction, a player is automatically registered with:
   - Initial score of 0 (encrypted)
   - Alive status set to 1 (encrypted)
   - No previous actions or outcomes

2. **Action Submission**: Players submit two encrypted values:
   - **Action** (1, 2, or 3): The chosen move
   - **Roll** (0-99): A random number influencing the outcome

3. **Encrypted Computation**: The smart contract:
   - Validates the action is one of the three valid types
   - Evaluates outcome based on action + roll using FHE operations
   - Updates score, alive status, and last outcome (all encrypted)
   - Grants decryption permission only to the player

4. **Decryption**: Players can decrypt their own data by:
   - Signing an EIP-712 message with their wallet
   - Using Zama's relayer to decrypt the ciphertext
   - Viewing their score, last action, and outcome in plaintext

### Encryption Flow

```
┌─────────────┐                    ┌──────────────┐                  ┌─────────────────┐
│   Player    │                    │ Zama Relayer │                  │  Smart Contract │
│  (Browser)  │                    │              │                  │    (On-Chain)   │
└──────┬──────┘                    └───────┬──────┘                  └────────┬────────┘
       │                                   │                                  │
       │ 1. Request encryption             │                                  │
       ├──────────────────────────────────>│                                  │
       │                                   │                                  │
       │ 2. Return encrypted handles       │                                  │
       │<──────────────────────────────────┤                                  │
       │                                   │                                  │
       │ 3. Submit encrypted action + proof│                                  │
       ├──────────────────────────────────────────────────────────────────────>│
       │                                   │                                  │
       │                                   │  4. Compute on encrypted data    │
       │                                   │                                  ├────┐
       │                                   │                                  │    │
       │                                   │                                  │<───┘
       │                                   │  5. Store encrypted results      │
       │                                   │                                  │
       │ 6. Request decryption (signed)    │                                  │
       ├──────────────────────────────────>│                                  │
       │                                   │                                  │
       │                                   │  7. Fetch encrypted value        │
       │                                   ├─────────────────────────────────>│
       │                                   │                                  │
       │                                   │  8. Return ciphertext            │
       │                                   │<─────────────────────────────────┤
       │                                   │                                  │
       │ 9. Return decrypted plaintext     │                                  │
       │<──────────────────────────────────┤                                  │
       │                                   │                                  │
```

### Smart Contract Architecture

The **MirrorProtocol.sol** contract is structured as follows:

#### Data Structures

```solidity
enum Action { None, Attack, Defend, Scout }
enum Outcome { None, Fail, Death, Success }

struct PlayerState {
    euint32 score;        // Encrypted score
    euint32 lastAction;   // Encrypted last action
    euint32 lastOutcome;  // Encrypted last outcome
    euint32 alive;        // Encrypted alive flag (0 or 1)
    bool initialized;     // Plaintext initialization flag
}
```

#### Key Functions

- **`register()`**: Manually register a player
- **`performAction(encryptedAction, encryptedRoll, inputProof)`**: Submit an encrypted move
- **`getEncryptedScore(address)`**: Retrieve encrypted score
- **`getEncryptedAction(address)`**: Retrieve encrypted last action
- **`getEncryptedOutcome(address)`**: Retrieve encrypted last outcome
- **`getPlayerStatus(address)`**: Check if player is alive and initialized

#### FHE Operations Used

- **`FHE.fromExternal()`**: Import encrypted values from client
- **`FHE.eq()`, `FHE.lt()`, `FHE.ge()`**: Encrypted comparisons
- **`FHE.and()`, `FHE.or()`**: Encrypted boolean logic
- **`FHE.select()`**: Conditional assignment (encrypted ternary)
- **`FHE.add()`**: Encrypted addition
- **`FHE.allow()`**: Grant decryption permission

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version ≥ 20.0.0
- **npm**: Version ≥ 7.0.0 (bundled with Node.js)
- **Git**: For cloning the repository
- **MetaMask** or compatible Web3 wallet (for frontend interaction)

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/yourusername/Mirror-Protocol.git
cd Mirror-Protocol

# Install contract dependencies
npm install

# Install frontend dependencies
cd ui
npm install
cd ..
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# Required for deploying to Sepolia
INFURA_API_KEY=your_infura_api_key_here
PRIVATE_KEY=0xYourPrivateKeyHere

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Enable gas reporting
REPORT_GAS=true
```

**Important Security Notes:**
- **Never commit your `.env` file** to version control
- Use a **dedicated wallet** for testing (not your main wallet)
- Only fund test wallets with **testnet ETH** from faucets
- The private key must be in hex format with `0x` prefix

### Compilation

Compile the smart contracts:

```bash
npm run compile
```

This will:
- Compile Solidity contracts with Zama FHEVM support
- Generate TypeScript bindings via TypeChain
- Create artifacts in `./artifacts` directory

### Testing

#### Local Tests (Mock FHE)

Run the test suite on a local Hardhat network with mocked FHE:

```bash
npm run test
```

The test suite includes:
- Player registration
- Action submission and outcome computation
- Score accumulation
- Death mechanics
- Encrypted state management

#### Sepolia Tests (Real FHE)

To test on Sepolia testnet with real FHE:

```bash
# Ensure you have Sepolia ETH in your wallet
npm run test:sepolia
```

**Note**: Sepolia tests interact with real FHE infrastructure and consume gas.

### Deployment

#### Deploy to Local Hardhat Network

```bash
npx hardhat deploy --network hardhat
```

#### Deploy to Sepolia Testnet

```bash
# Ensure INFURA_API_KEY and PRIVATE_KEY are set in .env
npx hardhat deploy --network sepolia
```

After deployment, note the contract address. You'll need it for:
- Frontend configuration (`ui/src/config/contracts.ts`)
- CLI task interactions

#### Verify Contract on Etherscan

```bash
# Set ETHERSCAN_API_KEY in .env first
npm run verify:sepolia
```

---

## Usage

### Command Line Interface

Mirror Protocol includes custom Hardhat tasks for interacting with the encrypted contract.

#### 1. Get Contract Address

```bash
npx hardhat task:address --network sepolia
```

#### 2. Submit an Encrypted Action

```bash
npx hardhat task:perform \
  --network sepolia \
  --action 1 \
  --roll 72
```

**Parameters:**
- `--action`: Action code (1 = Attack, 2 = Defend, 3 = Scout)
- `--roll`: Random integer between 0-99

**Example Output:**
```
MirrorProtocol: 0x1234...5678
Submitted action, tx hash: 0xabcd...ef01
Transaction status: 1
```

#### 3. Decrypt Your Score

```bash
npx hardhat task:decrypt-score --network sepolia
```

**Example Output:**
```
Encrypted score: 0x789a...bcde
Decrypted score: 200
```

#### 4. Decrypt Your Last Action & Outcome

```bash
npx hardhat task:decrypt-state --network sepolia
```

**Example Output:**
```
Last action (encrypted): 0x1234...5678
Last action (clear): 1
Last outcome (encrypted): 0xabcd...ef01
Last outcome (clear): 3
```

**Outcome Codes:**
- 0 = None
- 1 = Fail
- 2 = Death
- 3 = Success

### Frontend Application

#### Configuration

Update the contract address in `ui/src/config/contracts.ts`:

```typescript
export const MIRROR_PROTOCOL_ADDRESS = '0xYourDeployedAddress';
```

#### Running the UI

```bash
cd ui
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Building for Production

```bash
cd ui
npm run build
```

The production build will be output to `ui/dist/`

#### Frontend Features

- **Wallet Connection**: Connect via RainbowKit (supports MetaMask, WalletConnect, Coinbase Wallet, etc.)
- **Submit Actions**: Choose Attack/Defend/Scout and submit encrypted transactions
- **View Score**: Decrypt and view your current score
- **Game State**: See your last action and outcome
- **Transaction Status**: Real-time feedback on transaction confirmations

---

## Project Structure

```
Mirror-Protocol/
│
├── contracts/
│   └── MirrorProtocol.sol          # Core encrypted game contract
│
├── deploy/
│   └── deploy.ts                   # Hardhat-deploy deployment script
│
├── tasks/
│   ├── accounts.ts                 # Account management tasks
│   └── mirrorProtocol.ts           # Game-specific CLI tasks
│
├── test/
│   ├── MirrorProtocol.ts           # Unit tests (mock FHE)
│   └── MirrorProtocolSepolia.ts    # Integration tests (real FHE)
│
├── ui/                             # Frontend application
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── config/                 # Contract addresses & config
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── types/                          # TypeChain generated types
├── artifacts/                      # Compiled contract artifacts
├── deployments/                    # Deployment artifacts (per network)
├── cache/                          # Hardhat cache
│
├── hardhat.config.ts               # Hardhat configuration
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── .env                            # Environment variables (not committed)
└── README.md                       # This file
```

---

## Security Considerations

### Smart Contract Security

1. **FHE Encryption Guarantees**
   - All sensitive data encrypted with Zama's FHEVM
   - Only the contract owner and authorized player can decrypt values
   - Encryption keys managed by Zama's infrastructure

2. **Access Control**
   - `_syncAccess()` grants decryption rights only to the player and contract
   - Players cannot decrypt other players' data
   - No admin privileges or centralized control

3. **Input Validation**
   - Actions sanitized to prevent invalid inputs
   - Invalid actions default to `Action.None`
   - Roll values bounded by smart contract logic

4. **Death Mechanism**
   - Dead players cannot update their score or state
   - Encrypted alive flag prevents state manipulation

### Frontend Security

1. **Wallet Signatures**
   - Decryption requires signing an EIP-712 message
   - Prevents unauthorized decryption attempts

2. **Relayer Trust**
   - Zama's relayer is trusted for encryption/decryption
   - Relayer cannot decrypt without user signature
   - Open-source SDK for transparency

3. **Private Key Safety**
   - Never expose private keys in frontend code
   - Use secure wallet providers (MetaMask, WalletConnect)

### Known Limitations

- **Testnet Only**: Currently deployed on Sepolia (not production-ready)
- **Gas Costs**: FHE operations are more expensive than plaintext
- **Latency**: Encryption/decryption adds processing overhead
- **Zama Dependency**: Relies on Zama's FHE infrastructure

---

## Performance & Gas Optimization

### Gas Usage

FHE operations consume significantly more gas than standard operations:

| Operation | Approximate Gas |
|-----------|----------------|
| `performAction()` | ~2,000,000 - 3,000,000 |
| `register()` | ~800,000 - 1,200,000 |
| `getEncrypted*()` | ~50,000 - 100,000 |

### Optimizations Applied

1. **Compiler Settings**
   - Optimizer enabled with 800 runs
   - `viaIR` compilation for better optimization
   - Cancun EVM version for latest features

2. **Storage Efficiency**
   - Packed structs minimize storage slots
   - Lazy initialization (register on first action)
   - Minimal public state variables

3. **FHE Operation Batching**
   - Multiple encrypted operations in single transaction
   - Reuse of encrypted constants

### Future Optimization Opportunities

- Batch multiple actions in one transaction
- Optimize encrypted comparison chains
- Explore gas-efficient FHE type sizes (euint8 vs euint32)

---

## Roadmap

### Phase 1: Foundation (Current)
- ✅ Core FHE game contract
- ✅ Basic actions (Attack, Defend, Scout)
- ✅ Encrypted score and state management
- ✅ CLI tooling for testing
- ✅ React frontend with wallet integration

### Phase 2: Enhanced Gameplay (Q2 2025)
- [ ] Implement Defend and Scout mechanics
- [ ] Multi-turn game sessions
- [ ] Player-vs-player matching
- [ ] Leaderboard (encrypted ranks)
- [ ] Game reset and restart functionality

### Phase 3: Advanced Features (Q3 2025)
- [ ] Multiple game modes (PvP, co-op, tournaments)
- [ ] NFT-based character/item system
- [ ] Encrypted inventory management
- [ ] Reward distribution mechanism
- [ ] DAO governance for game rules

### Phase 4: Scaling & Mainnet (Q4 2025)
- [ ] Gas optimization improvements
- [ ] Layer 2 deployment exploration
- [ ] Mainnet deployment (pending Zama mainnet)
- [ ] Mobile app support
- [ ] Enhanced UI/UX with animations

### Phase 5: Ecosystem Growth (2026)
- [ ] SDK for building FHE games
- [ ] Game template library
- [ ] Integration with gaming platforms
- [ ] Cross-chain FHE bridge
- [ ] Community-driven game expansions

### Research Directions
- Hybrid on-chain/off-chain game logic
- Zero-knowledge proof integration
- Decentralized random number generation
- FHE performance benchmarking

---

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/Mirror-Protocol.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, well-documented code
   - Follow existing code style and conventions
   - Add tests for new features

4. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues

### Development Guidelines

- **Code Style**: Run `npm run prettier:write` before committing
- **Testing**: Maintain or improve test coverage
- **Documentation**: Update README and code comments
- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use strict type checking

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/Mirror-Protocol/issues) with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Environment details (Node version, OS, etc.)

---

## Resources

### Zama Documentation
- [Zama Protocol Overview](https://docs.zama.ai/protocol)
- [FHEVM Solidity Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer)
- [FHE.sol API Reference](https://docs.zama.ai/protocol/solidity-guides/api-reference)

### Hardhat Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat Deploy Plugin](https://github.com/wighawag/hardhat-deploy)
- [TypeChain Documentation](https://github.com/dethcrypto/TypeChain)

### Frontend Resources
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Vite Documentation](https://vitejs.dev/)

### Learning Resources
- [Introduction to FHE](https://www.zama.ai/post/tfhe-deep-dive-part-1)
- [FHE Use Cases in Blockchain](https://www.zama.ai/post/programmable-privacy-and-onchain-compliance-using-fhe)
- [Solidity by Example](https://solidity-by-example.org/)

---

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for details.

**Key Points:**
- ✅ Free to use, modify, and distribute
- ✅ Permissive for commercial use
- ❌ No patent grant (Clear clause)
- ⚠️ Provided "as-is" without warranty

---

## Acknowledgments

### Built With
- **[Zama](https://www.zama.ai/)**: For pioneering FHE technology and providing FHEVM infrastructure
- **[Hardhat](https://hardhat.org/)**: For the excellent Ethereum development environment
- **[RainbowKit](https://www.rainbowkit.com/)**: For beautiful wallet connection UX
- **[Wagmi](https://wagmi.sh/)**: For powerful React hooks for Ethereum

### Special Thanks
- The Zama team for technical support and FHE expertise
- The Ethereum developer community for tooling and resources
- Contributors and testers who helped improve this project

### Inspired By
- Classic strategy games with hidden information mechanics
- On-chain gaming experiments like Dark Forest
- Privacy-preserving protocols in DeFi and governance

---

## Contact & Community

- **GitHub**: [https://github.com/yourusername/Mirror-Protocol](https://github.com/yourusername/Mirror-Protocol)
- **Issues**: [Report bugs or request features](https://github.com/yourusername/Mirror-Protocol/issues)
- **Discussions**: [Join the conversation](https://github.com/yourusername/Mirror-Protocol/discussions)
- **Twitter**: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle)

---

<div align="center">

**Built with ❤️ on top of the Zama FHEVM**

*Enabling privacy-preserving gameplay, one encrypted action at a time*

</div>
