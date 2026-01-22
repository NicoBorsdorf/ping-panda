"use client";
import { useForm } from "@tanstack/react-form";
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
import { useSonner } from "sonner";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
} from "@/components/ui/select";
import { useCreateEvent, useDeleteEvent } from "@/hooks/use-events";
import { cn } from "@/lib/utils";
import { eventSchema } from "@/server/schemas";
import type { getEventPageData } from "./actions";

function CreateEventModal({
	categories,
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	categories: Awaited<ReturnType<typeof getEventPageData>>[1];
	onClose: () => void;
}) {
	const { toasts } = useSonner();

	const defaultFormData = {
		name: "",
		description: "",
		category: "custom",
		payload: {},
	} as z.infer<typeof eventSchema>;

	const createEvent = useCreateEvent({
		onSuccess: () => {
			toasts.push({
				id: Date.now(),
				title: "Event created successfully",
				description: "Your event has been created successfully",
				duration: 3000,
			});
		},
		onError: (error) => {
			toasts.push({
				id: Date.now(),
				title: "Failed to create event",
				description: error.message,
				duration: 3000,
			});
		},
	});

	const form = useForm({
		defaultValues: defaultFormData,
		onSubmit: async ({ formApi, value }) => {
			await createEvent.mutateAsync({
				...value,
			});

			formApi.reset();
			onClose();
		},
		defaultState: {
			canSubmit: false,
		},
		validators: {
			onChange: eventSchema.safeParse,
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key !== "Escape") return;

					form.reset();
					onClose();
				}}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-lg">
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
					<form className="space-y-4">
						<form.Field name="name">
							{(field) => (
								<div>
									<Label
										className="mb-1.5 block font-medium text-sm"
										htmlFor={field.name}
									>
										Name
									</Label>
									<Input
										id={field.name}
										name={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., New Sale"
										required
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div>
									<Label
										className="mb-1.5 block font-medium text-sm"
										htmlFor={field.name}
									>
										Description
									</Label>
									<Input
										id={field.name}
										name={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., Triggered when a sale is completed"
										required
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="category">
							{(field) => (
								<div>
									<Label
										className="mb-1.5 block font-medium text-sm"
										htmlFor={field.name}
									>
										Category
									</Label>
									<div className="flex flex-wrap gap-2">
										{categories.length === 0 && (
											<p className="text-muted-foreground text-sm">
												No categories found. Please create a category first.
											</p>
										)}
										{categories.map(({ name, emoji, color }) => (
											<button
												className={cn(
													"rounded-full border px-3 py-1 text-sm capitalize transition-colors",
													{
														"border-brand-600 bg-brand-100 text-brand-700":
															field.state.value === name,
														"border-border hover:bg-muted":
															field.state.value !== name,
													},
												)}
												key={name}
												onClick={() => field.handleChange(name)}
												style={{ backgroundColor: color }}
												type="button"
											>
												<span className="mr-1 size-3 rounded-full">
													{emoji}
												</span>
												{name}
											</button>
										))}
									</div>
								</div>
							)}
						</form.Field>

						<form.Field name="payload">
							{(field) => (
								<div>
									<Label className="mb-1.5 block font-medium text-sm">
										Payload
									</Label>
									<p className="mb-2 text-muted-foreground text-sm">
										Add keys to the event payload. Choose a type for each key.
									</p>
									{Array.isArray(field.state.value) &&
									field.state.value.length > 0 ? (
										field.state.value.map(({ key, type }, idx) => (
											<div className="mb-2 flex items-center gap-2" key={key}>
												<Input
													onChange={(e) => {
														field.handleChange([
															...field.state.value,
															{ key: e.target.value, type },
														]);
													}}
													placeholder="Key"
													required
													value={key}
												/>
												<Select
													onValueChange={(e) => {
														field.handleChange([
															...field.state.value,
															{
																key,
																type: e as "string" | "number" | "boolean",
															},
														]);
													}}
													value={type}
												>
													<SelectContent>
														<SelectGroup>
															<SelectItem value="string">String</SelectItem>
															<SelectItem value="number">Number</SelectItem>
															<SelectItem value="boolean">Boolean</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
												<button
													aria-label="Remove key"
													className="ml-2 text-red-600 hover:underline"
													onClick={() => {
														const newValue = field.state.value.filter(
															(_: any, i: number) => i !== idx,
														);
														field.handleChange(newValue);
													}}
													type="button"
												>
													Remove
												</button>
											</div>
										))
									) : (
										<p className="mb-2 text-muted-foreground text-sm">
											No payload keys defined.
										</p>
									)}
									<button
										className="text-blue-600 text-sm hover:underline"
										onClick={() => {
											field.handleChange(
												field.state.value.concat([
													{ key: "", type: "string" as const },
												]),
											);
										}}
										type="button"
									>
										Add key
									</button>
								</div>
							)}
						</form.Field>

						<form.Subscribe
							selector={(state) => [state.isSubmitting, state.canSubmit]}
						>
							{([isSubmitting, canSubmit]) => (
								<div className="flex justify-end gap-2 pt-4">
									<Button onClick={onClose} type="button" variant="outline">
										Cancel
									</Button>
									<Button disabled={isSubmitting || !canSubmit} type="submit">
										{isSubmitting ? "Creating..." : "Create Event"}
									</Button>
								</div>
							)}
						</form.Subscribe>
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
	event: Awaited<ReturnType<typeof getEventPageData>>[0][number];
	onEdit: () => void;
}) {
	const deleteEvent = useDeleteEvent();
	const [showMenu, setShowMenu] = useState(false);

	return (
		<Card className="relative overflow-hidden">
			<div
				className="absolute top-0 left-0 h-full w-1"
				style={{ backgroundColor: event.category.color }}
			/>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						<div
							className="size-3 rounded-full"
							style={{ backgroundColor: event.category.color }}
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
						{event.category.name}
					</Badge>
					<span className="text-muted-foreground text-xs">
						Created {event.createdAt.toLocaleDateString()}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function EventGrid({
	events,
	categories,
}: {
	events: Awaited<ReturnType<typeof getEventPageData>>[0];
	categories: Awaited<ReturnType<typeof getEventPageData>>[1];
}) {
	const [search, setSearch] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const filteredEvents = events?.filter(
		(event) =>
			event.name.toLowerCase().includes(search.toLowerCase()) ||
			event.category.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<>
			{/* Search */}
			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-md">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search events..."
						value={search}
					/>
				</div>

				<Button onClick={() => setIsCreateModalOpen(true)}>
					<Plus className="mr-1 size-4" />
					Create Event
				</Button>
			</div>

			{/* Events Grid */}
			{!filteredEvents || filteredEvents.length === 0 ? (
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
				categories={categories}
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</>
	);
}
