import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-brand-50">
			<DashboardSidebar />
			<div className="lg:pl-64">
				<main className="min-h-screen">{children}</main>
			</div>
		</div>
	);
}
