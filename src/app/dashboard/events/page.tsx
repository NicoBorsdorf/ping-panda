"use client";

import {
	Calendar,
	Edit2,
	MoreVertical,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import type z from "zod";
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
import { useCreateEvent, useDeleteEvent, useEvents } from "@/hooks/use-events";
import type { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import type { createEventSchema } from "@/server/schemas";

const categoryOptions = ["revenue", "users", "system", "marketing", "custom"];

function CreateEventModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const defaultFormData = {
		name: "",
		description: "",
		category: "custom",
		color: "#6991D2",
		fields: {},
	};
	const [formData, setFormData] =
		useState<z.infer<typeof createEventSchema>>(defaultFormData);

	const createEvent = useCreateEvent();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await createEvent.mutateAsync(formData);
		setFormData(defaultFormData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-md">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Create Event</CardTitle>
						<Button onClick={onClose} size="icon" variant="ghost">
							<X className="size-4" />
						</Button>
					</div>
					<CardDescription>
						Define a new event category to track
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<label
								className="mb-1.5 block font-medium text-sm"
								htmlFor="name"
							>
								Name
							</label>
							<Input
								id="name"
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="e.g., New Sale"
								required
								value={formData.name}
							/>
						</div>
						<div>
							<label
								className="mb-1.5 block font-medium text-sm"
								htmlFor="description"
							>
								Description
							</label>
							<Input
								id="description"
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="e.g., Triggered when a sale is completed"
								value={formData.description}
							/>
						</div>
						<div>
							<label
								className="mb-1.5 block font-medium text-sm"
								htmlFor="category"
							>
								Category
							</label>
							<div className="flex flex-wrap gap-2">
								{categoryOptions.map((cat) => (
									<button
										className={cn(
											"rounded-full border px-3 py-1 text-sm capitalize transition-colors",
											formData.category === cat
												? "border-brand-600 bg-brand-100 text-brand-700"
												: "border-border hover:bg-muted",
										)}
										key={cat}
										onClick={() => setFormData({ ...formData, category: cat })}
										type="button"
									>
										{cat}
									</button>
								))}
							</div>
						</div>
						<div>
							<label
								className="mb-1.5 block font-medium text-sm"
								htmlFor="color"
							>
								Color
							</label>
							<div className="flex gap-2">
								<HexColorPicker
									color={formData.color}
									onChange={(color) =>
										setFormData({ ...formData, color: color })
									}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2 pt-4">
							<Button onClick={onClose} type="button" variant="outline">
								Cancel
							</Button>
							<Button
								disabled={createEvent.isPending || !formData.name}
								type="submit"
							>
								{createEvent.isPending ? "Creating..." : "Create Event"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function EventCard({
	event,
	onEdit,
}: {
	event: NonNullable<Awaited<ReturnType<typeof api.event.get>>["data"]>[number];
	onEdit: () => void;
}) {
	const deleteEvent = useDeleteEvent();
	const [showMenu, setShowMenu] = useState(false);

	return (
		<Card className="relative overflow-hidden">
			<div
				className="absolute top-0 left-0 h-full w-1"
				style={{ backgroundColor: event.categoryColor }}
			/>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						<div
							className="size-3 rounded-full"
							style={{ backgroundColor: event.categoryColor }}
						/>
						<CardTitle className="text-base">{event.name}</CardTitle>
					</div>
					<div className="relative">
						<Button
							onClick={() => setShowMenu(!showMenu)}
							size="icon-xs"
							variant="ghost"
						>
							<MoreVertical className="size-4" />
						</Button>
						{showMenu && (
							<>
								<button
									className="fixed inset-0 z-10"
									onClick={() => setShowMenu(false)}
									onKeyDown={(e) => e.key === "Escape" && setShowMenu(false)}
									type="button"
								/>
								<div className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
									<button
										className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
										onClick={() => {
											onEdit();
											setShowMenu(false);
										}}
										type="button"
									>
										<Edit2 className="size-3" />
										Edit
									</button>
									<button
										className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-red-600 text-sm hover:bg-red-50"
										onClick={() => {
											deleteEvent.mutate(event.id);
											setShowMenu(false);
										}}
										type="button"
									>
										<Trash2 className="size-3" />
										Delete
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-muted-foreground text-sm">{event.description}</p>
				<div className="flex items-center justify-between">
					<Badge className="capitalize" variant="secondary">
						{event.categoryName}
					</Badge>
					<span className="text-muted-foreground text-xs">
						Created {event.createdAt.toLocaleDateString()}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export default function EventsPage() {
	const { data: events, isLoading } = useEvents();
	const [search, setSearch] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const filteredEvents = events?.filter(
		(event) =>
			event.name.toLowerCase().includes(search.toLowerCase()) ||
			event.categoryName.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Events
					</h1>
					<p className="text-muted-foreground">
						Manage your event categories and triggers
					</p>
				</div>
				<Button onClick={() => setIsCreateModalOpen(true)}>
					<Plus className="mr-1 size-4" />
					Create Event
				</Button>
			</div>

			{/* Search */}
			<div className="relative max-w-sm">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
				<Input
					className="pl-9"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search events..."
					value={search}
				/>
			</div>

			{/* Events Grid */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
				</div>
			) : !filteredEvents || filteredEvents.length === 0 ? (
				<Card className="py-12">
					<CardContent className="text-center">
						<Calendar className="mx-auto size-12 text-muted-foreground" />
						<h3 className="mt-4 font-semibold text-lg">No events found</h3>
						<p className="mt-1 text-muted-foreground text-sm">
							{search
								? "Try a different search term"
								: "Create your first event to get started"}
						</p>
						{!search && (
							<Button
								className="mt-4"
								onClick={() => setIsCreateModalOpen(true)}
							>
								<Plus className="mr-1 size-4" />
								Create Event
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredEvents.map((event) => (
						<EventCard
							event={event}
							key={event.id}
							onEdit={() => {
								// TODO: Open edit modal
								console.log("Edit event", event.id);
							}}
						/>
					))}
				</div>
			)}

			{/* Create Modal */}
			<CreateEventModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
}
