import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { api } from "@/lib/eden";
import type {
	createCategorySchema,
	updateCategorySchema,
} from "@/server/schemas";

// Query keys
export const categoryKeys = {
	all: ["categories"] as const,
	lists: () => [...categoryKeys.all, "list"] as const,
};

// Fetch all categories
export function useCategories() {
	return useQuery({
		queryKey: categoryKeys.lists(),
		queryFn: async () => {
			return await api.category.get().then(({ status, data }) => {
				if (status !== 200 || !data) {
					throw new Error("Failed to get categories");
				}

				return data;
			});
		},
	});
}

// Create category
export function useCreateCategory({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
} = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: z.infer<typeof createCategorySchema>) => {
			return await api.category.post(input).then(({ status, data }) => {
				if (status !== 201 || !data) {
					throw new Error("Failed to create category");
				}

				return data;
			});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
		},
		onError,
	});
}

// Update category
export function useUpdateCategory({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
} = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id: number;
			input: z.infer<typeof updateCategorySchema>;
		}) => {
			return await api
				.category({ id })
				.put(input)
				.then(({ status, data }) => {
					if (status !== 200 || !data) {
						throw new Error("Failed to update category");
					}

					return data;
				});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
		},
		onError,
	});
}

// Delete category
export function useDeleteCategory({
	onSuccess,
	onError,
}: {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
} = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return await api
				.category({ id })
				.delete()
				.then(({ status }) => {
					if (status !== 200) {
						throw new Error("Failed to delete category");
					}
				});
		},
		onSuccess: () => {
			onSuccess?.();
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
		},
		onError,
	});
}
