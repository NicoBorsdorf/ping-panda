import { Elysia } from "elysia";

export const eventRouter = new Elysia({ prefix: "/event", tags: ["event"] })
	.post("/", async () => {
		return new Response("Event created", { status: 200 });
	})
	.get("/", async () => {
		return new Response("Event list", { status: 200 });
	})
	.get("/:id", async () => {
		return new Response("Event get", { status: 200 });
	})
	.put("/:id", async () => {
		return new Response("Event update", { status: 200 });
	})
	.delete("/:id", async () => {
		return new Response("Event delete", { status: 200 });
	});
