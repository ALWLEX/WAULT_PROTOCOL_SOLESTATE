/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        wault: {
          primary: "#6C5CE7",
          secondary: "#00D2D3",
          accent: "#FECA57",
          dark: "#0A0A1A",
          darker: "#050510",
          card: "#111128",
          border: "#1E1E3F",
          text: "#E2E8F0",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "wault-gradient": "linear-gradient(135deg, #6C5CE7 0%, #00D2D3 100%)",
        "wault-dark-gradient": "linear-gradient(180deg, #0A0A1A 0%, #050510 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};