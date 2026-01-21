import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/providers/providers";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PingPanda",
	description: "Your Discord notification service.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className={`${geistSans.variable} ${geistMono.variable}`} lang="en">
			<body className="flex min-h-[calc(100vh-1px)] flex-col bg-brand-50 font-sans text-brand-950 antialiased">
				<main className="relative flex flex-1 flex-col bg-brand-25">
					<Providers>{children}</Providers>
				</main>
				<Toaster position="bottom-right" />
			</body>
		</html>
	);
}
