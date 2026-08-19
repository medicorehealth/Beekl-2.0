import type { Metadata } from "next";
import { LegalPage } from "../legal-content";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
    return (
        <LegalPage title="Terms of Service">
            <p>
                By using BeeKL you agree to these placeholder terms. Replace with your
                finalized terms before launch.
            </p>
            <h2>Accounts</h2>
            <p>
                You are responsible for your account and for keeping your credentials
                secure. Roles and access are managed by BeeKL.
            </p>
            <h2>Creator content & IP</h2>
            <p>
                Creators must own or be properly licensed for everything they submit.
                BeeKL only produces original or properly licensed designs and removes
                infringing content.
            </p>
            <h2>Orders & commissions</h2>
            <p>
                Purchases are fulfilled via Shopify and our print/fulfilment partners.
                Creator commissions are calculated and paid according to the configured
                commission system.
            </p>
            <h2>Prohibited use</h2>
            <p>
                No hateful, infringing or illegal content. We reserve the right to
                suspend accounts that violate these terms.
            </p>
        </LegalPage>
    );
}
