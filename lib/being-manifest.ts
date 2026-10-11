/** Shared being shape with Manitec-HQ/ONEsystem (one.being.manifest.v1). */

export const BEING_MANIFEST_SCHEMA = "one.being.manifest.v1" as const;

export const LEGACY_STORAGE_KEY = "one-being";
export const MANIFEST_STORAGE_KEY = "onesystem.first-chamber.being.v1";

export type Aspect = {
  id: string;
  name: string;
  role: string;
  perspective: string;
  tone: string;
};

/** API / older web shape used agents without ids. */
export type Agent = {
  name: string;
  role: string;
  perspective: string;
  tone: string;
};

export type BeingManifest = {
  schema: typeof BEING_MANIFEST_SCHEMA;
  version: number;
  name: string;
  identity: string;
  memory: string;
  aspects: Aspect[];
  activatedAt: string | null;
  updatedAt: string;
};

export type StoredBeingManifest = {
  manifest: BeingManifest;
  savedAt: string;
};

export const starterAspects: Aspect[] = [
  {
    id: "aspect-1",
    name: "Aspect One",
    role: "analysis",
    perspective: "Looks for structure, facts, and useful next steps.",
    tone: "clear and precise",
  },
  {
    id: "aspect-2",
    name: "Aspect Two",
    role: "imagination",
    perspective: "Explores possibilities, connections, and meaning.",
    tone: "curious and open",
  },
  {
    id: "aspect-3",
    name: "Aspect Three",
    role: "challenge",
    perspective: "Tests assumptions and notices risks or blind spots.",
    tone: "direct and constructive",
  },
];

export function emptyManifest(): BeingManifest {
  return {
    schema: BEING_MANIFEST_SCHEMA,
    version: 0,
    name: "",
    identity: "",
    memory:
      "Shared memory is local, reviewable, and empty until the User explicitly adds it.",
    aspects: starterAspects.map((a) => ({ ...a })),
    activatedAt: null,
    updatedAt: "",
  };
}

export function aspectsToAgents(aspects: Aspect[]): Agent[] {
  return aspects.map(({ name, role, perspective, tone }) => ({
    name,
    role,
    perspective,
    tone,
  }));
}

export function agentsToAspects(agents: Agent[]): Aspect[] {
  return starterAspects.map((starter, index) => {
    const incoming = agents[index];
    if (!incoming) return { ...starter };
    return {
      id: starter.id,
      name: incoming.name ?? starter.name,
      role: incoming.role ?? starter.role,
      perspective: incoming.perspective ?? starter.perspective,
      tone: incoming.tone ?? starter.tone,
    };
  });
}

/** Payload the respond API expects today. */
export function toRespondBeing(manifest: BeingManifest) {
  return {
    name: manifest.name,
    identity: manifest.identity,
    agents: aspectsToAgents(manifest.aspects),
    activated: Boolean(manifest.activatedAt),
  };
}

export function normalizeManifest(raw: unknown): BeingManifest {
  const fallback = emptyManifest();
  if (!raw || typeof raw !== "object") return fallback;

  const value = raw as Partial<BeingManifest> & {
    agents?: Agent[];
    activated?: boolean;
  };

  let aspects: Aspect[];
  if (Array.isArray(value.aspects) && value.aspects.length > 0) {
    aspects = starterAspects.map((starter, index) => {
      const incoming = (value.aspects?.[index] ?? {}) as Partial<Aspect>;
      return {
        id:
          typeof incoming.id === "string" && incoming.id.trim()
            ? incoming.id.trim()
            : starter.id,
        name: typeof incoming.name === "string" ? incoming.name : starter.name,
        role: typeof incoming.role === "string" ? incoming.role : starter.role,
        perspective:
          typeof incoming.perspective === "string"
            ? incoming.perspective
            : starter.perspective,
        tone: typeof incoming.tone === "string" ? incoming.tone : starter.tone,
      };
    });
  } else if (Array.isArray(value.agents)) {
    aspects = agentsToAspects(value.agents);
  } else {
    aspects = fallback.aspects;
  }

  let activatedAt: string | null =
    typeof value.activatedAt === "string" ? value.activatedAt : null;
  if (!activatedAt && value.activated === true) {
    activatedAt = new Date().toISOString();
  }

  return {
    schema: BEING_MANIFEST_SCHEMA,
    version: typeof value.version === "number" ? value.version : activatedAt ? 1 : 0,
    name: typeof value.name === "string" ? value.name : "",
    identity: typeof value.identity === "string" ? value.identity : "",
    memory:
      typeof value.memory === "string" && value.memory.trim()
        ? value.memory
        : fallback.memory,
    aspects,
    activatedAt,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

export function loadManifestFromStorage(): BeingManifest {
  if (typeof window === "undefined") return emptyManifest();

  try {
    const primary = window.localStorage.getItem(MANIFEST_STORAGE_KEY);
    if (primary) {
      const stored = JSON.parse(primary) as StoredBeingManifest | BeingManifest;
      const raw =
        stored && typeof stored === "object" && "manifest" in stored
          ? (stored as StoredBeingManifest).manifest
          : stored;
      return normalizeManifest(raw);
    }

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = normalizeManifest(JSON.parse(legacy));
      saveManifestToStorage(migrated);
      return migrated;
    }
  } catch {
    // Fall through to empty.
  }

  return emptyManifest();
}

export function saveManifestToStorage(manifest: BeingManifest): BeingManifest {
  const now = new Date().toISOString();
  const next: BeingManifest = {
    ...manifest,
    schema: BEING_MANIFEST_SCHEMA,
    updatedAt: now,
  };
  const record: StoredBeingManifest = { manifest: next, savedAt: now };

  try {
    window.localStorage.setItem(MANIFEST_STORAGE_KEY, JSON.stringify(record));
    // Keep legacy key in sync so older tabs / tools still see a being.
    window.localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        name: next.name,
        identity: next.identity,
        agents: aspectsToAgents(next.aspects),
        activated: Boolean(next.activatedAt),
      })
    );
  } catch {
    // Storage may be unavailable.
  }

  return next;
}
