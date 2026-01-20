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

export const createMonitoringEntrySchema = z.object({
	eventId: z.number().int().positive(),
	payload: z.record(z.string(), z.string()).optional(),
	status: z.enum(["sent", "failed"]),
});

export const updateUserSettingsSchema = z.object({
	discordWebhookUrl: z.string().optional(),
	disableAllEvents: z.boolean().optional(),
	timezone: z.string().optional(),
});

export const intParamSchema = z.object({
	id: z.number().int().positive(),
});
