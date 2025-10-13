"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	type ReactNode,
} from "react";

interface AudioContextType {
	isPlaying: boolean;
	isMuted: boolean;
	togglePlay: () => void;
	toggleMute: () => void;
	setIsPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// BGM音源のパスを指定（後で音源ファイルを配置）
		audioRef.current = new Audio("/audio/bgm.mp3");
		audioRef.current.loop = true;
		audioRef.current.volume = 0.3; // 音量を30%に設定

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!audioRef.current) return;

		if (isPlaying && !isMuted) {
			audioRef.current.play().catch((error) => {
				console.error("Audio playback failed:", error);
			});
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying, isMuted]);

	const togglePlay = () => {
		setIsPlaying((prev) => !prev);
	};

	const toggleMute = () => {
		setIsMuted((prev) => !prev);
	};

	return (
		<AudioContext.Provider
			value={{ isPlaying, isMuted, togglePlay, toggleMute, setIsPlaying }}
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
