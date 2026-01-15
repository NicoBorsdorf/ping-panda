import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { apiKeyRouter } from "@/server/routers/apiKeyRouter";
import { eventRouter } from "@/server/routers/eventRouter";
import { monitoringRouter } from "@/server/routers/monitoringRouter";
import { userRouter } from "@/server/routers/userRouter";

export const app = new Elysia({ prefix: "/api" })
	.use(userRouter)
	.use(eventRouter)
	.use(monitoringRouter)
	.use(apiKeyRouter)
	.use(
		swagger({
			documentation: {
				info: {
					title: "Ping Panda API",
					description: "API for Ping Panda",
					version: "1.0.0",
				},
			},
		}),
	);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
