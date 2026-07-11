import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { RadarIcon } from "./Icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Banner de instalação do PWA:
 * - Android/desktop: usa `beforeinstallprompt` (botão "Instalar").
 * - iOS Safari: mostra instruções de "Adicionar à Tela de Início".
 */
export function InstallPrompt() {
  const [dismissed, setDismissed] = useLocalStorage(
    "refugio-nerd:install-dismissed",
    false,
  );
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissed || isStandalone()) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS não dispara beforeinstallprompt — mostra a dica manualmente.
    if (isIOS()) setShow(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [dismissed]);

  if (!show || dismissed || isStandalone()) return null;

  const ios = isIOS();

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl glass p-3 shadow-glow-strong">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-grape-500 shadow-glow-grape">
          <RadarIcon className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          {ios ? (
            <p className="text-slate-200">
              Instale o app: toque em{" "}
              <span className="font-semibold text-electric-400">Compartilhar</span>{" "}
              e depois em{" "}
              <span className="font-semibold text-electric-400">
                “Adicionar à Tela de Início”
              </span>
              .
            </p>
          ) : (
            <p className="text-slate-200">
              Instale o Radar Nerd na sua tela inicial para acesso rápido e
              offline.
            </p>
          )}
        </div>
        {!ios && deferred && (
          <button onClick={install} className="btn-primary shrink-0 px-3 py-2 text-sm">
            Instalar
          </button>
        )}
        <button
          onClick={() => {
            setShow(false);
            setDismissed(true);
          }}
          aria-label="Dispensar"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
