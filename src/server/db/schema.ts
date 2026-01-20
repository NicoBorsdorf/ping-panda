import {
	boolean,
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
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const userSettingsTable = pgTable(
	"user_settings",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: varchar()
			.notNull()
			.references(() => userTable.id),
		discordWebhookUrl: varchar({ length: 255 }),
		disableAllEvents: boolean().default(false),
		timezone: varchar({ length: 255 }),

		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("user_settings_user_idx").on(table.userId)],
);

export const categoryTable = pgTable(
	"category",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull(),
		color: varchar({ length: 7 }).notNull().default("#6991D2"), // hex color
		emoji: varchar({ length: 10 }), // optional emoji

		userId: varchar()
			.notNull()
			.references(() => userTable.id),

		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("category_user_idx").on(table.userId),
		uniqueIndex("category_name_user_idx").on(table.name, table.userId),
	],
);

export const eventTable = pgTable(
	"event",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }).notNull(),
		description: varchar({ length: 500 }),
		fields: varchar({ length: 1000 }), // JSON string of custom fields

		categoryId: integer()
			.notNull()
			.references(() => categoryTable.id, { onDelete: "cascade" }),
		userId: varchar()
			.notNull()
			.references(() => userTable.id),

		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("event_category_user_idx").on(table.categoryId, table.userId),
		uniqueIndex("event_name_category_user_idx").on(
			table.name,
			table.categoryId,
			table.userId,
		),
	],
);

export const apiKeyTable = pgTable("api_key", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: varchar()
		.notNull()
		.references(() => userTable.id),
	name: varchar({ length: 255 }).notNull(),
	key: varchar({ length: 255 }).notNull().unique(),
	description: varchar({ length: 500 }).notNull(),
	active: boolean().notNull().default(true),
	lastUsedAt: timestamp(),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const monitoringEntryTable = pgTable("monitoring_entry", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	eventId: integer()
		.notNull()
		.references(() => eventTable.id, { onDelete: "cascade" }),
	userId: varchar()
		.notNull()
		.references(() => userTable.id),

	payload: varchar({ length: 2000 }), // JSON string of event data
	status: varchar({ length: 255, enum: ["sent", "failed"] }).notNull(),

	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date()),
});
