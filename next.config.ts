import type { NextConfig } from "next";
import "@/env";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	// Prevent Turbopack from bundling Node.js-only packages
	serverExternalPackages: ["pg", "pg-native", "pg-pool"],
};

export default nextConfig;
