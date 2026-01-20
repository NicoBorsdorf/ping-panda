"use client";

import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import {
	Activity,
	Book,
	Calendar,
	Crown,
	Key,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navigation = [
	{ name: "Overview", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Events", href: "/dashboard/events", icon: Calendar },
	{ name: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
	{ name: "API Keys", href: "/dashboard/api-keys", icon: Key },
	{ name: "Documentation", href: "/dashboard/docs", icon: Book },
	{ name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, isLoaded } = useUser();

	// Mock plan status - in real app, fetch from user data
	const isPro = false;

	return (
		<>
			{/* Mobile menu button */}
			<div className="fixed top-4 left-4 z-50 lg:hidden">
				<Button
					className="bg-white shadow-md"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					size="icon"
					variant="outline"
				>
					{mobileMenuOpen ? (
						<X className="size-5" />
					) : (
						<Menu className="size-5" />
					)}
				</Button>
			</div>

			{/* Mobile overlay */}
			{mobileMenuOpen && (
				<button
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setMobileMenuOpen(false)}
					type="button"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-brand-200 border-r bg-white transition-transform duration-200 ease-in-out lg:translate-x-0",
					mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				{/* Logo */}
				<div className="flex h-16 items-center border-brand-100 border-b px-6">
					<Link
						className="flex items-center gap-2"
						href="/dashboard"
						onClick={() => setMobileMenuOpen(false)}
					>
						<div className="flex size-8 items-center justify-center rounded-lg bg-brand-600">
							<span className="font-bold text-sm text-white">P</span>
						</div>
						<span className="text-lg tracking-tight">
							Ping<span className="font-semibold text-brand-700">Panda</span>
						</span>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
					{/* General Section */}
					<div className="mb-8 space-y-1">
						<p className="select-none px-2 pb-1 font-semibold text-brand-600 text-xs uppercase tracking-widest">
							General
						</p>
						<div className="flex flex-col gap-1">
							{navigation
								.filter(
									(item) =>
										item.name === "Overview" ||
										item.name === "Events" ||
										item.name === "Monitoring",
								)
								.map((item) => {
									const isActive =
										pathname === item.href ||
										(item.href !== "/dashboard" &&
											pathname.startsWith(item.href));

									return (
										<Link
											className={cn(
												"group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-150",
												{
													"bg-brand-600 text-white shadow-sm": isActive,
													"text-brand-700 hover:bg-brand-50": !isActive,
												},
											)}
											href={item.href}
											key={item.name}
											onClick={() => setMobileMenuOpen(false)}
										>
											<item.icon
												className={cn("size-[18px] transition-colors", {
													"text-white": isActive,
													"text-brand-400 group-hover:text-brand-600":
														!isActive,
												})}
											/>
											{item.name}
										</Link>
									);
								})}
						</div>
					</div>

					{/* Usage Section */}
					<div className="mb-2 space-y-1">
						<p className="select-none px-2 pb-1 font-semibold text-brand-600 text-xs uppercase tracking-widest">
							Usage
						</p>
						<div className="flex flex-col gap-1">
							{navigation
								.filter(
									(item) =>
										item.name === "API Keys" || item.name === "Documentation",
								)
								.map((item) => {
									const isActive =
										pathname === item.href ||
										(item.href !== "/dashboard" &&
											pathname.startsWith(item.href));

									return (
										<Link
											className={cn(
												"group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-150",
												{
													"bg-brand-600 text-white shadow-sm": isActive,
													"text-brand-700 hover:bg-brand-50": !isActive,
												},
											)}
											href={item.href}
											key={item.name}
											onClick={() => setMobileMenuOpen(false)}
										>
											<item.icon
												className={cn("size-[18px] transition-colors", {
													"text-white": isActive,
													"text-brand-400 group-hover:text-brand-600":
														!isActive,
												})}
											/>
											{item.name}
										</Link>
									);
								})}
						</div>
					</div>

					{/* Settings at the bottom */}
					<div className="flex h-full flex-col justify-end space-y-1">
						{navigation
							.filter((item) => item.name === "Settings")
							.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== "/dashboard" &&
										pathname.startsWith(item.href));

								return (
									<Link
										className={cn(
											"group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-150",
											{
												"bg-brand-600 text-white shadow-sm": isActive,
												"text-brand-700 hover:bg-brand-50": !isActive,
											},
										)}
										href={item.href}
										key={item.name}
										onClick={() => setMobileMenuOpen(false)}
									>
										<item.icon
											className={cn("size-[18px] transition-colors", {
												"text-white": isActive,
												"text-brand-400 group-hover:text-brand-600": !isActive,
											})}
										/>
										{item.name}
									</Link>
								);
							})}
					</div>
				</nav>

				{/* Bottom section */}
				{/* User section */}
				<div className="flex items-center gap-3 rounded-lg bg-brand-50/50 p-2">
					<UserButton
						appearance={{
							elements: {
								avatarBox: "size-9",
							},
						}}
					/>
					<div className="min-w-0 flex-1">
						{!isLoaded ? (
							<div className="flex w-full items-center gap-2">
								<div className="size-6 animate-pulse rounded-full bg-brand-200" />
								<div className="flex flex-col gap-1">
									<div className="h-5 w-24 animate-pulse rounded-lg bg-brand-200" />
									<div className="h-3 w-32 animate-pulse rounded-lg bg-brand-200" />
								</div>
							</div>
						) : (
							<>
								<p className="truncate font-medium text-brand-900 text-sm">
									{user?.fullName || user?.username || "User"}
								</p>
								<p className="truncate text-brand-500 text-xs">
									{user?.primaryEmailAddress?.emailAddress || ""}
								</p>
							</>
						)}
					</div>
					<SignOutButton>
						<Button size="icon" variant="ghost">
							<LogOut className="size-4" />
						</Button>
					</SignOutButton>
				</div>
				<div className="border-brand-100 border-t p-3">
					{/* Plan indicator */}
					<div className="mb-3 rounded-lg bg-linear-to-br from-brand-50 to-brand-100/50 p-3">
						<div className="flex items-center gap-2">
							{isPro ? (
								<Crown className="size-4 text-amber-500" />
							) : (
								<div className="size-4 rounded-full bg-brand-200" />
							)}
							<span className="font-medium text-brand-900 text-sm">
								{isPro ? "Pro Plan" : "Free Plan"}
							</span>
						</div>
						<p className="mt-1.5 text-brand-600 text-xs">
							{isPro
								? "10 categories • 100 events"
								: "3 categories • 10 events"}
						</p>
						{!isPro && (
							<Link href="/dashboard/settings">
								<Button
									className="mt-2.5 w-full bg-brand-600 text-white hover:bg-brand-700"
									onClick={() => setMobileMenuOpen(false)}
									size="xs"
								>
									Upgrade to Pro
								</Button>
							</Link>
						)}
					</div>
				</div>
			</aside>
		</>
	);
}
