// next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
