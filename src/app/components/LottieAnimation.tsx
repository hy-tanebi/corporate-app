"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useRef, useState, useEffect } from "react";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // コンポーネントがマウントされたら、クライアントサイドと判定
    setIsClient(true);
  }, []);

  // サーバー側ではレンダリングせず、ハイドレーションエラーを回避
  if (!isClient) {
    return null;
  }

  return (
    <div className={className}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        style={{
          width,
          height,
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        loop={true}
        autoplay={true}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );
}
