import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { tryCatchAsync } from "@/lib/utils";
import { getEventPageData } from "./actions";
import { EventGrid } from "./event-client-components";

export default async function EventsPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const [result, error] = await tryCatchAsync(
		async () => await getEventPageData({ userId }),
	);

	if (error) {
		console.error("Error getting categories:", { error, userId });
		throw new Error("Failed to get categories");
	}

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						Events
					</h1>
					<p className="text-muted-foreground">
						Manage your event categories and triggers
					</p>
				</div>
			</div>

			<EventGrid categories={result[1]} events={result[0]} />
		</div>
	);
}
