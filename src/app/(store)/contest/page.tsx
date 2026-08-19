import type { Metadata } from "next";
import { Trophy, Lightbulb, Users, Rocket, Award } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { ContestEntryForm } from "@/components/community/ContestEntryForm";
import { VoteButton } from "@/components/community/VoteButton";
import { safe } from "@/lib/safe";
import { prisma } from "@/lib/db";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Monthly Contest",
    description:
        "You have the idea. We'll make the drop. Submit your design idea to BeeKL's monthly contest — the community votes and winners become real drops.",
};

export const revalidate = 30;

export default async function ContestPage() {
    const contest = await safe(
        () =>
            prisma.contest.findFirst({
                where: { status: { in: ["OPEN", "VOTING", "JUDGING", "ENDED"] } },
                orderBy: { startAt: "desc" },
                include: {
                    submissions: {
                        orderBy: { voteCount: "desc" },
                        take: 24,
                        include: { user: { select: { name: true } } },
                    },
                },
            }),
        null
    );

    const pastWinners = await safe(
        () =>
            prisma.contestSubmission.findMany({
                where: { status: "WINNER" },
                orderBy: { updatedAt: "desc" },
                take: 6,
                include: {
                    user: { select: { name: true } },
                    contest: { select: { title: true } },
                },
            }),
        []
    );

    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-flame text-white">
                <div className="bk-container py-16 md:py-20">
                    <Badge tone="paper" className="mb-4">
                        <Trophy className="h-3.5 w-3.5" /> Monthly Contest
                    </Badge>
                    <h1 className="max-w-3xl font-display text-display-lg text-white text-balance">
                        You have the idea. <br /> We&apos;ll make the drop.
                    </h1>
                    <p className="mt-4 max-w-lg text-lg text-white/80">
                        Submit your design idea. The community votes. BeeKL turns the winner
                        into a real limited drop — and you get the reward.
                    </p>
                    {contest && contest.status === "OPEN" && (
                        <div className="mt-8">
                            <ContestEntryForm contestId={contest.id} />
                        </div>
                    )}
                </div>
            </section>

            <div className="bk-container space-y-14 py-12">
                {/* How it works */}
                <section>
                    <h2 className="mb-6 font-display text-2xl font-bold text-ink">How it works</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <Step icon={<Lightbulb />} n="1" title="Submit" body="Drop your idea + a reference." />
                        <Step icon={<Users />} n="2" title="Community votes" body="The internet decides." />
                        <Step icon={<Award />} n="3" title="BeeKL selects" body="We pick from the top voted." />
                        <Step icon={<Rocket />} n="4" title="It becomes a drop" body="Produced as a limited run." />
                        <Step icon={<Trophy />} n="5" title="You win" body="Winner gets the configured reward." />
                    </div>
                </section>

                {/* Current contest */}
                {contest ? (
                    <section>
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <Badge tone={statusTone(contest.status)} dot className="mb-2">
                                    {contest.status}
                                </Badge>
                                <h2 className="font-display text-2xl font-bold text-ink">
                                    {contest.title}
                                </h2>
                                {contest.tagline && (
                                    <p className="text-grey-500">{contest.tagline}</p>
                                )}
                            </div>
                            <div className="text-right text-sm text-grey-500">
                                {contest.status === "OPEN" && contest.endAt && (
                                    <p>Submissions close {formatDate(contest.endAt)}</p>
                                )}
                                {contest.status === "VOTING" && contest.votingEndAt && (
                                    <p>Voting closes {formatDate(contest.votingEndAt)}</p>
                                )}
                                {contest.prize && (
                                    <p className="font-bold text-ink">Prize: {contest.prize}</p>
                                )}
                            </div>
                        </div>

                        {contest.rules && (
                            <div className="mb-8 rounded-2xl border border-grey-200 bg-paper-soft p-5">
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-grey-500">
                                    Rules
                                </h3>
                                <p className="whitespace-pre-line text-sm text-grey-600">
                                    {contest.rules}
                                </p>
                            </div>
                        )}

                        {/* Submissions / voting */}
                        <h3 className="mb-4 font-display text-xl font-bold text-ink">
                            {contest.status === "VOTING" ? "Vote for your favourites" : "Submissions"}
                        </h3>
                        {contest.submissions.length ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {contest.submissions.map((s) => (
                                    <div key={s.id} className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                                        <div className="relative aspect-square bg-grey-100">
                                            {s.images[0] ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={s.images[0]} alt={s.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-2xl font-bold text-grey-300">
                                                    {initials(s.title)}
                                                </div>
                                            )}
                                            {s.status === "WINNER" && (
                                                <Badge tone="honey" className="absolute left-2 top-2">
                                                    <Trophy className="h-3 w-3" /> Winner
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="line-clamp-1 text-sm font-bold text-ink">{s.title}</h4>
                                            <p className="mb-2 text-xs text-grey-400">
                                                by {s.user.name ?? "Anonymous"}
                                            </p>
                                            <VoteButton
                                                submissionId={s.id}
                                                initialCount={s.voteCount}
                                                disabled={contest.status !== "VOTING"}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No submissions yet."
                                description={
                                    contest.status === "OPEN"
                                        ? "Be the first to submit an idea."
                                        : "Submissions will appear here."
                                }
                            />
                        )}
                    </section>
                ) : (
                    <EmptyState
                        title="No active contest right now."
                        description="Our next monthly contest is being prepared. Check back soon — or start a community and drop merch anytime."
                        action={{ label: "Become a Creator", href: "/register?as=creator" }}
                    />
                )}

                {/* Past winners */}
                {pastWinners.length > 0 && (
                    <section>
                        <h2 className="mb-6 font-display text-2xl font-bold text-ink">Previous winners</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {pastWinners.map((w) => (
                                <div key={w.id} className="overflow-hidden rounded-2xl border border-grey-200 bg-white">
                                    <div className="relative aspect-square bg-grey-100">
                                        {w.images[0] && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={w.images[0]} alt={w.title} className="h-full w-full object-cover" />
                                        )}
                                        <Badge tone="honey" className="absolute left-2 top-2">
                                            <Trophy className="h-3 w-3" />
                                        </Badge>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="line-clamp-1 text-sm font-bold text-ink">{w.title}</h4>
                                        <p className="text-xs text-grey-400">{w.contest.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function Step({
    icon,
    n,
    title,
    body,
}: {
    icon: React.ReactNode;
    n: string;
    title: string;
    body: string;
}) {
    return (
        <div className="rounded-2xl border border-grey-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                    {n}
                </span>
                <span className="text-flame">{icon}</span>
            </div>
            <h3 className="font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-grey-500">{body}</p>
        </div>
    );
}
