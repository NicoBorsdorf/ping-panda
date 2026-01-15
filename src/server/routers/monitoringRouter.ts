import Elysia from "elysia";

export const monitoringRouter = new Elysia({
	prefix: "/monitoring",
	tags: ["monitoring"],
})
	.post("", async () => {
		return new Response("Event monitoring create", { status: 200 });
	})
	.get("", async () => {
		return new Response("Event monitoring", { status: 200 });
	})
	.get("/:id", async () => {
		return new Response("Event monitoring get", { status: 200 });
	})
	.put("/:id", async () => {
		return new Response("Event monitoring update", { status: 200 });
	})
	.delete("/:id", async () => {
		return new Response("Event monitoring delete", { status: 200 });
	});
