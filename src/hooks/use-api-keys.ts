import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { api } from "@/lib/eden";
import type { apiKeySchema } from "@/server/schemas";

// Query keys
export const apiKeyKeys = {
	all: ["apiKeys"] as const,
	lists: () => [...apiKeyKeys.all, "list"] as const,
};

// Fetch all API keys
export function useApiKeys() {
	return useQuery({
		queryKey: apiKeyKeys.lists(),
		queryFn: async () => {
			const keys = await api.apikeys.get().then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to fetch API keys");
				}

				return data;
			});
			return keys;
		},
	});
}

// Create API key
export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: z.infer<typeof apiKeySchema>) => {
			const response = await api.apikeys
				.post(input)
				.then(({ status, data }) => {
					if (status !== 201 || !data) {
						throw new Error("Failed to create API key");
					}

					return data;
				});

			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
		},
	});
}

// Delete API key
export function useDeleteApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number): Promise<void> => {
			return await api
				.apikeys({
					id: id,
				})
				.delete()
				.then(({ status }) => {
					if (status !== 200) {
						throw new Error("Failed to delete API key");
					}
				});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
		},
	});
}
