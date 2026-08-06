"use client";

import { useEffect, useMemo, useState } from "react";

type Agent = { name: string; role: string; perspective: string; tone: string };
type Message = { who: string; text: string };

const starterAgents: Agent[] = [
  { name: "Aspect One", role: "analysis", perspective: "Looks for structure, facts, and useful next steps.", tone: "clear and precise" },
  { name: "Aspect Two", role: "imagination", perspective: "Explores possibilities, connections, and meaning.", tone: "curious and open" },
  { name: "Aspect Three", role: "challenge", perspective: "Tests assumptions and notices risks or blind spots.", tone: "direct and constructive" },
];

const blankBeing = { name: "", identity: "", agents: starterAgents, activated: false };

export default function Home() {
  const [being, setBeing] = useState(blankBeing);
  const [tab, setTab] = useState("setup");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPerspectives, setShowPerspectives] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("one-being");
    if (stored) setBeing(JSON.parse(stored));
  }, []);

  const updateAgent = (index: number, key: keyof Agent, value: string) => {
    setBeing((current) => ({ ...current, agents: current.agents.map((agent, i) => i === index ? { ...agent, [key]: value } : agent) }));
  };

  const activate = () => {
    const next = { ...being, name: being.name.trim() || "Unnamed Being", identity: being.identity.trim() || "A unified presence formed from three distinct perspectives.", activated: true };
    setBeing(next);
    window.localStorage.setItem("one-being", JSON.stringify(next));
    setSaved(true);
    setTab("interface");
  };

  const askBeing = () => {
    const question = input.trim();
    if (!question || !being.activated) return;
    const perspectives = being.agents.map((agent) => ({ who: agent.name, text: `${agent.perspective} For this question, I would focus on: ${question}` }));
    const unified = `I have considered this through three perspectives. ${being.identity} A useful next step is to clarify what outcome you want, then test the smallest practical move.`;
    setMessages((current) => [...current, { who: "You", text: question }, ...(showPerspectives ? perspectives : []), { who: being.name, text: unified }]);
    setInput("");
  };

  const status = useMemo(() => being.activated ? "Active being" : "Builder mode", [being.activated]);

  return (
    <main className="shell">
      <style>{styles}</style>
      <header className="topbar"><div><span className="eyebrow">ONE v1</span><h1>{being.activated ? being.name : "Create a being"}</h1></div><span className="status">{status}</span></header>
      <nav className="tabs">
        {["setup", "interface", "management", "browser"].map((name) => <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name === "setup" ? "Create" : name[0].toUpperCase() + name.slice(1)}</button>)}
      </nav>
      <section className="content">
        {tab === "setup" && <section className="panel"><p className="eyebrow">First chamber</p><h2>Name and assemble your being.</h2><p className="muted">ONE will hold the structure. You decide what it becomes.</p><label>Being name<input value={being.name} onChange={(e) => setBeing({ ...being, name: e.target.value })} placeholder="e.g. Aster" /></label><label>Shared identity<textarea value={being.identity} onChange={(e) => setBeing({ ...being, identity: e.target.value })} placeholder="What makes these three perspectives one?" /></label><div className="grid">{being.agents.map((agent, index) => <article className="agent" key={index}><h3>Aspect {index + 1}</h3>{(["name", "role", "perspective", "tone"] as (keyof Agent)[]).map((key) => <label key={key}>{key}<input value={agent[key]} onChange={(e) => updateAgent(index, key, e.target.value)} /></label>)}</article>)}</div><button className="primary" onClick={activate}>Activate {being.name || "being"}</button>{saved && <span className="saved">Saved locally.</span>}</section>}
        {tab === "interface" && <section className="panel"><p className="eyebrow">Interface</p><h2>{being.activated ? `Speak with ${being.name}.` : "Activate a being first."}</h2>{being.activated ? <><div className="messages">{messages.length === 0 && <p className="muted">Your unified being is waiting for its first question.</p>}{messages.map((message, index) => <div className={message.who === being.name ? "message being" : "message"} key={index}><strong>{message.who}</strong><p>{message.text}</p></div>)}</div><div className="composer"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askBeing(); } }} placeholder="Ask your being something..." /><button className="primary" onClick={askBeing}>Send</button></div><label className="check"><input type="checkbox" checked={showPerspectives} onChange={(e) => setShowPerspectives(e.target.checked)} /> Show internal perspectives</label></> : <button className="primary" onClick={() => setTab("setup")}>Open builder</button>}</section>}
        {tab === "management" && <section className="panel"><p className="eyebrow">Management</p><h2>Edit the architecture of {being.name || "your being"}.</h2><p className="muted">Return to Create to edit the name, shared identity, and three aspects. Changes are saved when you activate again.</p><div className="support"><strong>Mani · Technical Support</strong><p>Need help understanding the system? Mani will live here as the product support path.</p></div></section>}
        {tab === "browser" && <section className="panel"><p className="eyebrow">Browser</p><h2>The door is here. The tools come later.</h2><p className="muted">This placeholder will eventually provide controlled access to files, references, connected services, and approved browser actions.</p><div className="support"><strong>Permission boundary</strong><p>Nothing can browse or act until you explicitly grant access.</p></div></section>}
      </section>
    </main>
  );
}

const styles = `
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0e0d12;color:#f4f0ea;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.shell{min-height:100vh;max-width:1180px;margin:auto;padding:32px 24px;background:radial-gradient(circle at 80% 0%,#31203f55,transparent 34%)}.topbar{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #ffffff18;padding-bottom:24px}h1,h2,h3,p{margin-top:0}h1{font-size:clamp(2rem,5vw,4rem);margin-bottom:0;letter-spacing:-.05em}h2{font-size:2rem;letter-spacing:-.03em}.eyebrow{color:#d38cff;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;font-weight:700}.muted{color:#aaa2b1;line-height:1.6}.status,.saved{color:#b9ffca;font-size:.85rem;border:1px solid #b9ffca44;padding:8px 12px;border-radius:999px}.tabs{display:flex;gap:8px;padding:20px 0;flex-wrap:wrap}.tabs button{background:#17151d;border:1px solid #ffffff16;color:#aaa2b1;padding:10px 16px;border-radius:10px;cursor:pointer}.tabs button.active,.tabs button:hover{color:#fff;border-color:#c879ff;background:#281936}.content{padding-bottom:50px}.panel{background:#15131bde;border:1px solid #ffffff18;border-radius:20px;padding:clamp(20px,4vw,44px);box-shadow:0 20px 80px #0005}label{display:flex;flex-direction:column;gap:7px;color:#c6bdce;font-size:.85rem;margin:18px 0}input,textarea{width:100%;background:#0d0c11;border:1px solid #ffffff1c;color:#fff;border-radius:10px;padding:12px;font:inherit}textarea{min-height:90px;resize:vertical}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:24px 0}.agent{border:1px solid #ffffff16;border-radius:14px;padding:16px;background:#0e0d12}.agent h3{color:#d38cff}.agent label{margin:12px 0}.primary{background:linear-gradient(135deg,#a952e8,#7040ce);border:0;color:white;border-radius:10px;padding:13px 18px;font-weight:700;cursor:pointer}.saved{margin-left:14px}.messages{min-height:260px;border:1px solid #ffffff16;border-radius:14px;padding:18px;margin:24px 0;background:#0e0d12}.message{border-bottom:1px solid #ffffff10;padding:12px 0}.message strong{color:#d6c6e2}.message p{color:#bbb2c0;line-height:1.5;margin:6px 0}.message.being{background:#24182d;margin:10px -8px;padding:14px;border-radius:10px;border:1px solid #b76bdf44}.message.being strong{color:#e5a8ff}.composer{display:flex;gap:12px;align-items:end}.composer textarea{min-height:56px}.check{flex-direction:row;align-items:center}.check input{width:auto}.support{border:1px solid #ffffff16;border-radius:14px;padding:18px;background:#0e0d12;margin-top:24px}.support strong{color:#d38cff}
`;