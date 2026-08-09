# Flappy Shelby

A small Flappy-style game I built while experimenting with **Shelbynet**, Petra Wallet and Move.

The game is simple: keep the Shelby flyer in the air, get through the pipes, and try to beat your best score. If a run is worth keeping, you can sign it with Petra and submit the score on-chain. Low score? Just hit Play again and skip the transaction.

**Play:** https://flappyshelby.vercel.app/

## What I wanted to build

I wanted something more fun than a basic wallet-connect demo, so I used a Flappy Bird-style game as the frontend and connected the score system to a Move contract on Shelbynet.

Right now it has:

- Canvas-based Flappy gameplay
- Petra Wallet connection
- score submission on Shelbynet
- on-chain leaderboard
- transaction links to Aptos Explorer
- Shelby-themed UI
- separate Save score / Play again flow after each run

## Tech

Frontend is React + Vite + Canvas. Wallet interaction uses `@aptos-labs/wallet-adapter-react`, and the leaderboard lives in a Move module.

Shelbynet fullnode:

```text
https://api.shelbynet.shelby.xyz/v1
```

Shelbynet is a test/developer network, so I don't treat the leaderboard as permanent data.

## Run it locally

```bash
npm install
cp .env.example .env
npm run dev
```

Make sure Petra is switched to **Shelbynet** before connecting.

Example `.env`:

```env
VITE_MODULE_ADDRESS=<YOUR_ADDRESS>
VITE_APTOS_SHELBYNET_FULLNODE=https://api.shelbynet.shelby.xyz/v1
```

## Move contract

The contract is in the `move/` directory.

To publish your own version:

```bash
cd move
aptos move compile --named-addresses flappy_shelby=<YOUR_ADDRESS>
aptos move publish --named-addresses flappy_shelby=<YOUR_ADDRESS>
aptos move run --function-id <YOUR_ADDRESS>::flappy_score::init
```

Once the module address is added to the frontend env, players can call `submit_score(score)` from Petra and the app reads the ranking from `leaderboard()`.

## A note about scores

This is still an arcade/testnet project. The score is calculated in the browser, so the current version isn't designed for prize money or anything that needs serious anti-cheat protection. If I take it further, replay verification or a trusted score verifier would be the next thing I'd add.

## Links

- Game: https://flappyshelby.vercel.app/
- X: https://x.com/0xNickyy
- Shelby docs: https://docs.shelby.xyz/

Built for fun while testing what I can do on Shelbynet.
