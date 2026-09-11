import { NextRequest, NextResponse } from 'next/server';

const PLEX_SABLE_BASE = process.env.PLEX_SABLE_BASE_URL || '';
const PLEX_SABLE_GATE_PASSWORD = process.env.PLEX_SABLE_GATE_PASSWORD || '';

function onePlexSessionId(): string {
  return `one-plex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body as { message?: string };

    if (!PLEX_SABLE_BASE || !PLEX_SABLE_GATE_PASSWORD) {
      return NextResponse.json(
        { error: 'Plex bridge not configured on server' },
        { status: 503 },
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 },
      );
    }

    // 1) Handshake: login to Plex-Sable to obtain session cookie
    const loginRes = await fetch(`${PLEX_SABLE_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: PLEX_SABLE_GATE_PASSWORD }),
    });

    if (!loginRes.ok) {
      const text = await loginRes.text().catch(() => '');
      return NextResponse.json(
        { error: 'Plex-Sable login failed', details: text },
        { status: 502 },
      );
    }

    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) {
      return NextResponse.json(
        { error: 'Plex-Sable did not return session cookie' },
        { status: 502 },
      );
    }

    // Extract the session cookie value for subsequent calls
    // Expected format includes something like "plex_session=...; ..."
    const sessionCookieMatch = setCookie.match(/plex_session=([^;]+)/);
    if (!sessionCookieMatch) {
      return NextResponse.json(
        { error: 'Plex-Sable session cookie format unexpected', raw: setCookie },
        { status: 502 },
      );
    }
    const sessionCookieValue = sessionCookieMatch[1];

    // 2) Speak: call Plex-Sable /api/speak with the session cookie
    const speakRes = await fetch(`${PLEX_SABLE_BASE}/api/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `plex_session=${sessionCookieValue}`,
      },
      body: JSON.stringify({
        message,
        session_id: onePlexSessionId(),
      }),
    });

    if (!speakRes.ok) {
      const text = await speakRes.text().catch(() => '');
      return NextResponse.json(
        { error: 'Plex-Sable /api/speak failed', details: text },
        { status: 502 },
      );
    }

    const speakData = await speakRes.json();
    return NextResponse.json(speakData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'Internal Plex bridge error', details: msg },
      { status: 500 },
    );
  }
}
