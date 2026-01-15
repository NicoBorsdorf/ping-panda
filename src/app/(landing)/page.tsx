import { Sparkles, Star, VerifiedIcon, Zap } from "lucide-react";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { DiscordMessage, DiscordUiWrapper } from "@/components/discord-ui";
import { Heading } from "@/components/heading";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { ShinyButton } from "@/components/shiny-button";
import { AnimatedList } from "@/components/ui/animated-list";
import { Badge } from "@/components/ui/badge";

export default function Home() {
	const codeSnippet = `await fetch('https://api.pingpanda.com/log', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer YOUR_API_KEY',
	},
	body: JSON.stringify({
		event: 'user_signup',
		properties: {
			email: 'janedoe@example.com',
			plan: 'pro'
		}
	})
})`;
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<section
				className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32"
				id="intro"
			>
				<MaxWidthWrapper className="flex flex-col items-center gap-16 sm:gap-20">
					{/* Background decoration */}
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<div className="-right-40 -top-40 absolute size-80 rounded-full bg-brand-200/30 blur-3xl" />
						<div className="-left-40 absolute top-20 size-60 rounded-full bg-brand-300/20 blur-3xl" />
						<div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-px w-full max-w-4xl bg-linear-to-r from-transparent via-brand-300/50 to-transparent" />
					</div>

					<div className="container relative mx-auto px-4">
						<div className="relative mx-auo flex flex-col items-center gap-10 text-center">
							<Badge className="mb-6 border-brand-200 bg-brand-100 text-brand-700">
								<Zap className="mr-1 size-3" />
								Real-time event monitoring
							</Badge>

							<h1 className="mb-6 font-bold font-sans text-4xl text-brand-950 tracking-tight sm:text-5xl md:text-6xl">
								Real-Time SaaS Insights
								<br />
								<span className="font-semibold text-2xl text-brand-700">
									Delivered to your Discord
								</span>
							</h1>

							<p className="max-w-prose text-pretty text-center text-base/7 text-gray-600">
								PingPanda is the easiest way to monitor your SaaS. Get instant
								notifications for{" "}
								<span
									className="relative inline-block rounded-lg bg-linear-to-r from-indigo-300 to-purple-300 px-1 pb-1 font-semibold text-gray-700 dark:from-indigo-500 dark:to-purple-500"
									style={{
										backgroundRepeat: "no-repeat",
										backgroundPosition: "left center",
										display: "inline",
										backgroundSize: "100% 100%",
									}}
								>
									sales, new users, or any other event
								</span>{" "}
								sent directly to your Discord
							</p>

							<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
								<ShinyButton
									className="relative z-10 h-14 w-full text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
									href="/sign-up"
								>
									Start For Free Today
								</ShinyButton>
							</div>

							<p className="text-gray-500 text-sm">
								No credit card required • Free tier available
							</p>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>
			{/* Discord side */}
			<section className="relative pb-4" id="discord-example">
				<div className="absolute inset-x-0 top-24 bottom-24 bg-brand-700" />
				<div className="relative mx-auto">
					<div className="relative mx-auto h-full w-full max-w-7xl px-2.5 md:px-20">
						<div className="-m-2 lg:-m-4 rounded-xl bg-gray-900/5 p-2 ring-1 ring-gray-900/10 ring-inset lg:rounded-2xl lg:p-4">
							<DiscordUiWrapper>
								<AnimatedList>
									<DiscordMessage
										badgeColor="#43b581"
										badgeText="Milestone"
										content={{
											"Recurring Revenue": "$5000.00",
											Growth: "%12",
										}}
										timestamp="Today at 6:19PM"
										title="🚀 Revenue Milestone Achieved"
									/>
									<DiscordMessage
										badgeColor="#faa61a"
										badgeText="Revenue"
										content={{
											Amount: "$49.00",
											Email: "example2@example.com",
											Plan: "PRO",
										}}
										timestamp="Today at 5:18 PM"
										title="💰 Payment Received"
									/>
									<DiscordMessage
										badgeColor="#43b581"
										badgeText="SignUp"
										content={{
											Name: "Mateo Ortiz",
											Email: "example@example.com",
										}}
										timestamp="Today at 4:13 PM"
										title="🗣 New user is signed up"
									/>
								</AnimatedList>
							</DiscordUiWrapper>
						</div>
					</div>
				</div>
			</section>
			{/** feature section */}
			<section className="relative bg-brand-50 py-24 sm:py-32" id="features">
				<MaxWidthWrapper className="flex flex-col items-center gap-16 sm:gap-20">
					<div className="container mx-auto px-4">
						<div className="mx-auto mb-16 max-w-2xl text-center">
							<Badge className="mb-4 border-brand-200 bg-background/80 text-brand-700">
								<Sparkles className="mr-1 size-3" />
								Features
							</Badge>
							<Heading className="text-center">
								Everything you need to stay informed
							</Heading>
							<p className="text-gray-600">
								Built for developers who want to know what's happening in their
								apps without checking dashboards all day.
							</p>
						</div>

						<div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3">
							<div className="group space-y-4 overflow-hidden rounded-xl bg-card px-8 py-10 shadow-sm hover:shadow-lg lg:row-span-2">
								<div className="transition duration-200 group-hover:translate-x-2">
									<p className="mb-2 font-bold">Real-time notifications</p>
									<p className="text-pretty">
										Get notified about critical events the moment they happen,no
										matter if you're at home or on the go.
									</p>
								</div>
								<div className="relative max-w-fit overflow-hidden rounded-xl">
									<Image
										alt="phone-screen"
										height={515}
										src="/phone-screen.png"
										width={238}
									/>
								</div>
							</div>
							<div className="group flex flex-col gap-4 rounded-xl bg-card px-8 py-10 shadow-sm hover:shadow-lg">
								<div className="space-y-2 transition duration-200 group-hover:translate-x-2">
									<p className="font-bold">Track Any Event</p>
									<p className="text-pretty">
										From new user signups to successful payments, PingPanda
										notifies you for all critical events in your SaaS.
									</p>
								</div>
								<div className="relative max-w-fit rounded-lg">
									<Image
										alt="bento-any-event"
										height={515}
										src="/bento-any-event.png"
										width={238}
									/>
								</div>
							</div>
							<div className="group row-span-2 flex flex-col gap-4 rounded-xl bg-card pt-10 shadow-sm hover:shadow-lg">
								<div className="space-y-2 px-8 transition duration-200 group-hover:translate-x-2">
									<p className="font-bold">Easy Integration</p>
									<p className="text-pretty">
										Connect PingPanda with your existing workflows in minutes
										and call our intuitive logging API from any language.
									</p>
								</div>
								<div className="flex-1 overflow-hidden pl-8">
									<div className="max-h-120">
										<div className="rounded-tl-xl bg-black/90">
											<div className="w-fit rounded-tl-xl rounded-br-md border-[0.5px] border-white/30 bg-gray-800 px-4 py-3 font-bold text-sm text-white">
												pingpanda.ts
											</div>
											<SyntaxHighlighter
												language="typescript"
												style={{
													...oneDark,
													'pre[class*="language-"]': {
														...oneDark['pre[class*="language-"]'],
														background: "transparent",
														overflow: "hidden",
													},
													'code[class*="language-"]': {
														...oneDark['code[class*="language-"]'],
														background: "transparent",
													},
												}}
											>
												{codeSnippet}
											</SyntaxHighlighter>
										</div>
									</div>
								</div>
							</div>

							<div className="group flex flex-col gap-4 rounded-xl bg-card px-8 py-10 shadow-sm hover:shadow-lg">
								<div className="space-y-2 transition duration-200 group-hover:translate-x-2">
									<p className="font-bold">Track Any Properties</p>
									<p className="text-pretty">
										Add any custom data you like to an event, such as a user
										email, a purchase amount or an exceeded quota.
									</p>
								</div>
								<div className="relative max-w-fit rounded-lg">
									<Image
										alt="bento-custom-data"
										height={515}
										src="/bento-custom-data.png"
										width={238}
									/>
								</div>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>
			{/** customer section */}
			<section className="relative bg-white py-24 sm:py-32">
				<MaxWidthWrapper className="flex flex-col items-center gap-16 sm:gap-20">
					<div>
						<h2 className="text-center font-semibold text-base/7 text-brand-600">
							Real-World Experiences
						</h2>
						<Heading className="text-center">What our customers say</Heading>
					</div>

					<div className="mx-auto grid max-w-2xl grid-cols-1 divide-y divide-gray-200 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:divide-x lg:divide-y-0">
						{/* first customer review */}
						<div className="flex flex-auto flex-col gap-4 rounded-t-[2rem] bg-brand-25 p-6 sm:p-8 lg:rounded-l-[2rem] lg:rounded-tr-none lg:p-16">
							<div className="mb-2 flex justify-center gap-0.5 lg:justify-start">
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
							</div>

							<p className="text-pretty text-center font-medium text-base text-brand-950 tracking-tight sm:text-lg lg:text-left lg:text-lg/8">
								PingPanda has been a game-changer for me. I've been using it for
								two months now and seeing sales pop up in real-time is super
								satisfying.
							</p>

							<div className="mt-2 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start lg:justify-start">
								<Image
									alt="Random user"
									className="rounded-full object-cover"
									height={48}
									src="/user-2.png"
									width={48}
								/>
								<div className="flex flex-col items-center sm:items-start">
									<p className="flex items-center font-semibold">
										Freya Larsson
										<VerifiedIcon className="ml-1.5 inline-block size-4" />
									</p>
									<p className="text-gray-600 text-sm">@itsfreya</p>
								</div>
							</div>
						</div>

						{/* second customer review */}
						<div className="flex flex-auto flex-col gap-4 rounded-b-[2rem] bg-brand-25 p-6 sm:p-8 lg:rounded-r-[2rem] lg:rounded-bl-none lg:p-16">
							<div className="mb-2 flex justify-center gap-0.5 lg:justify-start">
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
								<Star className="size-5 fill-brand-600 text-brand-600" />
							</div>

							<p className="text-pretty text-center font-medium text-base text-brand-950 tracking-tight sm:text-lg lg:text-left lg:text-lg/8">
								PingPanda's been paying off for our SaaS. Nice to have simple
								way to see how we're doing day-to-day. Definitely makes our
								lives easier.
							</p>

							<div className="mt-2 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start lg:justify-start">
								<Image
									alt="Random user"
									className="rounded-full object-cover"
									height={48}
									src="/user-1.png"
									width={48}
								/>
								<div className="flex flex-col items-center sm:items-start">
									<p className="flex items-center font-semibold">
										Kai Durant
										<VerifiedIcon className="ml-1.5 inline-block size-4" />
									</p>
									<p className="text-gray-600 text-sm">@kdurant_</p>
								</div>
							</div>
						</div>
					</div>

					<ShinyButton
						className="relative z-10 h-14 w-full max-w-xs text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
						href="/sign-up"
					>
						Start For Free Today
					</ShinyButton>
				</MaxWidthWrapper>
			</section>
		</div>
	);
}
