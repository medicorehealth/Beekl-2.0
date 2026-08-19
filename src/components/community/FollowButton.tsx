"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** Join/Follow a community. Requires auth; persists membership server-side. */
export function FollowButton({
    communityId,
    initialJoined = false,
}: {
    communityId: string;
    initialJoined?: boolean;
}) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [joined, setJoined] = React.useState(initialJoined);
    const [loading, setLoading] = React.useState(false);

    async function toggle() {
        if (!session?.user) {
            toast("Sign in to join communities.", "info");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/community/join", {
                method: joined ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ communityId }),
            });
            if (!res.ok) throw new Error();
            setJoined((v) => !v);
            toast(joined ? "Left community." : "Joined community!", "success");
        } catch {
            toast("Something went wrong. Try again.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant={joined ? "secondary" : "primary"}
            size="sm"
            onClick={toggle}
            disabled={loading}
        >
            {joined ? (
                <>
                    <Check className="h-4 w-4" /> Joined
                </>
            ) : (
                <>
                    <Plus className="h-4 w-4" /> Join
                </>
            )}
        </Button>
    );
}
