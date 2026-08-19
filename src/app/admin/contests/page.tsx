import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Contests", robots: { index: false } };

export default async function AdminContestsPage() {
    await requirePermission("contests.view", "/admin/contests");

    const contests = await safe(
        () =>
            prisma.contest.findMany({
                orderBy: { createdAt: "desc" },
                include: { _count: { select: { submissions: true } } },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Contests" subtitle="Monthly design contests and submissions." />

            {contests.length === 0 ? (
                <EmptyState
                    title="No contests yet."
                    description="Seed a contest or create one to start collecting community ideas."
                />
            ) : (
                <div className="space-y-3">
                    {contests.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-grey-200 bg-white p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-ink">{c.title}</h3>
                                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                                    </div>
                                    <p className="text-xs text-grey-400">
                                        {c._count.submissions} submissions
                                        {c.endAt && ` · closes ${formatDate(c.endAt)}`}
                                        {c.prize && ` · Prize: ${c.prize}`}
                                    </p>
                                </div>
                            </div>
                            {c.tagline && <p className="mt-2 text-sm text-grey-600">{c.tagline}</p>}
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-6 text-xs text-grey-400">
                Contest lifecycle: DRAFT → OPEN (accepting entries) → VOTING → JUDGING →
                ENDED. Winners are published from the submissions list.
            </p>
        </div>
    );
}
