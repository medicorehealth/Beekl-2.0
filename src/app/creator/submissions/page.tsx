import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { CreatorShell } from "@/components/dashboard/CreatorNav";
import { SubmitDesignForm } from "@/components/dashboard/SubmitDesignForm";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Creator · Submissions", robots: { index: false } };

export default async function CreatorSubmissionsPage() {
    const user = await getCurrentUser();

    const [submissions, communities] = await Promise.all([
        safe(
            () =>
                prisma.designSubmission.findMany({
                    where: { userId: user!.id },
                    orderBy: { createdAt: "desc" },
                }),
            []
        ),
        safe(
            () =>
                prisma.community.findMany({
                    where: { creator: { userId: user!.id } },
                    select: { id: true, name: true },
                }),
            []
        ),
    ]);

    return (
        <CreatorShell title="Submissions" subtitle="Design ideas you've sent for review.">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-grey-500">
                    {submissions.length} {submissions.length === 1 ? "submission" : "submissions"}
                </p>
                <SubmitDesignForm communities={communities} />
            </div>

            {submissions.length ? (
                <div className="space-y-3">
                    {submissions.map((s) => (
                        <div
                            key={s.id}
                            className="flex items-center gap-4 rounded-2xl border border-grey-200 bg-white p-4"
                        >
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-grey-100">
                                {s.images[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={s.images[0]} alt="" className="h-full w-full object-cover" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate font-bold text-ink">{s.title}</h3>
                                <p className="text-xs text-grey-400">
                                    {s.category ?? "Uncategorized"} · {formatDate(s.createdAt)}
                                </p>
                            </div>
                            <Badge tone={statusTone(s.status)}>{s.status.replace(/_/g, " ")}</Badge>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No submissions yet."
                    description="Send your first design idea. If it's approved, BeeKL turns it into a product."
                />
            )}
        </CreatorShell>
    );
}
