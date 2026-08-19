import type { Metadata } from "next";
import { LegalPage } from "../legal-content";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
    return (
        <LegalPage title="Shipping Policy">
            <p>Placeholder shipping policy. Replace with finalized terms before launch.</p>
            <h2>Delivery</h2>
            <p>
                {SITE.announcement}. Orders are typically dispatched within 2–4 business
                days. Delivery timelines depend on your location and courier.
            </p>
            <h2>Tracking</h2>
            <p>
                Once your order ships, tracking details are shared via email and appear
                in your account order history (powered by Shopify fulfilment).
            </p>
            <h2>Print-on-demand items</h2>
            <p>
                Some community/creator items are produced on demand and may take a few
                extra days before dispatch.
            </p>
        </LegalPage>
    );
}
