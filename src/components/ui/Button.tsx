import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
    primary:
        "bg-ink text-paper hover:bg-charcoal active:bg-black disabled:bg-grey-300",
    secondary:
        "bg-paper-soft text-ink border border-grey-200 hover:bg-paper-muted",
    outline:
        "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper",
    ghost: "bg-transparent text-ink hover:bg-grey-100",
    accent:
        "bg-honey text-ink hover:bg-honey-dark font-bold",
    danger: "bg-flame text-white hover:bg-flame-dark",
};

const sizes: Record<Size, string> = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "h-10 w-10",
};

const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";

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
