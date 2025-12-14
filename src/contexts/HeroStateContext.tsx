import { createContext, useContext } from "react";

interface HeroStateContextType {
  setIsContactVisible: (visible: boolean) => void;
}

export const HeroStateContext = createContext<HeroStateContextType>({
  setIsContactVisible: () => {},
});

export const useHeroState = () => useContext(HeroStateContext);
