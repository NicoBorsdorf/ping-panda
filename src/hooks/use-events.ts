import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface Event {
	id: string;
	name: string;
	description: string;
	category: string;
	color: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateEventInput {
	name: string;
	description: string;
	category: string;
	color: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
	id: string;
}

// Mock data for development
const mockEvents: Event[] = [
	{
		id: "1",
		name: "New Sale",
		description: "Triggered when a new sale is completed",
		category: "revenue",
		color: "#faa61a",
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "2",
		name: "User Signup",
		description: "Triggered when a new user signs up",
		category: "users",
		color: "#43b581",
		createdAt: new Date("2024-01-14"),
		updatedAt: new Date("2024-01-14"),
	},
	{
		id: "3",
		name: "Subscription Cancelled",
		description: "Triggered when a subscription is cancelled",
		category: "revenue",
		color: "#f04747",
		createdAt: new Date("2024-01-13"),
		updatedAt: new Date("2024-01-13"),
	},
];

// Query keys
export const eventKeys = {
	all: ["events"] as const,
	lists: () => [...eventKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...eventKeys.lists(), filters] as const,
	details: () => [...eventKeys.all, "detail"] as const,
	detail: (id: string) => [...eventKeys.details(), id] as const,
};

// Fetch all events
export function useEvents() {
	return useQuery({
		queryKey: eventKeys.lists(),
		queryFn: async (): Promise<Event[]> => {
			// TODO: Replace with actual API call
			// const response = await api.events.get();
			// return response.data;
			await new Promise((resolve) => setTimeout(resolve, 500));
			return mockEvents;
		},
	});
}

// Fetch single event
export function useEvent(id: string) {
	return useQuery({
		queryKey: eventKeys.detail(id),
		queryFn: async (): Promise<Event | undefined> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 300));
			return mockEvents.find((e) => e.id === id);
		},
		enabled: !!id,
	});
}

// Create event
export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateEventInput): Promise<Event> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			return {
				...input,
				id: Math.random().toString(36).slice(2),
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
		},
	});
}

// Update event
export function useUpdateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateEventInput): Promise<Event> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			const existing = mockEvents.find((e) => e.id === input.id);
			if (!existing) throw new Error("Event not found");
			return {
				...existing,
				...input,
				updatedAt: new Date(),
			};
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
			queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) });
		},
	});
}

// Delete event
export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (_id: string): Promise<void> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
		},
	});
}
