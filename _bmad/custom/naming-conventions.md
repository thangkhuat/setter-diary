# Project naming conventions (setter-diary)

This project uses industry-standard document names instead of BMad's defaults. Read and write these names; never create a BMad-default file alongside them.

## Documents

| BMad default | This project | Location |
|---|---|---|
| `SPEC.md` (spec kernel) | `PRD.md`, Product Requirements Document | `_bmad-output/planning-artifacts/prd-setter-diary/` |
| spec folder `specs/spec-{slug}/` | `planning-artifacts/prd-{slug}/` | |
| companion `set-log-model.md` | `data-dictionary.md` | PRD folder |
| companion `access-matrix.md` | `permissions-matrix.md` | PRD folder |
| companion `progress-views.md` | `reporting-requirements.md` | PRD folder |
| UX `DESIGN.md` | `design-system.md`, Design System (same DESIGN.md spine format) | `_bmad-output/planning-artifacts/ux-designs/ux-setter-diary-2026-10-05/` |
| UX `EXPERIENCE.md` | `ux-specification.md`, UX Specification (same EXPERIENCE.md spine format) | same UX folder |
| UX mocks | `mockups/screens.html` | same UX folder |
| Architecture spine | `architecture.md`, Architecture Document, plus one ADR per architecture decision in `adr/ADR-NNN-<slug>.md` (Status, Context, Decision, Consequences) | `_bmad-output/planning-artifacts/architecture/` |
| Change proposals | RFC: `rfc/RFC-NNN-<slug>.md` (Summary, Motivation, Proposal, Alternatives, Impact) | `_bmad-output/planning-artifacts/rfc/` |
| Product brief | `docs/product-brief.md` (unchanged) | |
| `.memlog.md` | unchanged: internal append-only decision log | each folder |

## Terms inside the PRD

| BMad spec term | PRD term |
|---|---|
| Why | Problem Statement |
| Capabilities | Functional Requirements |
| `CAP-N` | `FR-N` (same number; CAP-14 = FR-14) |
| intent | Requirement |
| success | Acceptance criteria |
| Constraints | Constraints & Non-Functional Requirements |
| Non-goals | Out of Scope |
| Success signal | Success Metrics |

`.memlog.md` entries written before 2026-10-05 use the old names (`CAP-N`, `SPEC.md`, `DESIGN.md`, `EXPERIENCE.md`); read them through this mapping. Never renumber: FR IDs stay stable and retired IDs are never reused.

## Which skill owns what

- `PRD.md` and its companions are written only by **bmad-spec** (spec_filename = PRD.md). Do not use bmad-prd to create a second PRD; route requirement changes through bmad-spec.
- `design-system.md` and `ux-specification.md` are owned by **bmad-ux**.
- Git: no Claude attribution in commits or PR descriptions.
