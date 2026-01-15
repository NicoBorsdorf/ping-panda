import { useQuery } from "@tanstack/react-query";

// Types
export interface MonitoringEntry {
	id: string;
	eventId: string;
	eventName: string;
	category: string;
	status: "success" | "failed" | "pending";
	triggeredAt: Date;
	deliveredAt: Date | null;
	payload: Record<string, unknown>;
}

// Mock data for development
const mockMonitoringEntries: MonitoringEntry[] = [
	{
		id: "m1",
		eventId: "1",
		eventName: "New Sale",
		category: "revenue",
		status: "success",
		triggeredAt: new Date("2024-01-15T14:30:00"),
		deliveredAt: new Date("2024-01-15T14:30:01"),
		payload: { amount: 49.0, email: "customer@email.com", plan: "PRO" },
	},
	{
		id: "m2",
		eventId: "2",
		eventName: "User Signup",
		category: "users",
		status: "success",
		triggeredAt: new Date("2024-01-15T13:15:00"),
		deliveredAt: new Date("2024-01-15T13:15:01"),
		payload: { name: "Sarah Johnson", email: "sarah.j@company.io" },
	},
	{
		id: "m3",
		eventId: "1",
		eventName: "New Sale",
		category: "revenue",
		status: "success",
		triggeredAt: new Date("2024-01-15T12:00:00"),
		deliveredAt: new Date("2024-01-15T12:00:01"),
		payload: { amount: 99.0, email: "buyer@example.com", plan: "TEAM" },
	},
	{
		id: "m4",
		eventId: "3",
		eventName: "Subscription Cancelled",
		category: "revenue",
		status: "failed",
		triggeredAt: new Date("2024-01-15T11:30:00"),
		deliveredAt: null,
		payload: { reason: "Payment failed", userId: "usr_123" },
	},
	{
		id: "m5",
		eventId: "2",
		eventName: "User Signup",
		category: "users",
		status: "success",
		triggeredAt: new Date("2024-01-15T10:45:00"),
		deliveredAt: new Date("2024-01-15T10:45:01"),
		payload: { name: "Mike Chen", email: "mike.c@startup.io" },
	},
	{
		id: "m6",
		eventId: "1",
		eventName: "New Sale",
		category: "revenue",
		status: "success",
		triggeredAt: new Date("2024-01-15T09:20:00"),
		deliveredAt: new Date("2024-01-15T09:20:01"),
		payload: { amount: 29.0, email: "new@customer.com", plan: "STARTER" },
	},
];

// Query keys
export const monitoringKeys = {
	all: ["monitoring"] as const,
	lists: () => [...monitoringKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...monitoringKeys.lists(), filters] as const,
	recent: (limit: number) => [...monitoringKeys.all, "recent", limit] as const,
};

// Fetch all monitoring entries
export function useMonitoring(filters?: { eventId?: string; status?: string }) {
	return useQuery({
		queryKey: monitoringKeys.list(filters ?? {}),
		queryFn: async (): Promise<MonitoringEntry[]> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			let entries = [...mockMonitoringEntries];

			if (filters?.eventId) {
				entries = entries.filter((e) => e.eventId === filters.eventId);
			}
			if (filters?.status) {
				entries = entries.filter((e) => e.status === filters.status);
			}

			return entries;
		},
	});
}

// Fetch recent monitoring entries (for dashboard)
export function useRecentMonitoring(limit = 5) {
	return useQuery({
		queryKey: monitoringKeys.recent(limit),
		queryFn: async (): Promise<MonitoringEntry[]> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			return mockMonitoringEntries.slice(0, limit);
		},
	});
}

// Stats for dashboard
export interface MonitoringStats {
	totalToday: number;
	successRate: number;
	averageDeliveryTime: number;
}

export function useMonitoringStats() {
	return useQuery({
		queryKey: [...monitoringKeys.all, "stats"],
		queryFn: async (): Promise<MonitoringStats> => {
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 300));
			return {
				totalToday: 24,
				successRate: 95.8,
				averageDeliveryTime: 87,
			};
		},
	});
}
