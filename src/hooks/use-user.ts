import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { api } from "@/lib/eden";
import type { updateUserSettingsSchema } from "@/server/schemas";

export function useSettings() {
	return useQuery({
		queryKey: ["settings"],
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
export function useUpdateSettings({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: () => void;
} = {}) {
	return useMutation({
		mutationFn: async (input: z.infer<typeof updateUserSettingsSchema>) => {
			return await api.user.settings.put(input).then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to update user settings");
				}
				return data;
			});
		},
		onSuccess,
		onError,
	});
}

// Test Discord connection
export function useTestDiscord({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: () => void;
} = {}) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return await api.user.settings["test-discord"]
				.post()
				.then(({ status, data }) => {
					if (status !== 200 || !data) {
						throw new Error("Failed to test Discord connection");
					}
					return data;
				});
		},
		onSuccess: () => {
			onSuccess?.();

			queryClient.invalidateQueries({ queryKey: ["settings"] });
		},
		onError,
	});
}

export function useUpgrade({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: () => void;
} = {}) {
	return useMutation({
		mutationFn: async () => {
			return await api.user.upgrade.post().then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to upgrade user");
				}
				return data;
			});
		},
		onSuccess,
		onError,
	});
}
