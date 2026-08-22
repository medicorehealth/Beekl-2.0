import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
    // Clay-styled ink button: puffy, tactile, presses in on click.
    primary:
        "bk-clay-press text-paper hover:brightness-110 disabled:opacity-50 [background:linear-gradient(145deg,#1a1a1a,#000)] shadow-[8px_8px_20px_rgba(17,20,45,0.25),-6px_-6px_16px_rgba(255,255,255,0.5),inset_2px_2px_5px_rgba(255,255,255,0.12)]",
    // Frosted glass button.
    secondary:
        "bk-glass bk-clay-press text-ink hover:brightness-105",
    outline:
        "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper",
    ghost: "bg-transparent text-ink hover:bg-white/50",
    // Clay-styled honey accent.
    accent:
        "bk-clay-accent bk-clay-press text-ink font-bold hover:brightness-105",
    danger:
        "bk-clay-press text-white [background:linear-gradient(145deg,#ff5c3d,#e23a1e)] shadow-[8px_8px_20px_rgba(226,58,30,0.3),-6px_-6px_16px_rgba(255,255,255,0.5)]",
};

const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "h-10 w-10",
};

const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold uppercase tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";


export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    base,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export interface ButtonLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
}

/** Link styled as a button. */
export function ButtonLink({
    className,
    variant = "primary",
    size = "md",
    fullWidth,
    href,
    ...props
}: ButtonLinkProps) {
    const isExternal = href.startsWith("http");
    const classes = cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
    );
    if (isExternal) {
        return <a href={href} className={classes} {...props} />;
    }
    return <Link href={href} className={classes} {...props} />;
}
