import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { SITE } from "@/lib/constants";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

// BeeKL is a fully database- and session-driven app. Render everything
// dynamically at request time so Vercel never statically exports pages at
// build time (which caused "/_not-found" and "/unauthorized" export errors
// because they run before env/DB/runtime context exists).
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: {
        default: `${SITE.name} — The Community Makes The Clothes.`,
        template: `%s — ${SITE.name}`,
    },
    description: SITE.description,
    keywords: [
        "Gen-Z fashion",
        "creator merchandise",
        "meme clothing",
        "streetwear India",
        "community drops",
        "BeeKL",
    ],
    authors: [{ name: "BeeKL" }],
    openGraph: {
        type: "website",
        siteName: SITE.name,
        title: `${SITE.name} — The Community Makes The Clothes.`,
        description: SITE.description,
        url: SITE.url,
    },
    twitter: {
        card: "summary_large_image",
        title: `${SITE.name} — The Community Makes The Clothes.`,
        description: SITE.description,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
