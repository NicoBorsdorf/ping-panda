import {
	Camera,
	Clock,
	CogIcon,
	Gift,
	Headphones,
	HelpCircle,
	Inbox,
	Mic,
	Phone,
	Pin,
	PlusCircle,
	Search,
	Smile,
	Sticker,
	User2,
	UserCircle,
} from "lucide-react";
import Image from "next/image";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Discord } from "./icons/discord";

export function DiscordUiWrapper({
	children,
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex min-h-[800px] w-full max-w-[1200px] overflow-clip rounded-lg bg-discord-background text-white shadow-xl",
				className,
			)}
			{...props}
		>
			{/** quick access section */}
			<div className="flex w-16 flex-col items-center gap-2 bg-[#202225] p-4">
				<div className="flex w-fit rounded-2xl bg-discord-brandcolor p-2 transition-all duration-200 hover:rounded-lg">
					<Discord className="size-8 text-white" />
				</div>

				<hr className="my-2 h-0.5 bg-discord-timestamp" />

				{["A", "B", "C", "D", "E"].map((user) => (
					<div
						className="flex size-12 items-center justify-center rounded-4xl bg-discord-background transition-all duration-300 hover:cursor-not-allowed hover:rounded-2xl hover:bg-discord-brandcolor"
						key={user}
					>
						<span className="font-semibold text-gray-400 text-lg">{user}</span>
					</div>
				))}

				<div className="mt-auto mb-3 flex size-12 items-center justify-center rounded-4xl bg-discord-background text-white transition-all duration-300 hover:cursor-not-allowed hover:rounded-2xl hover:bg-green-500">
					<PlusCircle className="size-6 text-green-700" />
				</div>
			</div>

			{/** chat section */}
			<div className="flex w-60 flex-col bg-[#2f3136]">
				<div className="flex h-16 w-full items-center border-[#202225] border-b px-4 shadow-sm">
					<div className="flex items-center justify-center rounded-sm bg-[#202225] p-2">
						<span className="text-discord-timestamp text-sm">
							Find or start a conversation
						</span>
					</div>
				</div>
				<div className="flex flex-col px-2 pt-4 text-discord-text opacity-60">
					<div className="relative flex cursor-not-allowed items-center gap-2 rounded p-2 hover:bg-[#393c43]">
						<UserCircle className="size-7" />
						<span className="font-semibold text-sm">Friends</span>
					</div>
					<div className="relative flex cursor-not-allowed items-center gap-2 rounded p-2 hover:bg-[#393c43]">
						<Inbox className="size-7" />
						<span className="font-semibold text-sm">Inbox</span>
					</div>
				</div>

				<div className="flex flex-col px-2 py-4 text-discord-text">
					<span className="ml-2 font-semibold text-discord-text/70 text-xs">
						DIRECT MESSAGES
					</span>
					<ul className="space-y-1">
						<li
							className="relative flex cursor-not-allowed items-center gap-2 rounded bg-[#393c43] px-2 py-1.5 text-white"
							key="ping-panda"
						>
							<div className="relative">
								<Image
									alt="ping-panda-profile"
									className="rounded-full"
									height={32}
									src={"/brand-asset-profile-picture.png"}
									width={32}
								/>
								<div className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-[#36393f] bg-green-500" />
							</div>
							<span className="font-semibold text-sm">PingPanda</span>
						</li>
						{["User 2", "User 3", "User 4", "User 5"].map((user, i) => (
							<li
								className="relative flex cursor-not-allowed items-center gap-2 rounded px-2 py-1.5 text-white hover:bg-[#393c43]"
								key={user}
							>
								<div className="relative rounded-full bg-discord-timestamp p-1">
									<User2 className="size-6" />
									{(i & 1) === 0 && (
										<div className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-[#36393f] bg-green-500" />
									)}
								</div>
								<span className="font-semibold text-sm">{user}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="mt-auto flex items-center bg-[#292b2f] p-2">
					<div className="mr-2 size-8 rounded-full bg-brand-700" />
					<div className="flex-1">
						<p className="font-semibold text-sm">You</p>
						<p className="text-discord-timestamp text-xs">@your_account</p>
					</div>
					<div className="flex gap-2 text-discord-timestamp">
						<Mic className="size-5 cursor-pointer text-[#b9bbbe] hover:text-white" />
						<Headphones className="size-5 cursor-pointer text-[#b9bbbe] hover:text-white" />
						<CogIcon className="size-5 cursor-pointer text-[#b9bbbe] hover:text-white" />
					</div>
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="flex h-16 w-full items-center border-[#202225] border-b px-4 shadow-sm">
					<div className="flex flex-1 items-center">
						<div className="relative mr-2">
							<Image
								alt="ping-panda-profile"
								className="rounded-full"
								height={45}
								src={"/brand-asset-profile-picture.png"}
								width={45}
							/>
							<div className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-[#36393f] bg-green-500" />
						</div>
						<p className="font-semibold text-lg">PingPanda</p>
					</div>
					<div className="flex items-center gap-2">
						<Phone className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
						<Camera className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
						<Pin className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
						<UserCircle className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
						<Search className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
						<Inbox className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
						<HelpCircle className="hidden size-5 cursor-not-allowed hover:text-white sm:block" />
					</div>
				</div>

				<div className="flex flex-1 flex-col-reverse overflow-y-auto bg-discord-background p-4">
					{children}
				</div>

				<div className="p-4">
					<div className="flex items-center rounded-lg bg-[#40444b] p-2">
						<PlusCircle className="mx-3 cursor-not-allowed text-[#b9bbbe] hover:text-white" />
						<input
							className="flex-1 cursor-not-allowed bg-transparent px-1 py-2.5 text-white"
							placeholder="Message @PingPanda"
							readOnly
						/>
						<div className="flex gap-2">
							<Gift className="size-6 cursor-pointer text-[#b9bbbe] hover:text-white" />
							<Sticker className="size-6 cursor-pointer text-[#b9bbbe] hover:text-white" />
							<Smile className="size-6 cursor-pointer text-[#b9bbbe] hover:text-white" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

type BadgeColor = "#43b581" | "#faa61a" | (string & {});

const getBadgeStyles = (color: BadgeColor) => {
	switch (color) {
		case "#43b581":
			return "bg-green-500/10 text-green-400 ring-green-500/20";
		case "#faa61a":
			return "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20";
		default:
			return "bg-gray-500/10 text-gray-400 ring-gray-500/20";
	}
};

interface DiscordMessageProps {
	title: string;
	badgeColor?: BadgeColor;
	badgeText?: string;
	timestamp: string;
	content: {
		[k: string]: string;
	};
}

export function DiscordMessage({
	title,
	badgeColor = "#43b581",
	badgeText = "",
	timestamp,
	content,
}: DiscordMessageProps) {
	return (
		<div className="mx-auto w-full">
			<div className="flex shrink-0 gap-2">
				<div className="relative">
					<Image
						alt="ping-panda-profile"
						className="rounded-full"
						height={40}
						src={"/brand-asset-profile-picture.png"}
						width={40}
					/>
				</div>
				<div className="flex-1 shrink-0">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-lg">PingPanda</span>
						<div className="rounded-md bg-brand-700 p-1 text-xs">App</div>
						<span className="font-normal text-gray-400 text-xs">
							{timestamp}
						</span>
					</div>
					<div className="mt-1.5 mb-4 w-full rounded-md bg-[#2f3136] p-3 text-sm">
						<div className="mb-2 block items-center sm:flex">
							<p className="font-semibold text-lg">{title}</p>
							<div
								className={cn(
									"ml-auto w-fit rounded-md px-2 py-1 font-semibold",
									getBadgeStyles(badgeColor),
								)}
							>
								{badgeText}
							</div>
						</div>
						{Object.entries(content).map(([key, value]) => (
							<div className="gap-1" key={key}>
								<span className="text-[#b9bbbe]">{key}: </span>
								<span className="text-discord-text">{value}</span>
							</div>
						))}
						<p className="mt-2 flex items-center text-discord-timestamp text-xs">
							<Clock className="mr-2 size-4" /> {timestamp}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
