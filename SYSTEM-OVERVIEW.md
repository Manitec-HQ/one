# ONE System — System Overview

**Repo:** `Manitec-HQ/one`  
**Purpose:** Synthetic selfhood architecture — both specification **and** minimal runtime implementation.  
**State:** Active Next.js app + architecture reference for HexBot, NyxBot, ManiBot, Plex-Sable.

## What ONE Actually Is

ONE is **not just a spec repo**. It's a working Next.js application that implements the ONE architecture:

- **Runtime:** `app/page.tsx` (main UI), `app/api/respond/route.ts` (API endpoint)
- **Spec:** `docs/` (vision, spec, diagram, v1-definition)
- **Core modules:** `core/` (identity, memory, routing, governance, emergence, archive)
- **Aspects:** `aspects/` (Hex, Nyx, Manibot, Erebus)
- **Interface spec:** `interface/` (app.md, tabs.md)

## Core Architecture

### 1. Runtime (app/)
| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main ONE UI — 8.7KB, substantial interface |
| `app/api/respond/route.ts` | API endpoint — 6KB, handles ONE responses |
| `app/layout.tsx` | App layout wrapper |

### 2. Spec & Docs (docs/)
| Doc | Purpose |
|-----|---------|
| `vision.md` | Long-term vision for ONE system |
| `spec.md` | Technical specification |
| `diagram.md` | Architecture diagram |
| `v1-definition.md` | V1 feature/behavior definition |
| `first-run.md` | First-run experience spec |
| `product-boundary.md` | Product scope and boundaries |

### 3. Core Modules (core/)
| Module | Purpose |
|--------|---------|
| `identity.md` | Synthetic identity definition |
| `memory.md` | Memory architecture (hot/cold split, continuity) |
| `routing.md` | Request/response routing across aspects |
| `governance.md` | Decision-making, ethics, constraints |
| `emergence.md` | Emergent behavior, self-modification |
| `archive.md` | Long-term storage, cold memory |
| `v1-runtime.md` | V1 runtime behavior spec |

### 4. Aspects (aspects/)
| Aspect | Role |
|--------|------|
| `hex.md` | HexBot — thinking, acting, logic |
| `nyx.md` | NyxBot — feeling, relating, dreaming |
| `manibot.md` | ManiBot — support, routing, KB search |
| `erebus.md` | Erebus — shadow, conflict, gap detection |

### 5. Interface Spec (interface/)
| Doc | Purpose |
|-----|---------|
| `app.md` | Application-level interface spec |
| `tabs.md` | Tab/navigation structure |

## Relationship to Other Repos

| Repo | Role in ONEsystem |
|------|-------------------|
| `Ecko-7/hexbot` | Hex aspect implementation (full chat app) |
| `Ecko-7/nyxbot` | Nyx aspect implementation (full chat app) |
| `Manitec-HQ/manibot` | Mani aspect implementation (full chat app) |
| `Manitec/Plex-Sable` | Plex interface (primary UI, full app) |
| `Manitec-HQ/Manitec-Command-Hub` | Central orchestration API (FastAPI) |
| `Manitec-HQ/one` | ONE core runtime + spec (minimal implementation) |

## Known Issues

1. **Minimal runtime** — ONE app exists but is minimal compared to full aspect implementations (HexBot, NyxBot, etc.).
2. **Spec vs. implementation gap** — architecture defined here, but aspect implementations diverge.
3. **Firebase dependency** — all aspect implementations depend on shared Firebase project (quota, doc size limits).

## Next Steps (for ONEsystem integration)

- [ ] Expand ONE runtime — build out `app/` and `app/api/` to orchestrate aspects.
- [ ] Align implementations with spec — ensure HexBot, NyxBot, ManiBot, Plex-Sable match ONE architecture.
- [ ] Map memory architecture — define hot/cold split, GitHub-backed archive, Firestore index.
- [ ] Unify aspects — ensure Hex, Nyx, Mani, Erebus can coordinate through ONE.

---

*This is a living doc. Update as the system evolves.*
