import { and, count, desc, eq, sql } from "drizzle-orm";
import Elysia from "elysia";
import z from "zod";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import {
	categoryTable,
	eventTable,
	monitoringEntryTable,
	payloadTable,
} from "../db/schema";
import { paramIdSchema } from "../schemas";
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
						eventId: monitoringEntryTable.eventId,
						eventName: eventTable.name,
						categoryName: categoryTable.name,
						categoryColor: categoryTable.color,
						payload: monitoringEntryTable.payload,
						status: monitoringEntryTable.status,
						error: monitoringEntryTable.error,
						createdAt: monitoringEntryTable.createdAt,
						updatedAt: monitoringEntryTable.updatedAt,
					})
					.from(monitoringEntryTable)
					.innerJoin(
						eventTable,
						eq(monitoringEntryTable.eventId, eventTable.id),
					)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.where(eq(monitoringEntryTable.userId, userId))
					.orderBy(desc(monitoringEntryTable.createdAt))
					.limit(limit)
					.offset(offset);

				// Get payload field names for each event
				const eventIds = [...new Set(entries.map((e) => e.eventId))];
				const payloadFields =
					eventIds.length > 0
						? await db
								.select({
									eventId: payloadTable.eventId,
									name: payloadTable.name,
								})
								.from(payloadTable)
								.where(eq(payloadTable.userId, userId))
						: [];

				// Group payload fields by eventId
				const fieldsByEvent = payloadFields.reduce(
					(acc, field) => {
						if (!acc[field.eventId]) {
							acc[field.eventId] = [];
						}
						acc[field.eventId].push(field.name);
						return acc;
					},
					{} as Record<number, string[]>,
				);

				return {
					entries: entries.map(
						({
							createdAt,
							updatedAt,
							status,
							categoryColor,
							categoryName,
							eventName,
							eventId,
							error,
							id,
							payload,
						}) => ({
							id,
							name: eventName,
							category: {
								name: categoryName,
								color: categoryColor,
							},
							payload: payload as Record<string, string> | null | undefined,
							payloadFields: fieldsByEvent[eventId] ?? [],
							status,
							error,
							createdAt,
							updatedAt,
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
			params: paramIdSchema,
		},
	)
	.get("/stats", async ({ status }) => {
		const userId = await getUserId();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [stats, error] = await tryCatchAsync(async () => {
			// Calculate date boundaries
			const now = new Date();
			const todayStart = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			);
			const yesterdayStart = new Date(todayStart);
			yesterdayStart.setDate(yesterdayStart.getDate() - 1);

			// Single optimized query to get all stats
			const [result] = await db
				.select({
					totalToday: sql<number>`count(*) filter (where ${monitoringEntryTable.createdAt} >= ${todayStart})`,
					totalYesterday: sql<number>`count(*) filter (where ${monitoringEntryTable.createdAt} >= ${yesterdayStart} and ${monitoringEntryTable.createdAt} < ${todayStart})`,
					successToday: sql<number>`count(*) filter (where ${monitoringEntryTable.createdAt} >= ${todayStart} and ${monitoringEntryTable.status} = 'sent')`,
					total: count(),
					totalSuccess: sql<number>`count(*) filter (where ${monitoringEntryTable.status} = 'sent')`,
				})
				.from(monitoringEntryTable)
				.where(eq(monitoringEntryTable.userId, userId));

			const totalToday = Number(result.totalToday) || 0;
			const totalYesterday = Number(result.totalYesterday) || 0;
			const totalSuccess = Number(result.totalSuccess) || 0;
			const total = result.total || 0;

			// Calculate percentage change (avoid division by zero)
			const changePercent =
				totalYesterday === 0
					? totalToday > 0
						? 100
						: 0
					: Math.round(((totalToday - totalYesterday) / totalYesterday) * 100);

			// Calculate success rate as percentage (avoid division by zero)
			const successRate =
				total === 0 ? 0 : Math.round((totalSuccess / total) * 100);

			return {
				totalToday,
				totalYesterday,
				changePercent,
				successRate,
				total,
			};
		});

		if (error) {
			console.error("Error getting monitoring stats:", { error, userId });
			return status(500, { error: "Failed to get monitoring stats" });
		}

		return status(200, stats);
	});
