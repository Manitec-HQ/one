import { NextResponse } from "next/server";

const MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
const HF_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

type Agent = { name: string; role: string; perspective: string; tone: string };
type Perspective = { who: string; text: string };

async function ask(prompt: string) {
  const token = process.env.HF_TOKEN;
  if (!token) return null;
  try {
    const response = await fetch(HF_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 220, temperature: 0.7, return_full_text: false } }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text.trim();
    if (data?.generated_text) return data.generated_text.trim();
    return null;
  } catch {
    return null;
  }
}

function localPerspective(agent: Agent, message: string, index: number) {
  const focus = agent.perspective || "Offer a distinct perspective.";
  const tone = agent.tone || "helpful";
  if (index === 0) return `${focus} The practical question underneath "${message}" is what outcome would make this conversation useful. In a ${tone} way, I would begin by naming that outcome and the next concrete choice.`;
  if (index === 1) return `${focus} One possibility is that "${message}" is an opening rather than a complete request. In a ${tone} way, I would invite curiosity: what would you like this being to help you explore, build, or understand?`;
  return `${focus} Before moving too fast, test the assumption that the first answer must be the right one. In a ${tone} way, I would keep the response small, honest, and easy to revise after the next message.`;
}

function localSynthesis(name: string, identity: string, perspectives: Perspective[]) {
  const [first, second, third] = perspectives;
  return `${identity} I would hold all three together: ${first.who} asks for a clear outcome, ${second.who} leaves room for discovery, and ${third.who} keeps us from pretending we already know the answer. So let us start simply—tell me what you want us to make, solve, or understand next.`;
}

export async function POST(request: Request) {
  try {
    const { being, message } = await request.json();
    if (!being?.name || !message || !Array.isArray(being.agents)) return NextResponse.json({ error: "Being configuration and message are required." }, { status: 400 });
    const agents = being.agents as Agent[];
    const prompts = agents.map((agent) => `You are ${agent.name}, an internal aspect of a unified being. Role: ${agent.role}. Perspective: ${agent.perspective}. Tone: ${agent.tone}. Shared identity: ${being.identity}. Give one concise, concrete contribution to this user message: ${message}`);
    const live = await Promise.all(prompts.map(ask));
    const providerActive = live.every(Boolean);
    const perspectives = agents.map((agent, index) => ({ who: agent.name, text: live[index] || localPerspective(agent, message, index) }));
    const integrationPrompt = `You are the integration layer for ${being.name}. Shared identity: ${being.identity}. Combine these three internal perspectives into one coherent response. Do not mention agents or the integration process unless useful. User message: ${message}\n\n${perspectives.map((item) => `${item.who}: ${item.text}`).join("\n\n")}`;
    const unified = providerActive ? await ask(integrationPrompt) : null;
    return NextResponse.json({ perspectives, unified: unified || localSynthesis(being.name, being.identity, perspectives), provider: providerActive ? "huggingface" : "local", model: providerActive ? MODEL : null });
  } catch {
    return NextResponse.json({ error: "Unable to process this request." }, { status: 500 });
  }
}
