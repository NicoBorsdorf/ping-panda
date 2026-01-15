import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface ApiKey {
	id: string;
	name: string;
	key: string; // Masked, e.g., "pk_live_****xxxx"
	createdAt: Date;
	lastUsedAt: Date | null;
}

export interface CreateApiKeyInput {
	name: string;
}

export interface CreateApiKeyResponse {
	id: string;
	name: string;
	key: string; // Full key, only shown once
	createdAt: Date;
}

// Mock data for development
const mockApiKeys: ApiKey[] = [
	{
		id: "key1",
		name: "Production Key",
		key: "pk_live_****7x9z",
		createdAt: new Date("2024-01-10"),
		lastUsedAt: new Date("2024-01-15T14:30:00"),
	},
	{
		id: "key2",
		name: "Development Key",
		key: "pk_test_****3a2b",
		createdAt: new Date("2024-01-05"),
		lastUsedAt: new Date("2024-01-14T09:15:00"),
	},
];

// Query keys
export const apiKeyKeys = {
	all: ["apiKeys"] as const,
	lists: () => [...apiKeyKeys.all, "list"] as const,
};

// Fetch all API keys
export function useApiKeys() {
	return useQuery({
		queryKey: apiKeyKeys.lists(),
		queryFn: async (): Promise<ApiKey[]> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			return mockApiKeys;
		},
	});
}

// Create API key
export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			input: CreateApiKeyInput,
		): Promise<CreateApiKeyResponse> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Generate a fake key for demo
			const fullKey = `pk_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

			return {
				id: Math.random().toString(36).slice(2),
				name: input.name,
				key: fullKey,
				createdAt: new Date(),
			};
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
		mutationFn: async (_id: string): Promise<void> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
		},
	});
}
