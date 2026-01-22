import { and, count, eq } from "drizzle-orm";
import Elysia from "elysia";
import z from "zod";
import { MAX_API_KEYS_PER_USER } from "@/config";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import { apiKeyTable, userSettingsTable } from "../db/schema";
import { apiKeySchema, paramIdSchema } from "../schemas";
import { getUserId } from "./auth";

// Generate a secure API key
function generateApiKey(): string {
	const prefix = "pk_live_";
	const randomBytes = crypto.getRandomValues(new Uint8Array(24));
	const key = Array.from(randomBytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return `${prefix}${key}`;
}

// Mask API key for display (show first 8 and last 4 chars)
function maskApiKey(key: string): string {
	if (key.length <= 16) return key;
	return `${key.slice(0, 12)}${"•".repeat(8)}${key.slice(-4)}`;
}

export const apiKeyRouter = new Elysia({
	prefix: "/apikeys",
	tags: ["api-keys"],
})
	// Create API key
	.post(
		"/",
		async ({ body, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Check if user has reached the limit
				const [keyCount] = await db
					.select({ count: count() })
					.from(apiKeyTable)
					.where(eq(apiKeyTable.userId, userId));

				if (keyCount && keyCount.count >= MAX_API_KEYS_PER_USER) {
					return {
						success: false as const,
						error: `Maximum of ${MAX_API_KEYS_PER_USER} API keys allowed per user`,
					};
				}

				// Generate new API key
				const newApiKey = generateApiKey();

				// Insert into database
				await db.insert(apiKeyTable).values({
					userId,
					name: body.name,
					description: body.description,
					key: newApiKey,
				});

				return {
					success: true as const,
					key: newApiKey,
				};
			});

			if (error) {
				console.error("Error creating API key:", { error, userId });
				return status(500, { error: "Failed to create API key" });
			}

			if (!result.success) {
				console.error("Error creating API key:", {
					error: result.error,
					userId,
				});
				return status(400, { error: result.error });
			}

			return status(201, { success: true, key: result.key });
		},
		{
			body: apiKeySchema,
		},
	)

	// List all API keys for user
	.get("/", async ({ status }) => {
		const userId = await getUserId();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [keys, error] = await tryCatchAsync(async () => {
			const apiKeys = await db
				.select({
					id: apiKeyTable.id,
					name: apiKeyTable.name,
					description: apiKeyTable.description,
					key: apiKeyTable.key,
					active: apiKeyTable.active,
					lastUsedAt: apiKeyTable.lastUsedAt,
					createdAt: apiKeyTable.createdAt,
				})
				.from(apiKeyTable)
				.innerJoin(
					userSettingsTable,
					eq(apiKeyTable.userId, userSettingsTable.userId),
				)
				.where(eq(apiKeyTable.userId, userId))
				.orderBy(apiKeyTable.createdAt);

			// Mask API keys for security
			return apiKeys.map(({ key, ...rest }) => ({
				...rest,
				key: maskApiKey(key),
			}));
		});

		if (error) {
			console.error("Error listing API keys:", { error, userId });
			return status(500, { error: "Failed to list API keys" });
		}

		return status(200, keys);
	})

	// Get single API key
	.get(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [key, error] = await tryCatchAsync(async () => {
				const [apiKey] = await db
					.select({
						id: apiKeyTable.id,
						name: apiKeyTable.name,
						description: apiKeyTable.description,
						key: apiKeyTable.key,
						active: apiKeyTable.active,
						lastUsedAt: apiKeyTable.lastUsedAt,
						createdAt: apiKeyTable.createdAt,
					})
					.from(apiKeyTable)
					.innerJoin(
						userSettingsTable,
						eq(apiKeyTable.userId, userSettingsTable.userId),
					)
					.where(
						and(
							eq(apiKeyTable.id, Number(params.id)),
							eq(apiKeyTable.userId, userId),
						),
					)
					.limit(1);

				if (!apiKey) {
					return null;
				}

				return {
					...apiKey,
					key: maskApiKey(apiKey.key),
				};
			});

			if (error) {
				console.error("Error getting API key:", { error, params, userId });
				return status(500, { error: "Failed to get API key" });
			}

			if (!key) {
				console.error("API key not found:", { params, userId });
				return status(404, { error: "API key not found" });
			}

			return status(200, key);
		},
		{
			params: paramIdSchema,
		},
	)

	// Update API key (name and description only)
	.put(
		"/:id",
		async ({ params, body, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Check if key exists and belongs to user
				const [existing] = await db
					.select({ id: apiKeyTable.id })
					.from(apiKeyTable)
					.where(
						and(eq(apiKeyTable.id, params.id), eq(apiKeyTable.userId, userId)),
					)
					.limit(1);

				if (!existing) {
					return { found: false as const };
				}

				// Update the key
				await db
					.update(apiKeyTable)
					.set({
						name: body.name,
						description: body.description,
					})
					.where(
						and(eq(apiKeyTable.id, params.id), eq(apiKeyTable.userId, userId)),
					);

				return {
					found: true as const,
				};
			});

			if (error) {
				console.error("Error updating API key:", { error, userId });
				return status(500, { error: "Failed to update API key" });
			}

			if (!result.found) {
				console.error("API key not found:", { params, userId });
				return status(404, { error: "API key not found" });
			}

			return status(200, { success: true });
		},
		{
			params: paramIdSchema,
			body: z.object({
				name: z.string().min(1).max(255),
				description: z.string().max(500).optional(),
			}),
		},
	)

	// Delete API key
	.delete(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Check if key exists and belongs to user
				const [existing] = await db
					.select({ id: apiKeyTable.id })
					.from(apiKeyTable)
					.where(
						and(eq(apiKeyTable.id, params.id), eq(apiKeyTable.userId, userId)),
					)
					.limit(1);

				if (!existing) {
					return { found: false };
				}

				// Delete the key
				await db
					.delete(apiKeyTable)
					.where(
						and(eq(apiKeyTable.id, params.id), eq(apiKeyTable.userId, userId)),
					);

				return { found: true };
			});

			if (error) {
				console.error("Error deleting API key:", { error, userId });
				return status(500, { error: "Failed to delete API key" });
			}

			if (!result.found) {
				console.error("API key not found:", { params, userId });
				return status(404, { error: "API key not found" });
			}

			return status(200, { success: true });
		},
		{
			params: paramIdSchema,
		},
	);
