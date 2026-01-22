"use client";

import { Check, Copy, Terminal, Zap } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Button
			className="absolute top-3 right-3 size-8 bg-white/10 text-white hover:bg-white/20"
			onClick={handleCopy}
			size="icon"
			variant="ghost"
		>
			{copied ? (
				<Check className="size-4 text-green-400" />
			) : (
				<Copy className="size-4" />
			)}
		</Button>
	);
}

function CodeBlock({
	code,
	language = "typescript",
}: {
	code: string;
	language?: string;
}) {
	return (
		<div className="relative overflow-hidden rounded-lg">
			<CopyButton text={code} />
			<SyntaxHighlighter
				customStyle={{
					margin: 0,
					padding: "1rem",
					fontSize: "0.875rem",
					borderRadius: "0.5rem",
				}}
				language={language}
				style={oneDark}
			>
				{code}
			</SyntaxHighlighter>
		</div>
	);
}

const triggerExample = `// Trigger an event using fetch
const response = await fetch("https://pingpanda.app/api/v1/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    category: "sales",
    event: "new-purchase",
    payload: {
      amount: "99.99",
      currency: "EUR",
      customer: "john@example.com"
    }
  })
});`;

const curlExample = `curl -X POST https://pingpanda.app/api/v1/events \\
  -H "Content-Type: application/json" \\
  -H "Authorization: YOUR_API_KEY" \\
  -d '{
    "category": "sales",
    "event": "new-purchase",
    "payload": {
      "amount": "99.99",
      "currency": "EUR",
      "customer": "john@example.com"
    }
  }'`;

const nodeExample = `import axios from "axios";

const pingPanda = axios.create({
  baseURL: "https://pingpanda.app/api/v1",
  headers: {
    "Authorization": "YOUR_API_KEY"
  }
});

// Trigger an event
await pingPanda.post("/events", {
  category: "user-activity",
  event: "signup",
  payload: {
    email: "newuser@example.com",
    plan: "free",
    referrer: "google"
  }
});`;

const responseExample = `// Success (200)
{
  "success": true,
  "message": "Event sent to channel.",
  "event": "new-purchase",
  "category": "sales",
  "sentDate": "2024-01-15T10:30:00.000Z"
}

// Error (400/401/403/404)
{
  "error": "Event not found.",
  "message": "Event \\"new-purchase\\" not found in category \\"sales\\"."
}`;

export default function DocsPage() {
	const [activeTab, setActiveTab] = useState<"fetch" | "curl" | "node">(
		"fetch",
	);

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Documentation
					</h1>
					<Badge className="bg-brand-100 text-brand-700" variant="secondary">
						v1.0
					</Badge>
				</div>
				<p className="mt-1 text-muted-foreground">
					Learn how to integrate PingPanda into your application and start
					receiving Discord notifications.
				</p>
			</div>

			{/* Quick Start */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Zap className="size-5 text-amber-500" />
						<CardTitle>Quick Start</CardTitle>
					</div>
					<CardDescription>
						Get up and running in under 5 minutes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="flex gap-4">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-sm text-white">
								1
							</div>
							<div>
								<h3 className="font-semibold text-brand-900">
									Create an API Key
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									Go to the{" "}
									<a
										className="text-brand-600 underline hover:text-brand-700"
										href="/dashboard/api-keys"
									>
										API Keys page
									</a>{" "}
									and create a new API key. Keep it secure - you'll need it to
									authenticate your requests.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-sm text-white">
								2
							</div>
							<div>
								<h3 className="font-semibold text-brand-900">
									Create an Event Category
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									Visit the{" "}
									<a
										className="text-brand-600 underline hover:text-brand-700"
										href="/dashboard/events"
									>
										Events page
									</a>{" "}
									to create a category (e.g., "sales", "user-activity") and add
									events you want to track.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-sm text-white">
								3
							</div>
							<div>
								<h3 className="font-semibold text-brand-900">
									Configure Discord User ID
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									In{" "}
									<a
										className="text-brand-600 underline hover:text-brand-700"
										href="/dashboard/settings"
									>
										Settings
									</a>
									, add your Discord User ID to receive notifications via DM.
									Enable Developer Mode in Discord, then right-click your
									username and select "Copy User ID".
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-sm text-white">
								4
							</div>
							<div>
								<h3 className="font-semibold text-brand-900">
									Trigger Your First Event
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									Use the API endpoint below to trigger events from your
									application.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Terminal className="size-5 text-brand-600" />
						<CardTitle>Trigger Event API</CardTitle>
					</div>
					<CardDescription>
						Send events to PingPanda and receive Discord notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Endpoint */}
					<div>
						<h3 className="mb-2 font-semibold text-brand-900 text-sm">
							Endpoint
						</h3>
						<div className="flex items-center gap-2 rounded-lg bg-brand-950 p-3">
							<Badge className="bg-green-500/20 text-green-400">POST</Badge>
							<code className="font-mono text-brand-100 text-sm">
								/api/v1/events
							</code>
						</div>
					</div>

					{/* Headers */}
					<div>
						<h3 className="mb-2 font-semibold text-brand-900 text-sm">
							Headers
						</h3>
						<div className="overflow-hidden rounded-lg border border-brand-200">
							<table className="w-full text-sm">
								<thead className="bg-brand-50">
									<tr>
										<th className="px-4 py-2 text-left font-medium text-brand-700">
											Header
										</th>
										<th className="px-4 py-2 text-left font-medium text-brand-700">
											Value
										</th>
										<th className="px-4 py-2 text-left font-medium text-brand-700">
											Required
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-brand-100">
									<tr>
										<td className="px-4 py-2 font-mono text-brand-900">
											Content-Type
										</td>
										<td className="px-4 py-2 text-muted-foreground">
											application/json
										</td>
										<td className="px-4 py-2">
											<Badge
												className="bg-red-100 text-red-700"
												variant="secondary"
											>
												Required
											</Badge>
										</td>
									</tr>
									<tr>
										<td className="px-4 py-2 font-mono text-brand-900">
											Authorization
										</td>
										<td className="px-4 py-2 text-muted-foreground">
											YOUR_API_KEY
										</td>
										<td className="px-4 py-2">
											<Badge
												className="bg-red-100 text-red-700"
												variant="secondary"
											>
												Required
											</Badge>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* Request Body */}
					<div>
						<h3 className="mb-2 font-semibold text-brand-900 text-sm">
							Request Body
						</h3>
						<div className="overflow-hidden rounded-lg border border-brand-200">
							<table className="w-full text-sm">
								<thead className="bg-brand-50">
									<tr>
										<th className="px-4 py-2 text-left font-medium text-brand-700">
											Field
										</th>
										<th className="px-4 py-2 text-left font-medium text-brand-700">
											Type
										</th>
										<th className="px-4 py-2 text-left font-medium text-brand-700">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-brand-100">
									<tr>
										<td className="px-4 py-2 font-mono text-brand-900">
											category
										</td>
										<td className="px-4 py-2 text-muted-foreground">string</td>
										<td className="px-4 py-2 text-muted-foreground">
											The category name you created in the dashboard (required)
										</td>
									</tr>
									<tr>
										<td className="px-4 py-2 font-mono text-brand-900">
											event
										</td>
										<td className="px-4 py-2 text-muted-foreground">string</td>
										<td className="px-4 py-2 text-muted-foreground">
											The event name within the category (required)
										</td>
									</tr>
									<tr>
										<td className="px-4 py-2 font-mono text-brand-900">
											payload
										</td>
										<td className="px-4 py-2 text-muted-foreground">
											{"Record<string, string>"}
										</td>
										<td className="px-4 py-2 text-muted-foreground">
											Key-value pairs to include in the Discord notification
											(optional)
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* Code Examples */}
					<div>
						<h3 className="mb-2 font-semibold text-brand-900 text-sm">
							Code Examples
						</h3>
						<div className="flex gap-1 rounded-lg bg-brand-100 p-1">
							<button
								className={cn(
									"flex-1 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
									activeTab === "fetch"
										? "bg-white text-brand-900 shadow-sm"
										: "text-brand-600 hover:text-brand-900",
								)}
								onClick={() => setActiveTab("fetch")}
								type="button"
							>
								JavaScript
							</button>
							<button
								className={cn(
									"flex-1 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
									activeTab === "curl"
										? "bg-white text-brand-900 shadow-sm"
										: "text-brand-600 hover:text-brand-900",
								)}
								onClick={() => setActiveTab("curl")}
								type="button"
							>
								cURL
							</button>
							<button
								className={cn(
									"flex-1 rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
									activeTab === "node"
										? "bg-white text-brand-900 shadow-sm"
										: "text-brand-600 hover:text-brand-900",
								)}
								onClick={() => setActiveTab("node")}
								type="button"
							>
								Node.js
							</button>
						</div>
						<div className="mt-3">
							{activeTab === "fetch" && (
								<CodeBlock code={triggerExample} language="typescript" />
							)}
							{activeTab === "curl" && (
								<CodeBlock code={curlExample} language="bash" />
							)}
							{activeTab === "node" && (
								<CodeBlock code={nodeExample} language="typescript" />
							)}
						</div>
					</div>

					{/* Response */}
					<div>
						<h3 className="mb-2 font-semibold text-brand-900 text-sm">
							Response
						</h3>
						<CodeBlock code={responseExample} language="json" />
					</div>
				</CardContent>
			</Card>

			{/* Use Cases */}
			<Card>
				<CardHeader>
					<CardTitle>Common Use Cases</CardTitle>
					<CardDescription>
						Ideas for integrating PingPanda into your workflow
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
							<h3 className="font-semibold text-brand-900">
								💰 Sales & Revenue
							</h3>
							<p className="mt-1 text-muted-foreground text-sm">
								Get notified when someone makes a purchase, upgrades their plan,
								or cancels their subscription.
							</p>
						</div>
						<div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
							<h3 className="font-semibold text-brand-900">👤 User Activity</h3>
							<p className="mt-1 text-muted-foreground text-sm">
								Track signups, logins, profile updates, and other user
								interactions in real-time.
							</p>
						</div>
						<div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
							<h3 className="font-semibold text-brand-900">🔔 System Alerts</h3>
							<p className="mt-1 text-muted-foreground text-sm">
								Monitor errors, deployment completions, or background job
								failures instantly.
							</p>
						</div>
						<div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
							<h3 className="font-semibold text-brand-900">📊 Milestones</h3>
							<p className="mt-1 text-muted-foreground text-sm">
								Celebrate achievements like hitting 1000 users, first paying
								customer, or feature launches.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Rate Limits */}
			<Card>
				<CardHeader>
					<CardTitle>Rate Limits</CardTitle>
					<CardDescription>Understand the limits for your plan</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-hidden rounded-lg border border-brand-200">
						<table className="w-full text-sm">
							<thead className="bg-brand-50">
								<tr>
									<th className="px-4 py-3 text-left font-medium text-brand-700">
										Plan
									</th>
									<th className="px-4 py-3 text-left font-medium text-brand-700">
										Categories
									</th>
									<th className="px-4 py-3 text-left font-medium text-brand-700">
										Events
									</th>
									<th className="px-4 py-3 text-left font-medium text-brand-700">
										Triggers/Month
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-brand-100">
								<tr>
									<td className="px-4 py-3 font-medium text-brand-900">Free</td>
									<td className="px-4 py-3 text-muted-foreground">3</td>
									<td className="px-4 py-3 text-muted-foreground">3</td>
									<td className="px-4 py-3 text-muted-foreground">10</td>
								</tr>
								<tr className="bg-brand-50/50">
									<td className="px-4 py-3 font-medium text-brand-900">
										<div className="flex items-center gap-2">
											Pro
											<Badge className="bg-amber-100 text-amber-700">
												Recommended
											</Badge>
										</div>
									</td>
									<td className="px-4 py-3 text-muted-foreground">10</td>
									<td className="px-4 py-3 text-muted-foreground">100</td>
									<td className="px-4 py-3 text-muted-foreground">100</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p className="mt-3 text-muted-foreground text-sm">
						Triggers are counted per event. When you exceed your monthly limit
						for an event, you'll receive a 403 error until the next month.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
