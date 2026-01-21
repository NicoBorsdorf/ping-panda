import { and, count, eq } from "drizzle-orm";
import Elysia from "elysia";
import { PLANS } from "@/config";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import { categoryTable, eventTable, userTable } from "../db/schema";
import {
	createEventSchema,
	intParamSchema,
	updateEventSchema,
} from "../schemas";
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
					.select({ id: categoryTable.id, name: categoryTable.name })
					.from(categoryTable)
					.where(
						and(
							eq(categoryTable.name, body.category),
							eq(categoryTable.userId, userId),
						),
					)
					.limit(1);

				if (!category) {
					return {
						success: false as const,
						error: `Category "${body.category}" not found or doesn't belong to you`,
					};
				}

				// Get user's event limit based on plan
				const eventLimit = await getEventLimit(userId);

				// Check if category has reached the event limit
				const [eventCount] = await db
					.select({ count: count() })
					.from(eventTable)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.where(eq(eventTable.userId, userId))
					.limit(1);

				if (eventCount && eventCount.count >= eventLimit) {
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
						and(
							eq(eventTable.name, body.name),
							eq(eventTable.categoryId, category.id),
							eq(eventTable.userId, userId),
						),
					)
					.limit(1);

				if (existingEvent) {
					return {
						success: false as const,
						error: `An event with the name "${body.name}" already exists in this category`,
					};
				}

				// Insert into database
				const [inserted] = await db
					.insert(eventTable)
					.values({
						userId,
						categoryId: category.id,
						name: body.name,
						description: body.description,
						fields: body.fields,
					})
					.returning();

				return {
					success: true as const,
					data: {
						id: inserted.id,
						name: inserted.name,
						categoryId: inserted.categoryId,
						description: inserted.description,
						fields: inserted.fields,
						createdAt: inserted.createdAt,
						updatedAt: inserted.updatedAt,
					},
				};
			});

			if (error) {
				console.error("Error creating event:", error);
				return status(500, { error: "Failed to create event" });
			}

			if (!result.success) {
				return status(400, { error: result.error });
			}

			return status(201, result.data);
		},
		{
			body: createEventSchema,
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
			const events = await db
				.select({
					id: eventTable.id,
					name: eventTable.name,
					description: eventTable.description,
					fields: eventTable.fields,
					createdAt: eventTable.createdAt,
					updatedAt: eventTable.updatedAt,
					categoryId: eventTable.categoryId,
					categoryName: categoryTable.name,
					categoryColor: categoryTable.color,
					categoryEmoji: categoryTable.emoji,
				})
				.from(eventTable)
				.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
				.where(eq(eventTable.userId, userId));

			return events;
		});

		if (error) {
			console.error("Error getting events:", error);
			return status(500, { error: "Failed to get events" });
		}

		return status(200, events);
	})
	// Get single event
	.get(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [event, error] = await tryCatchAsync(async () => {
				// Join with category to verify ownership
				const [foundEvent] = await db
					.select({
						id: eventTable.id,
						name: eventTable.name,
						description: eventTable.description,
						categoryId: eventTable.categoryId,
						categoryName: categoryTable.name,
						categoryColor: categoryTable.color,
						categoryEmoji: categoryTable.emoji,
						fields: eventTable.fields,
						createdAt: eventTable.createdAt,
						updatedAt: eventTable.updatedAt,
						categoryUserId: categoryTable.userId,
					})
					.from(eventTable)
					.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
					.where(
						and(
							eq(eventTable.id, Number(params.id)),
							eq(eventTable.userId, userId),
						),
					)
					.limit(1);

				if (!foundEvent || foundEvent.categoryUserId !== userId) {
					return null;
				}

				return {
					id: foundEvent.id,
					name: foundEvent.name,
					description: foundEvent.description,
					category: {
						id: foundEvent.categoryId,
						name: foundEvent.categoryName,
						color: foundEvent.categoryColor,
						emoji: foundEvent.categoryEmoji ?? null,
					},
					fields: foundEvent.fields,
					createdAt: foundEvent.createdAt,
					updatedAt: foundEvent.updatedAt,
				};
			});

			if (error) {
				console.error("Error getting event:", error);
				return status(500, { error: "Failed to get event" });
			}

			if (!event) {
				return status(404, { error: "Event not found" });
			}

			return status(200, event);
		},
		{
			params: intParamSchema,
		},
	)

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

				// If name is being changed, check for duplicates within the category
				if (body.name && body.name !== existing.name) {
					const [duplicate] = await db
						.select({ id: eventTable.id })
						.from(eventTable)
						.where(
							and(
								eq(eventTable.name, body.name),
								eq(eventTable.categoryId, existing.categoryId),
							),
						)
						.limit(1);

					if (duplicate) {
						return {
							found: true as const,
							duplicate: true as const,
							error: `An event with the name "${body.name}" already exists in this category`,
						};
					}
				}

				// Update the event
				const [updated] = await db
					.update(eventTable)
					.set({
						name: body.name,
						fields: body.fields ? JSON.stringify(body.fields) : undefined,
					})
					.where(eq(eventTable.id, Number(params.id)))
					.returning();

				return {
					found: true as const,
					duplicate: false as const,
					data: {
						id: updated.id,
						name: updated.name,
						categoryId: updated.categoryId,
						fields: updated.fields,
						createdAt: updated.createdAt,
						updatedAt: updated.updatedAt,
					},
				};
			});

			if (error) {
				console.error("Error updating event:", error);
				return status(500, { error: "Failed to update event" });
			}

			if (!result.found) {
				return status(404, { error: "Event not found" });
			}

			if (result.duplicate) {
				return status(400, { error: result.error });
			}

			return status(200, result.data);
		},
		{
			params: intParamSchema,
			body: updateEventSchema,
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
				console.error("Error deleting event:", error);
				return status(500, { error: "Failed to delete event" });
			}

			if (!result.found) {
				return status(404, { error: "Event not found" });
			}

			return status(200, true);
		},
		{
			params: intParamSchema,
		},
	);
