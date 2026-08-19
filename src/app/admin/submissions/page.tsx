import type { Metadata } from "next";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ActionButton } from "@/components/admin/ActionButtons";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Submissions", robots: { index: false } };

export default async function AdminSubmissionsPage() {
    const user = await requirePermission("submissions.view", "/admin/submissions");
    const canModerate = user.permissions.includes("submissions.moderate");

    const submissions = await safe(
        () =>
            prisma.designSubmission.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    community: { select: { name: true } },
                },
            }),
        []
    );

    return (
        <div className="p-5 md:p-8">
            <AdminHeader title="Submissions" subtitle="Review community design ideas." />

            {submissions.length === 0 ? (
                <EmptyState title="No submissions yet." description="Design ideas from the community appear here." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {submissions.map((s) => (
                        <div key={s.id} className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                            <div className="relative aspect-video bg-grey-100">
                                {s.images[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={s.images[0]} alt={s.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-2xl font-bold text-grey-300">
                                        {initials(s.title)}
                                    </div>
                                )}
                                <Badge tone={statusTone(s.status)} className="absolute left-2 top-2">
                                    {s.status.replace(/_/g, " ")}
                                </Badge>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-ink">{s.title}</h3>
                                <p className="text-xs text-grey-400">
                                    {s.user.name ?? s.user.email} · {formatDate(s.createdAt)}
                                    {s.community && ` · ${s.community.name}`}
                                </p>
                                {s.description && (
                                    <p className="mt-2 line-clamp-2 text-sm text-grey-600">{s.description}</p>
                                )}

                                {canModerate && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {s.status !== "CONVERTED_TO_PRODUCT" && (
                                            <>
                                                <ActionButton
                                                    endpoint="/api/admin/submissions"
                                                    body={{ submissionId: s.id, action: "approve" }}
                                                    label="Approve"
                                                    successMessage="Approved."
                                                />
                                                <ActionButton
                                                    endpoint="/api/admin/submissions"
                                                    body={{ submissionId: s.id, action: "reject" }}
                                                    label="Reject"
                                                    variant="outline"
                                                    successMessage="Rejected."
                                                />
                                                <ActionButton
                                                    endpoint="/api/admin/submissions"
                                                    body={{ submissionId: s.id, action: "convert" }}
                                                    label="Convert"
                                                    variant="accent"
                                                    confirm="Convert this into a draft product?"
                                                    successMessage="Converted to product."
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
