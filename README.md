# Brisova

Brisova is a real estate investment platform that provides qualified investors with access to global property markets through tokenization and fractional ownership. The platform offers investment opportunities across residential, commercial, and hospitality assets, enabling investors to participate in property-backed investments with greater flexibility. Brisova prioritizes institutional-grade transparency through documented ownership records, clear investment structures, and verifiable rental income distributions. By combining real estate with blockchain technology, Brisova aims to create a more accessible, efficient, and transparent investment ecosystem.

This repository is a **client-only** React app. Marketplace data, investments, KYC, favorites, and admin actions run in the browser (seed JSON + `localStorage`). Optional Hardhat smart contracts live under `contracts/`.

## Requirements

| Dependency | Version |
|------------|---------|
| Node.js | 20.0.0 or newer |
| npm | 10.0.0 or newer |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router, Bootstrap, Tailwind CSS, Zustand, TanStack Query |
| Web3 | Wagmi, Viem, Web3Modal |
| Data | Bundled seed (`src/data/seed.json`) + browser `localStorage` |
| Smart contracts | Hardhat, Solidity, OpenZeppelin (optional) |
| Tooling | npm workspaces, react-app-rewired |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file and fill in values as needed:

```bash
cp .env.example .env
```

Root `.env` variables:

```bash
GENERATE_SOURCEMAP=false
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id
PORT=3000
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sample listings load from seed data; your investments, KYC, favorites, and listings persist in the browser.

### One-step setup

```bash
npm run setup
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install dependencies |
| `npm run dev` | Run the React app on `:3000` |
| `npm run build` | Create a production frontend build |
| `npm start` | Serve the production build on `:3000` |
| `npm run preview` | Build, then serve the SPA |
| `npm test` | Run frontend tests |
| `npm run contracts:compile` | Compile Solidity contracts |
| `npm run contracts:test` | Run contract tests |

## Production

```bash
npm run setup
npm run build
npm start
```

Provide `REACT_APP_WALLETCONNECT_PROJECT_ID` at **build** time if you use WalletConnect.

## Project Structure

```
src/          React application (pages, components, hooks, local data layer)
src/data/     Seed marketplace data
contracts/    Hardhat Solidity contracts (optional)
public/       Static assets
```

## License

UNLICENSED
