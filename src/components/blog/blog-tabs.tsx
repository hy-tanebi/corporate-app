"use client";

import { BlogPageClient } from "./blog-page-client";
import type { BlogPost } from "@/lib/microcms";

interface BlogTabsProps {
	initialPosts: BlogPost[];
}

export function BlogTabs({ initialPosts }: BlogTabsProps) {
	return <BlogPageClient initialPosts={initialPosts} />;
}
