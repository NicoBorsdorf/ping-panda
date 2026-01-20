import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: "sent" | "failed" }) {
	const config = {
		sent: {
			label: "Delivered",
			className: "bg-green-100 text-green-700 border-green-200",
			icon: CheckCircle,
		},
		failed: {
			label: "Failed",
			className: "bg-red-100 text-red-700 border-red-200",
			icon: XCircle,
		},
	};

	const { label, className, icon: Icon } = config[status];

	return (
		<Badge className={cn("gap-1", className)} variant="outline">
			<Icon className="size-3" />
			{label}
		</Badge>
	);
}
