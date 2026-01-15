import Image from "next/image";

export function Footer() {
	return (
		<footer className="border-gray-200 border-t bg-background/80 py-12">
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<div className="flex items-center gap-2">
						<Image
							alt="PingPanda"
							className="rounded-lg"
							height={32}
							src="/brand-asset-profile-picture.png"
							width={32}
						/>
						<span className="font-semibold text-brand-950">PingPanda</span>
					</div>
					<p className="text-gray-500 text-sm">
						© {new Date().getFullYear()} PingPanda. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
