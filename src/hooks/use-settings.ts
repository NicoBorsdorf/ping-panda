import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface UserSettings {
	discordWebhookUrl: string | null;
	notificationsEnabled: boolean;
	emailNotifications: boolean;
	timezone: string;
}

export interface UpdateSettingsInput extends Partial<UserSettings> {}

// Mock data for development
const mockSettings: UserSettings = {
	discordWebhookUrl: "https://discord.com/api/webhooks/*****/******",
	notificationsEnabled: true,
	emailNotifications: false,
	timezone: "Europe/Berlin",
};

// Query keys
export const settingsKeys = {
	all: ["settings"] as const,
	user: () => [...settingsKeys.all, "user"] as const,
};

// Fetch user settings
export function useSettings() {
	return useQuery({
		queryKey: settingsKeys.user(),
		queryFn: async (): Promise<UserSettings> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			return mockSettings;
		},
	});
}

// Update settings
export function useUpdateSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateSettingsInput): Promise<UserSettings> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			return {
				...mockSettings,
				...input,
			};
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
