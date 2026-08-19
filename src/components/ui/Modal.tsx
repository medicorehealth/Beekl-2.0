"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
    footer?: React.ReactNode;
}

const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    size = "md",
    footer,
}: ModalProps) {
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-ink/60 animate-fade-in"
                onClick={onClose}
                aria-hidden
            />
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    "relative z-10 w-full overflow-hidden rounded-2xl bg-white shadow-lift animate-scale-in",
                    sizes[size]
                )}
            >
                <div className="flex items-start justify-between border-b border-grey-100 p-5">
                    <div>
                        {title && <h2 className="text-lg font-bold text-ink">{title}</h2>}
                        {description && (
                            <p className="mt-1 text-sm text-grey-500">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-grey-500 transition-colors hover:bg-grey-100 hover:text-ink"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
                {footer && (
                    <div className="flex items-center justify-end gap-3 border-t border-grey-100 bg-paper-soft p-5">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
