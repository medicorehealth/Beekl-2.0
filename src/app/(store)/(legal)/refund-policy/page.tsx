import type { Metadata } from "next";
import { LegalPage } from "../legal-content";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
    return (
        <LegalPage title="Refund Policy">
            <p>Placeholder refund policy. Replace with finalized terms before launch.</p>
            <h2>Returns</h2>
            <p>
                Unworn items with tags may be returned within 7 days of delivery.
                Made-to-order / print-on-demand items may have different eligibility.
            </p>
            <h2>Refunds</h2>
            <p>
                Approved refunds are issued to the original payment method via Shopify.
                Processing times depend on your bank.
            </p>
            <h2>Exchanges</h2>
            <p>Size exchanges are subject to availability.</p>
        </LegalPage>
    );
}
