# Brisova

Brisova is a real estate investment platform that provides qualified investors with access to global property markets through tokenization and fractional ownership. The platform offers investment opportunities across residential, commercial, and hospitality assets, enabling investors to participate in property-backed investments with greater flexibility. Brisova prioritizes institutional-grade transparency through documented ownership records, clear investment structures, and verifiable rental income distributions. By combining real estate with blockchain technology, Brisova aims to create a more accessible, efficient, and transparent investment ecosystem.

This repository contains the full stack: a React frontend, an Express API with a JSON demo store, and Hardhat smart contracts for property registry, NFT deeds, fractional ownership, marketplace, escrow, and related modules.

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
| API | Express 4 (`/api/v1`) |
| Data | JSON file store (`backend/data/store.json`) |
| Smart contracts | Hardhat, Solidity, OpenZeppelin |
| Tooling | npm workspaces, react-app-rewired, concurrently |

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
REACT_APP_API_URL=http://localhost:3344
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id
PORT=3000
```

Optional API settings in `backend/.env`:

```bash
API_PORT=3344
PORT=3344
NODE_ENV=development
CORS_ORIGIN=*
```

### 3. Seed sample data

```bash
npm run db:seed
```

### 4. Run the development servers

```bash
npm run dev
```

This starts:

- Frontend at [http://localhost:3000](http://localhost:3000)
- API at [http://localhost:3344](http://localhost:3344)

### One-step setup

Install dependencies and seed the database in a single command, then start development:

```bash
npm run setup
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install workspaces and seed the store |
| `npm run dev` | Run frontend and API together |
| `npm run db:seed` | Load / reset sample listings and platform data |
| `npm run build` | Create a production frontend build |
| `npm start` | Run the production API (serves the SPA when `build/` exists) |
| `npm run preview` | Build, then serve SPA on `:3000` and API on `:3344` |
| `npm test` | Run frontend tests |
| `npm run test:smoke` | Run API smoke tests |
| `npm run contracts:compile` | Compile Solidity contracts |
| `npm run contracts:test` | Run contract tests |

## Production

```bash
npm run setup
npm run build
npm start
```

Set `NODE_ENV=production` and provide `REACT_APP_WALLETCONNECT_PROJECT_ID` at **build** time. Optional: `API_PORT`, `CORS_ORIGIN`.

## Project Structure

```
src/          React application (pages, components, hooks, styles)
backend/      Express API and JSON data store
contracts/    Hardhat Solidity contracts
public/       Static assets
```

## License

UNLICENSED
