import { Elysia } from "elysia";
import { apiKeyRouter } from "@/server/routers/apiKeyRouter";
import { eventCategoryRouter } from "@/server/routers/eventCategoryRouter";
import { eventRouter } from "@/server/routers/eventRouter";
import { monitoringRouter } from "@/server/routers/monitoringRouter";
import { userRouter } from "@/server/routers/userRouter";

// The /api prefix matches the app/api directory structure in Next.js
export const app = new Elysia({ prefix: "/api" })
	.use(userRouter)
	.use(eventCategoryRouter)
	.use(eventRouter)
	.use(monitoringRouter)
	.use(apiKeyRouter);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
