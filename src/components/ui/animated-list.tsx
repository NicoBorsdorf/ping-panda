"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, {
	type ReactElement,
	type ReactNode,
	useEffect,
	useState,
} from "react";

export interface AnimatedListProps {
	className?: string;
	children: React.ReactNode;
	delay?: number;
}

export const AnimatedList = React.memo(
	({ className = "", children, delay = 1000 }: AnimatedListProps) => {
		const [messages, setMessages] = useState<ReactNode[]>([]);
		const childrenArray = React.Children.toArray(children);

		useEffect(() => {
			const interval = setInterval(() => {
				if (messages.length < childrenArray.length) {
					setMessages((prev) => [childrenArray[messages.length], ...prev]);
				} else {
					clearInterval(interval);
				}
			}, delay);

			return () => clearInterval(interval);
		}, [childrenArray, delay, messages.length]);

		return (
			<div className={`flex flex-col-reverse items-center gap-4 ${className}`}>
				<AnimatePresence>
					{messages.map((item) => (
						<AnimatedListItem key={(item as ReactElement).key}>
							{item}
						</AnimatedListItem>
					))}
				</AnimatePresence>
			</div>
		);
	},
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			animate={{ scale: 1, opacity: 1, originY: 0 }}
			className="mx-auto w-full"
			exit={{ scale: 0, opacity: 0 }}
			initial={{ scale: 0, opacity: 0 }}
			layout
			transition={{ type: "spring", stiffness: 350, damping: 40 }}
		>
			{children}
		</motion.div>
	);
}
