import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<div className="flex w-full flex-1 items-center justify-center">
			<SignUp fallbackRedirectUrl="/welcome" forceRedirectUrl="/welcome" />
		</div>
	);
}
