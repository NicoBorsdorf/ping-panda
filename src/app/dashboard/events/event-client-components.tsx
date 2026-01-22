"use client";
import { useForm } from "@tanstack/react-form";
import {
	Calendar,
	Edit2,
	Loader2,
	MoreVertical,
	Palette,
	Plus,
	RefreshCcw,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading-spinner";
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
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/hooks/use-categories";
import {
	useCreateEvent,
	useDeleteEvent,
	useUpdateEvent,
} from "@/hooks/use-events";
import type { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import { eventSchema } from "@/server/schemas";

// ============================================
// TYPES
// ============================================
type Event = NonNullable<
	Awaited<ReturnType<typeof api.event.get>>["data"]
>[number];
type Category = NonNullable<
	Awaited<ReturnType<typeof api.category.get>>["data"]
>[number];

// ============================================
// EVENT COMPONENTS
// ============================================

function CreateEventModal({
	categories,
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	categories: Category[];
	onClose: () => void;
}) {
	const createEvent = useCreateEvent({
		onSuccess: () => {
			toast.success("Event created", {
				description: "Your event has been created successfully.",
			});
			form.reset();
			onClose();
		},
		onError: (error) => {
			toast.error("Failed to create event", {
				description: error.message,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			categoryId: categories[0]?.id ?? 0,
			payload: [] as string[],
		},
		onSubmit: async ({ value }) => {
			await createEvent.mutateAsync(value);
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				type="button"
			/>
			<Card className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Create Event</CardTitle>
						<Button onClick={onClose} size="icon" variant="ghost">
							<X className="size-4" />
						</Button>
					</div>
					<CardDescription>
						Define a new event to track in your application
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field name="name">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Name *</Label>
									<Input
										id={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., new-sale"
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Description</Label>
									<Input
										id={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., Triggered when a sale is completed"
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="categoryId">
							{(field) => (
								<div>
									<Label>Category *</Label>
									{categories.length === 0 ? (
										<p className="py-2 text-muted-foreground text-sm">
											No categories found. Create a category first.
										</p>
									) : (
										<div className="mt-1.5 flex flex-wrap gap-2">
											{categories.map((cat) => (
												<button
													className={cn(
														"flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
														field.state.value === cat.id
															? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
															: "border-border hover:bg-muted",
													)}
													key={cat.id}
													onClick={() => field.handleChange(cat.id)}
													type="button"
												>
													<span
														className="size-2.5 rounded-full"
														style={{ backgroundColor: cat.color }}
													/>
													{cat.name}
												</button>
											))}
										</div>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="payload">
							{(field) => (
								<PayloadFieldEditor
									onChange={field.handleChange}
									value={field.state.value}
								/>
							)}
						</form.Field>

						<div className="flex justify-end gap-2 border-t pt-4">
							<Button onClick={onClose} type="button" variant="outline">
								Cancel
							</Button>
							<Button
								disabled={createEvent.isPending || categories.length === 0}
								type="submit"
							>
								{createEvent.isPending && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Create Event
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function EditEventModal({
	event,
	categories,
	isOpen,
	onClose,
}: {
	event: Event;
	categories: Category[];
	isOpen: boolean;
	onClose: () => void;
}) {
	const updateEvent = useUpdateEvent();

	// Convert fields object to array format for the form
	const initialPayload: string[] = event.payloadFieldNames;

	const form = useForm({
		defaultValues: {
			name: event.name,
			description: event.description,
			categoryId: event.category.id,
			payload: initialPayload,
		},
		onSubmit: ({ value }) => {
			updateEvent.mutate(
				{ id: event.id, input: value },
				{
					onSuccess: () => {
						toast.success("Event updated", {
							description: "Your event has been updated successfully.",
						});
						onClose();
					},
					onError: (error) => {
						toast.error("Failed to update event", {
							description: error.message,
						});
					},
				},
			);
		},
		validators: {
			onSubmit: eventSchema,
			onChange: eventSchema,
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				type="button"
			/>
			<Card className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Edit Event</CardTitle>
						<Button onClick={onClose} size="icon" variant="ghost">
							<X className="size-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field name="name">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Name *</Label>
									<Input
										id={field.name}
										name={field.name}
										onBlur={() => field.handleBlur()}
										onChange={(e) => field.handleChange(e.target.value)}
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Description</Label>
									<Input
										id={field.name}
										name={field.name}
										onBlur={() => field.handleBlur()}
										onChange={(e) => field.handleChange(e.target.value)}
										value={field.state.value ?? ""}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="categoryId">
							{(field) => (
								<div>
									<Label>Category *</Label>
									<div className="mt-1.5 flex flex-wrap gap-2">
										{categories.map((cat) => (
											<button
												className={cn(
													"flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
													field.state.value === cat.id
														? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
														: "border-border hover:bg-muted",
												)}
												key={cat.id}
												onBlur={() => field.handleBlur()}
												onClick={() => field.handleChange(cat.id)}
												type="button"
											>
												<span
													className="size-2.5 rounded-full"
													style={{ backgroundColor: cat.color }}
												/>
												{cat.name}
											</button>
										))}
									</div>
								</div>
							)}
						</form.Field>

						<form.Field name="payload">
							{(field) => (
								<PayloadFieldEditor
									onChange={field.handleChange}
									value={field.state.value}
								/>
							)}
						</form.Field>

						<form.Subscribe
							selector={(state) => [state.isPristine, state.isSubmitting]}
						>
							{([isPristine, isSubmitting]) => (
								<div className="flex justify-end gap-2 border-t pt-4">
									<Button
										onClick={() => {
											form.reset();
											onClose();
										}}
										type="button"
										variant="outline"
									>
										Cancel
									</Button>
									<Button disabled={isPristine || isSubmitting} type="submit">
										{isSubmitting && (
											<Loader2 className="mr-2 size-4 animate-spin" />
										)}
										Save Changes
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

function PayloadFieldEditor({
	value,
	onChange,
}: {
	value: string[];
	onChange: (value: string[]) => void;
}) {
	const addField = () => {
		onChange([...value, ""]);
	};

	const updateField = (index: number, updates: string) => {
		const newValue = [...value];
		newValue[index] = updates;
		onChange(newValue);
	};

	const removeField = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div>
			<Label>Payload Fields</Label>
			<p className="mb-2 text-muted-foreground text-sm">
				Define the data structure for this event
			</p>

			{value.length > 0 ? (
				<div className="space-y-2">
					{value.map((field, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Fields don't have stable IDs
						<div className="flex items-center gap-2" key={idx}>
							<Input
								className="flex-1"
								onChange={(e) => updateField(idx, e.target.value)}
								placeholder="Field name"
								value={field}
							/>
							<Button
								onClick={() => removeField(idx)}
								size="icon"
								type="button"
								variant="ghost"
							>
								<X className="size-4 text-red-500" />
							</Button>
						</div>
					))}
				</div>
			) : (
				<p className="py-2 text-muted-foreground text-sm">
					No payload fields defined.
				</p>
			)}

			<Button
				className="mt-2"
				onClick={addField}
				size="sm"
				type="button"
				variant="outline"
			>
				<Plus className="mr-1 size-3" />
				Add Field
			</Button>
		</div>
	);
}

function EventCard({
	event,
	categories,
}: {
	event: Event;
	categories: Category[];
}) {
	const [showMenu, setShowMenu] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const deleteEvent = useDeleteEvent();

	const handleDelete = () => {
		deleteEvent.mutate(event.id, {
			onSuccess: () => {
				toast.success("Event deleted", {
					description: `"${event.name}" has been deleted.`,
				});
				setShowDeleteConfirm(false);
			},
			onError: (error) => {
				toast.error("Failed to delete event", {
					description: error.message,
				});
			},
		});
	};

	return (
		<>
			<Card className="group relative overflow-hidden">
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
								className="opacity-0 transition-opacity group-hover:opacity-100"
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
										type="button"
									/>
									<div className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
										<button
											className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
											onClick={() => {
												setShowEditModal(true);
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
												setShowDeleteConfirm(true);
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
					{event.description && (
						<div className="mt-2 flex flex-col gap-2">
							<Label>Description</Label>
							<p className="line-clamp-2 text-muted-foreground text-sm">
								{event.description}
							</p>
						</div>
					)}
					{event.payloadFieldNames.length > 0 && (
						<div className="mt-2 flex flex-col gap-2">
							<Label>Event payload</Label>
							<div className="flex flex-wrap items-center gap-2">
								{event.payloadFieldNames.map((field) => (
									<Badge key={field}>{field}</Badge>
								))}
							</div>
						</div>
					)}
					<div className="flex items-center justify-between">
						<Badge
							className="capitalize"
							style={{ backgroundColor: `${event.category.color}20` }}
							variant="secondary"
						>
							{event.category.name}
						</Badge>
						<span className="text-muted-foreground text-xs">
							{event.createdAt.toLocaleDateString()}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Edit Modal */}
			<EditEventModal
				categories={categories}
				event={event}
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
			/>

			{/* Delete Confirmation */}
			{showDeleteConfirm && (
				<DeleteConfirmModal
					description={`This will permanently delete "${event.name}" and all associated monitoring data.`}
					isDeleting={deleteEvent.isPending}
					onCancel={() => setShowDeleteConfirm(false)}
					onConfirm={handleDelete}
					title="Delete Event"
				/>
			)}
		</>
	);
}

export function EventGrid({
	events,
	categories,
	error,
}: {
	events: Event[];
	categories: Category[];
	error?: string;
}) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const filteredEvents = events?.filter(
		(event) =>
			event.name.toLowerCase().includes(search.toLowerCase()) ||
			event.category.name.toLowerCase().includes(search.toLowerCase()),
	);

	if (error) {
		return (
			<Card className="py-8">
				<CardContent className="text-center">
					<p className="text-muted-foreground text-sm">{error}</p>
					<p className="text-muted-foreground text-sm">
						An error occurred while loading the events. Please try again.
					</p>
					<Button className="mt-4" onClick={() => router.refresh()} size="sm">
						<RefreshCcw className="mr-1 size-4" />
						Refresh
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="flex items-center justify-between gap-4">
				<div className="relative max-w-md flex-1">
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
							categories={categories ?? []}
							event={event}
							key={event.id}
						/>
					))}
				</div>
			)}

			<CreateEventModal
				categories={categories ?? []}
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</>
	);
}

// ============================================
// CATEGORY COMPONENTS
// ============================================

function CreateCategoryModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const createCategory = useCreateCategory({
		onSuccess: () => {
			toast.success("Category created", {
				description: "Your category has been created successfully.",
			});
			form.reset();
			onClose();
		},
		onError: (error) => {
			toast.error("Failed to create category", {
				description: error.message,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			color: "#6991D2",
		},
		onSubmit: async ({ value }) => {
			await createCategory.mutateAsync(value);
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-md">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Create Category</CardTitle>
						<Button onClick={onClose} size="icon" variant="ghost">
							<X className="size-4" />
						</Button>
					</div>
					<CardDescription>
						Categories help organize your events
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field name="name">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Name *</Label>
									<Input
										id={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., Sales"
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Description</Label>
									<Input
										id={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., Sales-related events"
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="color">
							{(field) => (
								<div>
									<Label className="flex items-center gap-2">
										<Palette className="size-4" />
										Color
									</Label>
									<div className="mt-2 flex items-start gap-4">
										<HexColorPicker
											color={field.state.value}
											onChange={field.handleChange}
											style={{ width: "100%", height: 150 }}
										/>
										<div
											className="size-12 shrink-0 rounded-lg border shadow-sm"
											style={{ backgroundColor: field.state.value }}
										/>
									</div>
								</div>
							)}
						</form.Field>

						<div className="flex justify-end gap-2 border-t pt-4">
							<Button onClick={onClose} type="button" variant="outline">
								Cancel
							</Button>
							<Button disabled={createCategory.isPending} type="submit">
								{createCategory.isPending && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Create Category
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function EditCategoryModal({
	category,
	isOpen,
	onClose,
}: {
	category: Category;
	isOpen: boolean;
	onClose: () => void;
}) {
	const updateCategory = useUpdateCategory({
		onSuccess: () => {
			toast.success("Category updated", {
				description: "Your category has been updated successfully.",
			});
			onClose();
		},
		onError: (error) => {
			toast.error("Failed to update category", {
				description: error.message,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: category.name,
			description: category.description ?? "",
			color: category.color,
		},
		onSubmit: async ({ value }) => {
			await updateCategory.mutateAsync({ id: category.id, input: value });
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-md">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Edit Category</CardTitle>
						<Button onClick={onClose} size="icon" variant="ghost">
							<X className="size-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field name="name">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Name *</Label>
									<Input
										id={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div>
									<Label htmlFor={field.name}>Description</Label>
									<Input
										id={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="color">
							{(field) => (
								<div>
									<Label className="flex items-center gap-2">
										<Palette className="size-4" />
										Color
									</Label>
									<div className="mt-2 flex items-start gap-4">
										<HexColorPicker
											color={field.state.value}
											onChange={field.handleChange}
											style={{ width: "100%", height: 150 }}
										/>
										<div
											className="size-12 shrink-0 rounded-lg border shadow-sm"
											style={{ backgroundColor: field.state.value }}
										/>
									</div>
								</div>
							)}
						</form.Field>

						<div className="flex justify-end gap-2 border-t pt-4">
							<Button onClick={onClose} type="button" variant="outline">
								Cancel
							</Button>
							<Button disabled={updateCategory.isPending} type="submit">
								{updateCategory.isPending && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
								Save Changes
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function CategoryCard({ category }: { category: Category }) {
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const deleteCategory = useDeleteCategory({
		onSuccess: () => {
			toast.success("Category deleted", {
				description: `"${category.name}" and all its events have been deleted.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to delete category", {
				description: error.message,
			});
		},
	});

	return (
		<>
			<div
				className="group relative flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:shadow-md"
				style={{ backgroundColor: `${category.color}15` }}
			>
				<div
					className="flex size-10 items-center justify-center rounded-lg text-lg"
					style={{ backgroundColor: category.color }}
				>
					{category.name.charAt(0).toUpperCase()}
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">{category.name}</p>
					{category.description && (
						<p className="truncate text-muted-foreground text-xs">
							{category.description}
						</p>
					)}
				</div>
				<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
					<Button
						onClick={() => setShowEditModal(true)}
						size="icon-xs"
						variant="ghost"
					>
						<Edit2 className="size-3.5" />
					</Button>
					<Button
						onClick={() => setShowDeleteConfirm(true)}
						size="icon-xs"
						variant="ghost"
					>
						<Trash2 className="size-3.5 text-red-500" />
					</Button>
				</div>
			</div>

			<EditCategoryModal
				category={category}
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
			/>

			{showDeleteConfirm && (
				<DeleteConfirmModal
					description={`This will permanently delete "${category.name}" and ALL events in this category.`}
					isDeleting={deleteCategory.isPending}
					onCancel={() => setShowDeleteConfirm(false)}
					onConfirm={() => deleteCategory.mutate(category.id)}
					title="Delete Category"
				/>
			)}
		</>
	);
}

export function CategoryGrid({
	categories,
	error,
}: {
	categories: Category[];
	error?: string;
}) {
	const router = useRouter();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	if (error) {
		return (
			<Card className="py-8">
				<CardContent className="text-center">
					<p className="text-muted-foreground text-sm">{error}</p>
					<p className="text-muted-foreground text-sm">
						An error occurred while loading the categories. Please try again.
					</p>
					<Button className="mt-4" onClick={() => router.refresh()} size="sm">
						<RefreshCcw className="mr-1 size-4" />
						Refresh
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">Categories</h2>
				<Button onClick={() => setIsCreateModalOpen(true)} size="sm">
					<Plus className="mr-1 size-4" />
					Create Category
				</Button>
			</div>

			<Card className="py-8">
				<CardContent className="text-center">
					{!categories || categories.length === 0 ? (
						<>
							<Palette className="mx-auto size-10 text-muted-foreground" />
							<p className="mt-2 text-muted-foreground text-sm">
								No categories yet. Create one to organize your events.
							</p>
							<Button
								className="mt-4"
								onClick={() => setIsCreateModalOpen(true)}
								size="sm"
							>
								<Plus className="mr-1 size-4" />
								Create Category
							</Button>
						</>
					) : (
						<div className="flex flex-wrap gap-3">
							{categories.map((category) => (
								<CategoryCard category={category} key={category.id} />
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<CreateCategoryModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
}

// ============================================
// SHARED COMPONENTS
// ============================================

function DeleteConfirmModal({
	title,
	description,
	isDeleting,
	onConfirm,
	onCancel,
}: {
	title: string;
	description: string;
	isDeleting: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onCancel}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-red-600">{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-end gap-2">
						<Button disabled={isDeleting} onClick={onCancel} variant="outline">
							Cancel
						</Button>
						<Button
							disabled={isDeleting}
							onClick={onConfirm}
							variant="destructive"
						>
							{isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
							Delete
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function LoadingSkeleton({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<Card className="py-8">
			<CardContent className="flex flex-col items-center justify-center text-center">
				<LoadingSpinner className="size-8" />
				<h3 className="mt-4 font-semibold text-lg">{title}</h3>
				<p className="mt-1 text-muted-foreground text-sm">{description}</p>
			</CardContent>
		</Card>
	);
}
