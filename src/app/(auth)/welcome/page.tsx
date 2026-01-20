"use client";

import { useQuery } from "@tanstack/react-query";
import type { LucideProps } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heading } from "@/components/heading";
import { LoadingSpinner } from "@/components/loading-spinner";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/eden";

export default function WelcomePage() {
	const { isError, refetch, isSuccess, isPending } = useQuery({
		queryKey: ["user-sync"],
		queryFn: async () =>
			await api.user.sync.post().then((res) => {
				if (res.status !== 200 || !res.data) {
					throw new Error("Failed to sync user");
				}

				return res.data;
			}),
		retry: 5,
		retryDelay: 1000,
		refetchInterval: (query) => {
			return query.state.data?.isSynced ? false : 1000;
		},
	});
	const router = useRouter();

	useEffect(() => {
		if (!isPending && isSuccess) {
			router.push("/dashboard");
		}
	}, [isPending, isSuccess, router]);

	if (isError) {
		return (
			<div className="flex h-full flex-1 items-center justify-center px-4">
				<MaxWidthWrapper className="flex h-full flex-col items-center justify-center gap-10">
					<Heading className="text-center text-destructive">
						Error creating your account
					</Heading>
					<p className="max-w-prose text-base/7 text-gray-600">
						Please try again later.
					</p>
					<Button onClick={async () => await refetch()} variant="outline">
						Try again
					</Button>
				</MaxWidthWrapper>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-1 items-center justify-center px-4">
			<BackgroundPattern className="-translate-x-1/2 absolute inset-0 left-1/2 z-0 opacity-75" />

			<div className="-translate-y-1/2 relative z-10 flex flex-col items-center gap-6 text-center">
				<LoadingSpinner className="mb-4" />
				<Heading>Creating your account...</Heading>
				<p className="max-w-prose text-base/7 text-gray-600">
					Just a moment while we set things up for you.
				</p>
			</div>
		</div>
	);
}

const BackgroundPattern = (props: LucideProps) => {
	return (
		<svg
			className={props.className}
			fill="none"
			height="736"
			viewBox="0 0 768 736"
			width="768"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>backdrop</title>
			<mask
				height="768"
				id="mask0_5036_374506"
				maskUnits="userSpaceOnUse"
				style={{ maskType: "alpha" }}
				width="768"
				x="0"
				y="-32"
			>
				<rect
					fill="url(#paint0_radial_5036_374506)"
					height="768"
					transform="translate(0 -32)"
					width="768"
				/>
			</mask>
			<g mask="url(#mask0_5036_374506)">
				<g clipPath="url(#clip0_5036_374506)">
					<g clipPath="url(#clip1_5036_374506)">
						<line stroke="#E4E7EC" x1="0.5" x2="0.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="48.5" x2="48.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="96.5" x2="96.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="144.5" x2="144.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="192.5" x2="192.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="240.5" x2="240.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="288.5" x2="288.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="336.5" x2="336.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="384.5" x2="384.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="432.5" x2="432.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="480.5" x2="480.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="528.5" x2="528.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="576.5" x2="576.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="624.5" x2="624.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="672.5" x2="672.5" y1="-32" y2="736" />
						<line stroke="#E4E7EC" x1="720.5" x2="720.5" y1="-32" y2="736" />
					</g>
					<rect height="767" stroke="#E4E7EC" width="767" x="0.5" y="-31.5" />
					<g clipPath="url(#clip2_5036_374506)">
						<line stroke="#E4E7EC" x2="768" y1="15.5" y2="15.5" />
						<line stroke="#E4E7EC" x2="768" y1="63.5" y2="63.5" />
						<line stroke="#E4E7EC" x2="768" y1="111.5" y2="111.5" />
						<line stroke="#E4E7EC" x2="768" y1="159.5" y2="159.5" />
						<line stroke="#E4E7EC" x2="768" y1="207.5" y2="207.5" />
						<line stroke="#E4E7EC" x2="768" y1="255.5" y2="255.5" />
						<line stroke="#E4E7EC" x2="768" y1="303.5" y2="303.5" />
						<line stroke="#E4E7EC" x2="768" y1="351.5" y2="351.5" />
						<line stroke="#E4E7EC" x2="768" y1="399.5" y2="399.5" />
						<line stroke="#E4E7EC" x2="768" y1="447.5" y2="447.5" />
						<line stroke="#E4E7EC" x2="768" y1="495.5" y2="495.5" />
						<line stroke="#E4E7EC" x2="768" y1="543.5" y2="543.5" />
						<line stroke="#E4E7EC" x2="768" y1="591.5" y2="591.5" />
						<line stroke="#E4E7EC" x2="768" y1="639.5" y2="639.5" />
						<line stroke="#E4E7EC" x2="768" y1="687.5" y2="687.5" />
						<line stroke="#E4E7EC" x2="768" y1="735.5" y2="735.5" />
					</g>
					<rect height="767" stroke="#E4E7EC" width="767" x="0.5" y="-31.5" />
				</g>
			</g>
			<defs>
				<radialGradient
					cx="0"
					cy="0"
					gradientTransform="translate(384 384) rotate(90) scale(384 384)"
					gradientUnits="userSpaceOnUse"
					id="paint0_radial_5036_374506"
					r="1"
				>
					<stop />
					<stop offset="1" stopOpacity="0" />
				</radialGradient>
				<clipPath id="clip0_5036_374506">
					<rect
						fill="white"
						height="768"
						transform="translate(0 -32)"
						width="768"
					/>
				</clipPath>
				<clipPath id="clip1_5036_374506">
					<rect fill="white" height="768" width="768" y="-32" />
				</clipPath>
				<clipPath id="clip2_5036_374506">
					<rect fill="white" height="768" width="768" y="-32" />
				</clipPath>
			</defs>
		</svg>
	);
};
