"use client";

import { useState, type ReactNode } from "react";
import { HeroStateContext } from "./HeroStateContext";

export function HeroStateProvider({ children }: { children: ReactNode }) {
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [spaceOpacity, setSpaceOpacity] = useState(1);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [shouldSnapAnimation, setShouldSnapAnimation] = useState(false);

  return (
    <HeroStateContext.Provider
      value={{
        isContactVisible,
        setIsContactVisible,
        spaceOpacity,
        setSpaceOpacity,
        transitionProgress,
        setTransitionProgress,
        shouldSnapAnimation,
        setShouldSnapAnimation,
      }}
    >
      {children}
    </HeroStateContext.Provider>
  );
}
