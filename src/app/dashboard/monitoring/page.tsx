"use client";

import {
	Activity,
	CheckCircle,
	ChevronDown,
	Filter,
	RefreshCw,
	Search,
	XCircle,
} from "lucide-react";
import { useState } from "react";
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
import { useMonitoring } from "@/hooks/use-monitoring";
import type { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../(shared)/status-badge";

type MonitoringEntry = NonNullable<
	Awaited<ReturnType<typeof api.monitoring.get>>["data"]
>[number];

function MonitoringRow({ entry }: { entry: MonitoringEntry }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="border-border border-b last:border-b-0">
			<button
				className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
				onClick={() => setExpanded(!expanded)}
				type="button"
			>
				<div
					className={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-full",
						{
							"bg-green-100": entry.status === "sent",
							"bg-red-100": entry.status === "failed",
						},
					)}
				>
					{entry.status === "sent" && (
						<CheckCircle className="size-5 text-green-600" />
					)}
					{entry.status === "failed" && (
						<XCircle className="size-5 text-red-600" />
					)}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="font-medium">{entry.eventName}</span>
						<Badge
							className="text-xs capitalize"
							style={{ backgroundColor: entry.categoryColor }}
							variant="secondary"
						>
							{entry.categoryName}
						</Badge>
					</div>
					<div className="mt-0.5 text-muted-foreground text-sm">
						{entry.createdAt.toLocaleString()}
					</div>
				</div>

				<div className="hidden items-center gap-4 sm:flex">
					<StatusBadge status={entry.status} />
				</div>

				<ChevronDown
					className={cn(
						"size-5 text-muted-foreground transition-transform",
						expanded && "rotate-180",
					)}
				/>
			</button>

			{expanded && (
				<div className="border-border border-t bg-muted/30 p-4">
					<div className="mb-2 font-medium text-sm">Payload</div>
					<pre className="overflow-x-auto rounded-lg bg-brand-950 p-4 font-mono text-brand-100 text-xs">
						{JSON.stringify(entry.payload, null, 2)}
					</pre>
					<div className="mt-4 flex flex-wrap gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Triggered: </span>
							<span>{entry.createdAt.toLocaleString()}</span>
						</div>
						<div className="sm:hidden">
							<StatusBadge status={entry.status} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function MonitoringPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const { data: entries, isLoading, refetch, isFetching } = useMonitoring();

	const filteredEntries = entries?.filter((entry) => {
		const matchesSearch =
			entry.eventName.toLowerCase().includes(search.toLowerCase()) ||
			entry.categoryName.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = !statusFilter || entry.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const statusOptions = [
		{ value: null, label: "All" },
		{ value: "sent", label: "Sent" },
		{ value: "failed", label: "Failed" },
	];

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Monitoring
					</h1>
					<p className="text-muted-foreground">
						View all triggered events and their delivery status
					</p>
				</div>
				<Button
					disabled={isFetching}
					onClick={() => refetch()}
					variant="outline"
				>
					<RefreshCw
						className={cn("mr-1 size-4", isFetching && "animate-spin")}
					/>
					Refresh
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative max-w-sm flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search events..."
						value={search}
					/>
				</div>
				<div className="flex items-center gap-2">
					<Filter className="size-4 text-muted-foreground" />
					<div className="flex gap-1">
						{statusOptions.map((option) => (
							<button
								className={cn(
									"rounded-full px-3 py-1 text-sm transition-colors",
									statusFilter === option.value
										? "bg-brand-700 text-white"
										: "bg-muted text-muted-foreground hover:bg-muted/80",
								)}
								key={option.value ?? "all"}
								onClick={() => setStatusFilter(option.value)}
								type="button"
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Entries List */}
			<Card>
				<CardHeader className="border-b">
					<CardTitle>Event History</CardTitle>
					<CardDescription>
						{filteredEntries?.length ?? 0} events found
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
						</div>
					) : !filteredEntries || filteredEntries.length === 0 ? (
						<div className="py-12 text-center">
							<Activity className="mx-auto size-12 text-muted-foreground" />
							<h3 className="mt-4 font-semibold text-lg">No events found</h3>
							<p className="mt-1 text-muted-foreground text-sm">
								{search || statusFilter
									? "Try adjusting your filters"
									: "Events will appear here when triggered"}
							</p>
						</div>
					) : (
						<div className="divide-y divide-border">
							{filteredEntries.map((entry) => (
								<MonitoringRow entry={entry} key={entry.id} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
