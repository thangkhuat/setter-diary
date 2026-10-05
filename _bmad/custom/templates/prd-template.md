---
id: PRD-{slug}
companions: []     # files downstream MUST read alongside PRD.md. Paths may point inside the PRD folder (spec-authored) or outside it (adopted from an upstream skill).
sources: []        # files fully absorbed into the PRD (audit only; downstream does NOT read these). Never the memlog.
---

> **Canonical contract.** This PRD and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# {Product Name} — Product Requirements Document (PRD)

## Problem Statement

{One paragraph naming the force behind this work: a pain to solve, an opportunity to capture, a vision to realize, or a mandate to meet. Name which applies, who is affected, and why it matters now.}

## Functional Requirements

- **FR-1**
  - **Requirement:** {One sentence. "User or system can do X to achieve Y." WHAT, not HOW.}
  - **Acceptance criteria:** {Testable or demonstrable criterion.}

## Constraints & Non-Functional Requirements

- {A non-negotiable that bends design. If it doesn't rule anything out, it doesn't belong.}

## Out of Scope

- {Explicit out-of-scope item. At least one.}

## Success Metrics

- {One or two sentences, concrete enough to test or demonstrate against.}

## Assumptions

<!-- Optional. Omit if empty. -->

- {Statement the PRD proceeded under without direct confirmation.}

## Open Questions

<!-- Optional. Omit if empty. -->

- {Question phrased so a human can answer it.}
