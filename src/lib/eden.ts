import { treaty } from "@elysiajs/eden";
import type { app } from "@/app/api/[[...slugs]]/route";

// Create the API client using only the type
// This avoids importing server-side code into client bundles
// Access .api to use the /api prefix from the Elysia app
export const api = treaty<typeof app>(
	typeof window === "undefined"
		? (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
		: window.location.origin,
).api;
