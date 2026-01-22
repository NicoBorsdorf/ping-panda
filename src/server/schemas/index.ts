import z from "zod";

export const apiKeySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(5000).optional(),
});

export const eventSchema = z.object({
	categoryId: z.number().int().positive(), // category id
	name: z
		.string({ error: "Event name must be of type string." })
		.min(1, { error: "Event name is required." })
		.max(255, { error: "Event name is too long." }),
	description: z
		.string({ error: "Event description must be of type string." })
		.max(5000, { error: "Event description is too long." })
		.nullable(),
	payload: z
		.array(z.string().min(1).max(255))
		.max(10, { error: "Maximum 10 payload fields are allowed." }),
});

export const categorySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(5000).optional(),
	color: z
		.string()
		.min(1)
		.max(7)
		.regex(/^#([0-9a-fA-F]{6})$/, {
			error: "Color must be a valid hex color.",
		}),
});

export const updateUserSettingsSchema = z.object({
	discordUserId: z.string(),
});

export const paramIdSchema = z.object({
	id: z.string().min(1, { error: "ID is required." }).transform(Number),
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
		.record(z.string().min(1).max(255), z.string().min(1).max(255), {
			error: "Payload must be of type record / object.",
		})
		.optional(),
});
