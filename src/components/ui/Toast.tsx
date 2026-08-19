"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";
type Toast = { id: string; message: string; type: ToastType };

type ToastContextValue = {
    toast: (message: string, type?: ToastType) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) {
        // Graceful no-op if used outside provider (avoids crashes).
        return { toast: () => { } };
    }
    return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <Check className="h-4 w-4" />,
    error: <X className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
};

const styles: Record<ToastType, string> = {
    success: "bg-ink text-paper",
    error: "bg-flame text-white",
    warning: "bg-honey text-ink",
    info: "bg-charcoal text-paper",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const toast = React.useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {mounted &&
                createPortal(
                    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
                        {toasts.map((t) => (
                            <div
                                key={t.id}
                                className={cn(
                                    "pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lift animate-fade-up",
                                    styles[t.type]
                                )}
                                role="status"
                            >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                                    {icons[t.type]}
                                </span>
                                <span className="flex-1">{t.message}</span>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </ToastContext.Provider>
    );
}
