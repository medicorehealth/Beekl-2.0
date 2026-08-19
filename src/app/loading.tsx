import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-paper">
            <div className="flex flex-col items-center gap-3 text-grey-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-display text-lg font-bold tracking-tight text-ink">
                    BEE<span className="text-flame">KL</span>
                </span>
            </div>
        </div>
    );
}
