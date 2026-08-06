import { NextResponse } from "next/server";

const MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
const HF_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

type Agent = { name: string; role: string; perspective: string; tone: string };

async function ask(prompt: string) {
  const token = process.env.HF_TOKEN;
  if (!token) return null;
  const response = await fetch(HF_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 220, temperature: 0.7, return_full_text: false } }),
  });
  if (!response.ok) throw new Error(`Hugging Face returned ${response.status}`);
  const data = await response.json();
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text.trim();
  if (data?.generated_text) return data.generated_text.trim();
  return JSON.stringify(data);
}

export async function POST(request: Request) {
  try {
    const { being, message } = await request.json();
    if (!being?.name || !message || !Array.isArray(being.agents)) return NextResponse.json({ error: "Being configuration and message are required." }, { status: 400 });
    const agents = being.agents as Agent[];
    const prompts = agents.map((agent) => `You are ${agent.name}, an internal aspect of a unified being. Role: ${agent.role}. Perspective: ${agent.perspective}. Tone: ${agent.tone}. Shared identity: ${being.identity}. Respond only with your useful perspective on this user message: ${message}`);
    const live = await Promise.all(prompts.map(ask));
    const perspectives = live.map((text, index) => ({ who: agents[index].name, text: text || `${agents[index].perspective} Focus on the user's question: ${message}` }));
    const integrationPrompt = `You are the integration layer for ${being.name}. Shared identity: ${being.identity}. Combine these three internal perspectives into one coherent response. Do not mention agents or the integration process unless useful. User message: ${message}\n\n${perspectives.map((item) => `${item.who}: ${item.text}`).join("\n\n")}`;
    const unified = await ask(integrationPrompt) || `I considered this through three perspectives. ${being.identity} A useful next step is to clarify the desired outcome and test the smallest practical move.`;
    return NextResponse.json({ perspectives, unified, provider: live.some(Boolean) ? "huggingface" : "mock", model: live.some(Boolean) ? MODEL : null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime error" }, { status: 500 });
  }
}
