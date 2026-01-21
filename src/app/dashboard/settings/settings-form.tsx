"use client";

import {
	AlertCircle,
	AlertTriangle,
	Check,
	Crown,
	Globe,
	Loader2,
	RefreshCw,
	Sparkles,
	TestTube,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Discord } from "@/components/icons/discord";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
} from "@/components/ui/select";
import { env } from "@/env";
import {
	useSettings,
	useTestDiscord,
	useUpdateSettings,
} from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

interface FormErrors {
	discordUserId?: string;
	timezone?: string;
	general?: string;
}

const TIMEZONES = [
	{ label: "UTC-12:00 (Baker Island, US)", value: "Pacific/Baker" },
	{
		label: "UTC-11:00 (Pago Pago, American Samoa)",
		value: "Pacific/Pago_Pago",
	},
	{ label: "UTC-10:00 (Honolulu, US)", value: "Pacific/Honolulu" },
	{
		label: "UTC-09:00 (Gambier Islands, French Polynesia)",
		value: "Pacific/Gambier",
	},
	{ label: "UTC-09:00 (Anchorage, US)", value: "America/Anchorage" },
	{ label: "UTC-08:00 (Los Angeles, US)", value: "America/Los_Angeles" },
	{ label: "UTC-08:00 (Tijuana, MX)", value: "America/Tijuana" },
	{ label: "UTC-07:00 (Denver, US)", value: "America/Denver" },
	{ label: "UTC-07:00 (Phoenix, US)", value: "America/Phoenix" },
	{ label: "UTC-06:00 (Chicago, US)", value: "America/Chicago" },
	{ label: "UTC-06:00 (Mexico City, MX)", value: "America/Mexico_City" },
	{ label: "UTC-05:00 (New York, US)", value: "America/New_York" },
	{ label: "UTC-05:00 (Lima, Peru)", value: "America/Lima" },
	{ label: "UTC-04:00 (Caracas, Venezuela)", value: "America/Caracas" },
	{ label: "UTC-04:00 (Santiago, Chile)", value: "America/Santiago" },
	{
		label: "UTC-03:00 (Buenos Aires, Argentina)",
		value: "America/Argentina/Buenos_Aires",
	},
	{ label: "UTC-03:00 (São Paulo, Brazil)", value: "America/Sao_Paulo" },
	{
		label: "UTC-02:00 (South Georgia & South Sandwich)",
		value: "Atlantic/South_Georgia",
	},
	{ label: "UTC-01:00 (Azores, Portugal)", value: "Atlantic/Azores" },
	{ label: "UTC±00:00 (London, UK)", value: "Europe/London" },
	{ label: "UTC±00:00 (Reykjavik, Iceland)", value: "Atlantic/Reykjavik" },
	{ label: "UTC+01:00 (Berlin, Germany)", value: "Europe/Berlin" },
	{ label: "UTC+01:00 (Paris, France)", value: "Europe/Paris" },
	{ label: "UTC+02:00 (Cairo, Egypt)", value: "Africa/Cairo" },
	{ label: "UTC+02:00 (Athens, Greece)", value: "Europe/Athens" },
	{ label: "UTC+03:00 (Moscow, Russia)", value: "Europe/Moscow" },
	{ label: "UTC+03:00 (Nairobi, Kenya)", value: "Africa/Nairobi" },
	{ label: "UTC+04:00 (Dubai, UAE)", value: "Asia/Dubai" },
	{ label: "UTC+04:00 (Baku, Azerbaijan)", value: "Asia/Baku" },
	{ label: "UTC+05:00 (Karachi, Pakistan)", value: "Asia/Karachi" },
	{ label: "UTC+05:00 (Yekaterinburg, Russia)", value: "Asia/Yekaterinburg" },
	{ label: "UTC+06:00 (Dhaka, Bangladesh)", value: "Asia/Dhaka" },
	{ label: "UTC+06:00 (Almaty, Kazakhstan)", value: "Asia/Almaty" },
	{ label: "UTC+07:00 (Bangkok, Thailand)", value: "Asia/Bangkok" },
	{ label: "UTC+07:00 (Novosibirsk, Russia)", value: "Asia/Novosibirsk" },
	{ label: "UTC+08:00 (Beijing, China)", value: "Asia/Shanghai" },
	{ label: "UTC+08:00 (Singapore, SG)", value: "Asia/Singapore" },
	{ label: "UTC+09:00 (Tokyo, Japan)", value: "Asia/Tokyo" },
	{ label: "UTC+09:00 (Seoul, South Korea)", value: "Asia/Seoul" },
	{ label: "UTC+10:00 (Sydney, Australia)", value: "Australia/Sydney" },
	{ label: "UTC+10:00 (Vladivostok, Russia)", value: "Asia/Vladivostok" },
	{ label: "UTC+11:00 (Noumea, New Caledonia)", value: "Pacific/Noumea" },
	{ label: "UTC+11:00 (Solomon Islands)", value: "Pacific/Guadalcanal" },
	{ label: "UTC+12:00 (Auckland, New Zealand)", value: "Pacific/Auckland" },
	{ label: "UTC+12:00 (Fiji)", value: "Pacific/Fiji" },
];

export function SettingsForm() {
	const { data: settings, isLoading, error } = useSettings();

	const [formData, setFormData] = useState({
		discordUserId: settings?.discordUserId ?? "",
		timezone: settings?.timezone ?? "Europe/Berlin",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isDirty, setIsDirty] = useState(false);

	useEffect(() => {
		if (settings) {
			setFormData({
				discordUserId: settings.discordUserId ?? "",
				timezone: settings.timezone ?? "Europe/Berlin",
			});
		}
	}, [settings]);

	const updateSettings = useUpdateSettings({
		onSuccess: () => {
			toast.success("Settings saved", {
				description: "Your settings have been updated successfully.",
			});
			setIsDirty(false);
			setErrors({});
		},
		onError: () => {
			toast.error("Failed to save settings", {
				description: "Please try again later.",
			});
		},
	});

	const testDiscord = useTestDiscord({
		onSuccess: () => {
			toast.success("Test message sent!", {
				description: "Check your Discord DMs for the test message.",
			});
		},
		onError: () => {
			toast.error("Failed to send test message", {
				description:
					"Make sure your Discord User ID is correct and you have DMs enabled.",
			});
		},
	});

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.discordUserId.trim()) {
			newErrors.discordUserId = "Discord User ID is required";
		} else if (!/^\d{17,19}$/.test(formData.discordUserId.trim())) {
			newErrors.discordUserId =
				"Invalid Discord User ID (should be 17-19 digits)";
		}

		if (!formData.timezone) {
			newErrors.timezone = "Timezone is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setIsDirty(true);
		// Clear field error when user starts typing
		if (errors[field as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		await updateSettings.mutateAsync({
			discordUserId: formData.discordUserId.trim(),
			timezone: formData.timezone,
		});
	};

	const handleTestDiscord = async () => {
		if (!formData.discordUserId.trim()) {
			setErrors((prev) => ({
				...prev,
				discordUserId: "Please enter your Discord User ID first",
			}));
			return;
		}

		if (!/^\d{17,19}$/.test(formData.discordUserId.trim())) {
			setErrors((prev) => ({
				...prev,
				discordUserId: "Invalid Discord User ID format",
			}));
			return;
		}

		await testDiscord.mutateAsync();
	};

	// Mock plan - in real app, fetch from user data
	const isPro = false;

	if (isLoading) {
		return <SettingsLoadingSkeleton />;
	}

	if (error) {
		return <SettingsErrorState error={error} />;
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
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
				<Button
					className="w-full bg-brand-600 hover:bg-brand-700 sm:w-auto"
					disabled={updateSettings.isPending || !isDirty}
					type="submit"
				>
					{updateSettings.isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</div>

			{/* Plan Card */}
			<Card className="border-brand-200 bg-linear-to-r from-brand-50 to-white">
				<CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-4">
						<div
							className={cn(
								"flex size-12 items-center justify-center rounded-full",
								isPro ? "bg-amber-100" : "bg-brand-100",
							)}
						>
							<Crown
								className={cn(
									"size-6",
									isPro ? "text-amber-600" : "text-brand-700",
								)}
							/>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-brand-950 text-lg">
									{isPro ? "Pro Plan" : "Free Plan"}
								</h3>
								<span className="rounded-full bg-brand-100 px-2.5 py-0.5 font-medium text-brand-700 text-xs">
									Current
								</span>
							</div>
							<p className="mt-1 text-brand-700 text-sm">
								{isPro
									? "10 event categories • 100 events per day"
									: "3 event categories • 10 events per day"}
							</p>
						</div>
					</div>
					{!isPro && (
						<Link href="/pricing">
							<Button className="w-full bg-brand-700 hover:bg-brand-800 sm:w-auto">
								<Sparkles className="mr-2 size-4" />
								Upgrade to Pro
							</Button>
						</Link>
					)}
				</CardContent>
			</Card>

			{/* Pro Plan Features */}
			{!isPro && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="size-5 text-amber-500" />
							Pro Plan Features
						</CardTitle>
						<CardDescription>
							Unlock more power with a one-time payment of €80
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 sm:grid-cols-2">
							{[
								"10 event categories",
								"100 events per day",
								"Priority support",
								"Advanced analytics",
							].map((feature) => (
								<div className="flex items-center gap-2" key={feature}>
									<div className="flex size-5 items-center justify-center rounded-full bg-brand-100">
										<Check className="size-3 text-brand-600" />
									</div>
									<span className="text-brand-800 text-sm">{feature}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Discord Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Discord className="size-5 text-[#5865F2]" />
						Discord Integration
					</CardTitle>
					<CardDescription>
						Connect your Discord account to receive event notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Discord User ID Input */}
					<div className="space-y-2">
						<Label htmlFor="discordUserId">Discord User ID</Label>
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Input
									className={cn(
										errors.discordUserId &&
											"border-red-300 focus-visible:ring-red-500",
									)}
									id="discordUserId"
									onChange={(e) =>
										handleInputChange("discordUserId", e.target.value)
									}
									placeholder="123456789012345678"
									value={formData.discordUserId}
								/>
								{errors.discordUserId && (
									<AlertCircle className="-translate-y-1/2 absolute top-1/2 right-3 size-4 text-red-500" />
								)}
							</div>
							<Button
								className="shrink-0"
								disabled={testDiscord.isPending || !formData.discordUserId}
								onClick={handleTestDiscord}
								type="button"
								variant="outline"
							>
								{testDiscord.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<>
										<TestTube className="mr-2 size-4" />
										Test
									</>
								)}
							</Button>
						</div>
						{errors.discordUserId && (
							<p className="text-red-500 text-sm">{errors.discordUserId}</p>
						)}
						<p className="text-muted-foreground text-xs">
							To find your Discord User ID: Enable Developer Mode in Discord
							settings, then right-click your username and select "Copy User
							ID".
						</p>
					</div>

					{/* Timezone Select */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="timezone">Timezone</Label>
							<Globe className="size-4 text-muted-foreground" />
						</div>
						<Select
							id="timezone"
							name="timezone"
							onValueChange={(value) => {
								if (!value) {
									setErrors((prev) => ({
										...prev,
										timezone: "Timezone is required",
									}));
									return;
								} else {
									setErrors((prev) => ({ ...prev, timezone: undefined }));
								}
								handleInputChange("timezone", value);
							}}
							required
							value={formData.timezone}
						>
							<SelectTrigger className="w-full max-w-96">
								Select a timezone
							</SelectTrigger>
							<SelectContent align="center">
								<SelectGroup className="no-scrollbar max-h-96 overflow-y-scroll">
									<SelectLabel>Timezones</SelectLabel>
									{TIMEZONES.map(({ label, value }) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						{errors.timezone && (
							<p className="text-red-500 text-sm">{errors.timezone}</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Save Button (Mobile) */}
			<div className="sm:hidden">
				<Button
					className="flex w-full items-center justify-center gap-1 bg-brand-600 hover:bg-brand-700"
					disabled={updateSettings.isPending || !isDirty}
					type="submit"
				>
					{updateSettings.isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</div>
		</form>
	);
}

function SettingsLoadingSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-2">
					<div className="h-8 w-32 animate-pulse rounded-md bg-brand-100" />
					<div className="h-4 w-48 animate-pulse rounded-md bg-brand-100" />
				</div>
				<div className="h-10 w-full animate-pulse rounded-md bg-brand-100 sm:w-32" />
			</div>

			{/* Plan Card Skeleton */}
			<Card className="border-brand-200 bg-linear-to-r from-brand-50 to-white">
				<CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-4">
						<div className="size-12 animate-pulse rounded-full bg-brand-200" />
						<div className="space-y-2">
							<div className="h-5 w-24 animate-pulse rounded-md bg-brand-200" />
							<div className="h-4 w-40 animate-pulse rounded-md bg-brand-200" />
						</div>
					</div>
					<div className="h-10 w-full animate-pulse rounded-md bg-brand-200 sm:w-36" />
				</CardContent>
			</Card>

			{/* Pro Features Skeleton */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<div className="size-5 animate-pulse rounded bg-brand-100" />
						<div className="h-5 w-32 animate-pulse rounded-md bg-brand-100" />
					</div>
					<div className="h-4 w-64 animate-pulse rounded-md bg-brand-100" />
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2">
						{[1, 2, 3, 4].map((i) => (
							<div className="flex items-center gap-2" key={i}>
								<div className="size-5 animate-pulse rounded-full bg-brand-100" />
								<div className="h-4 w-28 animate-pulse rounded-md bg-brand-100" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Discord Settings Skeleton */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<div className="size-5 animate-pulse rounded bg-brand-100" />
						<div className="h-5 w-36 animate-pulse rounded-md bg-brand-100" />
					</div>
					<div className="h-4 w-72 animate-pulse rounded-md bg-brand-100" />
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<div className="h-4 w-28 animate-pulse rounded-md bg-brand-100" />
						<div className="flex gap-2">
							<div className="h-10 flex-1 animate-pulse rounded-md bg-brand-100" />
							<div className="h-10 w-20 animate-pulse rounded-md bg-brand-100" />
						</div>
						<div className="h-3 w-80 animate-pulse rounded-md bg-brand-100" />
					</div>
					<div className="space-y-2">
						<div className="h-4 w-20 animate-pulse rounded-md bg-brand-100" />
						<div className="h-10 w-full animate-pulse rounded-md bg-brand-100" />
					</div>
				</CardContent>
			</Card>

			{/* Notifications Skeleton */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<div className="size-5 animate-pulse rounded bg-brand-100" />
						<div className="h-5 w-28 animate-pulse rounded-md bg-brand-100" />
					</div>
					<div className="h-4 w-56 animate-pulse rounded-md bg-brand-100" />
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50/50 p-4">
						<div className="flex items-center gap-3">
							<div className="size-10 animate-pulse rounded-full bg-brand-200" />
							<div className="space-y-1">
								<div className="h-4 w-36 animate-pulse rounded-md bg-brand-200" />
								<div className="h-3 w-52 animate-pulse rounded-md bg-brand-200" />
							</div>
						</div>
						<div className="h-6 w-11 animate-pulse rounded-full bg-brand-200" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function SettingsErrorState({ error }: { error: Error }) {
	const handleRetry = () => {
		window.location.reload();
	};

	return (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-100">
				<AlertTriangle className="size-8 text-red-600" />
			</div>
			<h2 className="mb-2 font-semibold text-brand-950 text-xl">
				Failed to load settings
			</h2>
			<p className="mb-6 max-w-md text-center text-muted-foreground">
				We couldn&apos;t load your settings. Please check your connection and
				try again.
			</p>
			{env.NODE_ENV === "development" && (
				<div className="mb-6 max-w-md rounded-lg bg-red-50 p-4">
					<p className="font-medium text-red-800 text-sm">Error details:</p>
					<p className="mt-1 font-mono text-red-600 text-xs">{error.message}</p>
				</div>
			)}
			<Button className="bg-brand-600 hover:bg-brand-700" onClick={handleRetry}>
				<RefreshCw className="mr-2 size-4" />
				Try again
			</Button>
		</div>
	);
}
