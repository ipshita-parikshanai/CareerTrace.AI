import OpenAI from 'openai';

/** OpenRouter requires a valid HTTP-Referer. */
function appReferer(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

let _client: OpenAI | undefined;

/**
 * Lazy singleton so importing API route modules during `next build` does not
 * throw when OPENROUTER_API_KEY is absent (e.g. CI without secrets).
 */
export function getOpenRouterClient(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return null;
  if (!_client) {
    _client = new OpenAI({
      apiKey: key,
      baseURL: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': appReferer(),
        'X-Title': 'CareerTrace.AI',
      },
    });
  }
  return _client;
}
