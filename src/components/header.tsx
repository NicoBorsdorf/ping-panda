"use client";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function Header() {
	return (
		<header className="border-brand-700 border-b bg-brand-50">
			<MaxWidthWrapper>
				<nav className="flex items-center justify-between gap-4 p-4">
					<Link className="flex items-center text-xl" href="/">
						Ping<span className="font-semibold text-brand-700">Panda</span>
					</Link>
					<div className="flex flex-row items-center gap-4">
						<Link href="/pricing">
							<Button className="hover:bg-brand-200" variant="ghost">
								Pricing
							</Button>
						</Link>
						<SignedOut>
							<SignInButton>
								<Button className="hover:bg-brand-200" variant="ghost">
									Sign In
								</Button>
							</SignInButton>
							<Separator className="bg-brand-700" orientation="vertical" />
							<SignUpButton>
								<Button className="flex items-center justify-center bg-brand-700 hover:bg-brand-800">
									Sign Up <ArrowRight className="site-4" />
								</Button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard">
								<Button className="hover:bg-brand-200" variant="ghost">
									Dashboard
								</Button>
							</Link>
							<UserButton />
						</SignedIn>
					</div>
				</nav>
			</MaxWidthWrapper>
		</header>
	);
}
