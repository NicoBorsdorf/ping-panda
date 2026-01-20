import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";

export async function POST(request: NextRequest) {
	const body = await request.text();
	const signature = await headers().then((h) => h.get("stripe-signature"));

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature ?? "",
			env.STRIPE_WEBHOOK_SECRET,
		);

		if (!event) throw new Error("Failed to create stripe event");
	} catch (error: unknown) {
		console.error("Error creating stripe event", { body }, error);

		if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
			return new NextResponse("Invalid signature", { status: 400 });
		}

		return new NextResponse("Error creating stripe event", { status: 500 });
	}

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;

			if (!session.metadata?.userId) {
				console.error("Invalid event metadata, user id does not match", {
					session,
				});
				return new NextResponse("Invalid event metadata", {
					status: 400,
				});
			}

			await db
				.update(userTable)
				.set({
					plan: "PRO",
				})
				.where(eq(userTable.id, session.metadata.userId));

			console.info("User plan updated to PRO", {
				userId: session.metadata.userId,
			});

			return new NextResponse("User plan updated to PRO", { status: 200 });
		}
		default:
			console.error("Unhandled stripe event", {
				type: event.type,
				metadata: { ...event.data.object },
			});
			return new NextResponse("Unhandled stripe event", { status: 200 });
	}
}
