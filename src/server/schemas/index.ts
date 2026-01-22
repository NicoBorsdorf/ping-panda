import z from "zod";

export const createApiKeySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(500).optional(),
});

export const eventSchema = z.object({
	category: z.string().min(1).max(255),
	name: z
		.string({ error: "Event name must be of type string." })
		.min(1, { error: "Event name is required." })
		.max(255, { error: "Event name is too long." }),
	description: z
		.string({ error: "Event description must be of type string." })
		.max(5000, { error: "Event description is too long." })
		.optional(),
	payload: z.array(
		z.object({
			key: z.string().min(1).max(255),
			type: z.enum(["string", "number", "boolean"]),
		}),
	),
});

export const createCategorySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(5000).optional(),
	color: z.string().optional(),
	emoji: z.string().optional(),
});

export const updateCategorySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(5000).optional(),
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
