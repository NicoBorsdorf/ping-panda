import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";

// Query keys
export const monitoringKeys = {
	all: ["monitoring"] as const,
	lists: () => [...monitoringKeys.all, "list"] as const,
	list: (filters: { page: number; limit: number }) =>
		[...monitoringKeys.lists(), filters] as const,
	recent: (limit: number) => [...monitoringKeys.all, "recent", limit] as const,
};

// Fetch paginated monitoring entries
export function useMonitoring({ page = 1, limit = 25 } = {}) {
	return useQuery({
		queryKey: monitoringKeys.list({ page, limit }),
		queryFn: async () => {
			return api.monitoring
				.get({
					query: {
						page,
						limit,
					},
				})
				.then(({ status, data }) => {
					if (status !== 200 || !data) {
						throw new Error("Failed to get monitoring entries");
					}

					return data;
				});
		},
		placeholderData: keepPreviousData,
		retry: 3,
	});
}

// Fetch recent monitoring entries (for dashboard)
export function useRecentMonitoring(limit = 5) {
	return useQuery({
		queryKey: monitoringKeys.recent(limit),
		queryFn: async () => {
			return api.monitoring
				.get({
					query: {
						page: 1,
						limit,
					},
				})
				.then(({ status, data }) => {
					if (status !== 200 || !data) {
						throw new Error("Failed to get monitoring entries");
					}

					return data.entries;
				});
		},
	});
}

export function useMonitoringStats() {
	return useQuery({
		queryKey: [...monitoringKeys.all, "stats"],
		queryFn: async () => {
			return api.monitoring.stats.get().then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to get monitoring stats");
				}

				return data;
			});
		},
	});
}
