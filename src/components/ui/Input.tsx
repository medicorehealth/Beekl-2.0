import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const inputId = id || props.name;
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey-600"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "h-11 w-full rounded-xl border border-grey-200 bg-white px-4 text-sm text-ink placeholder:text-grey-400 transition-colors",
                        "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10",
                        error && "border-danger focus:border-danger focus:ring-danger/10",
                        className
                    )}
                    {...props}
                />
                {error ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
                ) : hint ? (
                    <p className="mt-1.5 text-xs text-grey-400">{hint}</p>
                ) : null}
            </div>
        );
    }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        label?: string;
        error?: string;
    }
>(({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey-600"
                >
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                ref={ref}
                className={cn(
                    "w-full rounded-xl border border-grey-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-grey-400 transition-colors",
                    "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10",
                    error && "border-danger",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
        </div>
    );
});
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement> & {
        label?: string;
    }
>(({ className, label, id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-grey-600"
                >
                    {label}
                </label>
            )}
            <select
                id={inputId}
                ref={ref}
                className={cn(
                    "h-11 w-full rounded-xl border border-grey-200 bg-white px-4 text-sm text-ink transition-colors",
                    "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10",
                    className
                )}
                {...props}
            >
                {children}
            </select>
        </div>
    );
});
Select.displayName = "Select";
