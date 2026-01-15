import Elysia from "elysia";

export const apiKeyRouter = new Elysia({
	prefix: "/api-key",
	tags: ["api-key"],
})
	.post("/", async () => {
		return new Response("API key created", { status: 200 });
	})
	.get("/", async () => {
		return new Response("API key list", { status: 200 });
	})
	.get("/:id", async () => {
		return new Response("API key get", { status: 200 });
	})
	.put("/:id", async () => {
		return new Response("API key update", { status: 200 });
	})
	.delete("/:id", async () => {
		return new Response("API key delete", { status: 200 });
	});
