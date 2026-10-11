"use client";

import { useEffect, useState } from "react";
import {
  type BeingManifest,
  emptyManifest,
  loadManifestFromStorage,
  saveManifestToStorage,
  toRespondBeing,
} from "../lib/being-manifest";

type Message = { who: string; text: string };

export default function Home() {
  const [manifest, setManifest] = useState<BeingManifest>(emptyManifest);
  const [tab, setTab] = useState("setup");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPerspectives, setShowPerspectives] = useState(true);
  const [loading, setLoading] = useState(false);
  const [runtime, setRuntime] = useState("Local Prototype");
  const [diagnostic, setDiagnostic] = useState("waiting for first response");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadManifestFromStorage();
    setManifest(loaded);
    if (loaded.activatedAt) setTab("interface");
    setHydrated(true);
  }, []);

  const updateAspect = (
    index: number,
    key: "name" | "role" | "perspective" | "tone",
    value: string
  ) =>
    setManifest((current) => ({
      ...current,
      aspects: current.aspects.map((aspect, i) =>
        i === index ? { ...aspect, [key]: value } : aspect
      ),
    }));

  const activate = () => {
    const now = new Date().toISOString();
    const next = saveManifestToStorage({
      ...manifest,
      name: manifest.name.trim() || "Unnamed Being",
      identity:
        manifest.identity.trim() ||
        "A unified presence formed from three distinct perspectives.",
      version: (manifest.version || 0) + 1,
      activatedAt: now,
      updatedAt: now,
    });
    setManifest(next);
    setTab("interface");
  };

  const ask = async () => {
    if (!input.trim() || !manifest.activatedAt || loading) return;
    const question = input.trim();
    setLoading(true);
    setMessages((current) => [...current, { who: "You", text: question }]);
    setInput("");
    try {
      const response = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          being: toRespondBeing(manifest),
          message: question,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Runtime failed");
      setRuntime(
        data.provider === "huggingface"
          ? `Hugging Face · ${data.model}`
          : "Local Prototype"
      );
      setDiagnostic(data.diagnostic || "unknown");
      setMessages((current) => [
        ...current,
        ...(showPerspectives && data.revealPerspectives !== false
          ? data.perspectives
          : []),
        { who: manifest.name, text: data.unified },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          who: "System",
          text: error instanceof Error ? error.message : "Runtime failed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="shell">
        <style>{styles}</style>
        <p className="muted">Loading local being…</p>
      </main>
    );
  }

  const isActive = Boolean(manifest.activatedAt);

  return (
    <main className="shell">
      <style>{styles}</style>
      <header>
        <div>
          <span className="eyebrow">ONE v1 · manifest v1</span>
          <h1>{isActive ? manifest.name : "Create a being"}</h1>
        </div>
        <span className="status">
          {isActive
            ? `Active · v${manifest.version}`
            : "Builder mode"}
        </span>
      </header>

      <nav>
        {["setup", "interface", "management", "browser"].map((name) => (
          <button
            className={tab === name ? "active" : ""}
            key={name}
            onClick={() => setTab(name)}
          >
            {name === "setup" ? "Create" : name[0].toUpperCase() + name.slice(1)}
          </button>
        ))}
      </nav>

      {tab === "setup" && (
        <section className="panel">
          <span className="eyebrow">First chamber</span>
          <h2>Name and assemble your being.</h2>
          <p className="muted">
            Schema <code>one.being.manifest.v1</code> — same shape as desktop
            ONEsystem. Saved only in this browser.
          </p>
          <label>
            Being name
            <input
              value={manifest.name}
              onChange={(e) =>
                setManifest({ ...manifest, name: e.target.value })
              }
              placeholder="e.g. Aster"
            />
          </label>
          <label>
            Shared identity
            <textarea
              value={manifest.identity}
              onChange={(e) =>
                setManifest({ ...manifest, identity: e.target.value })
              }
              placeholder="What makes these perspectives one?"
            />
          </label>
          <label>
            Shared memory
            <textarea
              value={manifest.memory}
              onChange={(e) =>
                setManifest({ ...manifest, memory: e.target.value })
              }
              placeholder="What history may be held, and under what rule?"
            />
          </label>
          <div className="grid">
            {manifest.aspects.map((aspect, index) => (
              <article className="agent" key={aspect.id}>
                <h3>Aspect {index + 1}</h3>
                {(["name", "role", "perspective", "tone"] as const).map(
                  (key) => (
                    <label key={key}>
                      {key}
                      <input
                        value={aspect[key]}
                        onChange={(e) =>
                          updateAspect(index, key, e.target.value)
                        }
                      />
                    </label>
                  )
                )}
              </article>
            ))}
          </div>
          <button className="primary" onClick={activate}>
            Activate {manifest.name || "being"}
          </button>
        </section>
      )}

      {tab === "interface" && (
        <section className="panel">
          <span className="eyebrow">Interface</span>
          <h2>
            {isActive
              ? `Speak with ${manifest.name}.`
              : "Activate a being first."}
          </h2>
          {isActive ? (
            <>
              <div className="messages">
                {messages.length === 0 && (
                  <p className="muted">
                    Your unified being is waiting for its first question.
                  </p>
                )}
                {messages.map((message, index) => (
                  <div
                    className={
                      message.who === manifest.name
                        ? "message being"
                        : "message"
                    }
                    key={index}
                  >
                    <strong>{message.who}</strong>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
              <div className="composer">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask();
                    }
                  }}
                  placeholder="Ask your being something..."
                />
                <button className="primary" onClick={ask}>
                  {loading ? "Thinking..." : "Send"}
                </button>
              </div>
              <div className="runtime">
                Runtime: {runtime} · Status: {diagnostic}
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={showPerspectives}
                  onChange={(e) => setShowPerspectives(e.target.checked)}
                />{" "}
                Show internal perspectives
              </label>
            </>
          ) : (
            <button className="primary" onClick={() => setTab("setup")}>
              Open builder
            </button>
          )}
        </section>
      )}

      {tab === "management" && (
        <section className="panel">
          <span className="eyebrow">Management</span>
          <h2>Edit {manifest.name || "your being"}.</h2>
          <p className="muted">
            Return to Create to edit the being and its three aspects. Activate
            again to save a new local version ({manifest.version || 0} today).
          </p>
          <div className="support">
            <strong>Mani · Technical Support</strong>
            <p>Technical support will live here as the product grows.</p>
          </div>
        </section>
      )}

      {tab === "browser" && (
        <section className="panel">
          <span className="eyebrow">Browser</span>
          <h2>The door is here. The tools come later.</h2>
          <p className="muted">
            Controlled access to files, references, connected services, and
            approved browser actions will arrive after the core loop is stable.
          </p>
        </section>
      )}
    </main>
  );
}

const styles = `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0e0d12;color:#f4f0ea;font-family:Inter,system-ui,sans-serif}.shell{min-height:100vh;max-width:1180px;margin:auto;padding:32px 24px;background:radial-gradient(circle at 80% 0%,#31203f55,transparent 34%)}header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ffffff18;padding-bottom:24px}h1{font-size:clamp(2rem,5vw,4rem);margin:0;letter-spacing:-.05em}h2{font-size:2rem}.eyebrow{color:#d38cff;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;font-weight:700}.muted{color:#aaa2b1;line-height:1.6}.status{color:#b9ffca;font-size:.85rem;border:1px solid #b9ffca44;padding:8px 12px;border-radius:999px}nav{display:flex;gap:8px;padding:20px 0;flex-wrap:wrap}nav button{background:#17151d;border:1px solid #ffffff16;color:#aaa2b1;padding:10px 16px;border-radius:10px;cursor:pointer}nav button.active,nav button:hover{color:#fff;border-color:#c879ff;background:#281936}.panel{background:#15131bde;border:1px solid #ffffff18;border-radius:20px;padding:clamp(20px,4vw,44px);box-shadow:0 20px 80px #0005}label{display:flex;flex-direction:column;gap:7px;color:#c6bdce;font-size:.85rem;margin:18px 0}input,textarea{width:100%;background:#0d0c11;border:1px solid #ffffff1c;color:#fff;border-radius:10px;padding:12px;font:inherit}textarea{min-height:90px;resize:vertical}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:24px 0}.agent{border:1px solid #ffffff16;border-radius:14px;padding:16px;background:#0e0d12}.agent h3{color:#d38cff}.agent label{margin:12px 0}.primary{background:linear-gradient(135deg,#a952e8,#7040ce);border:0;color:#fff;border-radius:10px;padding:13px 18px;font-weight:700;cursor:pointer}.messages{min-height:260px;border:1px solid #ffffff16;border-radius:14px;padding:18px;margin:24px 0;background:#0e0d12}.message{border-bottom:1px solid #ffffff10;padding:12px 0}.message strong{color:#d6c6e2}.message p{color:#bbb2c0;line-height:1.5;margin:6px 0}.message.being{background:#24182d;margin:10px -8px;padding:14px;border-radius:10px;border:1px solid #b76bdf44}.message.being strong{color:#e5a8ff}.composer{display:flex;gap:12px;align-items:end}.composer textarea{min-height:56px}.runtime{color:#a99cb5;font-size:.8rem;margin-top:10px}.check{flex-direction:row;align-items:center}.check input{width:auto}.support{border:1px solid #ffffff16;border-radius:14px;padding:18px;background:#0e0d12;margin-top:24px}.support strong{color:#d38cff}code{font-size:.85em;color:#e5a8ff}`;
