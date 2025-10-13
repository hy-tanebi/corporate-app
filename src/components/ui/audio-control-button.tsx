"use client";

import { useAudio } from "@/contexts/audio-context";
import { Volume2, VolumeX } from "lucide-react";

export function AudioControlButton() {
	const { isPlaying, togglePlay } = useAudio();

	return (
		<button
			type="button"
			onClick={togglePlay}
			className="group p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40"
			aria-label={isPlaying ? "サウンドをオフにする" : "サウンドをオンにする"}
		>
			{isPlaying ? (
				<Volume2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
			) : (
				<VolumeX className="w-5 h-5 text-white/60 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
			)}
		</button>
	);
}
