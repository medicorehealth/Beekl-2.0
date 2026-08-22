import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "1.5rem",
                lg: "2rem",
                xl: "2.5rem",
            },
            screens: {
                "2xl": "1440px",
            },
        },
        extend: {
            colors: {
                // BeeKL brand palette — mono base with a single hot accent.
                ink: {
                    DEFAULT: "#0A0A0A", // near-black
                    soft: "#141414",
                    muted: "#1F1F1F",
                },
                paper: {
                    DEFAULT: "#FAFAF7", // off-white
                    soft: "#F2F1EC",
                    muted: "#E7E5DE",
                },
                charcoal: {
                    DEFAULT: "#2A2A2A",
                    light: "#3A3A3A",
                },
                grey: {
                    50: "#F7F7F5",
                    100: "#EDEDEA",
                    200: "#D9D9D4",
                    300: "#BFBFB8",
                    400: "#9A9A92",
                    500: "#767670",
                    600: "#565651",
                    700: "#3D3D39",
                    800: "#262624",
                    900: "#161615",
                },
                // Selective bold accent — BeeKL "honey" + electric support.
                // DEFAULT reads a CSS variable so the admin can retheme accents
                // at runtime (falls back to the brand hex when unset).
                honey: {
                    DEFAULT: "var(--bk-honey, #FFC400)",
                    dark: "#E0A800",
                },
                flame: {
                    DEFAULT: "var(--bk-flame, #FF4D2E)",
                    dark: "#E23A1E",
                },

                // Semantic
                success: "#1F9D55",
                warning: "#E0A800",
                danger: "#E23A1E",
                info: "#2563EB",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                display: ["var(--font-clash)", "var(--font-inter)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "ui-monospace", "monospace"],
            },
            fontSize: {
                "display-xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "0.92", letterSpacing: "-0.03em", fontWeight: "800" }],
                "display-lg": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em", fontWeight: "800" }],
                "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
                "display-sm": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
            },
            spacing: {
                18: "4.5rem",
                22: "5.5rem",
                28: "7rem",
            },
            maxWidth: {
                "8xl": "88rem",
            },
            boxShadow: {
                card: "0 1px 2px rgba(10,10,10,0.06), 0 8px 24px rgba(10,10,10,0.06)",
                "card-hover": "0 2px 4px rgba(10,10,10,0.08), 0 16px 40px rgba(10,10,10,0.12)",
                lift: "0 20px 60px rgba(10,10,10,0.18)",
            },
            keyframes: {
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "fade-up": {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "scale-in": {
                    from: { opacity: "0", transform: "scale(0.96)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
                "slide-in-right": {
                    from: { transform: "translateX(100%)" },
                    to: { transform: "translateX(0)" },
                },
                "slide-in-left": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
                marquee: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
                shimmer: {
                    "100%": { transform: "translateX(100%)" },
                },
                "ken-burns": {
                    "0%": { transform: "scale(1) translate3d(0,0,0)" },
                    "100%": { transform: "scale(1.12) translate3d(-1.5%, -1.5%, 0)" },
                },
                "hero-progress": {
                    from: { transform: "scaleX(0)" },
                    to: { transform: "scaleX(1)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.4s ease-out",
                "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                "scale-in": "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-in-left": "slide-in-left 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                marquee: "marquee 30s linear infinite",
                shimmer: "shimmer 1.5s infinite",
                "ken-burns": "ken-burns 7s ease-out forwards",
            },

        },
    },
    plugins: [],
};

export default config;
