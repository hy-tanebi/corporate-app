"use client";

import { useState } from "react";
import { useAudio } from "@/contexts/audio-context";
import { Volume2, VolumeX } from "lucide-react";

export default function SoundToggle({ onStart }: { onStart: () => void }) {
	const { setIsPlaying } = useAudio();
	const [selected, setSelected] = useState<"on" | "off" | null>(null);

	const handleSelection = (choice: "on" | "off") => {
		setSelected(choice);
		setIsPlaying(choice === "on");
		// 選択後、少し待ってから画面遷移
		setTimeout(() => {
			onStart();
		}, 500);
	};

	return (
		<div className="flex flex-col items-center space-y-6">
			<p className="text-white text-xl md:text-2xl font-semibold">
				サウンドを有効にしますか？
			</p>
			<div className="flex gap-6">
				{/* ON ボタン */}
				<button
					type="button"
					onClick={() => handleSelection("on")}
					className={`
            group relative px-8 py-4 rounded-xl border-2 transition-all duration-300
            ${
							selected === "on"
								? "bg-blue-500 border-blue-500 scale-110"
								: "bg-gray-900/50 border-gray-700 hover:border-blue-500 hover:bg-gray-800/50"
						}
          `}
				>
					<div className="flex flex-col items-center gap-2">
						<Volume2
							className={`w-8 h-8 ${selected === "on" ? "text-white" : "text-gray-400 group-hover:text-blue-400"}`}
						/>
						<span
							className={`text-lg font-semibold ${selected === "on" ? "text-white" : "text-gray-400 group-hover:text-blue-400"}`}
						>
							ON
						</span>
					</div>
				</button>

				{/* OFF ボタン */}
				<button
					type="button"
					onClick={() => handleSelection("off")}
					className={`
            group relative px-8 py-4 rounded-xl border-2 transition-all duration-300
            ${
							selected === "off"
								? "bg-gray-600 border-gray-600 scale-110"
								: "bg-gray-900/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
						}
          `}
				>
					<div className="flex flex-col items-center gap-2">
						<VolumeX
							className={`w-8 h-8 ${selected === "off" ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
						/>
						<span
							className={`text-lg font-semibold ${selected === "off" ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
						>
							OFF
						</span>
					</div>
				</button>
			</div>
		</div>
	);
}
