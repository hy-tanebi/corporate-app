/**
 * Material Design 3 Card Components Examples
 *
 * このファイルは、Material Design 3の仕様に準拠したカードコンポーネントの実装例です。
 * 3つのカードバリアントを提供します:
 * 1. Elevated Card (影付き、最も一般的)
 * 2. Filled Card (色付き背景)
 * 3. Outlined Card (ボーダーのみ)
 */

import { type HTMLAttributes, type ReactNode } from "react";

// =====================================
// Base Card Props
// =====================================

interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	clickable?: boolean;
	onCardClick?: () => void;
}

// =====================================
// 1. Elevated Card (Most Common)
// =====================================

/**
 * Elevated Card
 *
 * 用途: 最も一般的なカード。コンテンツをグループ化して表示
 * 特徴: shadow-md で浮き上がって見える
 *
 * @example
 * <ElevatedCard>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </ElevatedCard>
 */
export function ElevatedCard({
	children,
	clickable = false,
	onCardClick,
	className = "",
	...props
}: BaseCardProps) {
	return (
		<div
			role={clickable ? "button" : undefined}
			tabIndex={clickable ? 0 : undefined}
			onClick={clickable ? onCardClick : undefined}
			onKeyDown={
				clickable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onCardClick?.();
							}
						}
					: undefined
			}
			className={`
        bg-surface text-on-surface
        rounded-xl shadow-md
        transition-all duration-200 ease-out

        ${
					clickable
						? `
          cursor-pointer
          hover:shadow-lg hover:brightness-105
          active:shadow-md active:brightness-95
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary focus-visible:ring-offset-2
        `
						: ""
				}

        ${className}
      `}
			{...props}
		>
			{children}
		</div>
	);
}

// =====================================
// 2. Filled Card (With Background Color)
// =====================================

/**
 * Filled Card
 *
 * 用途: 背景色を使ってセクションを区別したい場合
 * 特徴: Surface Variantの背景色、影なし
 *
 * @example
 * <FilledCard>
 *   <h3>Highlighted Section</h3>
 *   <p>Important information</p>
 * </FilledCard>
 */
export function FilledCard({
	children,
	clickable = false,
	onCardClick,
	className = "",
	...props
}: BaseCardProps) {
	return (
		<div
			role={clickable ? "button" : undefined}
			tabIndex={clickable ? 0 : undefined}
			onClick={clickable ? onCardClick : undefined}
			onKeyDown={
				clickable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onCardClick?.();
							}
						}
					: undefined
			}
			className={`
        bg-surface-variant text-on-surface
        rounded-xl
        transition-all duration-200 ease-out

        ${
					clickable
						? `
          cursor-pointer
          hover:brightness-105
          active:brightness-95
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary focus-visible:ring-offset-2
        `
						: ""
				}

        ${className}
      `}
			{...props}
		>
			{children}
		</div>
	);
}

// =====================================
// 3. Outlined Card (Border Only)
// =====================================

/**
 * Outlined Card
 *
 * 用途: 控えめにコンテンツをグループ化したい場合
 * 特徴: ボーダーのみ、背景は透明
 *
 * @example
 * <OutlinedCard>
 *   <h3>Simple Card</h3>
 *   <p>Minimal design</p>
 * </OutlinedCard>
 */
export function OutlinedCard({
	children,
	clickable = false,
	onCardClick,
	className = "",
	...props
}: BaseCardProps) {
	return (
		<div
			role={clickable ? "button" : undefined}
			tabIndex={clickable ? 0 : undefined}
			onClick={clickable ? onCardClick : undefined}
			onKeyDown={
				clickable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onCardClick?.();
							}
						}
					: undefined
			}
			className={`
        bg-surface text-on-surface
        rounded-xl border border-outline
        transition-all duration-200 ease-out

        ${
					clickable
						? `
          cursor-pointer
          hover:bg-on-surface/[0.08]
          active:bg-on-surface/[0.12]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary focus-visible:ring-offset-2
        `
						: ""
				}

        ${className}
      `}
			{...props}
		>
			{children}
		</div>
	);
}

// =====================================
// Card Content Components
// =====================================

/**
 * Card Header
 *
 * カードのヘッダー部分
 *
 * @example
 * <CardHeader
 *   title="Card Title"
 *   subtitle="Card subtitle"
 *   avatar={<Avatar />}
 *   action={<IconButton />}
 * />
 */
interface CardHeaderProps {
	title: string;
	subtitle?: string;
	avatar?: ReactNode;
	action?: ReactNode;
	className?: string;
}

export function CardHeader({
	title,
	subtitle,
	avatar,
	action,
	className = "",
}: CardHeaderProps) {
	return (
		<div className={`flex items-start gap-4 p-4 ${className}`}>
			{avatar && <div className="flex-shrink-0">{avatar}</div>}

			<div className="flex-1 min-w-0">
				<h3 className="text-title-large text-on-surface truncate">{title}</h3>
				{subtitle && (
					<p className="text-body-medium text-on-surface-variant truncate mt-1">
						{subtitle}
					</p>
				)}
			</div>

			{action && <div className="flex-shrink-0">{action}</div>}
		</div>
	);
}

/**
 * Card Media
 *
 * カードの画像/動画部分
 *
 * @example
 * <CardMedia
 *   src="/images/photo.jpg"
 *   alt="Photo description"
 *   aspectRatio="16/9"
 * />
 */
interface CardMediaProps {
	src: string;
	alt: string;
	aspectRatio?: "16/9" | "4/3" | "1/1";
	className?: string;
}

export function CardMedia({
	src,
	alt,
	aspectRatio = "16/9",
	className = "",
}: CardMediaProps) {
	const aspectRatioClass = {
		"16/9": "aspect-video",
		"4/3": "aspect-[4/3]",
		"1/1": "aspect-square",
	}[aspectRatio];

	return (
		<div className={`overflow-hidden ${className}`}>
			<img
				src={src}
				alt={alt}
				className={`w-full h-full object-cover ${aspectRatioClass}`}
			/>
		</div>
	);
}

/**
 * Card Content
 *
 * カードのコンテンツ部分
 *
 * @example
 * <CardContent>
 *   <p>Card content text</p>
 * </CardContent>
 */
interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
	return (
		<div className={`px-4 py-3 text-body-medium text-on-surface ${className}`}>
			{children}
		</div>
	);
}

/**
 * Card Actions
 *
 * カードのアクション部分（ボタンなど）
 *
 * @example
 * <CardActions>
 *   <TextButton>Cancel</TextButton>
 *   <FilledButton>Submit</FilledButton>
 * </CardActions>
 */
interface CardActionsProps {
	children: ReactNode;
	alignment?: "left" | "right" | "space-between";
	className?: string;
}

export function CardActions({
	children,
	alignment = "right",
	className = "",
}: CardActionsProps) {
	const alignmentClass = {
		left: "justify-start",
		right: "justify-end",
		"space-between": "justify-between",
	}[alignment];

	return (
		<div className={`flex items-center gap-2 px-4 py-3 ${alignmentClass} ${className}`}>
			{children}
		</div>
	);
}

// =====================================
// Complete Card Examples
// =====================================

/**
 * Article Card Example
 *
 * ブログ記事などのコンテンツカード
 */
export function ArticleCard() {
	return (
		<ElevatedCard className="max-w-sm">
			<CardMedia
				src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
				alt="Article cover"
				aspectRatio="16/9"
			/>
			<CardHeader
				title="Material Design 3の新機能"
				subtitle="2024年1月15日"
			/>
			<CardContent>
				<p>
					Material Design
					3では、Dynamic Colorシステムが導入され、ユーザーの壁紙に合わせた配色が可能になりました。
				</p>
			</CardContent>
			<CardActions>
				<button
					type="button"
					className="text-primary font-medium text-label-large px-3 py-2 rounded-lg hover:bg-primary/8"
				>
					共有
				</button>
				<button
					type="button"
					className="text-primary font-medium text-label-large px-3 py-2 rounded-lg hover:bg-primary/8"
				>
					詳細を見る
				</button>
			</CardActions>
		</ElevatedCard>
	);
}

/**
 * Product Card Example
 *
 * 製品カードの例
 */
export function ProductCard() {
	return (
		<OutlinedCard clickable className="max-w-xs">
			<CardMedia
				src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
				alt="Product image"
				aspectRatio="1/1"
			/>
			<div className="p-4">
				<h3 className="text-title-medium text-on-surface mb-1">
					ワイヤレスヘッドホン
				</h3>
				<p className="text-body-small text-on-surface-variant mb-3">
					高音質・ノイズキャンセリング搭載
				</p>
				<p className="text-title-large text-primary">¥24,800</p>
			</div>
		</OutlinedCard>
	);
}

/**
 * Profile Card Example
 *
 * プロフィールカードの例
 */
export function ProfileCard() {
	return (
		<FilledCard className="max-w-sm">
			<div className="p-6 text-center">
				<div className="w-24 h-24 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-on-primary text-display-small font-bold">
					JD
				</div>
				<h3 className="text-headline-small text-on-surface mb-1">
					John Doe
				</h3>
				<p className="text-body-medium text-on-surface-variant mb-4">
					UI/UX Designer
				</p>
				<div className="flex gap-2 justify-center">
					<button
						type="button"
						className="flex-1 bg-primary text-on-primary px-6 py-2.5 rounded-full font-medium text-label-large hover:shadow-md transition-shadow"
					>
						フォロー
					</button>
					<button
						type="button"
						className="flex-1 border border-outline text-primary px-6 py-2.5 rounded-full font-medium text-label-large hover:bg-primary/8 transition-colors"
					>
						メッセージ
					</button>
				</div>
			</div>
		</FilledCard>
	);
}

/**
 * Usage Examples Demo
 */
export function CardExamples() {
	return (
		<div className="space-y-8 p-8 bg-background">
			<section>
				<h2 className="text-headline-medium text-on-background mb-4">
					Card Variants
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<h3 className="text-title-medium text-on-background mb-3">
							Elevated Card
						</h3>
						<ElevatedCard className="p-6">
							<p className="text-body-medium">
								Shadow-md で浮き上がって見えるカード
							</p>
						</ElevatedCard>
					</div>

					<div>
						<h3 className="text-title-medium text-on-background mb-3">
							Filled Card
						</h3>
						<FilledCard className="p-6">
							<p className="text-body-medium">背景色付きのカード</p>
						</FilledCard>
					</div>

					<div>
						<h3 className="text-title-medium text-on-background mb-3">
							Outlined Card
						</h3>
						<OutlinedCard className="p-6">
							<p className="text-body-medium">ボーダーのみのカード</p>
						</OutlinedCard>
					</div>
				</div>
			</section>

			<section>
				<h2 className="text-headline-medium text-on-background mb-4">
					Complete Examples
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<ArticleCard />
					<ProductCard />
					<ProfileCard />
				</div>
			</section>
		</div>
	);
}
