# Copilot Instructions — sgs-cs-helper
<!-- Version: 1.2 | Last Updated: 2026-02-06 -->

This file is read automatically by GitHub Copilot.
It defines how Copilot MUST behave in this project.

---

## Product Context Resolution

```yaml
active_product:
  slug: sgs-cs-helper
  name: SGS CS Order Tracker
  description: Order progress monitoring for CS team
  tech_stack_file: docs/tech-stack/sgs-cs-helper/instructions.md
  activated_at: 2026-02-05

COPILOT_MUST:
  - Read and follow tech stack instructions at the path above
  - Use the specified technologies (Next.js, Prisma, etc.)
  - Follow architecture patterns defined in instructions
  - Apply coding conventions for this stack
```

---

## Project Overview

```yaml
project:
  name: sgs-cs-helper
  type: documentation-and-code
  description: SGS CS Helper project
```

---

## Workflow Governance

This project uses the **copilot-flow** governed workflow system.

```yaml
workflow:
  tooling_root: a-z-copilot-flow
  docs_location: docs/runs/<branch-slug>/
  
COPILOT_MUST:
  - Follow workflow contract at a-z-copilot-flow/docs/workflow/contract.md
  - Check for existing workflow state before starting new work
  - STOP for user approval at phase gates
  - Store workflow docs in docs/runs/<branch-slug>/

COPILOT_MUST_NOT:
  - Skip phases or approval gates
  - Create/switch git branches automatically
  - Start implementation without completing analysis
```

---

## Session Startup

```yaml
ON_EVERY_NEW_SESSION:
  1. READ WORKSPACE_CONTEXT.md from a-z-copilot-flow
  2. GET current branch: git rev-parse --abbrev-ref HEAD
  3. CHECK for existing workflow: docs/runs/<branch-slug>/.workflow-state.yaml
  4. IF EXISTS: Resume workflow
     IF NOT: Ask user to start new workflow or use /lite-mode
```

---

## Coding Conventions

```yaml
# Active Tech Stack: sgs-cs-helper
# Full details: docs/tech-stack/sgs-cs-helper/instructions.md

error_handling: Server Actions with try-catch, return typed errors
imports: Absolute imports with @/ alias, group by type
types: TypeScript strict mode, Zod for runtime validation
testing: Vitest + Testing Library, AAA pattern
async: Server Components for data fetching, SWR for client-side
```

---

## Quick Reference

| Command | Action |
|---------|--------|
| `/cf-init` | Initialize session |
| `/workflow-status` | Check current workflow state |
| `/lite-mode <desc>` | Quick task without full workflow |
| `/phase-0-analysis` | Start analysis phase |

---

## See Also

- [Workflow Contract](../a-z-copilot-flow/docs/workflow/contract.md)
- [Command Reference](../a-z-copilot-flow/docs/guides/command-reference.md)
- [WORKSPACE_CONTEXT.md](../a-z-copilot-flow/WORKSPACE_CONTEXT.md)

---

**Version:** 1.0  
**Last Updated:** 2026-02-05
