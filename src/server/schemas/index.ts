import z from "zod";

export const createApiKeySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(500).optional(),
});

export const updateEventSchema = z.object({
	name: z.string().min(1).max(255),
	fields: z.record(z.string(), z.string()).optional(),
});

export const createEventSchema = z.object({
	category: z.string(),
	color: z.string(),
	name: z.string().min(1).max(255),
	description: z.string().max(500).optional(),
	fields: z.record(z.string(), z.string()).optional(),
});

export const createCategorySchema = z.object({
	name: z.string().min(1).max(255),
	color: z.string().optional(),
	emoji: z.string().optional(),
});

export const updateCategorySchema = z.object({
	name: z.string().min(1).max(255),
	color: z.string().optional(),
	emoji: z.string().optional(),
});

export const updateUserSettingsSchema = z.object({
	timezone: z.string(),
	discordUserId: z.string(),
});

export const intParamSchema = z.object({
	id: z.number().int().positive(),
});

export const eventV1Schema = z.object({
	event: z
		.string({ error: "Event name must be of type string." })
		.min(1, { error: "Event name is required." })
		.max(255, { error: "Event name is too long." }),
	category: z
		.string({ error: "Category must be of type string." })
		.min(1, { error: "Category is required." })
		.max(255, { error: "Category is too long." }),
	payload: z
		.record(z.string(), z.string(), {
			error: "Payload must be of type record / object.",
		})
		.optional(),
});
