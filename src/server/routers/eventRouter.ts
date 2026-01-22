import { and, countDistinct, eq } from "drizzle-orm";
import Elysia from "elysia";
import { PLANS } from "@/config";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import {
	categoryTable,
	eventTable,
	userSettingsTable,
	userTable,
} from "../db/schema";
import { eventSchema, intParamSchema, eventSchema } from "../schemas";
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
							eq(categoryTable.name, body.category),
							eq(categoryTable.userId, userId),
						),
					);

				if (!category) {
					return {
						success: false as const,
						error: `Category "${body.category}" not found`,
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
				await db.insert(eventTable).values({
					userId,
					categoryId: category.id,
					name: body.name,
					description: body.description,
					fields: body.fields,
				});

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
					timezone: userSettingsTable.timezone,
				})
				.from(eventTable)
				.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
				.innerJoin(
					userSettingsTable,
					eq(eventTable.userId, userSettingsTable.userId),
				)
				.where(
					and(eq(eventTable.userId, userId), eq(categoryTable.userId, userId)),
				);

			return events.map(
				({
					timezone,
					createdAt,
					updatedAt,
					categoryColor,
					categoryEmoji,
					categoryId,
					categoryName,
					description,
					fields,
					id,
					name,
				}) => ({
					id,
					name,
					description,
					fields,
					category: {
						id: categoryId,
						name: categoryName,
						color: categoryColor,
						emoji: categoryEmoji,
					},
					createdAt: new Date(
						createdAt.toLocaleString("de-DE", { timeZone: timezone }),
					),
					updatedAt: new Date(
						updatedAt.toLocaleString("de-DE", { timeZone: timezone }),
					),
				}),
			);
		});

		if (error) {
			console.error("Error getting events:", { error, userId });
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
						timezone: userSettingsTable.timezone,
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
					return {
						success: false as const,
						error: "Event not found or not authorized",
					};
				}

				return {
					success: true as const,
					data: {
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
						createdAt: new Date(
							foundEvent.createdAt.toLocaleString("de-DE", {
								timeZone: foundEvent.timezone,
							}),
						),
						updatedAt: new Date(
							foundEvent.updatedAt.toLocaleString("de-DE", {
								timeZone: foundEvent.timezone,
							}),
						),
					},
				};
			});

			if (error) {
				console.error("Error getting event:", error);
				return status(500, { error: "Failed to get event" });
			}

			if (!event.success) {
				console.error("Event not found:", { params, userId });
				return status(404, { error: event.error });
			}

			return status(200, event.data);
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
				await db
					.update(eventTable)
					.set({
						name: body.name,
						fields: body.fields ? JSON.stringify(body.fields) : undefined,
					})
					.where(
						and(eq(eventTable.id, params.id), eq(eventTable.userId, userId)),
					);

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
			params: intParamSchema,
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
			params: intParamSchema,
		},
	);
