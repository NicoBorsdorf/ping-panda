import { and, count, countDistinct, eq } from "drizzle-orm";
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
import {
	createCategorySchema,
	intParamSchema,
	updateCategorySchema,
} from "../schemas";
import { getUserId } from "./auth";

// Get category limit based on user plan
async function getCategoryLimit(userId: string): Promise<number> {
	const [user] = await db
		.select({ plan: userTable.plan })
		.from(userTable)
		.where(eq(userTable.id, userId))
		.limit(1);

	if (!user) {
		return PLANS.FREE.categories;
	}

	return user.plan === "PRO" ? PLANS.PRO.categories : PLANS.FREE.categories;
}

export const eventCategoryRouter = new Elysia({
	prefix: "/category",
	tags: ["category"],
})
	// Create category
	.post(
		"/",
		async ({ body, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Get user's category limit based on plan
				const categoryLimit = await getCategoryLimit(userId);

				// Check if user has reached the limit
				const [categoryCount] = await db
					.select({ count: count() })
					.from(categoryTable)
					.where(eq(categoryTable.userId, userId));

				if (categoryCount && categoryCount.count >= categoryLimit) {
					return {
						success: false as const,
						error: `Maximum of ${categoryLimit} categories allowed on your plan. Upgrade to Pro for more.`,
					};
				}

				// Check for duplicate category name for this user
				const [existingCategory] = await db
					.select({ id: categoryTable.id })
					.from(categoryTable)
					.where(
						and(
							eq(categoryTable.name, body.name),
							eq(categoryTable.userId, userId),
						),
					)
					.limit(1);

				if (existingCategory) {
					return {
						success: false as const,
						error: `A category with the name "${body.name}" already exists`,
					};
				}

				// Insert into database
				await db.insert(categoryTable).values({
					userId,
					name: body.name,
					color: body.color ?? "#6991D2",
					emoji: body.emoji,
				});

				return {
					success: true as const,
				};
			});

			if (error) {
				console.error("Error creating category:", { error, userId });
				return status(500, { error: "Failed to create category" });
			}

			if (!result.success) {
				console.error("Error creating category:", {
					error: result.error,
					userId,
				});
				return status(400, { error: result.error });
			}

			return status(201, { success: true });
		},
		{
			body: createCategorySchema,
		},
	)

	// List all categories for user (with event counts)
	.get("/", async ({ status }) => {
		const userId = await getUserId();
		if (!userId) {
			console.error("No user provided.");
			return status(401, { error: "Unauthorized" });
		}

		const [categories, error] = await tryCatchAsync(async () => {
			const categoryList = await db
				.select({
					id: categoryTable.id,
					name: categoryTable.name,
					description: categoryTable.description,
					color: categoryTable.color,
					emoji: categoryTable.emoji,
					createdAt: categoryTable.createdAt,
					updatedAt: categoryTable.updatedAt,
					timezone: userSettingsTable.timezone,
					eventCount: countDistinct(eventTable.id),
				})
				.from(categoryTable)
				.innerJoin(eventTable, eq(categoryTable.id, eventTable.categoryId))
				.innerJoin(
					userSettingsTable,
					eq(categoryTable.userId, userSettingsTable.userId),
				)
				.where(
					and(eq(eventTable.userId, userId), eq(categoryTable.userId, userId)),
				)
				.groupBy(categoryTable.id)
				.orderBy(categoryTable.createdAt);

			return categoryList.map(
				({
					id,
					name,
					description,
					color,
					createdAt,
					emoji,
					eventCount,
					updatedAt,
					timezone,
				}) => ({
					id,
					name,
					description,
					eventCount,
					color,
					emoji,
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
			console.error("Error listing categories:", { error, userId });
			return status(500, { error: "Failed to list categories" });
		}

		return status(200, categories);
	})

	// Get single category with its events
	.get(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				const [category] = await db
					.select({
						id: categoryTable.id,
						name: categoryTable.name,
						description: categoryTable.description,
						color: categoryTable.color,
						emoji: categoryTable.emoji,
						createdAt: categoryTable.createdAt,
						updatedAt: categoryTable.updatedAt,
						timezone: userSettingsTable.timezone,
					})
					.from(categoryTable)
					.innerJoin(
						userSettingsTable,
						eq(categoryTable.userId, userSettingsTable.userId),
					)
					.where(
						and(
							eq(categoryTable.id, params.id),
							eq(categoryTable.userId, userId),
						),
					)
					.limit(1);

				if (!category) {
					return null;
				}

				return {
					id: category.id,
					name: category.name,
					description: category.description,
					color: category.color,
					emoji: category.emoji,
					createdAt: new Date(
						category.createdAt.toLocaleString("de-DE", {
							timeZone: category.timezone,
						}),
					),
					updatedAt: new Date(
						category.updatedAt.toLocaleString("de-DE", {
							timeZone: category.timezone,
						}),
					),
				};
			});

			if (error) {
				console.error("Error getting category:", { error, userId });
				return status(500, { error: "Failed to get category" });
			}

			if (!result) {
				console.error("Category not found:", { params, userId });
				return status(404, { error: "Category not found" });
			}

			return status(200, result);
		},
		{
			params: intParamSchema,
		},
	)

	// Update category
	.put(
		"/:id",
		async ({ params, body, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Check if category exists and belongs to user
				const [existing] = await db
					.select({ id: categoryTable.id, name: categoryTable.name })
					.from(categoryTable)
					.where(
						and(
							eq(categoryTable.id, Number(params.id)),
							eq(categoryTable.userId, userId),
						),
					)
					.limit(1);

				if (!existing) {
					return { found: false as const };
				}

				// If name is being changed, check for duplicates
				if (body.name && body.name !== existing.name) {
					const [duplicate] = await db
						.select({ id: categoryTable.id })
						.from(categoryTable)
						.where(
							and(
								eq(categoryTable.name, body.name),
								eq(categoryTable.userId, userId),
							),
						)
						.limit(1);

					if (duplicate) {
						return {
							found: true as const,
							duplicate: true as const,
							error: `A category with the name "${body.name}" already exists`,
						};
					}
				}

				// Update the category
				await db
					.update(categoryTable)
					.set({
						name: body.name,
						description: body.description,
						color: body.color,
						emoji: body.emoji,
					})
					.where(
						and(
							eq(categoryTable.id, params.id),
							eq(categoryTable.userId, userId),
						),
					)
					.returning();

				return {
					found: true as const,
					duplicate: false as const,
				};
			});

			if (error) {
				console.error("Error updating category:", error);
				return status(500, { error: "Failed to update category" });
			}

			if (!result.found) {
				console.error("Category not found:", params.id);
				return status(404, { error: "Category not found" });
			}

			if (result.duplicate) {
				console.error("Category duplicate:", result.error);
				return status(400, { error: result.error });
			}

			return status(200, { success: true });
		},
		{
			params: intParamSchema,
			body: updateCategorySchema,
		},
	)

	// Delete category (cascades to events)
	.delete(
		"/:id",
		async ({ params, status }) => {
			const userId = await getUserId();
			if (!userId) {
				console.error("No user provided.");
				return status(401, { error: "Unauthorized" });
			}

			const [result, error] = await tryCatchAsync(async () => {
				// Check if category exists and belongs to user
				const [existing] = await db
					.select({ id: categoryTable.id })
					.from(categoryTable)
					.where(
						and(
							eq(categoryTable.id, Number(params.id)),
							eq(categoryTable.userId, userId),
						),
					)
					.limit(1);

				if (!existing) {
					return { found: false };
				}

				// Delete the category (events will cascade delete)
				await db
					.delete(categoryTable)
					.where(
						and(
							eq(categoryTable.id, params.id),
							eq(categoryTable.userId, userId),
						),
					);

				return { found: true };
			});

			if (error) {
				console.error("Error deleting category:", { error, userId });
				return status(500, { error: "Failed to delete category" });
			}

			if (!result.found) {
				console.error("Category not found:", { params, userId });
				return status(404, { error: "Category not found" });
			}

			return status(200, { success: true });
		},
		{
			params: intParamSchema,
		},
	);
