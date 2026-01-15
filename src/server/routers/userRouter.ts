import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { tryCatchAsync } from "@/lib/utils";
import { db } from "../db";
import { userTable } from "../db/schema";

export const userRouter = new Elysia({ prefix: "/user", tags: ["user"] }).post(
	"/sync",
	async () => {
		const user = await currentUser();

		if (!user || !user.id) {
			console.error("No user found");

			return new Response(JSON.stringify({ isSynced: false }), {
				status: 401,
				statusText: "Unauthorized",
			});
		}

		const [_, error] = await tryCatchAsync(async () => {
			console.info("Checking user:", user.id);
			const [dbUser] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.id, user.id))
				.limit(1);

			if (dbUser) {
				console.info("User already exists:", user.id);
				return;
			}

			console.info("User does not exist, creating user:", user.id);
			await db.insert(userTable).values({
				id: user.id,
			});

			console.info("User created:", user.id);
			return;
		});

		if (error) {
			console.error("Error syncing user:", error);

			return new Response(JSON.stringify({ isSynced: false }), {
				status: 500,
				statusText: "Internal server error",
			});
		}

		return new Response(JSON.stringify({ isSynced: true }), { status: 200 });
	},
);
