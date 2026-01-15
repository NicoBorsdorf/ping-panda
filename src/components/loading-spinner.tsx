import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"size-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700",
				className,
			)}
		/>
	);
}
