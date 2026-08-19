import type { Metadata } from "next";
import { LegalPage } from "../legal-content";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy">
            <p>
                BeeKL respects your privacy. This placeholder describes, at a high
                level, how we would handle personal data. Replace with your finalized
                policy before launch.
            </p>
            <h2>What we collect</h2>
            <ul>
                <li>Account details (name, email, phone) you provide.</li>
                <li>Order and delivery information processed via Shopify.</li>
                <li>Basic usage analytics to improve the experience.</li>
            </ul>
            <h2>How we use it</h2>
            <p>
                To fulfil orders, operate creator communities, process commissions and
                improve BeeKL. We never sell your personal data.
            </p>
            <h2>Payments</h2>
            <p>
                Payments are processed securely by Shopify checkout. BeeKL does not
                store your card details.
            </p>
            <h2>Contact</h2>
            <p>Questions? Reach us via the Contact page.</p>
        </LegalPage>
    );
}
