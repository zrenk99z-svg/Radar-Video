import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * Configuração opcional para habilitar dados ao vivo e IA.
 * Tudo é armazenado apenas no localStorage do navegador.
 */
export interface Settings {
  /** Chave da YouTube Data API v3 (habilita tendências + concorrência reais). */
  youtubeApiKey: string;
  /**
   * URL base de um proxy para o Google Trends (não há API pública com CORS).
   * O proxy deve aceitar ?q=<termo>&geo=BR e devolver JSON com uma lista de
   * termos relacionados. Sem isso, o Google Trends fica em modo simulado.
   */
  googleTrendsProxyUrl: string;
  /** Chave da Anthropic para o modo "IA (Claude)" no gerador de títulos. */
  anthropicApiKey: string;
  /** Se true, tenta buscar tendências reais ao abrir o Radar. */
  enableLiveTrends: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  youtubeApiKey: "",
  googleTrendsProxyUrl: "",
  anthropicApiKey: "",
  enableLiveTrends: true,
};

export const SETTINGS_KEY = "refugio-nerd:settings";

export function useSettings() {
  return useLocalStorage<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}
