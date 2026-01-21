"use client";

import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-brand-50 to-white px-4">
			{/* Background decoration */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="-right-40 -top-40 absolute size-80 rounded-full bg-red-100/50 blur-3xl" />
				<div className="-left-40 absolute top-20 size-60 rounded-full bg-brand-200/30 blur-3xl" />
			</div>

			<div className="relative z-10 flex max-w-md flex-col items-center text-center">
				{/* Error Icon */}
				<div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
					<AlertTriangle className="size-10 text-red-600" />
				</div>

				{/* Title */}
				<h1 className="mb-2 font-bold text-2xl text-brand-950 tracking-tight sm:text-3xl">
					Something went wrong
				</h1>

				{/* Description */}
				<p className="mb-2 text-muted-foreground">
					We encountered an unexpected error while processing your request.
					Don't worry, our team has been notified.
				</p>

				{/* Error details (only in development) */}
				{process.env.NODE_ENV === "development" && error.message && (
					<div className="mb-6 w-full rounded-lg border border-red-200 bg-red-50 p-4">
						<p className="mb-1 font-medium text-red-800 text-sm">
							Error details:
						</p>
						<p className="break-all font-mono text-red-600 text-xs">
							{error.message}
						</p>
						{error.digest && (
							<p className="mt-2 text-red-500 text-xs">
								Digest: {error.digest}
							</p>
						)}
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						className="bg-brand-600 hover:bg-brand-700"
						onClick={() => reset()}
					>
						<RefreshCw className="mr-2 size-4" />
						Try again
					</Button>
					<Link href="/">
						<Button variant="outline">
							<ArrowLeft className="mr-2 size-4" />
							Back to home
						</Button>
					</Link>
				</div>
			</div>

			{/* Footer branding */}
			<div className="absolute bottom-8 text-muted-foreground text-sm">
				<Link className="hover:text-brand-600" href="/">
					Ping<span className="font-semibold text-brand-700">Panda</span>
				</Link>
			</div>
		</div>
	);
}
