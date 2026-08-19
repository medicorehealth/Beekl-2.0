"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    side?: "left" | "right";
    footer?: React.ReactNode;
    widthClass?: string;
}

export function Drawer({
    open,
    onClose,
    title,
    children,
    side = "right",
    footer,
    widthClass = "max-w-md",
}: DrawerProps) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) {
            document.addEventListener("keydown", onKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[95]">
            <div
                className="absolute inset-0 bg-ink/60 animate-fade-in"
                onClick={onClose}
                aria-hidden
            />
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    "absolute top-0 flex h-full w-full flex-col bg-white shadow-lift",
                    widthClass,
                    side === "right"
                        ? "right-0 animate-slide-in-right"
                        : "left-0 animate-slide-in-left"
                )}
            >
                <div className="flex items-center justify-between border-b border-grey-100 px-5 py-4">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-grey-500 transition-colors hover:bg-grey-100 hover:text-ink"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
                {footer && (
                    <div className="border-t border-grey-100 bg-paper-soft p-5">{footer}</div>
                )}
            </div>
        </div>,
        document.body
    );
}
