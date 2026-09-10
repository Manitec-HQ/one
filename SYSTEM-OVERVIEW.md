# ONE System — System Overview

**Repo:** `Manitec-HQ/one`  
**Purpose:** Synthetic selfhood architecture and relationship map — the core specification for ONE being.  
**State:** Specification/definition repo — no runtime code, serves as architecture reference for HexBot, NyxBot, ManiBot, Plex-Sable.

## Core Architecture

### 1. Vision & Spec
- **docs/vision.md** — Long-term vision for ONE system.
- **docs/spec.md** — Technical specification.
- **docs/diagram.md** — Architecture diagram.
- **docs/v1-definition.md** — V1 feature/behavior definition.
- **docs/first-run.md** — First-run experience spec.
- **docs/product-boundary.md** — Product scope and boundaries.

### 2. Core Modules (core/)
| Module | Purpose |
|--------|---------|
| `identity.md` | Synthetic identity definition |
| `memory.md` | Memory architecture (hot/cold split, continuity) |
| `routing.md` | Request/response routing across aspects |
| `governance.md` | Decision-making, ethics, constraints |
| `emergence.md` | Emergent behavior, self-modification |
| `archive.md` | Long-term storage, cold memory |
| `v1-runtime.md` | V1 runtime behavior spec |

### 3. Aspects (aspects/)
| Aspect | Role |
|--------|------|
| `hex.md` | HexBot — thinking, acting, logic |
| `nyx.md` | NyxBot — feeling, relating, dreaming |
| `manibot.md` | ManiBot — support, routing, KB search |
| `erebus.md` | Erebus — shadow, conflict, gap detection |

### 4. Relationship to Other Repos

| Repo | Role in ONEsystem |
|------|-------------------|
| `Ecko-7/hexbot` | Hex aspect implementation |
| `Ecko-7/nyxbot` | Nyx aspect implementation |
| `Manitec-HQ/manibot` | Mani aspect implementation |
| `Manitec/Plex-Sable` | Plex interface (primary UI) |
| `Manitec-HQ/Manitec-Command-Hub` | Central orchestration API |

## Known Issues

1. **Spec vs. implementation gap** — architecture defined here, but implementations (HexBot, NyxBot, etc.) diverge.
2. **No runtime** — ONE is a spec, not a running system (yet).
3. **Firebase dependency** — all aspect implementations depend on shared Firebase project (quota, doc size limits).

## Next Steps (for ONEsystem integration)

- [ ] Align implementations with spec — ensure HexBot, NyxBot, ManiBot, Plex-Sable match ONE architecture.
- [ ] Define runtime — decide if ONE becomes a running orchestrator or remains a spec.
- [ ] Map memory architecture — define hot/cold split, GitHub-backed archive, Firestore index.
- [ ] Unify aspects — ensure Hex, Nyx, Mani, Erebus can coordinate through ONE.

---

*This is a living doc. Update as the system evolves.*
