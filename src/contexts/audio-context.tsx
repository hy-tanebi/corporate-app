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
	playHoverSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// BGM音源のパスを指定（m4a形式に対応）
		audioRef.current = new Audio("/audio/bgm.m4a");
		audioRef.current.loop = true;
		audioRef.current.volume = 0.3; // 音量を30%に設定

		// ホバー音源の読み込み
		hoverSoundRef.current = new Audio("/audio/click.mp3");
		hoverSoundRef.current.volume = 0.2; // 音量を20%に設定

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
			if (hoverSoundRef.current) {
				hoverSoundRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!audioRef.current) return;

		if (isPlaying && !isMuted) {
			// 音量を設定してから再生
			audioRef.current.volume = 0.3;
			audioRef.current
				.play()
				.then(() => {
					console.log("Audio playback started successfully");
				})
				.catch((error) => {
					console.error("Audio playback failed:", error);
					// ユーザーインタラクションが必要な場合のエラーハンドリング
					if (error.name === "NotAllowedError") {
						console.warn(
							"Audio playback requires user interaction. Please try again.",
						);
					}
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

	const playHoverSound = () => {
		if (hoverSoundRef.current && isPlaying && !isMuted) {
			hoverSoundRef.current.currentTime = 0; // 最初から再生
			hoverSoundRef.current.play().catch((error) => {
				console.error("Hover sound playback failed:", error);
			});
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
