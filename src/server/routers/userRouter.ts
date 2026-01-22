import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { env } from "@/env";
import { DiscordClient } from "@/lib/discord";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import { userSettingsTable, userTable } from "../db/schema";
import { updateUserSettingsSchema } from "../schemas";
import { getUserId } from "./auth";

export const userRouter = new Elysia({ prefix: "/user", tags: ["user"] })
	.post("/sync", async ({ status }) => {
		const userId = await getUserId();

		if (!userId) {
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
		const userId = await getUserId();

		if (!userId) {
			return status(401, { error: "Unauthorized" });
		}
		const [result, error] = await tryCatchAsync(async () => {
			const [settings] = await db
				.select({
					id: userSettingsTable.id,
					userId: userSettingsTable.userId,
					createdAt: userSettingsTable.createdAt,
					updatedAt: userSettingsTable.updatedAt,
					timezone: userSettingsTable.timezone,
					discordUserId: userSettingsTable.discordUserId,
				})
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
				settings: {
					id: settings.id,
					userId: settings.userId,
					createdAt: new Date(
						settings.createdAt.toLocaleString("de-DE", {
							timeZone: settings.timezone,
						}),
					),
					updatedAt: new Date(
						settings.updatedAt.toLocaleString("de-DE", {
							timeZone: settings.timezone,
						}),
					),
					timezone: settings.timezone,
					discordUserId: settings.discordUserId,
				},
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
			const userId = await getUserId();

			if (!userId) {
				return status(401, { error: "Unauthorized" });
			}
			const [settings, error] = await tryCatchAsync(async () => {
				const [settings] = await db
					.update(userSettingsTable)
					.set({
						timezone: body.timezone,
						discordUserId: body.discordUserId,
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
	)
	.post("/settings/test-discord", async ({ status }) => {
		const userId = await getUserId();

		if (!userId) {
			return status(401, { error: "Unauthorized" });
		}
		const discordClient = new DiscordClient(env.DISCORD_API_TOKEN);

		const [settings, error] = await tryCatchAsync(async () => {
			const [settings] = await db
				.select({
					discordUserId: userSettingsTable.discordUserId,
				})
				.from(userSettingsTable)
				.where(eq(userSettingsTable.userId, userId))
				.limit(1);

			if (!settings) return null;
			return settings;
		});

		if (error) {
			console.error("Error getting user settings:", { error, userId });
			return status(500, { error: "Failed to get user settings" });
		}

		if (!settings) {
			console.error("User settings not found:", { userId });
			return status(404, { error: "User settings not found" });
		}

		if (!settings.discordUserId) {
			console.error("Discord user ID not found:", { userId });
			return status(400, {
				error: "No Discord user ID set.",
				message: "Please set your Discord user ID in your settings.",
			});
		}

		const { id: channelId } = await discordClient.createDM(
			settings.discordUserId,
		);

		const [_, embedResult] = await tryCatchAsync(async () => {
			return await discordClient.sendEmbed(channelId, {
				title: "Test Message",
				description: "This is a test message",
			});
		});

		if (embedResult) {
			console.error("Error sending test message:", {
				error: embedResult,
				userId,
			});
			return status(400, { error: "Failed to send test message to Discord" });
		}

		return status(200, { success: true });
	});
