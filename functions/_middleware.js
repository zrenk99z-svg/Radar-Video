/**
 * Cloudflare Pages Function (middleware) que protege TODO o site.
 *
 * - Exige autenticação HTTP Basic (usuário + senha compartilhados).
 * - A senha vem da variável de ambiente SITE_PASSWORD (defina no painel do
 *   Cloudflare Pages). O usuário vem de SITE_USER (opcional; padrão "refugio").
 * - Adiciona X-Robots-Tag: noindex, nofollow em todas as respostas para
 *   impedir indexação por mecanismos de busca.
 *
 * Comportamento da senha:
 *   - SITE_PASSWORD definida  -> site PRIVADO (exige usuário + senha).
 *   - SITE_PASSWORD ausente    -> site PÚBLICO (abre direto), mas ainda noindex.
 * Ou seja: por padrão o site abre; basta definir SITE_PASSWORD para trancá-lo.
 */

function withNoindex(response) {
  const out = new Response(response.body, response);
  out.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return out;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function unauthorized(message) {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Refugio Nerd - Radar (privado)", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;

  const expectedUser = env.SITE_USER || "refugio";
  const expectedPass = env.SITE_PASSWORD;

  // Sem senha configurada: site público (abre direto), mantendo o noindex.
  if (!expectedPass) {
    return withNoindex(await next());
  }

  const header = request.headers.get("Authorization") || "";
  if (header.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice(6));
    } catch {
      decoded = "";
    }
    const sep = decoded.indexOf(":");
    const user = sep >= 0 ? decoded.slice(0, sep) : "";
    const pass = sep >= 0 ? decoded.slice(sep + 1) : "";

    if (
      timingSafeEqual(user, expectedUser) &&
      timingSafeEqual(pass, expectedPass)
    ) {
      // Autenticado: segue para o conteúdo, mas ainda com noindex.
      return withNoindex(await next());
    }
  }

  return unauthorized("Autenticação necessária.");
}
