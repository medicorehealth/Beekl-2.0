/** BeeKL brand + config constants (client-safe — no secrets). */

export const SITE = {
    name: "BeeKL",
    tagline: "The Community Makes The Clothes.",
    description:
        "Gen-Z fashion, creator merchandise, community-made drops and internet culture-inspired clothing.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    freeShippingThreshold: 999,
    announcement: "FREE SHIPPING ON ORDERS ABOVE ₹999",
};

/** Primary navigation (main website header). */
export const MAIN_NAV: { label: string; href: string }[] = [
    { label: "MEN", href: "/shop?gender=men" },
    { label: "WOMEN", href: "/shop?gender=women" },
    { label: "TEES", href: "/collections/tees" },
    { label: "HOODIES", href: "/collections/hoodies" },
    { label: "DROPS", href: "/drops" },
    { label: "MEMES", href: "/memes" },
    { label: "MOVIES & TV", href: "/movies-tv" },
    { label: "ANIME", href: "/anime" },
    { label: "CREATORS", href: "/creators" },
    { label: "COMMUNITIES", href: "/communities" },
];

/** Homepage "Shop the Culture" categories. */
export const CATEGORY_CARDS: {
    label: string;
    href: string;
    image: string;
    blurb: string;
}[] = [
        {
            label: "T-SHIRTS",
            href: "/collections/tees",
            image:
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
            blurb: "The daily uniform.",
        },
        {
            label: "OVERSIZED",
            href: "/collections/oversized",
            image:
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
            blurb: "Big fits, bigger energy.",
        },
        {
            label: "HOODIES",
            href: "/collections/hoodies",
            image:
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
            blurb: "Cozy but make it a flex.",
        },
        {
            label: "DROPS",
            href: "/drops",
            image:
                "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
            blurb: "Blink and it's gone.",
        },
        {
            label: "MEMES",
            href: "/memes",
            image:
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
            blurb: "Wearable chaos.",
        },
        {
            label: "ANIME",
            href: "/anime",
            image:
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
            blurb: "For the culture.",
        },
        {
            label: "MOVIES & TV",
            href: "/movies-tv",
            image:
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
            blurb: "Screen to street.",
        },
        {
            label: "CREATOR MERCH",
            href: "/creators",
            image:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
            blurb: "Straight from the source.",
        },
    ];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const SORT_OPTIONS = [
    { value: "recommended", label: "Recommended" },
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
] as const;

export const FOOTER_LINKS = {
    shop: [
        { label: "New Drops", href: "/drops" },
        { label: "Memes", href: "/memes" },
        { label: "Anime", href: "/anime" },
        { label: "Movies & TV", href: "/movies-tv" },
        { label: "Creator Merch", href: "/creators" },
        { label: "All Products", href: "/shop" },
    ],
    community: [
        { label: "Creators", href: "/creators" },
        { label: "Communities", href: "/communities" },
        { label: "Monthly Contest", href: "/contest" },
        { label: "Submit an Idea", href: "/contest" },
        { label: "Become a Creator", href: "/register?as=creator" },
    ],
    help: [
        { label: "Contact", href: "/contact" },
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
    ],
};

export const SOCIALS = [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "X", href: "https://x.com" },
];
