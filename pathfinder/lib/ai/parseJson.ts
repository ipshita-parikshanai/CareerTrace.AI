/**
 * Parse JSON from LLM output. Some models (via OpenRouter) still wrap JSON in ```json fences
 * despite response_format / instructions.
 */
export function parseJsonFromLLMResponse<T = unknown>(text: string): T {
  let s = text.trim();

  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '');
    const fenceEnd = s.indexOf('```');
    if (fenceEnd >= 0) {
      s = s.slice(0, fenceEnd).trim();
    }
  }

  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(s) as T;
}
