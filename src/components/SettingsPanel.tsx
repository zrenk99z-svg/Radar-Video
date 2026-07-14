import type { Settings } from "../lib/settings";
import { GearIcon } from "./Icons";

interface Props {
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

/** Painel de configurações (chaves de API e proxy) — tudo salvo localmente. */
export function SettingsPanel({ open, settings, onChange, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-glow w-full max-w-lg space-y-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl glass">
            <GearIcon className="h-5 w-5 text-electric-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              Configurações
            </h2>
            <p className="text-sm text-slate-400">
              Habilite fontes reais e IA. As chaves ficam só no seu navegador.
            </p>
          </div>
        </div>

        <label className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <span className="text-sm text-slate-200">
            Buscar tendências reais no Radar
          </span>
          <input
            type="checkbox"
            checked={settings.enableLiveTrends}
            onChange={(e) => onChange({ enableLiveTrends: e.target.checked })}
            className="h-5 w-5 accent-electric-500"
          />
        </label>

        <Field
          label="YouTube Data API v3 — chave (opcional)"
          hint="Adiciona vídeos populares da semana e a análise de concorrência real. As Buscas e o Reddit já funcionam sem chave."
          value={settings.youtubeApiKey}
          onChange={(v) => onChange({ youtubeApiKey: v })}
          placeholder="AIza…"
        />

        <Field
          label="Anthropic (Claude) — chave para IA de títulos"
          hint="Opcional. ⚠️ Usada direto no navegador — adequado só para uso pessoal/protótipo."
          value={settings.anthropicApiKey}
          onChange={(v) => onChange({ anthropicApiKey: v })}
          placeholder="sk-ant-…"
          secret
        />

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-primary">
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  secret,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secret?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-200">{label}</label>
      <input
        type={secret ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="mt-1.5 w-full rounded-xl glass px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-electric-500/50"
      />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
