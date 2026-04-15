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
	webpack(config, { isServer }) {
		config.module.rules.push({
			test: /\.glsl$/,
			loader: "raw-loader",
		});

		// クライアントビルドでThree.js関連を独立チャンクに分離し、初期バンドルを軽量化
		if (!isServer) {
			const cacheGroups =
				config.optimization?.splitChunks?.cacheGroups || {};
			cacheGroups.three = {
				test: /[\\/]node_modules[\\/](three|@react-three|three-stdlib)[\\/]/,
				name: "three-vendor",
				chunks: "all" as const,
				priority: 30,
			};
			cacheGroups.framerMotion = {
				test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
				name: "framer-motion-vendor",
				chunks: "all" as const,
				priority: 20,
			};
			config.optimization = {
				...config.optimization,
				splitChunks: {
					...config.optimization?.splitChunks,
					cacheGroups,
				},
			};
		}

		return config;
	},
};

export default nextConfig;
