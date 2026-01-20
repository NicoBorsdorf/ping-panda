import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import { categoryTable, eventTable, monitoringEntryTable } from "../db/schema";
import { createMonitoringEntrySchema, intParamSchema } from "../schemas";

export const monitoringRouter = new Elysia({
	prefix: "/monitoring",
	tags: ["monitoring"],
})
	.post(
		"/",
		async ({ body, status }) => {
			const { userId } = await auth();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				const [entry] = await db
					.insert(monitoringEntryTable)
					.values({
						userId,
						eventId: body.eventId,
						payload: body.payload ? JSON.stringify(body.payload) : null,
						status: body.status,
					})
					.returning();
				return entry;
			});

			if (error) {
				console.error("Error creating monitoring entry:", { error, userId });
				return status(500, { error: "Failed to create monitoring entry" });
			}

			return status(201, result);
		},
		{
			body: createMonitoringEntrySchema,
		},
	)
	.get("/", async ({ status }) => {
		const { userId } = await auth();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [entries, error] = await tryCatchAsync(async () => {
			const entries = await db
				.select({
					id: monitoringEntryTable.id,
					eventName: eventTable.name,
					categoryName: categoryTable.name,
					categoryColor: categoryTable.color,
					categoryEmoji: categoryTable.emoji,
					payload: eventTable.fields,
					status: monitoringEntryTable.status,
					createdAt: monitoringEntryTable.createdAt,
				})
				.from(monitoringEntryTable)
				.innerJoin(eventTable, eq(monitoringEntryTable.eventId, eventTable.id))
				.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
				.where(eq(monitoringEntryTable.userId, userId));
			return entries;
		});

		if (error) {
			console.error("Error getting monitoring entries:", { error, userId });
			return status(500, { error: "Failed to get monitoring entries" });
		}

		return status(200, entries);
	})
	.get(
		"/:id",
		async ({ params, status }) => {
			const { userId } = await auth();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				const [entry] = await db
					.select({
						id: monitoringEntryTable.id,
						eventId: eventTable.id,
						eventName: eventTable.name,
						categoryName: categoryTable.name,
						categoryColor: categoryTable.color,
						categoryEmoji: categoryTable.emoji,
						payload: eventTable.fields,
						status: monitoringEntryTable.status,
						createdAt: monitoringEntryTable.createdAt,
					})
					.from(monitoringEntryTable)
					.innerJoin(
						eventTable,
						eq(monitoringEntryTable.eventId, eventTable.id),
					)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.where(
						and(
							eq(monitoringEntryTable.id, params.id),
							eq(monitoringEntryTable.userId, userId),
						),
					);

				if (!entry) {
					return { found: false as const, entry: null };
				}

				return {
					found: true as const,
					entry: {
						...entry,
						payload: entry.payload ? JSON.parse(entry.payload) : null,
						category: {
							name: entry.categoryName,
							color: entry.categoryColor,
							emoji: entry.categoryEmoji,
						},
					},
				};
			});

			if (error) {
				console.error("Error getting monitoring entry:", { error, userId });
				return status(500, { error: "Failed to get monitoring entry" });
			}

			if (!result.found) {
				return status(404, { error: "Monitoring entry not found" });
			}

			return status(200, result.entry);
		},
		{
			params: intParamSchema,
		},
	)
	.delete(
		"/:id",
		async ({ params, status }) => {
			const { userId } = await auth();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				const result = await db
					.delete(monitoringEntryTable)
					.where(
						and(
							eq(monitoringEntryTable.userId, userId),
							eq(monitoringEntryTable.id, params.id),
						),
					)
					.returning();
				return result;
			});

			if (error) {
				console.error("Error deleting monitoring entry:", { error, userId });
				return status(500, { error: "Failed to delete monitoring entry" });
			}

			return status(200, result);
		},
		{
			params: intParamSchema,
		},
	)
	.get("/stats", async ({ status }) => {
		const { userId } = await auth();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [stats, error] = await tryCatchAsync(async () => {
			const stats = await db
				.select()
				.from(monitoringEntryTable)
				.where(eq(monitoringEntryTable.userId, userId));
			return {
				totalToday: stats.length,
				successRate:
					stats.filter((s) => s.status === "sent").length / stats.length,
			};
		});
		if (error) {
			console.error("Error getting monitoring stats:", { error, userId });
			return status(500, { error: "Failed to get monitoring stats" });
		}

		return status(200, stats);
	});
