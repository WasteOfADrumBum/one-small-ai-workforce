# One Small AI Workforce Phase 1 Architecture

## Scope

Phase 1 provides a deterministic orchestration skeleton and simulated integrations for TaskForge coordination.

## Layered design

1. **Next.js visual app (`src/app`)**
   - Dashboard, agents, workflows, projects, approvals, and observability screens.
2. **Application services (`src/lib/workflows.ts`)**
   - Deterministic task progression, approval pauses, retry/error state handling, and usage log creation.
3. **Agent orchestration contracts (`src/lib/domain.ts`)**
   - Typed roles, task contracts, routing, and budget policy types.
4. **Durable workflow state (PostgreSQL + Prisma)**
   - `WorkflowRun`, `WorkflowTask`, `Approval`, `ExecutionLog`, and `UsageRecord` models.
5. **Provider/model abstraction (`src/lib/providers.ts`)**
   - Disabled-by-default provider registry and budget checks.
6. **Integration scaffolding (`src/lib/integrations`)**
   - Read-only GitHub/Jira interfaces with demo adapters.
7. **Worker execution boundary**
   - Current execution is simulated only; no untrusted code execution in Next.js runtime.

## Security boundaries

- Auth.js session checks are required for mutable API routes.
- Secrets are server-side env vars and never hardcoded client-side.
- Consequential actions are blocked behind explicit approvals.
- Provider budgets default to `$0` with all providers disabled.

## Real vs simulated in Phase 1

- **Real:** App navigation, persisted workflow state, approvals, logs, usage records, budget validation logic.
- **Simulated:** Agent reasoning, token/cost metrics, GitHub/Jira data payloads, model execution.
- **Not implemented yet:** Live external integrations, isolated coding worker execution, autonomous code changes.
