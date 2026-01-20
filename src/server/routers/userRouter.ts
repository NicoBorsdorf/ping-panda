import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import { userSettingsTable, userTable } from "../db/schema";
import { updateUserSettingsSchema } from "../schemas";

export const userRouter = new Elysia({ prefix: "/user", tags: ["user"] })
	.post("/sync", async ({ status }) => {
		const { userId } = await auth();

		if (!userId) {
			console.error("No user provided.");

			return status(401, { error: "Unauthorized" });
		}

		const [_, error] = await tryCatchAsync(async () => {
			console.info("Checking user:", { userId });
			const [dbUser] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.id, userId))
				.limit(1);

			if (dbUser) {
				console.info("User already exists:", { userId });
				return;
			}

			console.info("User does not exist, creating user:", { userId });
			await db.transaction(async (tx) => {
				const [user] = await tx
					.insert(userTable)
					.values({
						id: userId,
						plan: "FREE",
					})
					.returning();

				await tx.insert(userSettingsTable).values({
					userId: user.id,
					discordWebhookUrl: "https://discord.com/api/webhooks/*****/******",
					disableAllEvents: false,
					timezone: "Europe/Berlin",
				});

				console.info("User created and settings initialized:", { userId });
			});
		});

		if (error) {
			console.error("Error syncing user:", { error, userId });

			return status(500, { error: "Internal server error" });
		}

		return status(200, { isSynced: true });
	})
	.get("/settings", async ({ status }) => {
		const { userId } = await auth();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [result, error] = await tryCatchAsync(async () => {
			const [settings] = await db
				.select()
				.from(userSettingsTable)
				.where(eq(userSettingsTable.userId, userId))
				.limit(1);

			if (!settings) {
				return {
					found: false as const,
					settings: null,
				};
			}

			return {
				found: true as const,
				settings,
			};
		});

		if (error) {
			console.error("Error getting user settings:", { error, userId });
			return status(500, { error: "Failed to get user settings" });
		}

		if (!result.found) {
			return status(404, { error: "User settings not found" });
		}

		return status(200, result.settings);
	})
	.put(
		"/settings",
		async ({ status, body }) => {
			const { userId } = await auth();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [settings, error] = await tryCatchAsync(async () => {
				const [settings] = await db
					.update(userSettingsTable)
					.set({
						discordWebhookUrl: body.discordWebhookUrl,
						disableAllEvents: body.disableAllEvents,
						timezone: body.timezone,
					})
					.where(eq(userSettingsTable.userId, userId))
					.returning();
				return settings;
			});

			if (error) {
				console.error("Error updating user settings:", { error, userId });
				return status(500, { error: "Failed to update user settings" });
			}

			return status(200, settings);
		},
		{
			body: updateUserSettingsSchema,
		},
	);
