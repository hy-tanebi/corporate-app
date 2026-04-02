// next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.microcms-assets.io",
				port: "",
				pathname: "/**",
			},
		],
	},
	// ここから追加
	webpack(config) {
		config.module.rules.push({
			test: /\.glsl$/,
			loader: "raw-loader",
		});
		return config;
	},
};

export default nextConfig;
