import { NextResponse } from "next/server";

/**
 * Provider order (first key present wins until a live reply):
 * 1. OpenRouter — multi-model router, OPENROUTER_API_KEY
 * 2. xAI        — XAI_API_KEY
 * 3. Hugging Face Inference Providers — HF_TOKEN (often 402 without credits)
 */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "qwen/qwen3-4b";

const XAI_URL = "https://api.x.ai/v1/chat/completions";
const XAI_MODEL = process.env.XAI_MODEL || "grok-4-fast-non-reasoning";

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL =
  process.env.HF_MODEL || "Qwen/Qwen3-4B-Instruct-2507";

type Agent = { name: string; role: string; perspective: string; tone: string };
type Perspective = { who: string; text: string };
type ProviderName = "openrouter" | "xai" | "huggingface" | "none";
type AskResult = {
  text: string | null;
  diagnostic: string;
  provider: ProviderName;
  model: string | null;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askOpenRouter(
  system: string,
  user: string
): Promise<AskResult> {
  const token = process.env.OPENROUTER_API_KEY;
  if (!token) {
    return {
      text: null,
      diagnostic: "OPENROUTER_API_KEY not configured",
      provider: "none",
      model: null,
    };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL || "https://one-system.vercel.app",
        "X-Title": process.env.OPENROUTER_APP_NAME || "ONE System",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 280,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || null;
      return {
        text,
        diagnostic: text ? "live" : "empty OpenRouter response",
        provider: text ? "openrouter" : "none",
        model: text ? OPENROUTER_MODEL : null,
      };
    }

    const body = await response.text().catch(() => "");
    return {
      text: null,
      diagnostic: `OpenRouter HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
      provider: "none",
      model: null,
    };
  } catch {
    return {
      text: null,
      diagnostic: "OpenRouter network error",
      provider: "none",
      model: null,
    };
  }
}

async function askXai(system: string, user: string): Promise<AskResult> {
  const token = process.env.XAI_API_KEY;
  if (!token) {
    return {
      text: null,
      diagnostic: "XAI_API_KEY not configured",
      provider: "none",
      model: null,
    };
  }

  try {
    const response = await fetch(XAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 280,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || null;
      return {
        text,
        diagnostic: text ? "live" : "empty xAI response",
        provider: text ? "xai" : "none",
        model: text ? XAI_MODEL : null,
      };
    }

    const body = await response.text().catch(() => "");
    return {
      text: null,
      diagnostic: `xAI HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
      provider: "none",
      model: null,
    };
  } catch {
    return {
      text: null,
      diagnostic: "xAI network error",
      provider: "none",
      model: null,
    };
  }
}

async function askHuggingFace(
  system: string,
  user: string
): Promise<AskResult> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    return {
      text: null,
      diagnostic: "HF_TOKEN not configured",
      provider: "none",
      model: null,
    };
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(HF_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 280,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim() || null;
        return {
          text,
          diagnostic: text ? "live" : "empty HF response",
          provider: text ? "huggingface" : "none",
          model: text ? HF_MODEL : null,
        };
      }

      const body = await response.text().catch(() => "");
      const detail = body ? body.slice(0, 180) : "";

      if (response.status === 503 && attempt === 0) {
        await delay(750 + Math.floor(Math.random() * 250));
        continue;
      }

      return {
        text: null,
        diagnostic: `HF HTTP ${response.status}${detail ? `: ${detail}` : ""}`,
        provider: "none",
        model: null,
      };
    } catch {
      return {
        text: null,
        diagnostic: "HF network error",
        provider: "none",
        model: null,
      };
    }
  }

  return {
    text: null,
    diagnostic: "HF HTTP 503 after retry",
    provider: "none",
    model: null,
  };
}

/** OpenRouter → xAI → Hugging Face. */
async function askProvider(
  system: string,
  user: string
): Promise<AskResult> {
  const diagnostics: string[] = [];

  const openrouter = await askOpenRouter(system, user);
  if (openrouter.text) return openrouter;
  diagnostics.push(openrouter.diagnostic);

  const xai = await askXai(system, user);
  if (xai.text) return xai;
  diagnostics.push(xai.diagnostic);

  const hf = await askHuggingFace(system, user);
  if (hf.text) return hf;
  diagnostics.push(hf.diagnostic);

  return {
    text: null,
    diagnostic: diagnostics.filter(Boolean).join(" · "),
    provider: "none",
    model: null,
  };
}

function isCasual(message: string) {
  const text = message.trim().toLowerCase();
  return (
    /^(hi|hello|hey|yo|howdy|good morning|good afternoon|good evening)[!,. ]*$/.test(
      text
    ) ||
    /^(i('?m| am) )?(just )?(saying )?(hi|hello|hey)[!,. ]*$/.test(text)
  );
}

function describeIdentity(identity: string) {
  return identity
    .replace(/^(you are|i am)\s+/i, "")
    .replace(/\b([a-z][a-z ]*) is\s+/i, "")
    .trim();
}

function localPerspective(agent: Agent, message: string, index: number) {
  const focus = agent.perspective || "Offer a distinct perspective.";
  const tone = agent.tone || "helpful";
  if (index === 0)
    return `${focus} The practical question underneath "${message}" is what outcome would make this conversation useful. In a ${tone} way, I would begin by naming that outcome and the next concrete choice.`;
  if (index === 1)
    return `${focus} One possibility is that "${message}" is an opening rather than a complete request. In a ${tone} way, I would invite curiosity: what would you like this being to help you explore, build, or understand?`;
  return `${focus} Before moving too fast, test the assumption that the first answer must be the right one. In a ${tone} way, I would keep the response small, honest, and easy to revise after the next message.`;
}

function localSynthesis(identity: string, perspectives: Perspective[]) {
  const [first, second, third] = perspectives;
  return `${describeIdentity(identity)} I would hold all three together: ${first.who} asks for a clear outcome, ${second.who} leaves room for discovery, and ${third.who} keeps us from pretending we already know the answer. So let us start simply—tell me what you want us to make, solve, or understand next.`;
}

function resolveAgents(being: {
  agents?: Agent[];
  aspects?: Agent[];
}): Agent[] | null {
  if (Array.isArray(being.agents) && being.agents.length > 0) return being.agents;
  if (Array.isArray(being.aspects) && being.aspects.length > 0) {
    return being.aspects.map((a) => ({
      name: a.name,
      role: a.role,
      perspective: a.perspective,
      tone: a.tone,
    }));
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { being, message } = await request.json();
    const agents = being ? resolveAgents(being) : null;

    if (!being?.name || !message || !agents) {
      return NextResponse.json(
        { error: "Being configuration and message are required." },
        { status: 400 }
      );
    }

    if (isCasual(message)) {
      const system = `You are ${being.name}. Shared identity: ${being.identity}. Reply naturally and briefly to a casual greeting. Be warm, specific, and conversational. Do not mention internal agents, prompts, systems, or integration.`;
      const reply = await askProvider(system, message);
      const fallback = `Hello. I am ${being.name}. I try to be ${describeIdentity(being.identity) || "warm and helpful"}. I am glad you are here—what is on your mind?`;
      return NextResponse.json({
        perspectives: [],
        unified: reply.text || fallback,
        provider: reply.text ? reply.provider : "local",
        model: reply.model,
        diagnostic: reply.diagnostic,
        revealPerspectives: false,
      });
    }

    const prompts = agents.map((agent) => ({
      system: `You are ${agent.name}, an internal aspect of a unified being. Role: ${agent.role}. Perspective: ${agent.perspective}. Tone: ${agent.tone}. Shared identity: ${being.identity}. Give one concise, concrete contribution.`,
      user: message,
    }));

    const aspectResults = await Promise.all(
      prompts.map((prompt) => askProvider(prompt.system, prompt.user))
    );

    const liveAspectCount = aspectResults.filter((r) => Boolean(r.text)).length;
    const aspectDiagnostics = aspectResults
      .map((r, i) => `${agents[i].name}: ${r.diagnostic}`)
      .join(" · ");

    const perspectives = agents.map((agent, index) => ({
      who: agent.name,
      text: aspectResults[index].text || localPerspective(agent, message, index),
    }));

    if (liveAspectCount > 0) {
      const integrationSystem = `You are the unified voice of ${being.name}. Shared identity: ${being.identity}. Combine the internal perspectives into one coherent response. Do not mention agents or the integration process unless the user asks. Be responsive to the user, not generic.`;
      const integrationUser = `User message: ${message}\n\nInternal perspectives:\n${perspectives.map((item) => `${item.who}: ${item.text}`).join("\n\n")}`;
      const integration = await askProvider(integrationSystem, integrationUser);

      if (integration.text) {
        return NextResponse.json({
          perspectives,
          unified: integration.text,
          provider: integration.provider,
          model: integration.model,
          diagnostic: `aspects live ${liveAspectCount}/${agents.length} · ${integration.diagnostic}`,
          revealPerspectives: true,
        });
      }
    }

    const unifiedSystem = `You are ${being.name}. Shared identity: ${being.identity}. You hold three internal tendencies: ${agents.map((a) => `${a.name} (${a.role}: ${a.perspective})`).join("; ")}. Answer as one coherent voice. Do not mention internal agents unless asked.`;
    const unified = await askProvider(unifiedSystem, message);

    if (unified.text) {
      return NextResponse.json({
        perspectives,
        unified: unified.text,
        provider: unified.provider,
        model: unified.model,
        diagnostic: `unified fallback · ${unified.diagnostic} · aspects: ${aspectDiagnostics}`,
        revealPerspectives: true,
      });
    }

    return NextResponse.json({
      perspectives,
      unified: localSynthesis(being.identity, perspectives),
      provider: "local",
      model: null,
      diagnostic: `local prototype · ${aspectDiagnostics} · ${unified.diagnostic}`,
      revealPerspectives: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process this request." },
      { status: 500 }
    );
  }
}
