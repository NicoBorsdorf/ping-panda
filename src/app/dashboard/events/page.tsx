"use client";
import { useCategories } from "@/hooks/use-categories";
import { useEvents } from "@/hooks/use-events";
import {
	CategoryGrid,
	EventGrid,
	LoadingSkeleton,
} from "./event-client-components";

export default function EventsPage() {
	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useEvents();
	const {
		data: categories,
		isLoading: categoriesLoading,
		error: categoriesError,
	} = useCategories();

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Event Categories
					</h1>
					<p className="text-muted-foreground">Manage your event categories</p>
				</div>
			</div>

			{categoriesLoading ? (
				<LoadingSkeleton
					description="Please wait while we load your categories."
					title="Loading categories..."
				/>
			) : (
				<CategoryGrid
					categories={categories ?? []}
					error={categoriesError?.message}
				/>
			)}

			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Events
					</h1>
					<p className="text-muted-foreground">
						Manage your events. Create new events and edit existing ones.
					</p>
				</div>
			</div>

			{eventsLoading ? (
				<LoadingSkeleton
					description="Please wait while we load your events."
					title="Loading events..."
				/>
			) : (
				<EventGrid
					categories={categories ?? []}
					error={eventsError?.message}
					events={events ?? []}
				/>
			)}
		</div>
	);
}
