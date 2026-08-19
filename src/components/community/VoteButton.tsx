"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

/** Vote toggle for a contest submission (only active during VOTING). */
export function VoteButton({
    submissionId,
    initialCount,
    disabled,
}: {
    submissionId: string;
    initialCount: number;
    disabled?: boolean;
}) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [count, setCount] = React.useState(initialCount);
    const [voted, setVoted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    async function vote() {
        if (disabled) {
            toast("Voting isn't open right now.", "info");
            return;
        }
        if (!session?.user) {
            toast("Sign in to vote.", "info");
            return;
        }
        setLoading(true);
        // Optimistic
        setVoted((v) => !v);
        setCount((c) => (voted ? c - 1 : c + 1));
        try {
            const res = await fetch("/api/contest/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contestSubmissionId: submissionId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error();
            setVoted(data.voted);
        } catch {
            // revert
            setVoted((v) => !v);
            setCount((c) => (voted ? c + 1 : c - 1));
            toast("Couldn't record your vote.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={vote}
            disabled={loading}
            className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors",
                voted
                    ? "border-flame bg-flame/10 text-flame"
                    : "border-grey-200 text-ink hover:border-ink"
            )}
        >
            <Heart className={cn("h-4 w-4", voted && "fill-flame")} />
            {count}
        </button>
    );
}
