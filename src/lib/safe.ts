import "server-only";

/**
 * Run a DB/data query and never throw at the page level. If the database or an
 * external service is unavailable, we return a fallback so pages render an
 * empty/"data unavailable" state instead of a hard crash.
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.error("[safe] query failed:", err);
        }
        return fallback;
    }
}
