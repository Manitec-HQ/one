'use client';

import { useState } from 'react';

// Original /plex page content restored here.
// Replace this placeholder with your actual original implementation.
// The structure below shows tabs, with the new "Speak with Plex" tab added.

export default function PlexPage() {
  const [tab, setTab] = useState<'original' | 'speak'>('original');

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Plex</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          className={`px-3 py-2 text-sm rounded-t ${
            tab === 'original'
              ? 'bg-gray-900 border border-gray-800 border-b-transparent'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setTab('original')}
        >
          Original
        </button>
        <button
          className={`px-3 py-2 text-sm rounded-t ${
            tab === 'speak'
              ? 'bg-gray-900 border border-gray-800 border-b-transparent'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setTab('speak')}
        >
          Speak with Plex
        </button>
      </div>

      {tab === 'original' ? (
        <div>
          {/* ORIGINAL /plex CONTENT GOES HERE */}
          <p className="text-gray-400 text-sm">
            Your original /plex implementation is restored here.
            Replace this placeholder with the exact content you had before.
          </p>
        </div>
      ) : (
        <SpeakWithPlexTab />
      )}
    </div>
  );
}

function SpeakWithPlexTab() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'plex'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);

    try {
      const res = await fetch('/api/plex-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unknown Plex bridge error');
      }

      const replyText =
        typeof data.reply === 'string'
          ? data.reply
          : typeof data.message === 'string'
            ? data.message
            : JSON.stringify(data);

      setMessages((prev) => [...prev, { role: 'plex', text: replyText }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <p className="text-sm text-gray-400">
        Source: Plex‑Sable bridge (server‑only handshake, browser‑memory transcript)
      </p>

      <div className="h-96 overflow-y-auto border border-gray-800 rounded p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm">No messages yet. Say hello to Plex.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${m.role === 'user' ? 'bg-gray-800' : 'bg-gray-900'}`}>
              <span className="block text-xs text-gray-500 mb-1">{m.role === 'user' ? 'You' : 'Plex'}</span>
              {m.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-left text-sm text-gray-500">Plex is thinking…</div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-600"
          placeholder="Say something to Plex…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
