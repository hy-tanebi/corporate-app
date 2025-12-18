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
	// デフォルトでOFF（ユーザー要望により一時的に完全無効化）
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// ホバー音源の読み込み
		hoverSoundRef.current = new Audio("/audio/click.mp3");
		hoverSoundRef.current.volume = 0.2; // 音量を20%に設定

		/*
		// セッションストレージから設定を読み込む（一時的に無効化）
		const savedState = sessionStorage.getItem("sound_enabled");
		if (savedState) {
			setIsPlaying(savedState === "on");
		}
		*/

		return () => {
			if (hoverSoundRef.current) {
				hoverSoundRef.current = null;
			}
		};
	}, []);

	const togglePlay = () => {
		// 一時的に機能無効化（ONにできないようにする）
		return;
		/*
		setIsPlaying((prev) => {
			const newState = !prev;
			sessionStorage.setItem("sound_enabled", newState ? "on" : "off");
			return newState;
		});
		*/
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
				setIsPlaying: (playing: boolean) => {
					setIsPlaying(playing);
					sessionStorage.setItem("sound_enabled", playing ? "on" : "off");
				},
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
