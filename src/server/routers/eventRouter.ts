import { and, countDistinct, eq, not } from "drizzle-orm";
import Elysia from "elysia";
import { PLANS } from "@/config";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import {
	categoryTable,
	eventTable,
	payloadTable,
	userTable,
} from "../db/schema";
import { eventSchema, paramIdSchema } from "../schemas";
import { getUserId } from "./auth";

// Get event limit based on user plan
async function getEventLimit(userId: string): Promise<number> {
	const [user] = await db
		.select({ plan: userTable.plan })
		.from(userTable)
		.where(eq(userTable.id, userId))
		.limit(1);

	if (!user) {
		return PLANS.FREE.events;
	}

	return user.plan === "PRO" ? PLANS.PRO.events : PLANS.FREE.events;
}

export const eventRouter = new Elysia({ prefix: "/event", tags: ["event"] })
	// Create event within a category
	.post(
		"/",
		async ({ body, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Verify the category belongs to the user
				const [category] = await db
					.select({
						id: categoryTable.id,
						name: categoryTable.name,
						eventCount: countDistinct(eventTable.id),
						userId: categoryTable.userId,
					})
					.from(categoryTable)
					.leftJoin(
						eventTable,
						and(
							eq(eventTable.categoryId, categoryTable.id),
							eq(eventTable.userId, userId),
						),
					)
					.where(
						and(
							eq(categoryTable.id, body.categoryId),
							eq(categoryTable.userId, userId),
						),
					)
					.groupBy(categoryTable.id);

				if (!category) {
					return {
						success: false as const,
						error: `Category "${body.categoryId}" not found`,
					};
				}

				const eventLimit = await getEventLimit(userId);

				if (category.eventCount >= eventLimit) {
					return {
						success: false as const,
						error: `Maximum of ${eventLimit} events per category allowed on your plan. Upgrade to Pro for more.`,
					};
				}

				// Check for duplicate event name within this category
				const [existingEvent] = await db
					.select({ id: eventTable.id })
					.from(eventTable)
					.where(
						and(eq(eventTable.name, body.name), eq(eventTable.userId, userId)),
					)
					.limit(1);

				if (existingEvent) {
					return {
						success: false as const,
						error: `An event with the name "${body.name}" already exists`,
					};
				}

				// Insert into database
				const [dbEvent] = await db
					.insert(eventTable)
					.values({
						userId,
						categoryId: category.id,
						name: body.name,
						description: body.description,
					})
					.returning();

				// Insert payload fields (if any)
				if (body.payload.length > 0) {
					await db.insert(payloadTable).values(
						body.payload.map((name) => ({
							eventId: dbEvent.id,
							userId,
							name,
						})),
					);
				}

				return {
					success: true as const,
				};
			});

			if (error) {
				console.error("Error creating event:", error);
				return status(500, { error: "Failed to create event" });
			}

			if (!result.success) {
				return status(400, { error: result.error });
			}

			return status(201, { success: true });
		},
		{
			body: eventSchema,
		},
	)

	// Get all events

	.get("/", async ({ status }) => {
		const userId = await getUserId();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [events, error] = await tryCatchAsync(async () => {
			// Get events with their categories and all payload field names
			const rawRows = await db
				.select({
					id: eventTable.id,
					name: eventTable.name,
					description: eventTable.description,
					createdAt: eventTable.createdAt,
					updatedAt: eventTable.updatedAt,
					categoryId: categoryTable.id,
					categoryName: categoryTable.name,
					categoryColor: categoryTable.color,
					payloadName: payloadTable.name,
				})
				.from(eventTable)
				.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
				.leftJoin(payloadTable, eq(payloadTable.eventId, eventTable.id))
				.where(
					and(eq(eventTable.userId, userId), eq(categoryTable.userId, userId)),
				);

			// Group rows by event, collecting payload names per event
			const eventMap = new Map<
				number,
				{
					id: number;
					name: string;
					description: string | null;
					createdAt: Date;
					updatedAt: Date;
					category: { id: number; name: string; color: string };
					payloadFieldNames: string[];
				}
			>();

			for (const row of rawRows) {
				if (!eventMap.has(row.id)) {
					eventMap.set(row.id, {
						id: row.id,
						name: row.name,
						description: row.description,
						createdAt: row.createdAt,
						updatedAt: row.updatedAt,
						category: {
							id: row.categoryId,
							name: row.categoryName,
							color: row.categoryColor,
						},
						payloadFieldNames: [],
					});
				}
				if (row.payloadName) {
					// biome-ignore lint/style/noNonNullAssertion: Event is set in the map
					eventMap.get(row.id)!.payloadFieldNames.push(row.payloadName);
				}
			}

			return Array.from(eventMap.values());
		});

		if (error) {
			console.error("Error getting events:", { error, userId });
			return status(500, { error: "Failed to get events" });
		}

		return status(200, events);
	})

	// Update event
	.put(
		"/:id",
		async ({ params, body, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Join with category to verify ownership
				const [existing] = await db
					.select({
						id: eventTable.id,
						name: eventTable.name,
						categoryId: eventTable.categoryId,
						categoryUserId: categoryTable.userId,
					})
					.from(eventTable)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.where(
						and(eq(eventTable.id, params.id), eq(eventTable.userId, userId)),
					)
					.limit(1);

				if (!existing || existing.categoryUserId !== userId) {
					return { found: false as const };
				}

				// check for duplicate event name
				const [duplicate] = await db
					.select({ id: eventTable.id })
					.from(eventTable)
					.where(
						and(
							eq(eventTable.name, body.name),
							eq(eventTable.userId, userId),
							not(eq(eventTable.id, params.id)),
						),
					)
					.limit(1);

				if (duplicate) {
					return {
						found: true as const,
						duplicate: true as const,
						error: `An event with the name "${body.name}" already exists`,
					};
				}

				// Update the event
				await Promise.all([
					db
						.update(eventTable)
						.set({
							name: body.name,
							description: body.description,
							categoryId: body.categoryId,
						})
						.where(
							and(eq(eventTable.id, params.id), eq(eventTable.userId, userId)),
						),
					// Delete existing payload fields
					db
						.delete(payloadTable)
						.where(eq(payloadTable.eventId, params.id)),
				]);

				// Insert new payload fields (if any) - easier than updating specific payload fields
				if (body.payload.length > 0) {
					await db.insert(payloadTable).values(
						body.payload.map((name) => ({
							eventId: params.id,
							userId,
							name,
						})),
					);
				}

				return {
					found: true as const,
					duplicate: false as const,
				};
			});

			if (error) {
				console.error("Error updating event:", error);
				return status(500, { error: "Failed to update event" });
			}

			if (!result.found) {
				console.error("Event not found:", { params, userId });
				return status(404, { error: "Event not found" });
			}

			if (result.duplicate) {
				console.error("Event duplicate:", { params, userId });
				return status(400, { error: result.error });
			}

			return status(200, { success: true });
		},
		{
			params: paramIdSchema,
			body: eventSchema,
		},
	)

	// Delete event
	.delete(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Join with category to verify ownership
				const [existing] = await db
					.select({
						id: eventTable.id,
						categoryUserId: categoryTable.userId,
					})
					.from(eventTable)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.where(
						and(eq(eventTable.id, params.id), eq(eventTable.userId, userId)),
					)
					.limit(1);

				if (!existing || existing.categoryUserId !== userId) {
					return { found: false };
				}

				// Delete the event
				await db
					.delete(eventTable)
					.where(
						and(eq(eventTable.id, params.id), eq(eventTable.userId, userId)),
					);

				return { found: true };
			});

			if (error) {
				console.error("Error deleting event:", { error, params, userId });
				return status(500, { error: "Failed to delete event" });
			}

			if (!result.found) {
				console.error("Event not found:", { params, userId });
				return status(404, { error: "Event not found" });
			}

			return status(200, { success: true });
		},
		{
			params: paramIdSchema,
		},
	);
