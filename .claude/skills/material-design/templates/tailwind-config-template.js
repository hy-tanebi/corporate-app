/**
 * Material Design 3 - Tailwind CSS Configuration Template
 *
 * このファイルは、Material Design 3の仕様に準拠したTailwind CSS設定のテンプレートです。
 * プロジェクトのtailwind.config.jsにこの設定を追加してください。
 *
 * 使い方:
 * 1. Material Theme Builder (https://m3.material.io/theme-builder) でブランドカラーを生成
 * 2. 生成された色をCSS変数として定義
 * 3. この設定をtailwind.config.jsにマージ
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			// =====================================
			// Material Design 3 Color System
			// =====================================
			colors: {
				// Primary colors
				primary: "rgb(var(--md-sys-color-primary) / <alpha-value>)",
				"on-primary": "rgb(var(--md-sys-color-on-primary) / <alpha-value>)",
				"primary-container":
					"rgb(var(--md-sys-color-primary-container) / <alpha-value>)",
				"on-primary-container":
					"rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)",

				// Secondary colors
				secondary: "rgb(var(--md-sys-color-secondary) / <alpha-value>)",
				"on-secondary":
					"rgb(var(--md-sys-color-on-secondary) / <alpha-value>)",
				"secondary-container":
					"rgb(var(--md-sys-color-secondary-container) / <alpha-value>)",
				"on-secondary-container":
					"rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)",

				// Tertiary colors
				tertiary: "rgb(var(--md-sys-color-tertiary) / <alpha-value>)",
				"on-tertiary": "rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)",
				"tertiary-container":
					"rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)",
				"on-tertiary-container":
					"rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)",

				// Error colors
				error: "rgb(var(--md-sys-color-error) / <alpha-value>)",
				"on-error": "rgb(var(--md-sys-color-on-error) / <alpha-value>)",
				"error-container":
					"rgb(var(--md-sys-color-error-container) / <alpha-value>)",
				"on-error-container":
					"rgb(var(--md-sys-color-on-error-container) / <alpha-value>)",

				// Surface colors
				surface: "rgb(var(--md-sys-color-surface) / <alpha-value>)",
				"on-surface": "rgb(var(--md-sys-color-on-surface) / <alpha-value>)",
				"surface-variant":
					"rgb(var(--md-sys-color-surface-variant) / <alpha-value>)",
				"on-surface-variant":
					"rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)",

				// Outline colors
				outline: "rgb(var(--md-sys-color-outline) / <alpha-value>)",
				"outline-variant":
					"rgb(var(--md-sys-color-outline-variant) / <alpha-value>)",

				// Background colors
				background: "rgb(var(--md-sys-color-background) / <alpha-value>)",
				"on-background":
					"rgb(var(--md-sys-color-on-background) / <alpha-value>)",

				// Inverse colors
				"inverse-surface":
					"rgb(var(--md-sys-color-inverse-surface) / <alpha-value>)",
				"inverse-on-surface":
					"rgb(var(--md-sys-color-inverse-on-surface) / <alpha-value>)",
				"inverse-primary":
					"rgb(var(--md-sys-color-inverse-primary) / <alpha-value>)",

				// Scrim
				scrim: "rgb(var(--md-sys-color-scrim) / <alpha-value>)",
			},

			// =====================================
			// Material Design 3 Typography
			// =====================================
			fontSize: {
				// Display (最大の見出し)
				"display-large": [
					"57px",
					{ lineHeight: "64px", letterSpacing: "-0.25px", fontWeight: "400" },
				],
				"display-medium": [
					"45px",
					{ lineHeight: "52px", letterSpacing: "0px", fontWeight: "400" },
				],
				"display-small": [
					"36px",
					{ lineHeight: "44px", letterSpacing: "0px", fontWeight: "400" },
				],

				// Headline (大見出し)
				"headline-large": [
					"32px",
					{ lineHeight: "40px", letterSpacing: "0px", fontWeight: "400" },
				],
				"headline-medium": [
					"28px",
					{ lineHeight: "36px", letterSpacing: "0px", fontWeight: "400" },
				],
				"headline-small": [
					"24px",
					{ lineHeight: "32px", letterSpacing: "0px", fontWeight: "400" },
				],

				// Title (小見出し)
				"title-large": [
					"22px",
					{ lineHeight: "28px", letterSpacing: "0px", fontWeight: "400" },
				],
				"title-medium": [
					"16px",
					{ lineHeight: "24px", letterSpacing: "0.15px", fontWeight: "500" },
				],
				"title-small": [
					"14px",
					{ lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" },
				],

				// Body (本文)
				"body-large": [
					"16px",
					{ lineHeight: "24px", letterSpacing: "0.5px", fontWeight: "400" },
				],
				"body-medium": [
					"14px",
					{ lineHeight: "20px", letterSpacing: "0.25px", fontWeight: "400" },
				],
				"body-small": [
					"12px",
					{ lineHeight: "16px", letterSpacing: "0.4px", fontWeight: "400" },
				],

				// Label (ラベル・ボタン)
				"label-large": [
					"14px",
					{ lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" },
				],
				"label-medium": [
					"12px",
					{ lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" },
				],
				"label-small": [
					"11px",
					{ lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" },
				],
			},

			// =====================================
			// Material Design 3 Spacing (8dp grid)
			// =====================================
			spacing: {
				0.5: "2px", // 0.5 * 4px
				1: "4px", // Minimum spacing
				2: "8px", // Small
				3: "12px", // Small-Medium
				4: "16px", // Medium (base unit)
				5: "20px",
				6: "24px", // Medium-Large
				7: "28px",
				8: "32px", // Large
				9: "36px",
				10: "40px",
				11: "44px",
				12: "48px", // Extra Large
				14: "56px",
				16: "64px", // Maximum
				20: "80px",
				24: "96px",
			},

			// =====================================
			// Material Design 3 Border Radius
			// =====================================
			borderRadius: {
				none: "0px",
				xs: "4px", // Extra small
				sm: "8px", // Small
				md: "12px", // Medium
				lg: "16px", // Large
				xl: "28px", // Extra Large
				full: "9999px", // Pill shape
			},

			// =====================================
			// Material Design 3 Elevation (Shadows)
			// =====================================
			boxShadow: {
				// Level 0: No elevation
				none: "none",

				// Level 1: Elevated Card, FAB at rest
				sm: "0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",

				// Level 2: FAB hover
				md: "0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",

				// Level 3: Dialog, Modal
				lg: "0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)",

				// Level 4: Menu, Dropdown
				xl: "0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)",

				// Level 5: Special emphasis
				"2xl":
					"0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)",
			},

			// =====================================
			// Material Design 3 Animation Duration
			// =====================================
			transitionDuration: {
				short: "100ms", // Short duration
				"short-medium": "200ms",
				medium: "300ms", // Standard duration
				"medium-long": "400ms",
				long: "500ms", // Long duration
			},

			// =====================================
			// Material Design 3 Easing Functions
			// =====================================
			transitionTimingFunction: {
				standard: "cubic-bezier(0.4, 0.0, 0.2, 1)", // Default
				deceleration: "cubic-bezier(0.0, 0.0, 0.2, 1)", // Entrance
				acceleration: "cubic-bezier(0.4, 0.0, 1, 1)", // Exit
				sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)", // Temporary changes
			},

			// =====================================
			// Material Design 3 Font Family
			// =====================================
			fontFamily: {
				sans: [
					"Roboto",
					"Inter",
					"Noto Sans",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"sans-serif",
				],
			},

			// =====================================
			// Material Design 3 Opacity
			// =====================================
			opacity: {
				8: "0.08", // Hover state
				12: "0.12", // Active/Pressed state
				16: "0.16", // Selected state
				38: "0.38", // Disabled text
				60: "0.6", // Medium emphasis text
				87: "0.87", // High emphasis text
			},

			// =====================================
			// Material Design 3 Z-Index
			// =====================================
			zIndex: {
				fab: "6", // Floating Action Button
				drawer: "5", // Navigation Drawer
				modal: "100", // Modal/Dialog
				snackbar: "101", // Snackbar/Toast
				tooltip: "102", // Tooltip
			},
		},
	},
	plugins: [],
};
