import { and, count, eq, gte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { PLANS } from "@/config";
import { env } from "@/env";
import { DiscordClient } from "@/lib/discord";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "@/server/db";
import {
	apiKeyTable,
	categoryTable,
	eventTable,
	monitoringEntryTable,
	payloadTable,
	userSettingsTable,
	userTable,
} from "@/server/db/schema";
import { eventV1Schema } from "@/server/schemas";

export async function POST(request: NextRequest) {
	const token = request.headers.get("Authorization");
	if (!token) {
		return new NextResponse(
			JSON.stringify({
				error: "Unauthorized.",
				message: "No API key provided.",
			}),
			{
				status: 401,
			},
		);
	}

	// Check if API key is valid
	const [tokenResult, tokenError] = await tryCatchAsync(async () => {
		console.info("Checking API key.");
		const [dbToken] = await db
			.select({
				id: apiKeyTable.id,
				key: apiKeyTable.key,
				active: apiKeyTable.active,
				lastUsedAt: apiKeyTable.lastUsedAt,
				createdAt: apiKeyTable.createdAt,
				userId: apiKeyTable.userId,
			})
			.from(apiKeyTable)
			.where(eq(apiKeyTable.key, token))
			.limit(1);

		if (!dbToken) {
			return {
				valid: false as const,
				error: "API key not found on database.",
				userId: null,
				apiKeyId: null,
			};
		}

		console.info("API key found on database:", {
			userId: dbToken.userId,
			id: dbToken.id,
			active: dbToken.active,
			lastUsedAt: dbToken.lastUsedAt,
			createdAt: dbToken.createdAt,
		});

		if (!dbToken.active) {
			return {
				valid: false as const,
				error: "API key is not active.",
				userId: dbToken.userId,
				apiKeyId: dbToken.id,
			};
		}

		// update last used at
		await db
			.update(apiKeyTable)
			.set({ lastUsedAt: new Date() })
			.where(
				and(
					eq(apiKeyTable.id, dbToken.id),
					eq(apiKeyTable.userId, dbToken.userId),
				),
			);

		return {
			valid: true as const,
			userId: dbToken.userId,
			apiKeyId: dbToken.id,
		};
	});

	if (tokenError) {
		console.error("Error checking API key:", { error: tokenError });
		return new NextResponse(
			JSON.stringify({ error: "Internal server error." }),
			{
				status: 500,
			},
		);
	}

	const { valid, error: tokenResultError, userId, apiKeyId } = tokenResult;

	if (!valid) {
		console.error("API key is not valid.", {
			tokenResultError,
			userId,
			apiKeyId,
		});
		return new NextResponse(
			JSON.stringify({ error: "Unauthorized.", message: tokenResultError }),
			{
				status: 401,
			},
		);
	}

	// Parse body
	const body = await request.json();
	const {
		success,
		data,
		error: parseError,
	} = await eventV1Schema.safeParseAsync(body);

	if (!success) {
		console.error("Invalid event payload.", {
			errorMessage: parseError.message,
			body,
			userId,
			apiKeyId,
			errorFull: parseError,
		});
		return new NextResponse(
			JSON.stringify({ error: "Invalid Body.", details: parseError.message }),
			{ status: 400 },
		);
	}

	const { event, category, payload } = data;

	// Check if event exists
	const [dbEventResult, dbEventError] = await tryCatchAsync(async () => {
		const [foundEvent] = await db
			.select({
				id: eventTable.id,
				categoryId: eventTable.categoryId,
			})
			.from(eventTable)
			.innerJoin(categoryTable, eq(eventTable.categoryId, categoryTable.id))
			.innerJoin(
				userSettingsTable,
				eq(eventTable.userId, userSettingsTable.userId),
			)
			.where(
				and(
					eq(eventTable.name, event),
					eq(categoryTable.name, category),
					eq(eventTable.userId, userId),
				),
			);

		if (!foundEvent) {
			return {
				found: false as const,
				error: `Event "${event}" not found in category "${category}".`,
			};
		}

		return {
			found: true as const,
			event: foundEvent,
		};
	});

	if (dbEventError) {
		console.error("Error checking if event exists:", {
			error: dbEventError,
			event,
			category,
			userId,
			apiKeyId,
		});
		return new NextResponse(
			JSON.stringify({ error: "Internal server error." }),
			{
				status: 500,
			},
		);
	}

	if (!dbEventResult.found) {
		console.error("Event not found.", { event, category, userId, apiKeyId });

		return new NextResponse(
			JSON.stringify({
				error: "Event not found.",
				message: dbEventResult.error,
			}),
			{ status: 404 },
		);
	}

	const { event: dbEvent } = dbEventResult;

	// validate event payload
	const [validatePayloadResult, validatePayloadError] = await tryCatchAsync(
		async () => {
			const dbPayload = await db
				.select({
					name: payloadTable.name,
				})
				.from(payloadTable)
				.where(
					and(
						eq(payloadTable.eventId, dbEvent.id),
						eq(payloadTable.userId, userId),
					),
				);

			if (dbPayload.length === 0 && data.payload) {
				return {
					valid: false as const,
					error:
						"Payload not found in event configuration but was provided in request.",
				};
			}

			if (dbPayload.length > 0 && !data.payload) {
				return {
					valid: false as const,
					error:
						"Payload missing on request. Please check event configuration or provide needed payload fields.",
				};
			}

			if (dbPayload.length > 0 && data.payload) {
				const expectedKeys = dbPayload.map((p) => p.name);
				const missingKeys = expectedKeys.filter((key) => !data.payload?.[key]);
				if (missingKeys.length > 0) {
					return {
						valid: false as const,
						error: `Payload fields "${missingKeys.join(", ")}" missing on request. Please check event configuration or provide needed payload fields.`,
					};
				}

				const invalidKeys = Object.keys(data.payload).filter(
					(key) => !expectedKeys.includes(key),
				);
				if (invalidKeys.length > 0) {
					return {
						valid: false as const,
						error: `Payload fields "${invalidKeys.join(", ")}" not found in event configuration.`,
					};
				}
			}

			return {
				valid: true as const,
				payload: data.payload,
			};
		},
	);

	if (validatePayloadError) {
		console.error("Error validating payload:", {
			error: validatePayloadError,
			userId,
			apiKeyId,
		});

		await handleEventMonitoring({
			success: false,
			userId,
			apiKeyId,
			eventId: dbEvent.id,
			categoryId: dbEvent.categoryId,
			payload,
			error: `An internal server error occurred while validating payload.`,
		});

		return new NextResponse(
			JSON.stringify({
				error: "Internal server error.",
				message:
					"An error occurred while validating payload. Please try again later.",
			}),
			{ status: 500 },
		);
	}

	if (!validatePayloadResult.valid) {
		console.error("Payload not valid.", {
			userId,
			apiKeyId,
		});

		await handleEventMonitoring({
			success: false,
			userId,
			apiKeyId,
			eventId: dbEvent.id,
			categoryId: dbEvent.categoryId,
			payload,
			error: `Payload not valid. ${validatePayloadResult.error}`,
		});

		return new NextResponse(
			JSON.stringify({
				error: "Invalid Payload.",
				message: validatePayloadResult.error,
			}),
			{ status: 400 },
		);
	}

	const startOfMonth = new Date(
		new Date().getFullYear(),
		new Date().getMonth(),
		1,
	);

	// check quota
	const [quotaResult, quotaError] = await tryCatchAsync(async () => {
		const [quota] = await db
			.select({
				count: count(),
				plan: userTable.plan,
			})
			.from(userTable)
			.leftJoin(
				monitoringEntryTable,
				and(
					eq(monitoringEntryTable.userId, userTable.id),
					eq(monitoringEntryTable.eventId, dbEvent.id),
					eq(monitoringEntryTable.status, "sent"),
					gte(monitoringEntryTable.createdAt, startOfMonth),
				),
			)
			.where(eq(userTable.id, userId))
			.groupBy(userTable.id);

		console.debug("quota", quota);

		if (
			quota &&
			quota.count >=
				(quota.plan === "FREE" ? PLANS.FREE.triggers : PLANS.PRO.triggers)
		) {
			return {
				exceeded: true as const,
				plan: quota.plan,
			};
		}

		return {
			exceeded: false as const,
			plan: quota.plan,
		};
	});

	if (quotaError) {
		console.error("Error checking quota:", {
			error: quotaError,
			userId,
			apiKeyId,
			event,
			category,
		});

		await handleEventMonitoring({
			success: false,
			userId,
			apiKeyId,
			eventId: dbEvent.id,
			categoryId: dbEvent.categoryId,
			payload,
			error: `An internal server error occurred while checking quota.`,
		});

		return new NextResponse(
			JSON.stringify({ error: "Internal server error." }),
			{ status: 500 },
		);
	}

	if (quotaResult.exceeded) {
		console.error("Quota exceeded.", {
			userId,
			apiKeyId,
			event,
			category,
			plan: quotaResult.plan,
		});

		await handleEventMonitoring({
			success: false,
			userId,
			apiKeyId,
			eventId: dbEvent.id,
			categoryId: dbEvent.categoryId,
			payload,
			error: `Quota exceeded for event ${event} in category ${category}.`,
		});

		return new NextResponse(
			JSON.stringify({
				error: `Quota exceeded for event ${event} in category ${category}.`,
			}),
			{ status: 403 },
		);
	}

	const dcClient = new DiscordClient(env.DISCORD_API_TOKEN);

	const [sendDmResult, sendDmError] = await tryCatchAsync(async () => {
		const [userSettings] = await db
			.select({ discordUserId: userSettingsTable.discordUserId })
			.from(userSettingsTable)
			.where(eq(userSettingsTable.userId, userId))
			.limit(1);

		if (!userSettings?.discordUserId) {
			return {
				success: false as const,
				error: "Discord User ID not configured",
			};
		}

		const { id } = await dcClient.createDM(userSettings.discordUserId);

		await dcClient.sendEmbed(id, {
			title: "Event Sent",
			description: `Event ${event} in category ${category} was sent to channel.`,
			fields: Object.entries(payload ?? {}).map(([key, value]) => ({
				name: key,
				value,
			})),
		});

		return {
			success: true as const,
			channelId: id,
		};
	});

	if (sendDmError) {
		console.error("Error sending DM:", {
			error: sendDmError,
			userId,
			apiKeyId,
		});

		await handleEventMonitoring({
			success: false,
			userId,
			apiKeyId,
			eventId: dbEvent.id,
			categoryId: dbEvent.categoryId,
			payload,
			error: sendDmError.message,
		});

		return new NextResponse(
			JSON.stringify({
				error:
					"Failed to send DM. Please check PingPanda monitoring for more details.",
			}),
			{
				status: 400,
			},
		);
	}

	if (!sendDmResult.success) {
		console.error("Error sending DM:", {
			error: sendDmResult.error,
			userId,
			apiKeyId,
		});

		await handleEventMonitoring({
			success: false,
			userId,
			apiKeyId,
			eventId: dbEvent.id,
			categoryId: dbEvent.categoryId,
			payload,
			error: "Failed to send DM. Discord User ID not configured.",
		});

		return new NextResponse(
			JSON.stringify({
				error:
					"Failed to send DM. Please check PingPanda monitoring for more details.",
			}),
			{ status: 400 },
		);
	}

	await handleEventMonitoring({
		success: true,
		userId,
		apiKeyId,
		eventId: dbEvent.id,
		categoryId: dbEvent.categoryId,
		payload,
	});

	return new NextResponse(
		JSON.stringify({
			success: true,
			message: "Event sent to channel.",
			event,
			category,
			sentDate: new Date().toISOString(),
		}),
		{ status: 200 },
	);
}

async function handleEventMonitoring({
	success,
	error,
	userId,
	apiKeyId,
	eventId,
	categoryId,
	payload,
}: {
	success: boolean;
	error?: string;
	userId: string;
	apiKeyId: number;
	eventId: number;
	categoryId: number;
	payload?: Record<string, string>;
}) {
	if (!success && !error) {
		throw new Error("No error message provided for failed event.");
	}

	console.info("Monitoring event:", {
		userId,
		apiKeyId,
		eventId,
		categoryId,
		payload,
		success,
		error,
	});

	const [monitoring] = await db
		.insert(monitoringEntryTable)
		.values({
			userId,
			eventId,
			categoryId,
			apiKeyId,
			error,
			payload,
			status: success ? "sent" : "failed",
		})
		.returning();

	console.info("Monitoring entry created:", {
		monitoring,
	});
}
