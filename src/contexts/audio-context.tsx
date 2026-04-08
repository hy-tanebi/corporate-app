"use client";

import {
	createContext,
	useContext,
	useState,
	useRef,
	type ReactNode,
} from "react";

interface AudioContextType {
	isPlaying: boolean;
	isMuted: boolean;
	togglePlay: () => void;
	toggleMute: () => void;
	setIsPlaying: (playing: boolean) => void;
	playHoverSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// NOTE: サウンド機能は現在無効化中。再有効化時は togglePlay / playHoverSound を実装し直すこと。
export function AudioProvider({ children }: { children: ReactNode }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

	const togglePlay = () => {
		// サウンド機能無効化中
	};

	const toggleMute = () => {
		setIsMuted((prev) => !prev);
	};

	const playHoverSound = () => {
		if (hoverSoundRef.current && isPlaying && !isMuted) {
			hoverSoundRef.current.currentTime = 0;
			hoverSoundRef.current.play().catch(() => {});
		}
	};

	return (
		<AudioContext.Provider
			value={{
				isPlaying,
				isMuted,
				togglePlay,
				toggleMute,
				setIsPlaying,
				playHoverSound,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	const context = useContext(AudioContext);
	if (context === undefined) {
		throw new Error("useAudio must be used within an AudioProvider");
	}
	return context;
}
