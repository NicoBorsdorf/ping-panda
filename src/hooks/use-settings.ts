import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { api } from "@/lib/eden";
import type { updateUserSettingsSchema } from "@/server/schemas";

// Query keys
export const settingsKeys = {
	all: ["settings"] as const,
	user: () => [...settingsKeys.all, "user"] as const,
};

// Fetch user settings
export function useSettings() {
	return useQuery({
		queryKey: settingsKeys.user(),
		queryFn: async () => {
			return await api.user.settings.get().then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to get user settings");
				}

				return data;
			});
		},
	});
}

// Update settings
export function useUpdateSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: z.infer<typeof updateUserSettingsSchema>) => {
			return api.user.settings.put(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsKeys.user() });
		},
	});
}

// Test Discord webhook
export function useTestWebhook() {
	return useMutation({
		mutationFn: async (): Promise<boolean> => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return true;
		},
	});
}
