import Link from "next/link";

export default function NotFound() {
	return (
		<div className="fixed inset-0 bg-black">
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<div className="text-center space-y-8 px-4">
					<h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
						TANEBI CREATIVE
					</h2>

					<h1 className="text-6xl md:text-8xl font-bold text-white tracking-wider">
						404
					</h1>

					<div className="w-64 md:w-96 mx-auto">
						<div className="h-2 bg-gray-800 rounded-full overflow-hidden">
							<div className="h-full w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600" />
						</div>
						<p className="text-white text-lg mt-6">
							お探しのページは見つかりませんでした
						</p>
						<p className="text-white/60 text-sm mt-2">
							ページが存在しないか、移動された可能性があります。
						</p>
					</div>

					<Link
						href="/"
						className="inline-block rounded-full border border-white/40 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black"
					>
						トップページに戻る
					</Link>
				</div>
			</div>
		</div>
	);
}
