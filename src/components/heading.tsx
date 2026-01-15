import { cn } from "@/lib/utils";

interface HeadingProps {
	children: React.ReactNode;
	className?: string;
}

export function Heading({ children, className }: HeadingProps) {
	return (
		<h1
			className={cn(
				"text-pretty font-heading font-semibold text-4xl text-zinc-800 tracking-tight sm:text-5xl",
				className,
			)}
		>
			{children}
		</h1>
	);
}
