import { useMemo, useState } from "react";
import type { VideoFormat, VideoIdea } from "./types";
import { generateIdeas } from "./lib/ideaGenerator";
import { rankIdeas } from "./lib/scoring";
import { resolveFormat, suggestFormat } from "./lib/format";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSettings, type Settings } from "./lib/settings";

import { SearchBar } from "./components/SearchBar";
import { IdeaCard } from "./components/IdeaCard";
import { LiveTrends } from "./components/LiveTrends";
import { ViralMode } from "./components/ViralMode";
import { SavedList } from "./components/SavedList";
import { CompetitionPanel } from "./components/CompetitionPanel";
import { TitleLab } from "./components/TitleLab";
import { EditorialCalendar } from "./components/EditorialCalendar";
import { SettingsPanel } from "./components/SettingsPanel";
import { InstallPrompt } from "./components/InstallPrompt";
import {
  FireIcon,
  GearIcon,
  LongIcon,
  RadarIcon,
  ShortIcon,
  SparkIcon,
} from "./components/Icons";

const STORAGE_KEY = "refugio-nerd:proximos-videos";

export default function App() {
  const [saved, setSaved] = useLocalStorage<VideoIdea[]>(STORAGE_KEY, []);
  const [settings, setSettings] = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [viralOnly, setViralOnly] = useState(false);
  const [formatFilter, setFormatFilter] = useState<"todos" | VideoFormat>("todos");

  const savedFormats = useMemo(
    () => new Map(saved.map((s) => [s.id, resolveFormat(s)])),
    [saved],
  );
  const ranked = useMemo(() => {
    const list = rankIdeas(ideas);
    if (formatFilter === "todos") return list;
    return list.filter((i) => suggestFormat(i) === formatFilter);
  }, [ideas, formatFilter]);

  function handleSearch(term: string) {
    setLoading(true);
    setSubject(term);
    window.setTimeout(() => {
      setIdeas(generateIdeas(term));
      setLoading(false);
      document
        .getElementById("resultados")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  }

  /**
   * Salva a ideia com um formato (Longo/Short). Se já estiver salva no mesmo
   * formato, remove; se estiver salva em outro formato, apenas troca.
   */
  function saveAs(idea: VideoIdea, format: VideoFormat) {
    setSaved((prev) => {
      const existing = prev.find((s) => s.id === idea.id);
      if (!existing) return [...prev, { ...idea, format }];
      if (existing.format === format) return prev.filter((s) => s.id !== idea.id);
      return prev.map((s) => (s.id === idea.id ? { ...s, format } : s));
    });
  }

  function setSavedFormat(id: string, format: VideoFormat) {
    setSaved((prev) => prev.map((s) => (s.id === id ? { ...s, format } : s)));
  }

  function patchSettings(p: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...p }));
  }

  return (
    <div className="min-h-screen">
      <Header savedCount={saved.length} onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto max-w-7xl space-y-14 px-4 pb-24 sm:px-6">
        {/* Hero + busca */}
        <section className="pt-10 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip mb-4 bg-white/5 text-electric-400 ring-1 ring-electric-500/20">
              <SparkIcon className="h-3.5 w-3.5" /> Radar de Vídeos
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
              Encontre o próximo vídeo{" "}
              <span className="bg-gradient-to-r from-electric-400 to-grape-400 bg-clip-text text-transparent">
                bombástico
              </span>{" "}
              do Refúgio Nerd
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Digite um assunto e receba 20 ideias pontuadas, análise de
              concorrência, títulos com alto CTR e um calendário editorial.
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.35em] text-electric-500/80">
              Filmes · Séries · HQs
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </section>

        {/* Resultados */}
        <section id="resultados" className="scroll-mt-24 space-y-6">
          {ideas.length > 0 && (
            <>
              <CompetitionPanel subject={subject} settings={settings} />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-100">
                    Ranking para{" "}
                    <span className="text-electric-400">“{subject}”</span>
                  </h2>
                  <p className="text-sm text-slate-400">
                    {formatFilter === "todos"
                      ? `${ideas.length} ideias, ordenadas do melhor para o pior tema.`
                      : `${ranked.length} de ${ideas.length} ideias que encaixam como ${formatFilter === "longo" ? "vídeo longo" : "short"}.`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!viralOnly && (
                    <FormatFilter value={formatFilter} onChange={setFormatFilter} />
                  )}
                  <button
                    onClick={() => setViralOnly((v) => !v)}
                    className={
                      viralOnly
                        ? "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric-600 to-grape-500 px-4 py-2.5 font-semibold text-void-900 shadow-glow-grape transition active:scale-95"
                        : "btn-ghost"
                    }
                  >
                    <FireIcon className="h-4 w-4" />
                    {viralOnly ? "Modo Viral" : "Modo Viral"}
                  </button>
                </div>
              </div>

              {viralOnly ? (
                <ViralMode
                  ideas={ideas}
                  savedFormats={savedFormats}
                  onSave={saveAs}
                />
              ) : ranked.length === 0 ? (
                <div className="card-glow p-8 text-center text-slate-400">
                  Nenhuma ideia encaixa como{" "}
                  {formatFilter === "longo" ? "vídeo longo" : "short"} para este
                  tema. Tente “Todos”.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ranked.map((idea, i) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      rank={i + 1}
                      savedFormat={savedFormats.get(idea.id) ?? null}
                      suggested={suggestFormat(idea)}
                      onSave={saveAs}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {ideas.length === 0 && (
            <div className="card-glow grid place-items-center gap-3 p-12 text-center">
              <RadarIcon className="h-10 w-10 animate-pulse-glow text-electric-400" />
              <p className="max-w-md text-slate-400">
                Comece pesquisando um herói, filme, série ou HQ — ou explore o{" "}
                <a href="#tendencias" className="text-electric-400 hover:underline">
                  Radar de Tendências
                </a>{" "}
                abaixo.
              </p>
            </div>
          )}
        </section>

        {/* Gerador de títulos com alto CTR — depende de um assunto */}
        {subject && <TitleLab subject={subject} settings={settings} />}

        <LiveTrends
          settings={settings}
          subject={subject || undefined}
          onExplore={handleSearch}
        />

        <EditorialCalendar saved={saved} />

        <SavedList
          saved={saved}
          onRemove={(id) => setSaved((prev) => prev.filter((s) => s.id !== id))}
          onClear={() => setSaved([])}
          onSetFormat={setSavedFormat}
        />
      </main>

      <Footer />

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={patchSettings}
        onClose={() => setSettingsOpen(false)}
      />

      <InstallPrompt />
    </div>
  );
}

function Header({
  savedCount,
  onOpenSettings,
}: {
  savedCount: number;
  onOpenSettings: () => void;
}) {
  return (
    <header className="safe-top sticky top-0 z-20 border-b border-white/5 bg-void-900/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#" className="flex items-center gap-3">
          <img
            src="/logo-rn.png"
            alt="Refúgio Nerd"
            className="h-8 w-auto"
            width={82}
            height={32}
          />
          <span className="hidden font-mono text-[11px] uppercase tracking-widest text-electric-400 sm:block">
            Radar de Vídeos
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 lg:flex">
          <a href="#tendencias" className="transition hover:text-slate-100">
            Tendências
          </a>
          <a href="#titulos" className="transition hover:text-slate-100">
            Títulos CTR
          </a>
          <a href="#calendario" className="transition hover:text-slate-100">
            Calendário
          </a>
          <a href="#proximos" className="transition hover:text-slate-100">
            Próximos Vídeos
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            aria-label="Configurações"
            className="grid h-9 w-9 place-items-center rounded-xl glass text-slate-300 transition hover:border-electric-500/40 hover:text-white"
          >
            <GearIcon className="h-5 w-5" />
          </button>
          <a
            href="#proximos"
            className="inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-electric-500/40"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-grape-500/20 text-[11px] font-bold text-grape-400">
              {savedCount}
            </span>
            Salvos
          </a>
        </div>
      </div>
    </header>
  );
}

function FormatFilter({
  value,
  onChange,
}: {
  value: "todos" | VideoFormat;
  onChange: (v: "todos" | VideoFormat) => void;
}) {
  const opts: { key: "todos" | VideoFormat; label: string; Icon?: typeof LongIcon }[] =
    [
      { key: "todos", label: "Todos" },
      { key: "longo", label: "Longo", Icon: LongIcon },
      { key: "short", label: "Short", Icon: ShortIcon },
    ];
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl glass p-0.5">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={
            value === o.key
              ? "inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-electric-500 to-grape-400 px-3 py-2 text-sm font-semibold text-void-900"
              : "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          }
        >
          {o.Icon && <o.Icon className="h-4 w-4" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="safe-bottom border-t border-white/5 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6">
        <p>
          Refúgio Nerd — Radar de Vídeos · fontes reais quando configuradas
          (Reddit · YouTube · Google Trends), com fallback simulado · dados
          salvos localmente no seu navegador.
        </p>
      </div>
    </footer>
  );
}
