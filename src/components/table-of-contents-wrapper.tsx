import { Suspense } from "react";
import type { AuthorProfile } from "@/lib/microcms";
import { ProfileCard } from "./profile-card";
import { TableOfContentsClient } from "./table-of-contents-client";

interface TableOfContentsWrapperProps {
	profile?: AuthorProfile;
}

// プロフィールのフォールバック
function ProfileFallback() {
	return (
		<div className="mb-6 rounded-lg border bg-card p-4 shadow-sm animate-pulse">
			<div className="flex items-center gap-3">
				<div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
				<div className="flex-1 min-w-0 space-y-2">
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
					<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
				</div>
			</div>
		</div>
	);
}

export function TableOfContentsWrapper({
	profile,
}: TableOfContentsWrapperProps) {
	return (
		<div className="sticky top-4 space-y-4">
			{/* プロフィールカード */}
			{profile ? (
				<Suspense fallback={<ProfileFallback />}>
					<ProfileCard profile={profile} />
				</Suspense>
			) : (
				<div className="mb-6" /> // プロフィールがない場合のスペース調整
			)}

			{/* 目次 */}
			<Suspense
				fallback={
					<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />
				}
			>
				<TableOfContentsClient />
			</Suspense>
		</div>
	);
}
