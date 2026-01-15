import {
	index,
	integer,
	pgTable,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
	id: varchar({ length: 255 }).primaryKey(), // clerk user id
	plan: varchar({ length: 4, enum: ["FREE", "PRO"] })
		.notNull()
		.default("FREE"),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const eventTable = pgTable(
	"event",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull(),
		description: varchar({ length: 255 }).notNull(),

		userId: varchar().references(() => userTable.id),

		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp().$onUpdate(() => new Date()),
	},
	(table) => [
		index("event_name_idx").on(table.name),
		uniqueIndex("event_name_user_idx").on(table.name, table.userId),
	],
);

export const apiKeyTable = pgTable("api_key", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: varchar().references(() => userTable.id),
	name: varchar({ length: 255 }).notNull(),
	apiKey: varchar({ length: 255 }).notNull().unique(),
	description: varchar({ length: 255 }).notNull(),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const notificationTable = pgTable("notification", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	eventId: integer().references(() => eventTable.id),
	userId: varchar().references(() => userTable.id),

	status: varchar({ length: 255, enum: ["sent", "failed"] }).notNull(),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().$onUpdate(() => new Date()),
});
