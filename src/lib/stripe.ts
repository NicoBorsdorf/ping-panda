import Stripe from "stripe";
import { env } from "@/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: "2025-12-15.clover",
	typescript: true,
	telemetry: false,
	appInfo: {
		name: "Ping Panda",
		version: "1.0.0",
	},
});

export const createCheckoutSession = async ({
	userEmail,
	userId,
}: {
	userEmail: string;
	userId: string;
}) => {
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: "price_1SsPIABU1orQCsaum1Ohd6MT",
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${env.NEXT_PUBLIC_VERCEL_URL}/dashboard`,
		cancel_url: `${env.NEXT_PUBLIC_VERCEL_URL}/`,
		customer_email: userEmail,
		metadata: {
			userId,
		},
	});

	return session;
};
