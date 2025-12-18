import { createContext, useContext } from "react";

interface HeroStateContextType {
  setIsContactVisible: (visible: boolean) => void;
  spaceOpacity: number;
  setSpaceOpacity: (opacity: number) => void;
  transitionProgress: number;
  setTransitionProgress: (progress: number) => void;
}

export const HeroStateContext = createContext<HeroStateContextType>({
  setIsContactVisible: () => {},
  spaceOpacity: 1,
  setSpaceOpacity: () => {},
  transitionProgress: 0,
  setTransitionProgress: () => {},
});

export const useHeroState = () => useContext(HeroStateContext);
