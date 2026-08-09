# Flappy Shelby

Flappy-style browser game for **Shelbynet** with Petra Wallet and a Move on-chain leaderboard.

## Stack
- React + Vite + Canvas
- `@aptos-labs/wallet-adapter-react` for Petra
- Move smart contract for persistent high scores
- Shelby React/Browser SDK wired for future replay/assets storage
- Shelbynet Aptos fullnode: `https://api.shelbynet.shelby.xyz/v1`

> Shelby docs describe `shelbynet` as a developer prototype network isolated from Aptos mainnet/testnet/devnet and warn that it may be wiped roughly weekly.

## Run frontend
```bash
npm install
cp .env.example .env
npm run dev
```

In Petra, switch the network to **Shelbynet** before connecting.

## Deploy Move module on Shelbynet
1. Install Aptos CLI.
2. Create/import a CLI profile using the same deployment account you want for the module.
3. Configure the profile against the Shelbynet fullnode/faucet (`https://api.shelbynet.shelby.xyz/v1`, `https://faucet.shelbynet.shelby.xyz`).
4. Fund the account with test APT.
5. Compile/publish:

```bash
cd move
aptos move compile --named-addresses flappy_shelby=<YOUR_ADDRESS>
aptos move publish --named-addresses flappy_shelby=<YOUR_ADDRESS>
aptos move run --function-id <YOUR_ADDRESS>::flappy_score::init
```

Set the deployed address in `.env`:
```env
VITE_MODULE_ADDRESS=<YOUR_ADDRESS>
VITE_APTOS_SHELBYNET_FULLNODE=https://api.shelbynet.shelby.xyz/v1
```

Restart the frontend. Each player can then sign `submit_score(score)` using Petra; `leaderboard()` reads the current on-chain ranking.

## Anti-cheat
The MVP stores scores on-chain, but the browser computes the score, so an advanced user could craft a transaction with a fake score. Before attaching rewards, add session nonces + signed replay/game-event verification (or a trusted verifier) and only commit verified scores.

## Shelby storage extension
The project already includes Shelby SDK setup. A production version can store replay blobs, season snapshots, screenshots and game assets on Shelby, while the Move module keeps compact authoritative leaderboard state.
