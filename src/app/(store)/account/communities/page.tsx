import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/safe";
import { AccountShell } from "@/components/dashboard/AccountNav";
import { CommunityCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/States";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "My Communities", robots: { index: false } };

export default async function AccountCommunitiesPage() {
    const user = await requireUser("/account/communities");
    const memberships = await safe(
        () =>
            prisma.communityMember.findMany({
                where: { userId: user.id },
                orderBy: { joinedAt: "desc" },
                include: {
                    community: {
                        include: {
                            creator: { select: { displayName: true } },
                            _count: { select: { members: true } },
                        },
                    },
                },
            }),
        []
    );

    return (
        <AccountShell title="My Account" subtitle="Communities you've joined.">
            <h2 className="mb-4 text-lg font-bold text-ink">Communities</h2>
            {memberships.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {memberships.map((m) => (
                        <CommunityCard
                            key={m.id}
                            slug={m.community.slug}
                            name={m.community.name}
                            description={m.community.description}
                            bannerImage={m.community.bannerImage}
                            memberCount={m.community._count.members}
                            creatorName={m.community.creator.displayName}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<Users className="h-6 w-6" />}
                    title="You haven't joined any communities."
                    description="Follow creators to join their world and be first for drops."
                    action={{ label: "Explore communities", href: "/communities" }}
                />
            )}
        </AccountShell>
    );
}
