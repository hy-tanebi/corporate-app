/**
 * Material Design 3 Button Components Examples
 *
 * このファイルは、Material Design 3の仕様に準拠したボタンコンポーネントの実装例です。
 * 5つのボタンバリアントを提供します:
 * 1. Filled Button (最も強調)
 * 2. Tonal Button (中程度の強調)
 * 3. Outlined Button (控えめな強調)
 * 4. Elevated Button (影付き)
 * 5. Text Button (最も控えめ)
 */

import { type ButtonHTMLAttributes, type ReactNode } from "react";

// =====================================
// Base Button Props
// =====================================

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
	fullWidth?: boolean;
}

// =====================================
// 1. Filled Button (Primary Action)
// =====================================

/**
 * Filled Button
 *
 * 用途: 最も重要なアクション（送信、保存、次へ、など）
 * 特徴: 背景色が塗りつぶされ、最も目立つデザイン
 *
 * @example
 * <FilledButton>送信する</FilledButton>
 * <FilledButton icon={<SaveIcon />}>保存</FilledButton>
 */
export function FilledButton({
	children,
	icon,
	iconPosition = "left",
	fullWidth = false,
	className = "",
	disabled = false,
	...props
}: BaseButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={`
        inline-flex items-center justify-center gap-2
        px-6 py-2.5 rounded-full
        bg-primary text-on-primary
        font-medium text-sm tracking-wide
        transition-all duration-200 ease-out

        hover:shadow-md hover:brightness-105
        active:shadow-sm active:brightness-95

        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2

        disabled:opacity-38 disabled:cursor-not-allowed
        disabled:shadow-none disabled:brightness-100

        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
			{...props}
		>
			{icon && iconPosition === "left" && (
				<span className="w-5 h-5">{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className="w-5 h-5">{icon}</span>
			)}
		</button>
	);
}

// =====================================
// 2. Tonal Button (Secondary Action)
// =====================================

/**
 * Tonal Button
 *
 * 用途: 重要だが、Primaryほどではないアクション
 * 特徴: Primary Containerで塗りつぶし、控えめな印象
 *
 * @example
 * <TonalButton>キャンセル</TonalButton>
 * <TonalButton icon={<FilterIcon />}>フィルター</TonalButton>
 */
export function TonalButton({
	children,
	icon,
	iconPosition = "left",
	fullWidth = false,
	className = "",
	disabled = false,
	...props
}: BaseButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={`
        inline-flex items-center justify-center gap-2
        px-6 py-2.5 rounded-full
        bg-primary-container text-on-primary-container
        font-medium text-sm tracking-wide
        transition-all duration-200 ease-out

        hover:shadow-md hover:brightness-105
        active:shadow-sm active:brightness-95

        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2

        disabled:opacity-38 disabled:cursor-not-allowed
        disabled:shadow-none disabled:brightness-100

        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
			{...props}
		>
			{icon && iconPosition === "left" && (
				<span className="w-5 h-5">{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className="w-5 h-5">{icon}</span>
			)}
		</button>
	);
}

// =====================================
// 3. Outlined Button (Low Emphasis)
// =====================================

/**
 * Outlined Button
 *
 * 用途: 二次的なアクション（戻る、スキップ、など）
 * 特徴: ボーダーのみ、背景は透明
 *
 * @example
 * <OutlinedButton>戻る</OutlinedButton>
 * <OutlinedButton icon={<BackIcon />}>キャンセル</OutlinedButton>
 */
export function OutlinedButton({
	children,
	icon,
	iconPosition = "left",
	fullWidth = false,
	className = "",
	disabled = false,
	...props
}: BaseButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={`
        inline-flex items-center justify-center gap-2
        px-6 py-2.5 rounded-full
        border border-outline
        bg-transparent text-primary
        font-medium text-sm tracking-wide
        transition-all duration-200 ease-out

        hover:bg-primary/8
        active:bg-primary/12

        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2

        disabled:opacity-38 disabled:cursor-not-allowed
        disabled:bg-transparent

        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
			{...props}
		>
			{icon && iconPosition === "left" && (
				<span className="w-5 h-5">{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className="w-5 h-5">{icon}</span>
			)}
		</button>
	);
}

// =====================================
// 4. Elevated Button (With Shadow)
// =====================================

/**
 * Elevated Button
 *
 * 用途: 平坦な背景の上で目立たせたいアクション
 * 特徴: shadow-md で浮き上がって見える
 *
 * @example
 * <ElevatedButton>続ける</ElevatedButton>
 * <ElevatedButton icon={<NextIcon />}>次へ</ElevatedButton>
 */
export function ElevatedButton({
	children,
	icon,
	iconPosition = "left",
	fullWidth = false,
	className = "",
	disabled = false,
	...props
}: BaseButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={`
        inline-flex items-center justify-center gap-2
        px-6 py-2.5 rounded-full
        bg-surface text-primary
        shadow-md
        font-medium text-sm tracking-wide
        transition-all duration-200 ease-out

        hover:shadow-lg hover:brightness-105
        active:shadow-md active:brightness-95

        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2

        disabled:opacity-38 disabled:cursor-not-allowed
        disabled:shadow-sm disabled:brightness-100

        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
			{...props}
		>
			{icon && iconPosition === "left" && (
				<span className="w-5 h-5">{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className="w-5 h-5">{icon}</span>
			)}
		</button>
	);
}

// =====================================
// 5. Text Button (Lowest Emphasis)
// =====================================

/**
 * Text Button
 *
 * 用途: 最も優先度の低いアクション（詳細を見る、もっと見る、など）
 * 特徴: 背景なし、ボーダーなし、テキストのみ
 *
 * @example
 * <TextButton>詳細を見る</TextButton>
 * <TextButton icon={<InfoIcon />}>もっと見る</TextButton>
 */
export function TextButton({
	children,
	icon,
	iconPosition = "left",
	fullWidth = false,
	className = "",
	disabled = false,
	...props
}: BaseButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2.5 rounded-full
        bg-transparent text-primary
        font-medium text-sm tracking-wide
        transition-all duration-200 ease-out

        hover:bg-primary/8
        active:bg-primary/12

        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2

        disabled:opacity-38 disabled:cursor-not-allowed
        disabled:bg-transparent

        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
			{...props}
		>
			{icon && iconPosition === "left" && (
				<span className="w-5 h-5">{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className="w-5 h-5">{icon}</span>
			)}
		</button>
	);
}

// =====================================
// Usage Example
// =====================================

/**
 * 使用例のデモコンポーネント
 */
export function ButtonExamples() {
	return (
		<div className="space-y-8 p-8 bg-background">
			<section>
				<h2 className="text-headline-medium text-on-background mb-4">
					Button Variants
				</h2>

				<div className="flex flex-wrap gap-4">
					<FilledButton>Filled Button</FilledButton>
					<TonalButton>Tonal Button</TonalButton>
					<OutlinedButton>Outlined Button</OutlinedButton>
					<ElevatedButton>Elevated Button</ElevatedButton>
					<TextButton>Text Button</TextButton>
				</div>
			</section>

			<section>
				<h3 className="text-title-large text-on-background mb-4">
					Disabled State
				</h3>

				<div className="flex flex-wrap gap-4">
					<FilledButton disabled>Disabled Filled</FilledButton>
					<TonalButton disabled>Disabled Tonal</TonalButton>
					<OutlinedButton disabled>Disabled Outlined</OutlinedButton>
					<ElevatedButton disabled>Disabled Elevated</ElevatedButton>
					<TextButton disabled>Disabled Text</TextButton>
				</div>
			</section>

			<section>
				<h3 className="text-title-large text-on-background mb-4">
					Full Width
				</h3>

				<div className="space-y-2 max-w-md">
					<FilledButton fullWidth>Full Width Filled</FilledButton>
					<TonalButton fullWidth>Full Width Tonal</TonalButton>
					<OutlinedButton fullWidth>Full Width Outlined</OutlinedButton>
				</div>
			</section>
		</div>
	);
}
