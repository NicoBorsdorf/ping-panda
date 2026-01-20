import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { api } from "@/lib/eden";
import type { createEventSchema, updateEventSchema } from "@/server/schemas";

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
		queryFn: async () => {
			return api.event.get().then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to get events");
				}

				return data;
			});
		},
	});
}

// Fetch single event
export function useEvent(id: number) {
	return useQuery({
		queryKey: eventKeys.detail(id.toString()),
		queryFn: async () => {
			return api
				.event({ id })
				.get()
				.then(({ status, data }) => {
					if (status !== 200 || !data) {
						throw new Error("Failed to get event");
					}

					return data;
				});
		},
		enabled: !!id,
	});
}

// Create event
export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: z.infer<typeof createEventSchema>) => {
			return await api.event.post(input).then(({ status, data }) => {
				if (status !== 201 || !data) {
					throw new Error("Failed to create event");
				}

				return data;
			});
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
		mutationFn: async ({
			id,
			input,
		}: {
			id: number;
			input: z.infer<typeof updateEventSchema>;
		}) => {
			return await api
				.event({ id })
				.put(input)
				.then(({ status, data }) => {
					if (status !== 200 || !data) {
						throw new Error("Failed to update event");
					}

					return data;
				});
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: eventKeys.detail(data.id.toString()),
			});
		},
	});
}

// Delete event
export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return await api
				.event({ id })
				.delete()
				.then(({ status }) => {
					if (status !== 200) {
						throw new Error("Failed to delete event");
					}
				});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
		},
	});
}
