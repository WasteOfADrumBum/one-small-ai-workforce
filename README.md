# One Small AI Workforce (Phase 1 Foundation)

One Small AI Workforce is a production-minded operations platform for coordinating specialized AI agents that progressively improve TaskForge.

This Phase 1 delivery is a deterministic, persisted simulation: it demonstrates architecture, orchestration, approvals, and observability without making paid model calls or writing to external systems.

## Tech stack

- Next.js App Router + React + TypeScript (strict)
- One Small UI (`@onesmall/ui`)
- PostgreSQL + Prisma
- Auth.js (NextAuth credentials for demo mode)
- Zod validation
- Vitest + React Testing Library
- Playwright e2e smoke test
- ESLint + Prettier
- GitHub Actions CI
- Vercel config

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   ```

3. Create a PostgreSQL database and set `DATABASE_URL`.

4. Apply schema and seed demo data:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Demo flow

- Sign in with demo credentials from `.env`.
- Start a simulated workflow from the dashboard.
- Step execution forward one stage at a time.
- Review and approve/reject pending actions in the Approval Center.
- Inspect logs, usage, and budget controls in Observability.

## What is real in this PR

- Responsive multi-page interface for dashboard, agents, workflows, projects, approvals, observability.
- Typed agent/task/provider contracts.
- Persisted workflow runs, tasks, approvals, logs, and usage records via Prisma models.
- Deterministic orchestration logic and explicit approval checkpoints.
- Budget enforcement scaffold with disabled-by-default providers and `$0` defaults.
- Read-only adapter interfaces for TaskForge GitHub and Jira targets.
- Unit tests for budget and workflow transition logic.
- CI workflow for lint/test/build.

## What is simulated

- Agent execution behavior and outputs.
- Token usage and cost records.
- TaskForge GitHub/Jira API responses.

## Not yet implemented

- Live credentialed GitHub/Jira synchronization.
- Real LLM provider execution and model routing in production.
- Isolated coding workers with filesystem + Git permissions.
- Autonomous merges or deployments.

## Additional documentation

- Architecture: [`docs/architecture.md`](./docs/architecture.md)
