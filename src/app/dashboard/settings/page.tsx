import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			<SettingsForm />

			{/* Danger Zone */}
			<Card className="border-red-200">
				<CardHeader>
					<CardTitle className="text-red-600">Danger Zone</CardTitle>
					<CardDescription>
						Irreversible actions that affect your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
						<div>
							<p className="font-medium text-red-900 text-sm">Delete Account</p>
							<p className="text-red-700 text-xs">
								Permanently delete your account and all data
							</p>
						</div>
						<Button size="sm" variant="destructive">
							Delete Account
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
