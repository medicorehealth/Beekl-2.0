export function CategoryHero({
    kicker,
    title,
    description,
    image,
    tone = "dark",
}: {
    kicker?: string;
    title: string;
    description?: string;
    image?: string;
    tone?: "dark" | "flame";
}) {
    return (
        <section
            className={
                "relative flex min-h-[300px] items-end overflow-hidden " +
                (tone === "flame" ? "bg-flame" : "bg-ink")
            }
        >
            {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
            <div className="bk-container relative z-10 py-12">
                {kicker && (
                    <span className="bk-kicker mb-2 text-honey">{kicker}</span>
                )}
                <h1 className="font-display text-display-md text-paper text-balance">
                    {title}
                </h1>
                {description && (
                    <p className="mt-3 max-w-xl text-paper/70">{description}</p>
                )}
            </div>
        </section>
    );
}
