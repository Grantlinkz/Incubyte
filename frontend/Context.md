# Application Building Context: ACME Global Salary Management

Read the following files in order before implementing or making any architectural decision:

1. `context/AGENTS.md` — **Master Specification** defining product scope, tech stack, API contracts, design tokens, and the 10-step implementation workflow.
2. `context/project-overview.md` — Product definition, goals, core user flows, in-scope features, out-of-scope tradeoffs, and success criteria.
3. `context/architecture.md` — System structure, directory hierarchy, FastAPI API contracts, URL state synchronization, and architectural invariants.
4. `context/ui-context.md` — UI theme tokens (Dark & Light modes), typography scale, layout patterns, and component specifications.
5. `context/code-standards.md` — Implementation rules, TypeScript standards, TanStack Query/Table conventions, form validation, and testing standards.
6. `context/ai-workflow-rules.md` — Spec-driven incremental delivery roadmap, scoping rules, and verification gates.
7. `context/progress-tracker.md` — Current phase, completed work, active roadmap, and architecture decisions.

---

## Workflow Rules

- Update `context/progress-tracker.md` after each meaningful implementation change.
- If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.
- Always create an implementation prompt in `prompts/<feature-name>.md` and obtain approval before writing code.
