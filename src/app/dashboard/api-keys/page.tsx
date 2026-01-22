"use client";

import {
	AlertTriangle,
	Check,
	Copy,
	Eye,
	EyeOff,
	Key,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	useApiKeys,
	useCreateApiKey,
	useDeleteApiKey,
} from "@/hooks/use-api-keys";
import type { api } from "@/lib/eden";
import { cn } from "@/lib/utils";

type CreateApiKeyResponse = NonNullable<
	Awaited<ReturnType<typeof api.apikeys.post>>["data"]
>;

function CreateApiKeyModal({
	isOpen,
	onClose,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (key: CreateApiKeyResponse) => void;
}) {
	const [name, setName] = useState("");
	const createApiKey = useCreateApiKey();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await createApiKey.mutateAsync({ name });
		onSuccess(result);
		setName("");
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-md">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Create API Key</CardTitle>
						<Button onClick={onClose} size="icon" variant="ghost">
							<X className="size-4" />
						</Button>
					</div>
					<CardDescription>
						Create a new API key to authenticate your requests
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<label
								className="mb-1.5 block font-medium text-sm"
								htmlFor="key-name"
							>
								Key Name
							</label>
							<Input
								id="key-name"
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Production Key"
								required
								value={name}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Give your key a descriptive name to identify it later
							</p>
						</div>
						<div className="flex justify-end gap-2 pt-4">
							<Button onClick={onClose} type="button" variant="outline">
								Cancel
							</Button>
							<Button disabled={createApiKey.isPending || !name} type="submit">
								{createApiKey.isPending ? "Creating..." : "Create Key"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function NewKeyModal({
	apiKey,
	onClose,
}: {
	apiKey: CreateApiKeyResponse;
	onClose: () => void;
}) {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(apiKey.key);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				type="button"
			/>
			<Card className="relative z-10 w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-100">
							<Check className="size-5 text-green-600" />
						</div>
						<div>
							<CardTitle>API Key Created</CardTitle>
							<CardDescription>Make sure to copy your key now</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
						<div className="flex items-start gap-2">
							<AlertTriangle className="mt-0.5 size-4 text-yellow-600" />
							<p className="text-sm text-yellow-800">
								This key will only be shown once. Please copy it and store it
								securely.
							</p>
						</div>
					</div>

					<div>
						<label
							className="mb-1.5 block font-medium text-sm"
							htmlFor="api-key"
						>
							Your API Key
						</label>
						<div className="flex gap-2">
							<Input
								className="font-mono text-sm"
								id="api-key"
								readOnly
								value={apiKey.key}
							/>
							<Button
								className={cn(copied && "text-green-600")}
								onClick={copyToClipboard}
								size="icon"
								variant="outline"
							>
								{copied ? (
									<Check className="size-4" />
								) : (
									<Copy className="size-4" />
								)}
							</Button>
						</div>
					</div>

					<div className="flex justify-end pt-2">
						<Button onClick={onClose}>Done</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function ApiKeyRow({
	apiKey,
}: {
	apiKey: NonNullable<
		Awaited<ReturnType<typeof api.apikeys.get>>["data"]
	>[number];
}) {
	const [showKey, setShowKey] = useState(false);
	const deleteApiKey = useDeleteApiKey();
	const [confirmDelete, setConfirmDelete] = useState(false);

	return (
		<div className="flex items-center justify-between border-border border-b p-4 last:border-b-0">
			<div className="flex items-center gap-4">
				<div className="flex size-10 items-center justify-center rounded-full bg-brand-100">
					<Key className="size-5 text-brand-700" />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<span className="font-medium">{apiKey.name}</span>
						{apiKey.active && (
							<Badge className="text-xs" variant="secondary">
								Active
							</Badge>
						)}
					</div>
					<div className="mt-0.5 flex items-center gap-2">
						<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
							{showKey ? apiKey.key : "••••••••••••••••"}
						</code>
						<button
							className="text-muted-foreground hover:text-foreground"
							onClick={() => setShowKey(!showKey)}
							type="button"
						>
							{showKey ? (
								<EyeOff className="size-3.5" />
							) : (
								<Eye className="size-3.5" />
							)}
						</button>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="hidden text-right text-sm sm:block">
					<div className="text-muted-foreground">
						Created {apiKey.createdAt.toLocaleDateString()}
					</div>
					{apiKey.lastUsedAt && (
						<div className="text-muted-foreground text-xs">
							Last used {apiKey.lastUsedAt.toLocaleDateString()}
						</div>
					)}
				</div>

				{confirmDelete ? (
					<div className="flex items-center gap-2">
						<Button
							disabled={deleteApiKey.isPending}
							onClick={() => deleteApiKey.mutate(apiKey.id)}
							size="xs"
							variant="destructive"
						>
							Confirm
						</Button>
						<Button
							onClick={() => setConfirmDelete(false)}
							size="xs"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
				) : (
					<Button
						className="text-muted-foreground hover:text-red-600"
						onClick={() => setConfirmDelete(true)}
						size="icon-sm"
						variant="ghost"
					>
						<Trash2 className="size-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

export default function ApiKeysPage() {
	const { data: apiKeys, isLoading } = useApiKeys();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);

	return (
		<div className="flex flex-col gap-8 p-6 pt-20 lg:p-8 lg:pt-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl text-brand-950 tracking-tight lg:text-3xl">
						API Keys
					</h1>
					<p className="text-muted-foreground">
						Manage your API keys for authenticating requests
					</p>
				</div>
				<Button onClick={() => setIsCreateModalOpen(true)}>
					<Plus className="mr-1 size-4" />
					Create API Key
				</Button>
			</div>

			{/* Usage Info */}
			<Card className="border-brand-200 bg-brand-50">
				<CardContent className="flex items-start gap-4 py-4">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
						<Key className="size-5 text-brand-700" />
					</div>
					<div>
						<h3 className="font-medium text-brand-900">Using API Keys</h3>
						<p className="mt-1 text-brand-700 text-sm">
							Include your API key in the <code>Authorization</code> header of
							your requests:
						</p>
						<pre className="mt-2 overflow-x-auto rounded bg-brand-950 p-3 font-mono text-brand-100 text-xs">
							Authorization: YOUR_API_KEY
						</pre>
					</div>
				</CardContent>
			</Card>

			{/* API Keys List */}
			<Card>
				<CardHeader className="border-b">
					<CardTitle>Your API Keys</CardTitle>
					<CardDescription>
						{apiKeys?.length ?? 0} key{apiKeys?.length !== 1 && "s"} created
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
						</div>
					) : !apiKeys || apiKeys.length === 0 ? (
						<div className="py-12 text-center">
							<Key className="mx-auto size-12 text-muted-foreground" />
							<h3 className="mt-4 font-semibold text-lg">No API keys yet</h3>
							<p className="mt-1 text-muted-foreground text-sm">
								Create your first API key to start integrating
							</p>
							<Button
								className="mt-4"
								onClick={() => setIsCreateModalOpen(true)}
							>
								<Plus className="mr-1 size-4" />
								Create API Key
							</Button>
						</div>
					) : (
						<div>
							{apiKeys.map((apiKey) => (
								<ApiKeyRow apiKey={apiKey} key={apiKey.id} />
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Modal */}
			<CreateApiKeyModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={(key) => {
					setIsCreateModalOpen(false);
					setNewKey(key);
				}}
			/>

			{/* New Key Display Modal */}
			{newKey && (
				<NewKeyModal apiKey={newKey} onClose={() => setNewKey(null)} />
			)}
		</div>
	);
}
