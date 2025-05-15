# 🐸 Flappy Frog

**A decentralized arcade game bringing classic gameplay to the blockchain with true community ownership.**

## Overview

Flappy Frog combines the addictive simplicity of classic arcade games with a revolutionary approach to blockchain gaming. Built on Base for fast, low-cost transactions, the game creates a sustainable play-to-earn economy where skill is rewarded and the community truly owns the experience.

## How to Play

The gameplay is elegantly simple yet challenging. Players guide a frog through a series of obstacles using precise timing and quick reflexes. Each day, you receive **five free attempts** to achieve your best score. 

But here's where it gets interesting: after exhausting your free lives, you face a crucial decision. You can walk away with your current score, or invest **$1 worth of ETH** to continue chasing that perfect run. This isn't just a payment wall - it's the engine of the game's economy.

Every dollar spent feeds into a community treasury, with **60% going directly to a prize pool** that rewards the most skilled players. The remaining 40% supports ongoing development and maintenance. Your highest score each day is saved to the leaderboard, creating a permanent record of your achievements.

## The Decentralization Journey

What truly sets Flappy Frog apart is our commitment to genuine decentralization, not just superficial blockchain integration. We're building towards a future where every aspect of the game lives on-chain, creating an unstoppable, community-owned gaming experience.

### Current State

- ✅ Core gameplay implemented with Phaser.js
- ✅ Base blockchain integration for payments
- ✅ Off-chain leaderboard for optimal performance
- ✅ Community treasury system operational
- ✅ Farcaster Frame integration for social sharing

### The Road to Full Decentralization

**On-Chain Leaderboards**: Our next major milestone involves moving the leaderboard entirely on-chain. This means scores will be permanently recorded on the blockchain, making them tamper-proof and truly owned by the players who earned them. No central authority can manipulate rankings or erase achievements.

**Smart Contract Tournaments**: We're developing autonomous tournament systems that run without human intervention. These tournaments will automatically distribute prizes, enforce rules coded in smart contracts, and operate transparently for all participants.

**Permanent Achievement Ownership**: Unlike traditional games where your accomplishments can vanish when servers shut down, Flappy Frog ensures your achievements live forever on the blockchain. Your high scores, tournament wins, and skills are permanently yours.

## Technical Stack

- **Game Engine**: Phaser.js for responsive gameplay
- **Framework**: Next.js with OnchainKit integration
- **Blockchain**: Base (Ethereum L2) for speed and cost efficiency  
- **Social Layer**: Farcaster Frame support for viral sharing
- **Backend**: Redis for notifications and user management

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Set up environment variables. These will be configured by the `npx create-onchain --mini` command:

You can regenerate the Farcaster Account Association environment variables by running `npx create-onchain --manifest` in your project directory.

```bash
# Required for Frame metadata
NEXT_PUBLIC_URL=
NEXT_PUBLIC_VERSION=
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=
NEXT_PUBLIC_ICON_URL=
NEXT_PUBLIC_IMAGE_URL=
NEXT_PUBLIC_SPLASH_IMAGE_URL=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=

# Required for the game
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS=
NEXT_PUBLIC_GAME_PRICE_USD=1
NEXT_PUBLIC_MAX_HEARTS=$MAX_HEARTS

# Required to allow users to add your frame
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=

# Required for webhooks and background notifications
REDIS_URL=
REDIS_TOKEN=
```

The environment variables enable the following features:
- **Frame metadata**: Sets up the Frame Embed shown when you cast your frame on Farcaster
- **Account association**: Allows users to add your frame to their account, enables notifications
- **Redis API keys**: Enable webhooks and background notifications by storing user notification details

3. Start the development server:

```bash
npm run dev
```

### Prerequisites
- Node.js 18+ 
- Web3 wallet (MetaMask recommended)
- Base network configured
- Farcaster account for social features

## Roadmap

### Immediate Next Release
- **Multi-chain support**: Direct in-game switching between Base and Base Sepolia
- **NFT achievements**: Exclusive NFT rewards for top-ranking players
- **Enhanced competition**: Rewards extending beyond just the #1 spot

### Future Milestones
- **Fully on-chain leaderboards**: Complete decentralization of scoring system
- **Smart contract tournaments**: Automated, blockchain-powered competitions
- **Flappy Frog governance token**: Community voting on game economics and features
- **Dynamic economic model**: Community-controlled revenue distribution

## Community & Economics

The game operates on a transparent economic model:
- **60%** of continuation fees → Community treasury (rewarded to top players)
- **40%** of continuation fees → Development and maintenance

Treasury payouts and community updates are announced on [Warpcast](https://warpcast.com), keeping players informed as the project evolves toward full decentralization.

## Contributing

We welcome contributions as we build toward complete decentralization. Areas of focus:
- Smart contract development for tournaments
- Frontend optimization for blockchain interactions
- Community governance mechanisms
- Farcaster Frame enhancements

Please check our [contributing guidelines](CONTRIBUTING.md) for development setup and submission processes.

## Vision

Flappy Frog proves that blockchain games don't need complex tokenomics to be valuable. Our vision is simple: create a game where achievements are permanent, competition is fair, and the community has real ownership. As we progress toward full on-chain functionality, players can be confident that their skills, scores, and accomplishments will live forever on the blockchain.

The integration with Farcaster Frames makes the game inherently social and viral, allowing players to share their achievements and compete with friends directly in their social feeds. This creates a perfect bridge between web2 social engagement and web3 ownership.

## Links

- **Game**: [Play Flappy Frog](#)
- **Community**: [Warpcast](https://warpcast.com)
- **Docs**: [Documentation](#)
- **Issues**: [GitHub Issues](https://github.com/[your-org]/flappy-frog/issues)
