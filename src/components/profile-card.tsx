import Image from "next/image";
import type { AuthorProfile } from "@/lib/microcms";

interface ProfileCardProps {
	profile: AuthorProfile | null | undefined;
}

export function ProfileCard({ profile }: ProfileCardProps) {
	// プロフィールまたはアバターが存在しない場合は何も表示しない
	if (!profile?.avatar?.url) {
		return null;
	}

	return (
		<div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<div className="relative h-12 w-12 flex-shrink-0 cursor-pointer group">
					{/* 光る外縁リング */}
					<div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
					
					{/* プロフィール画像 */}
					<div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-105">
						<Image
							src={profile.avatar.url}
							alt={`${profile.name}のプロフィール画像`}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-110"
							sizes="48px"
						/>
					</div>
					
					{/* さらなる光る効果 */}
					<div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-sm text-foreground truncate">
						{profile.name}
					</h3>
					<p className="text-xs text-muted-foreground line-clamp-1">
						{profile.tagline}
					</p>
				</div>
			</div>
		</div>
	);
}
