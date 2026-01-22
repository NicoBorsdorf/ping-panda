"use server";

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
	categoryTable,
	eventTable,
	userSettingsTable,
} from "@/server/db/schema";

export async function getEventPageData({ userId }: { userId: string }) {
	const eventsQuery = db
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
		.where(eq(eventTable.userId, userId))
		.then((events) =>
			events.map(
				({
					categoryColor,
					categoryEmoji,
					categoryId,
					categoryName,
					description,
					fields,
					id,
					name,
					createdAt,
					updatedAt,
					timezone,
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
			),
		);

	const categoriesQuery = db
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
		.where(eq(categoryTable.userId, userId))
		.then((categories) =>
			categories.map(
				({
					id,
					name,
					description,
					color,
					emoji,
					createdAt,
					updatedAt,
					timezone,
				}) => ({
					id,
					name,
					description,
					color,
					emoji,
					createdAt: new Date(
						createdAt.toLocaleString("de-DE", { timeZone: timezone }),
					),
					updatedAt: new Date(
						updatedAt.toLocaleString("de-DE", { timeZone: timezone }),
					),
				}),
			),
		);

	return await Promise.all([eventsQuery, categoriesQuery]);
}
