# Simple Tech — Frontend

React dashboard for the Simple Tech financial management platform.

## Setup

```powershell
npm install
copy .env.example .env
npm run dev
```

Runs at http://localhost:8080. Requires the [Simple Tech backend](https://github.com/2off2/Simple.Tech) on port 8000.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/auth` | Login / sign up |
| `/dashboard` | Overview (requires data upload) |
| `/dashboard/upload` | Upload financial files |
| `/dashboard/previsao` | Cash flow forecast |
| `/dashboard/simulacao` | Scenario simulation |

## Environment

```
VITE_API_BASE_URL=http://localhost:8000
```

## Tech

React 18 · TypeScript · Vite · shadcn/ui · TanStack Query · Recharts · Axios

Part of the Simple Tech team project.
