import { useState } from "react";
import { SearchIcon, SparkIcon } from "./Icons";

interface Props {
  onSearch: (subject: string) => void;
  loading?: boolean;
}

const SUGGESTIONS = [
  "Superman",
  "Batman",
  "Quarteto Fantástico",
  "One Piece",
  "Marvel",
  "DC",
  "Homem-Aranha",
  "Demon Slayer",
];

/** Campo de busca de assunto + sugestões rápidas. */
export function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");

  function submit(subject: string) {
    const v = subject.trim();
    if (!v) return;
    setValue(v);
    onSearch(v);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite um assunto: Superman, One Piece, Marvel…"
            className="w-full rounded-xl glass py-3.5 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 outline-none focus:border-electric-500/50 focus:shadow-glow"
            aria-label="Assunto do vídeo"
          />
        </div>
        <button type="submit" className="btn-primary py-3.5" disabled={loading}>
          <SparkIcon className="h-5 w-5" />
          {loading ? "Gerando…" : "Gerar 20 ideias"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Sugestões:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="chip bg-white/5 text-slate-300 transition hover:bg-electric-500/15 hover:text-electric-400"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
