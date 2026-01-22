"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight, CheckIcon, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useSonner } from "sonner";
import { Heading } from "@/components/heading";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { ShinyButton } from "@/components/shiny-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/config";
import { useUpgrade } from "@/hooks/use-user";

export default function PricingPage() {
	const { user, isLoaded } = useUser();
	const { toasts } = useSonner();

	const upgrade = useUpgrade({
		onError: () => {
			const id = Math.random().toString(36).substring(2, 15);
			toasts.push({
				id,
				title: "Failed to upgrade user",
				description: "Please try again later.",
				type: "error",
				duration: 5000,
			});
		},
	});
	return (
		<div className="relative overflow-hidden">
			{/* Background decoration */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="-right-40 -top-40 absolute size-80 rounded-full bg-brand-200/30 blur-3xl" />
				<div className="-left-40 absolute top-40 size-60 rounded-full bg-brand-300/20 blur-3xl" />
				<div className="-translate-x-1/2 absolute top-1/2 left-1/2 h-px w-full max-w-4xl bg-linear-to-r from-transparent via-brand-200/50 to-transparent" />
			</div>

			<section className="relative py-20 sm:py-28">
				<MaxWidthWrapper>
					{/* Header */}
					<div className="mx-auto mb-16 max-w-3xl text-center">
						<Badge className="mb-6 border-brand-200 bg-brand-100 text-brand-700">
							<Sparkles className="mr-1 size-3" />
							Simple pricing
						</Badge>

						<Heading className="mb-4">Pay once, use forever</Heading>

						<p className="mx-auto max-w-xl text-gray-600 text-lg">
							No subscriptions, no monthly fees. Start for free or upgrade to
							Pro with a one-time payment for lifetime access.
						</p>
					</div>

					{/* Pricing Cards */}
					<div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
						{/* Free Tier */}
						<div className="relative flex flex-col rounded-2xl border border-brand-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg lg:p-10">
							<div className="mb-8">
								<h3 className="mb-2 font-bold text-brand-950 text-xl">Free</h3>
								<p className="text-gray-600 text-sm">
									Perfect for trying out PingPanda
								</p>
							</div>

							<div className="mb-8">
								<span className="font-bold text-5xl text-brand-950">
									{PLANS.FREE.price}
								</span>
								<span className="ml-2 text-gray-500">forever</span>
							</div>

							<ul className="mb-10 flex-1 space-y-4">
								<li className="flex items-start gap-3">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
										<CheckIcon className="size-3 text-brand-700" />
									</div>
									<span className="text-gray-700">
										{PLANS.FREE.categories} Event categories
									</span>
								</li>
								<li className="flex items-start gap-3">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
										<CheckIcon className="size-3 text-brand-700" />
									</div>
									<span className="text-gray-700">
										{PLANS.FREE.events} Events per category
									</span>
								</li>
								<li className="flex items-start gap-3">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
										<CheckIcon className="size-3 text-brand-700" />
									</div>
									<span className="text-gray-700">
										{PLANS.FREE.triggers} Triggers per day
									</span>
								</li>
							</ul>

							{!isLoaded && (
								<div className="flex items-center justify-center">
									<div className="size-10 animate-pulse rounded-full bg-brand-200" />
									<div className="h-4 w-24 animate-pulse rounded bg-brand-200" />
								</div>
							)}

							{isLoaded && !user ? (
								<Link href="/sign-up">
									<Button
										className="h-12 w-full border-brand-200 text-brand-700 hover:bg-brand-50"
										variant="outline"
									>
										Get started free
										<ArrowRight className="ml-2 size-4" />
									</Button>
								</Link>
							) : (
								<Button
									className="h-12 w-full border-brand-200 text-brand-700"
									disabled
									variant="outline"
								>
									Current plan
								</Button>
							)}
						</div>

						{/* Pro Tier */}
						<div className="relative flex flex-col rounded-2xl border-2 border-brand-600 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl lg:p-10">
							{/* Popular badge */}
							<div className="-top-4 -translate-x-1/2 absolute left-1/2">
								<Badge className="bg-brand-700 px-4 py-1.5 text-white shadow-lg">
									<Zap className="mr-1 size-3" />
									Most Popular
								</Badge>
							</div>

							<div className="mb-8">
								<h3 className="mb-2 font-bold text-brand-950 text-xl">
									Pro (Lifetime)
								</h3>
								<p className="text-gray-600 text-sm">
									For serious SaaS builders
								</p>
							</div>

							<div className="mb-8">
								<span className="font-bold text-5xl text-brand-950">
									{PLANS.PRO.price}
								</span>
								<span className="ml-2 text-gray-500">one-time</span>
							</div>

							<ul className="mb-10 flex-1 space-y-4">
								<li className="flex items-start gap-3">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
										<CheckIcon className="size-3 text-white" />
									</div>
									<span className="text-gray-700">
										{PLANS.PRO.categories} Event categories
									</span>
								</li>
								<li className="flex items-start gap-3">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
										<CheckIcon className="size-3 text-white" />
									</div>
									<span className="text-gray-700">
										{PLANS.PRO.events} Events per category
									</span>
								</li>
								<li className="flex items-start gap-3">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600">
										<CheckIcon className="size-3 text-white" />
									</div>
									<span className="text-gray-700">
										{PLANS.PRO.triggers} Triggers per day
									</span>
								</li>
							</ul>

							{!user ? (
								<ShinyButton className="h-12 w-full" href="/sign-up">
									Get started with Pro
								</ShinyButton>
							) : user?.publicMetadata?.plan === "PRO" ? (
								<Button
									className="h-12 w-full bg-brand-100 text-brand-700"
									disabled
								>
									You're on Pro!
								</Button>
							) : (
								<Button
									className="h-12 w-full bg-brand-700 hover:bg-brand-800"
									onClick={async () => {
										await upgrade.mutateAsync().then(({ sessionUrl }) => {
											if (!sessionUrl) {
												throw new Error("Failed to get session URL");
											}

											window.location.href = sessionUrl;
										});
									}}
								>
									Upgrade to Pro
									<ArrowRight className="ml-2 size-4" />
								</Button>
							)}
						</div>
					</div>

					{/* FAQ / Additional Info */}
					<div className="mx-auto mt-20 max-w-3xl">
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
							<div className="text-center">
								<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-100">
									<CheckIcon className="size-6 text-brand-700" />
								</div>
								<h4 className="mb-1 font-semibold text-brand-950">
									No credit card
								</h4>
								<p className="text-gray-600 text-sm">
									Start free without any payment info
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-100">
									<Zap className="size-6 text-brand-700" />
								</div>
								<h4 className="mb-1 font-semibold text-brand-950">
									Instant setup
								</h4>
								<p className="text-gray-600 text-sm">
									Get up and running in under 5 minutes
								</p>
							</div>
							<div className="text-center">
								<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-100">
									<Sparkles className="size-6 text-brand-700" />
								</div>
								<h4 className="mb-1 font-semibold text-brand-950">
									Lifetime access
								</h4>
								<p className="text-gray-600 text-sm">
									Pay once, use forever with free updates
								</p>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>
		</div>
	);
}
