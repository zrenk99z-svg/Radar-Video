import { scoreTitle, type TitleSuggestion } from "./titleAI";

/**
 * Modo IA (opcional): usa a API da Anthropic (Claude) para sugerir títulos
 * com alto CTR, e reaproveita o mesmo `scoreTitle` heurístico para pontuá-los.
 *
 * ⚠️ Chamar a API da Anthropic direto do navegador expõe a chave. Isto é
 * adequado apenas para protótipos/uso pessoal. Em produção, use um backend
 * (proxy) que guarde a chave no servidor.
 */
export async function generateTitlesWithClaude(
  subject: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<TitleSuggestion[]> {
  const prompt = `Você é especialista em crescimento de canais no YouTube de cultura nerd.
Gere 8 títulos de vídeo com ALTO CTR sobre o tema: "${subject}".
Use palavras de impacto como FINALMENTE, EXPLICADO, SEGREDO, "O QUE NINGUÉM PERCEBEU", URGENTE, CHOCANTE, REVELADO.
Regras: cada título entre 40 e 70 caracteres; inclua números quando fizer sentido; em português do Brasil.
Responda APENAS com um JSON no formato {"titles": ["...", "..."]} sem texto extra.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude: HTTP ${res.status} ${detail.slice(0, 140)}`);
  }

  const json = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    json.content?.filter((b) => b.type === "text").map((b) => b.text).join("") ?? "";

  const titles = parseTitles(text);
  if (titles.length === 0) throw new Error("Claude não retornou títulos válidos.");

  return titles
    .map((title) => {
      const { ctr, powerWords } = scoreTitle(title);
      return { title, ctr, powerWords, origin: "ia" as const };
    })
    .sort((a, b) => b.ctr - a.ctr);
}

/** Extrai a lista de títulos do texto do modelo, tolerando ruído. */
function parseTitles(text: string): string[] {
  // tenta achar o objeto JSON
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]) as { titles?: unknown };
      if (Array.isArray(obj.titles)) {
        return obj.titles.filter((t): t is string => typeof t === "string");
      }
    } catch {
      /* cai no fallback abaixo */
    }
  }
  // fallback: linhas que parecem títulos
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*[-*\d.)"]+\s*/, "").replace(/"$/, "").trim())
    .filter((l) => l.length > 12 && l.length < 120)
    .slice(0, 8);
}
