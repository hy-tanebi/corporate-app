"use client";

import { createContext, useContext } from "react";

interface HeroStateContextType {
	isContactVisible: boolean;
	setIsContactVisible: (visible: boolean) => void;
	spaceOpacity: number;
	setSpaceOpacity: (opacity: number) => void;
	transitionProgress: number;
	setTransitionProgress: (progress: number) => void;
	shouldSnapAnimation: boolean;
	setShouldSnapAnimation: (shouldSnap: boolean) => void;
}

export const HeroStateContext = createContext<HeroStateContextType>({
	isContactVisible: false,
	setIsContactVisible: () => {},
	spaceOpacity: 1,
	setSpaceOpacity: () => {},
	transitionProgress: 0,
	setTransitionProgress: () => {},
	shouldSnapAnimation: false,
	setShouldSnapAnimation: () => {},
});

export const useHeroState = () => useContext(HeroStateContext);
