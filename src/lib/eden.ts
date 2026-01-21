import { treaty } from "@elysiajs/eden";
import type { app } from "@/app/api/[[...slugs]]/route";
import { env } from "@/env";

// Create the API client using only the type
// This avoids importing server-side code into client bundles
// Access .api to use the /api prefix from the Elysia app
export const api = treaty<typeof app>(
	typeof window === "undefined"
		? (env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000")
		: window.location.origin,
).api;
