import { and, count, desc, eq } from "drizzle-orm";
import Elysia from "elysia";
import z from "zod";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import {
	categoryTable,
	eventTable,
	monitoringEntryTable,
	userSettingsTable,
} from "../db/schema";
import { intParamSchema } from "../schemas";
import { getUserId } from "./auth";

export const monitoringRouter = new Elysia({
	prefix: "/monitoring",
	tags: ["monitoring"],
})
	.get(
		"/",
		async ({ status, query }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const { page, limit } = query;
			const offset = (page - 1) * limit;

			const [result, error] = await tryCatchAsync(async () => {
				// Get total count
				const [{ total }] = await db
					.select({ total: count() })
					.from(monitoringEntryTable)
					.where(eq(monitoringEntryTable.userId, userId));

				// Get paginated entries
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
						updatedAt: monitoringEntryTable.updatedAt,
						timezone: userSettingsTable.timezone,
					})
					.from(monitoringEntryTable)
					.innerJoin(
						eventTable,
						eq(monitoringEntryTable.eventId, eventTable.id),
					)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.innerJoin(
						userSettingsTable,
						eq(monitoringEntryTable.userId, userSettingsTable.userId),
					)
					.where(eq(monitoringEntryTable.userId, userId))
					.orderBy(desc(monitoringEntryTable.createdAt))
					.limit(limit)
					.offset(offset);

				return {
					entries: entries.map(
						({
							timezone,
							createdAt,
							updatedAt,
							status,
							categoryColor,
							categoryEmoji,
							categoryName,
							eventName,
							id,
							payload,
						}) => ({
							id,
							name: eventName,
							category: {
								name: categoryName,
								color: categoryColor,
								emoji: categoryEmoji,
							},
							payload,
							status,
							createdAt: new Date(
								createdAt.toLocaleString("de-DE", { timeZone: timezone }),
							),
							updatedAt: new Date(
								updatedAt.toLocaleString("de-DE", { timeZone: timezone }),
							),
						}),
					),
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit),
					},
				};
			});

			if (error) {
				console.error("Error getting monitoring entries:", { error, userId });
				return status(500, { error: "Failed to get monitoring entries" });
			}

			return status(200, result);
		},
		{
			query: z.object({
				page: z.coerce.number().int().positive().default(1),
				limit: z.coerce.number().int().positive().max(100).default(25),
			}),
		},
	)
	.delete(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [_, error] = await tryCatchAsync(async () => {
				await db
					.delete(monitoringEntryTable)
					.where(
						and(
							eq(monitoringEntryTable.userId, userId),
							eq(monitoringEntryTable.id, params.id),
						),
					);
			});

			if (error) {
				console.error("Error deleting monitoring entry:", { error, userId });
				return status(500, { error: "Failed to delete monitoring entry" });
			}

			return status(200, { success: true });
		},
		{
			params: intParamSchema,
		},
	)
	.get("/stats", async ({ status }) => {
		const userId = await getUserId();
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
