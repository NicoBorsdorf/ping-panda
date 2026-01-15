"use client";

import {
	Activity,
	Calendar,
	Key,
	LayoutDashboard,
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
	{ name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
					"fixed top-0 left-0 z-40 h-screen w-64 border-brand-200 border-r bg-brand-50 transition-transform duration-200 ease-in-out lg:translate-x-0",
					mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex h-full flex-col">
					{/* Logo */}
					<div className="flex h-16 items-center border-brand-200 border-b px-6">
						<Link
							className="flex items-center text-xl"
							href="/dashboard"
							onClick={() => setMobileMenuOpen(false)}
						>
							Ping<span className="font-semibold text-brand-700">Panda</span>
						</Link>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 p-4">
						{navigation.map((item) => {
							const isActive =
								pathname === item.href ||
								(item.href !== "/dashboard" && pathname.startsWith(item.href));

							return (
								<Link
									className={cn(
										"group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
										isActive
											? "bg-brand-700 text-white"
											: "text-brand-700 hover:bg-brand-100",
									)}
									href={item.href}
									key={item.name}
									onClick={() => setMobileMenuOpen(false)}
								>
									<item.icon
										className={cn(
											"size-5",
											isActive
												? "text-white"
												: "text-brand-500 group-hover:text-brand-700",
										)}
									/>
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* Footer */}
					<div className="border-brand-200 border-t p-4">
						<div className="rounded-lg bg-brand-100 p-4">
							<p className="font-medium text-brand-900 text-sm">Free Plan</p>
							<p className="mt-1 text-brand-600 text-xs">
								3 events • 10/day limit
							</p>
							<Link href="/dashboard/settings">
								<Button
									className="mt-3 w-full border-brand-300 text-brand-700 hover:bg-brand-200"
									onClick={() => setMobileMenuOpen(false)}
									size="xs"
									variant="outline"
								>
									Upgrade to Pro
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
