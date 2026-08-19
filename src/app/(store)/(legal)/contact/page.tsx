import type { Metadata } from "next";
import { Mail, Instagram, MessageCircle } from "lucide-react";
import { SITE, SOCIALS } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with the BeeKL team.",
};

export default function ContactPage() {
    return (
        <div className="bk-container max-w-3xl py-12">
            <span className="bk-kicker mb-2">We're listening</span>
            <h1 className="font-display text-display-sm text-ink">Contact BeeKL</h1>
            <p className="mt-3 text-grey-600">
                Questions about an order, a collab, or want to bring your community to
                BeeKL? Reach out.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <ContactCard
                    icon={<Mail className="h-5 w-5" />}
                    label="Email"
                    value="hello@beekl.example"
                    href="mailto:hello@beekl.example"
                />
                <ContactCard
                    icon={<Instagram className="h-5 w-5" />}
                    label="Instagram"
                    value="@beekl"
                    href={SOCIALS[0].href}
                />
                <ContactCard
                    icon={<MessageCircle className="h-5 w-5" />}
                    label="Support"
                    value="Help Center"
                    href="/shipping-policy"
                />
            </div>

            <div className="mt-10 rounded-2xl border border-grey-200 bg-paper-soft p-6 text-sm text-grey-500">
                <p>
                    BeeKL — {SITE.tagline} We aim to respond within 2 business days.
                </p>
            </div>
        </div>
    );
}

function ContactCard({
    icon,
    label,
    value,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
}) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto");
    return (
        <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="rounded-2xl border border-grey-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover"
        >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper">
                {icon}
            </div>
            <p className="text-xs uppercase tracking-wide text-grey-400">{label}</p>
            <p className="font-bold text-ink">{value}</p>
        </a>
    );
}
