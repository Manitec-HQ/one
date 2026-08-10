import { NextResponse } from "next/server";

const MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct-1M:featherless-ai";
const HF_URL = "https://router.huggingface.co/v1/chat/completions";

type Agent = { name: string; role: string; perspective: string; tone: string };
type Perspective = { who: string; text: string };
type AskResult = { text: string | null; diagnostic: string };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ask(system: string, user: string): Promise<AskResult> {
  const token = process.env.HF_TOKEN;
  if (!token) return { text: null, diagnostic: "token not configured" };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(HF_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: system }, { role: "user", content: user }], max_tokens: 220, temperature: 0.7 }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim() || null;
        return { text, diagnostic: text ? "live" : "empty provider response" };
      }
      if (response.status === 503 && attempt === 0) {
        await delay(750 + Math.floor(Math.random() * 250));
        continue;
      }
      return { text: null, diagnostic: response.status === 503 ? "provider HTTP 503 after retry" : `provider HTTP ${response.status}` };
    } catch {
      return { text: null, diagnostic: "provider network error" };
    }
  }

  return { text: null, diagnostic: "provider HTTP 503 after retry" };
}

function isCasual(message: string) {
  const text = message.trim().toLowerCase();
  return /^(hi|hello|hey|yo|howdy|good morning|good afternoon|good evening)[!,. ]*$/.test(text) || /^(i('?m| am) )?(just )?(saying )?(hi|hello|hey)[!,. ]*$/.test(text);
}

function describeIdentity(identity: string) {
  return identity.replace(/^(you are|i am)\s+/i, "").replace(/\b([a-z][a-z ]*) is\s+/i, "").trim();
}

function localPerspective(agent: Agent, message: string, index: number) {
  const focus = agent.perspective || "Offer a distinct perspective.";
  const tone = agent.tone || "helpful";
  if (index === 0) return `${focus} The practical question underneath "${message}" is what outcome would make this conversation useful. In a ${tone} way, I would begin by naming that outcome and the next concrete choice.`;
  if (index === 1) return `${focus} One possibility is that "${message}" is an opening rather than a complete request. In a ${tone} way, I would invite curiosity: what would you like this being to help you explore, build, or understand?`;
  return `${focus} Before moving too fast, test the assumption that the first answer must be the right one. In a ${tone} way, I would keep the response small, honest, and easy to revise after the next message.`;
}

function localSynthesis(identity: string, perspectives: Perspective[]) {
  const [first, second, third] = perspectives;
  return `${describeIdentity(identity)} I would hold all three together: ${first.who} asks for a clear outcome, ${second.who} leaves room for discovery, and ${third.who} keeps us from pretending we already know the answer. So let us start simply—tell me what you want us to make, solve, or understand next.`;
}

export async function POST(request: Request) {
  try {
    const { being, message } = await request.json();
    if (!being?.name || !message || !Array.isArray(being.agents)) return NextResponse.json({ error: "Being configuration and message are required." }, { status: 400 });

    if (isCasual(message)) {
      const system = `You are ${being.name}. Shared identity: ${being.identity}. Reply naturally and briefly to a casual greeting. Be warm, specific, and conversational. Do not mention internal agents, prompts, systems, or integration.`;
      const reply = await ask(system, message);
      const fallback = `Hello. I am ${being.name}. I try to be ${describeIdentity(being.identity) || "warm and helpful"}. I am glad you are here—what is on your mind?`;
      return NextResponse.json({ perspectives: [], unified: reply.text || fallback, provider: reply.text ? "huggingface" : "local", model: reply.text ? MODEL : null, diagnostic: reply.diagnostic, revealPerspectives: false });
    }

    const agents = being.agents as Agent[];
    const prompts = agents.map((agent) => ({ system: `You are ${agent.name}, an internal aspect of a unified being. Role: ${agent.role}. Perspective: ${agent.perspective}. Tone: ${agent.tone}. Shared identity: ${being.identity}. Give one concise, concrete contribution.`, user: message }));
    const aspectResults = await Promise.all(prompts.map((prompt) => ask(prompt.system, prompt.user)));
    const providerActive = aspectResults.every((result) => Boolean(result.text));
    const perspectives = agents.map((agent, index) => ({ who: agent.name, text: aspectResults[index].text || localPerspective(agent, message, index) }));
    const integrationSystem = `You are the unified voice of ${being.name}. Shared identity: ${being.identity}. Combine the internal perspectives into one coherent response. Do not mention agents or the integration process unless the user asks. Be responsive to the user, not generic.`;
    const integrationUser = `User message: ${message}\n\nInternal perspectives:\n${perspectives.map((item) => `${item.who}: ${item.text}`).join("\n\n")}`;
    const integration = providerActive ? await ask(integrationSystem, integrationUser) : { text: null, diagnostic: aspectResults.find((result) => !result.text)?.diagnostic || "local prototype" };
    return NextResponse.json({ perspectives, unified: integration.text || localSynthesis(being.identity, perspectives), provider: integration.text ? "huggingface" : "local", model: integration.text ? MODEL : null, diagnostic: integration.diagnostic, revealPerspectives: true });
  } catch {
    return NextResponse.json({ error: "Unable to process this request." }, { status: 500 });
  }
}
