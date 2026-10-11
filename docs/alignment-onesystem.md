# Alignment: web ONE ↔ desktop ONEsystem

## Roles

| Surface | Repo | Job |
|---------|------|-----|
| Web ONE | `Manitec-HQ/one` | Deployed First Chamber + Interface (`/api/respond`). Testable on a phone. |
| Desktop ONEsystem | `Manitec-HQ/ONEsystem` | Local-first Builder (Electron). Rooms, governance, archive placeholders. |

Do **not** merge the apps. Align on **data shape**, not file trees.

## Shared schema: `one.being.manifest.v1`

```ts
{
  schema: "one.being.manifest.v1",
  version: number,
  name: string,
  identity: string,
  memory: string,
  aspects: [{ id, name, role, perspective, tone }],  // exactly 3
  activatedAt: string | null,
  updatedAt: string
}
```

Storage key (both where local): `onesystem.first-chamber.being.v1`  
Web also mirrors legacy `one-being` for older tabs.

## Mapping

| Web (legacy) | Shared |
|--------------|--------|
| `agents[]` | `aspects[]` |
| `activated: boolean` | `activatedAt: ISO string \| null` |
| (missing) | `memory`, `version`, `schema` |

`/api/respond` accepts either `agents` or `aspects`.

## Boundaries kept

- No Plex-Sable credentials in either UI tree
- No automatic copy of private Plex / Nyx / Hex memory into public ONE
- Desktop Chat readiness stays offline until a provider is explicitly connected
- Web may call HF via server env (`HF_TOKEN`) — that is deploy-time config, not a desktop bridge

## Next (when useful)

1. Export/import JSON of a manifest between phone web session and desktop localStorage
2. Optional copy of `lib/being-manifest.ts` into ONEsystem as the single source of truth
3. Still no live desktop↔web sync until a reviewed adapter exists
