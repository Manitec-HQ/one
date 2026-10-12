# ONE `/api/respond` providers

Order of attempts (first live reply wins):

1. **OpenRouter** — `OPENROUTER_API_KEY`, model `OPENROUTER_MODEL` (default `qwen/qwen3-4b`)
2. **xAI** — `XAI_API_KEY`, model `XAI_MODEL` (default `grok-4-fast-non-reasoning`)
3. **Hugging Face** — `HF_TOKEN`, model `HF_MODEL` (default `Qwen/Qwen3-4B-Instruct-2507`)

HF often returns **402** when Inference Providers credits are exhausted. Prefer OpenRouter or xAI for production speak.

Optional OpenRouter headers (ranking / attribution):

- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_NAME`

Keys live only in Vercel project env for `one-system`. Never commit secrets.
