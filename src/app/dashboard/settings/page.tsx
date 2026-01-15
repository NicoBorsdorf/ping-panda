"use client";

import {
	Bell,
	Check,
	Crown,
	ExternalLink,
	Loader2,
	Mail,
	MessageSquare,
	Save,
	Sparkles,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	useSettings,
	useTestWebhook,
	useUpdateSettings,
} from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

function ToggleSwitch({
	enabled,
	onChange,
	disabled,
}: {
	enabled: boolean;
	onChange: (enabled: boolean) => void;
	disabled?: boolean;
}) {
	return (
		<button
			className={cn(
				"relative h-6 w-11 rounded-full transition-colors",
				enabled ? "bg-brand-600" : "bg-muted",
				disabled && "cursor-not-allowed opacity-50",
			)}
			disabled={disabled}
			onClick={() => onChange(!enabled)}
			type="button"
		>
			<span
				className={cn(
					"absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
					enabled && "translate-x-5",
				)}
			/>
		</button>
	);
}

export default function SettingsPage() {
	const { data: settings, isLoading } = useSettings();
	const updateSettings = useUpdateSettings();
	const testWebhook = useTestWebhook();

	const [discordWebhook, setDiscordWebhook] = useState("");
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (settings) {
			setDiscordWebhook(settings.discordWebhookUrl ?? "");
			setNotificationsEnabled(settings.notificationsEnabled);
			setEmailNotifications(settings.emailNotifications);
		}
	}, [settings]);

	useEffect(() => {
		if (settings) {
			const changed =
				discordWebhook !== (settings.discordWebhookUrl ?? "") ||
				notificationsEnabled !== settings.notificationsEnabled ||
				emailNotifications !== settings.emailNotifications;
			setHasChanges(changed);
		}
	}, [discordWebhook, notificationsEnabled, emailNotifications, settings]);

	const handleSave = async () => {
		await updateSettings.mutateAsync({
			discordWebhookUrl: discordWebhook || null,
			notificationsEnabled,
			emailNotifications,
		});
		setHasChanges(false);
	};

	const handleTestWebhook = async () => {
		await testWebhook.mutateAsync();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Settings
					</h1>
					<p className="text-muted-foreground">
						Configure your PingPanda preferences
					</p>
				</div>
				{hasChanges && (
					<Button disabled={updateSettings.isPending} onClick={handleSave}>
						{updateSettings.isPending ? (
							<Loader2 className="mr-1 size-4 animate-spin" />
						) : (
							<Save className="mr-1 size-4" />
						)}
						Save Changes
					</Button>
				)}
			</div>

			{/* Plan Card */}
			<Card className="border-brand-200 bg-linear-to-r from-brand-50 to-white">
				<CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-brand-100">
							<Crown className="size-6 text-brand-700" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-brand-950 text-lg">
									Free Plan
								</h3>
								<Badge className="bg-brand-100 text-brand-700">Current</Badge>
							</div>
							<p className="mt-1 text-brand-700 text-sm">
								3 event categories • 10 events per day
							</p>
						</div>
					</div>
					<Link href="/dashboard/settings/upgrade">
						<Button className="bg-brand-700 hover:bg-brand-800">
							<Sparkles className="mr-1 size-4" />
							Upgrade to Pro
						</Button>
					</Link>
				</CardContent>
			</Card>

			{/* Pro Plan Features */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="size-5 text-brand-600" />
						Pro Plan Features
					</CardTitle>
					<CardDescription>
						Unlock more power with a one-time payment of €80
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[
							"10 event categories",
							"100 events per day",
							"Priority support",
							"Lifetime updates",
						].map((feature) => (
							<div className="flex items-center gap-2" key={feature}>
								<Check className="size-4 text-brand-600" />
								<span className="text-sm">{feature}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Discord Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="size-5" />
						Discord Integration
					</CardTitle>
					<CardDescription>
						Configure your Discord webhook to receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label
							className="mb-1.5 block font-medium text-sm"
							htmlFor="discord-webhook-url"
						>
							Webhook URL
						</label>
						<div className="flex gap-2">
							<Input
								className="font-mono text-sm"
								id="discord-webhook-url"
								onChange={(e) => setDiscordWebhook(e.target.value)}
								placeholder="https://discord.com/api/webhooks/..."
								value={discordWebhook}
							/>
							<Button
								disabled={!discordWebhook || testWebhook.isPending}
								onClick={handleTestWebhook}
								variant="outline"
							>
								{testWebhook.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : testWebhook.isSuccess ? (
									<Check className="size-4 text-green-600" />
								) : (
									"Test"
								)}
							</Button>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							<a
								className="inline-flex items-center gap-1 text-brand-600 hover:underline"
								href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
								rel="noopener noreferrer"
								target="_blank"
							>
								Learn how to create a Discord webhook
								<ExternalLink className="size-3" />
							</a>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Notification Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="size-5" />
						Notifications
					</CardTitle>
					<CardDescription>
						Manage how you receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-brand-100">
								<MessageSquare className="size-5 text-brand-700" />
							</div>
							<div>
								<p className="font-medium text-sm">Discord Notifications</p>
								<p className="text-muted-foreground text-xs">
									Receive event notifications in Discord
								</p>
							</div>
						</div>
						<ToggleSwitch
							enabled={notificationsEnabled}
							onChange={setNotificationsEnabled}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-muted">
								<Mail className="size-5 text-muted-foreground" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<p className="font-medium text-sm">Email Notifications</p>
									<Badge className="text-xs" variant="secondary">
										Pro
									</Badge>
								</div>
								<p className="text-muted-foreground text-xs">
									Get a daily digest of your events via email
								</p>
							</div>
						</div>
						<ToggleSwitch
							disabled
							enabled={emailNotifications}
							onChange={setEmailNotifications}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-red-200">
				<CardHeader>
					<CardTitle className="text-red-600">Danger Zone</CardTitle>
					<CardDescription>
						Irreversible actions that affect your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
						<div>
							<p className="font-medium text-red-900 text-sm">Delete Account</p>
							<p className="text-red-700 text-xs">
								Permanently delete your account and all data
							</p>
						</div>
						<Button size="sm" variant="destructive">
							Delete Account
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
