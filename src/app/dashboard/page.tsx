"use client";

import {
	Activity,
	ArrowRight,
	Calendar,
	CheckCircle,
	Clock,
	TrendingUp,
	XCircle,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useEvents } from "@/hooks/use-events";
import {
	useMonitoringStats,
	useRecentMonitoring,
} from "@/hooks/use-monitoring";
import { cn } from "@/lib/utils";

function StatCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
}: {
	title: string;
	value: string;
	description: string;
	icon: React.ElementType;
	trend?: { value: string; positive: boolean };
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				<Icon className="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
				<div className="flex items-center gap-1 text-muted-foreground text-xs">
					{trend && (
						<span
							className={cn(
								"flex items-center",
								trend.positive ? "text-green-600" : "text-red-600",
							)}
						>
							<TrendingUp
								className={cn("mr-1 size-3", !trend.positive && "rotate-180")}
							/>
							{trend.value}
						</span>
					)}
					<span>{description}</span>
				</div>
			</CardContent>
		</Card>
	);
}

function StatusBadge({ status }: { status: "success" | "failed" | "pending" }) {
	const config = {
		success: {
			label: "Delivered",
			className: "bg-green-100 text-green-700",
			icon: CheckCircle,
		},
		failed: {
			label: "Failed",
			className: "bg-red-100 text-red-700",
			icon: XCircle,
		},
		pending: {
			label: "Pending",
			className: "bg-yellow-100 text-yellow-700",
			icon: Clock,
		},
	};

	const { label, className, icon: Icon } = config[status];

	return (
		<Badge className={cn("gap-1", className)} variant="outline">
			<Icon className="size-3" />
			{label}
		</Badge>
	);
}

export default function DashboardPage() {
	const { data: events, isLoading: eventsLoading } = useEvents();
	const { data: recentMonitoring, isLoading: monitoringLoading } =
		useRecentMonitoring(5);
	const { data: stats } = useMonitoringStats();

	const recentEvents = events?.slice(0, 5) ?? [];

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div>
				<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
					Dashboard
				</h1>
				<p className="text-muted-foreground">
					Welcome back! Here's an overview of your events.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					description="triggered today"
					icon={Zap}
					title="Events Today"
					trend={{ value: "+12%", positive: true }}
					value={stats?.totalToday.toString() ?? "0"}
				/>
				<StatCard
					description="delivery success"
					icon={CheckCircle}
					title="Success Rate"
					value={`${stats?.successRate ?? 0}%`}
				/>
				<StatCard
					description="average time"
					icon={Clock}
					title="Avg. Delivery"
					value={`${stats?.averageDeliveryTime ?? 0}ms`}
				/>
				<StatCard
					description="configured events"
					icon={Calendar}
					title="Active Events"
					value={events?.length.toString() ?? "0"}
				/>
			</div>

			{/* Content Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Events */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Your Events</CardTitle>
								<CardDescription>
									Event categories you've created
								</CardDescription>
							</div>
							<Link href="/dashboard/events">
								<Button size="sm" variant="ghost">
									View all
									<ArrowRight className="ml-1 size-4" />
								</Button>
							</Link>
						</div>
					</CardHeader>
					<CardContent>
						{eventsLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
							</div>
						) : recentEvents.length === 0 ? (
							<div className="py-8 text-center">
								<Calendar className="mx-auto size-10 text-muted-foreground" />
								<p className="mt-2 text-muted-foreground text-sm">
									No events created yet
								</p>
								<Link href="/dashboard/events">
									<Button className="mt-4" size="sm">
										Create your first event
									</Button>
								</Link>
							</div>
						) : (
							<div className="space-y-3">
								{recentEvents.map((event) => (
									<div
										className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
										key={event.id}
									>
										<div className="flex items-center gap-3">
											<div
												className="size-3 rounded-full"
												style={{ backgroundColor: event.color }}
											/>
											<div>
												<p className="font-medium text-sm">{event.name}</p>
												<p className="text-muted-foreground text-xs">
													{event.category}
												</p>
											</div>
										</div>
										<Badge variant="secondary">{event.category}</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Latest triggered events</CardDescription>
							</div>
							<Link href="/dashboard/monitoring">
								<Button size="sm" variant="ghost">
									View all
									<ArrowRight className="ml-1 size-4" />
								</Button>
							</Link>
						</div>
					</CardHeader>
					<CardContent>
						{monitoringLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
							</div>
						) : !recentMonitoring || recentMonitoring.length === 0 ? (
							<div className="py-8 text-center">
								<Activity className="mx-auto size-10 text-muted-foreground" />
								<p className="mt-2 text-muted-foreground text-sm">
									No activity yet
								</p>
								<p className="mt-1 text-muted-foreground text-xs">
									Trigger an event to see it here
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{recentMonitoring.map((entry) => (
									<div
										className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
										key={entry.id}
									>
										<div className="flex flex-1 items-center gap-3">
											<div
												className={cn(
													"flex size-8 items-center justify-center rounded-full",
													entry.status === "success"
														? "bg-green-100"
														: entry.status === "failed"
															? "bg-red-100"
															: "bg-yellow-100",
												)}
											>
												{entry.status === "success" ? (
													<CheckCircle className="size-4 text-green-600" />
												) : entry.status === "failed" ? (
													<XCircle className="size-4 text-red-600" />
												) : (
													<Clock className="size-4 text-yellow-600" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-sm">
													{entry.eventName}
												</p>
												<p className="text-muted-foreground text-xs">
													{entry.triggeredAt.toLocaleTimeString()}
												</p>
											</div>
										</div>
										<StatusBadge status={entry.status} />
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
