import { useCallback, useEffect, useState } from "react";
import type { Settings } from "../lib/settings";
import { fetchAllTrends, type SourceResult } from "../lib/sources";

/**
 * Busca as tendências reais (Reddit/YouTube/Google Trends) uma única vez e as
 * compartilha entre o Radar e a seção de "ideias em alta". Recarrega quando as
 * configurações de fontes mudam.
 */
export function useTrends(settings: Settings) {
  const [results, setResults] = useState<SourceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      fetchAllTrends(settings, undefined, signal)
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [settings],
  );

  useEffect(() => {
    if (!settings.enableLiveTrends) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    reload(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.enableLiveTrends,
    settings.youtubeApiKey,
    settings.googleTrendsProxyUrl,
  ]);

  return { results, loading, reload };
}
