import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// helper functions for try/catch

type SuccessResponse<T> = [T, null];
type ErrorResponse = [null, Error];

export function tryCatch<T>(fn: () => T): SuccessResponse<T> | ErrorResponse {
	try {
		return [fn(), null];
	} catch (error) {
		return [null, error instanceof Error ? error : new Error("Unknown error")];
	}
}

export async function tryCatchAsync<T>(
	fn: () => T | Promise<T>,
): Promise<SuccessResponse<T> | ErrorResponse> {
	try {
		const result = await fn();
		return [result, null];
	} catch (error) {
		return [null, error instanceof Error ? error : new Error("Unknown error")];
	}
}
