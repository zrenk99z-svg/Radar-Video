/** @type {import('tailwindcss').Config} */
// Identidade visual "Refúgio Nerd — Brasa":
// Preto #141210 (dominante) · Brasa #FF7A2E (acento) · Creme #E7DFCE (texto).
// Tipografia: Archivo Black (display/monograma) + Space Mono (rótulos/notas).
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fundo escuro quente (base Preto #141210).
        void: {
          900: "#0e0c0b",
          800: "#141210", // Preto — dominante
          700: "#1c1916",
          600: "#26211b",
        },
        // Brasa (laranja) — acento principal. Mantém o nome "electric" por
        // baixo dos panos para reaproveitar as classes existentes.
        electric: {
          400: "#ff9552",
          500: "#ff7a2e", // Brasa
          600: "#e8631a",
        },
        // Âmbar/brasa secundário (para os gradientes de brasa).
        grape: {
          400: "#ffb15e",
          500: "#f59a2e",
          600: "#d9791a",
        },
        // Creme — texto e destaques claros.
        creme: {
          100: "#f4efe2",
          200: "#e7dfce", // Creme
          300: "#d5c9ad",
        },
        brasa: {
          DEFAULT: "#ff7a2e",
          light: "#ff9552",
          dark: "#e8631a",
        },
        // Tons de cinza "esquentados" para combinar com o creme/preto.
        slate: {
          50: "#f6f3ea",
          100: "#ece5d6",
          200: "#e7dfce", // texto principal (creme)
          300: "#c9bfa8",
          400: "#a59b86", // texto secundário / muted
          500: "#847c6a",
          600: "#5b5446",
          700: "#403a30",
          800: "#2a2620",
          900: "#1b1814",
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,122,46,0.14), 0 8px 40px -12px rgba(255,122,46,0.35)",
        "glow-grape":
          "0 0 0 1px rgba(255,150,80,0.20), 0 8px 40px -12px rgba(255,122,46,0.45)",
        "glow-strong":
          "0 0 0 1px rgba(255,122,46,0.40), 0 0 60px -8px rgba(255,122,46,0.55)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ember: {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        sweep: "sweep 4s linear infinite",
        "fade-up": "fade-up 0.4s ease-out both",
        ember: "ember 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
