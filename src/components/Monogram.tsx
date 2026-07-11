interface Props {
  /** Mostra o "ponto Brasa" após o N (Regra Nº1). Abaixo de ~24px, oculte. */
  showDot?: boolean;
  /** Classe (defina o tamanho via text-* e a cor do RN). */
  className?: string;
  /** Cor do ponto: "brasa" (padrão) ou "creme" (quando sobre fundo Brasa). */
  dot?: "brasa" | "creme";
}

/**
 * Monograma RN do Refúgio Nerd, em Archivo Black, com o "ponto Brasa" na base
 * após o N — a brasa que não apaga. O tamanho acompanha o `text-*` aplicado.
 */
export function Monogram({ showDot = true, className = "", dot = "brasa" }: Props) {
  return (
    <span
      className={`inline-flex items-end font-display leading-none tracking-tight ${className}`}
    >
      RN
      {showDot && (
        <span
          aria-hidden
          className={`mb-[0.05em] ml-[0.06em] inline-block h-[0.2em] w-[0.2em] rounded-full animate-ember ${
            dot === "creme" ? "bg-creme-200" : "bg-electric-500"
          }`}
          style={{
            boxShadow:
              dot === "creme"
                ? "0 0 8px 1px rgba(231,223,206,0.6)"
                : "0 0 10px 2px rgba(255,122,46,0.75)",
          }}
        />
      )}
    </span>
  );
}
