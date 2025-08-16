"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useRef } from "react";
import animationData from "../../../public/animations/sunsun.json";

interface LottieAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function LottieAnimation({
  width = 400,
  height = 400,
  className = "",
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <div className={className}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        style={{
          width,
          height,
          // GPU加速を有効にしてスムーズなアニメーションを実現
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        loop={true}
        autoplay={true}
        // レンダリング品質を向上
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );
}
