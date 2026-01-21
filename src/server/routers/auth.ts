import { auth } from "@clerk/nextjs/server";

export async function getUserId() {
	const { userId, isAuthenticated } = await auth({
		treatPendingAsSignedOut: true,
	});

	return !isAuthenticated ? null : userId;
}
