import Link from "next/link";
import { ArrowUpRight, Users, Sparkles } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// CategoryCard — big visual card for "Shop the Culture"
// ---------------------------------------------------------------------------
export function CategoryCard({
    label,
    href,
    image,
    blurb,
    className,
}: {
    label: string;
    href: string;
    image: string;
    blurb?: string;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "group relative flex aspect-square items-end overflow-hidden rounded-2xl bg-ink",
                className
            )}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={image}
                alt={label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <div className="relative z-10 p-5">
                <h3 className="font-display text-xl font-bold text-paper">{label}</h3>
                {blurb && <p className="mt-0.5 text-xs text-paper/70">{blurb}</p>}
            </div>
            <span className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
            </span>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// CollectionCard
// ---------------------------------------------------------------------------
export function CollectionCard({
    title,
    slug,
    image,
    count,
}: {
    title: string;
    slug: string;
    image?: string | null;
    count?: number;
}) {
    return (
        <Link
            href={`/collections/${slug}`}
            className="group relative flex aspect-[4/5] items-end overflow-hidden rounded-2xl bg-charcoal"
        >
            {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
            <div className="relative z-10 p-5">
                <h3 className="font-display text-2xl font-bold text-paper">{title}</h3>
                {typeof count === "number" && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-paper/60">
                        {count} {count === 1 ? "piece" : "pieces"}
                    </p>
                )}
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// CreatorCard
// ---------------------------------------------------------------------------
export function CreatorCard({
    handle,
    displayName,
    avatarImage,
    bannerImage,
    isFeatured,
    productCount,
}: {
    handle: string;
    displayName: string;
    avatarImage?: string | null;
    bannerImage?: string | null;
    isFeatured?: boolean;
    productCount?: number;
}) {
    return (
        <Link
            href={`/creators/${handle}`}
            className="group block overflow-hidden rounded-2xl border border-grey-200 bg-white transition-all hover:-translate-y-1 hover:shadow-card-hover"
        >
            <div className="relative h-28 bg-gradient-to-br from-charcoal to-ink">
                {bannerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={bannerImage}
                        alt=""
                        className="h-full w-full object-cover opacity-80"
                    />
                )}
                {isFeatured && (
                    <Badge tone="honey" className="absolute right-3 top-3">
                        <Sparkles className="h-3 w-3" /> Featured
                    </Badge>
                )}
            </div>
            <div className="px-5 pb-5">
                <div className="-mt-8 mb-3 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-grey-100">
                    {avatarImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarImage} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-ink text-sm font-bold text-paper">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <h3 className="text-base font-bold text-ink">{displayName}</h3>
                <p className="text-xs text-grey-400">@{handle}</p>
                {typeof productCount === "number" && (
                    <p className="mt-2 text-xs font-semibold text-grey-500">
                        {productCount} {productCount === 1 ? "product" : "products"}
                    </p>
                )}
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// CommunityCard
// ---------------------------------------------------------------------------
export function CommunityCard({
    slug,
    name,
    description,
    bannerImage,
    memberCount,
    creatorName,
}: {
    slug: string;
    name: string;
    description?: string | null;
    bannerImage?: string | null;
    memberCount?: number;
    creatorName?: string;
}) {
    return (
        <Link
            href={`/communities/${slug}`}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-ink"
        >
            {bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={bannerImage}
                    alt={name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="relative z-10 p-5">
                {creatorName && (
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-honey">
                        by {creatorName}
                    </p>
                )}
                <h3 className="font-display text-2xl font-bold text-paper">{name}</h3>
                {description && (
                    <p className="mt-1 line-clamp-2 text-sm text-paper/70">{description}</p>
                )}
                {typeof memberCount === "number" && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-paper/60">
                        <Users className="h-3.5 w-3.5" />
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                    </p>
                )}
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// DropCard
// ---------------------------------------------------------------------------
export function DropCard({
    slug,
    name,
    status,
    bannerImage,
    releaseAt,
    creatorName,
}: {
    slug: string;
    name: string;
    status: string;
    bannerImage?: string | null;
    releaseAt?: Date | string | null;
    creatorName?: string | null;
}) {
    return (
        <Link
            href={`/drops/${slug}`}
            className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl bg-ink p-5"
        >
            {bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={bannerImage}
                    alt={name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
            <div className="relative z-10 flex justify-between">
                <Badge tone={statusTone(status)} dot>
                    {status}
                </Badge>
            </div>
            <div className="relative z-10">
                {creatorName && (
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-honey">
                        {creatorName}
                    </p>
                )}
                <h3 className="font-display text-2xl font-bold text-paper">{name}</h3>
                {releaseAt && status === "UPCOMING" && (
                    <p className="mt-1 text-xs text-paper/70">
                        Drops {formatDate(releaseAt)}
                    </p>
                )}
            </div>
        </Link>
    );
}

// ---------------------------------------------------------------------------
// ContestCard
// ---------------------------------------------------------------------------
export function ContestCard({
    slug,
    title,
    tagline,
    status,
    bannerImage,
    endAt,
}: {
    slug: string;
    title: string;
    tagline?: string | null;
    status: string;
    bannerImage?: string | null;
    endAt?: Date | string | null;
}) {
    return (
        <Link
            href="/contest"
            className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl bg-flame p-6"
        >
            {bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={bannerImage}
                    alt={title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                />
            )}
            <div className="relative z-10">
                <Badge tone="paper" className="mb-3">
                    Contest · {status}
                </Badge>
                <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
                {tagline && <p className="mt-1 text-sm text-white/80">{tagline}</p>}
                {endAt && (
                    <p className="mt-2 text-xs font-semibold text-white/70">
                        Closes {formatDate(endAt)}
                    </p>
                )}
            </div>
        </Link>
    );
}
