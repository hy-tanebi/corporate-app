"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// コンテンツデータ
const CONTENT_ITEMS = [
  {
    id: '01',
    title: 'AIとWebを使って、\nビジネスの課題に向き合います。',
    description: 'AIによる業務効率化や、Webサイトの制作・運用を通じて、日々の業務や運用上の課題に取り組んでいます。複雑になりがちな技術を、現場で無理なく活用できる形に整理し、実務に役立つ形で取り入れます。'
  },
  {
    id: '02',
    title: '外部の制作会社ではなく、\nチームの一員として。',
    description: '言われたものを作るだけではなく、業務内容や組織の状況を理解した上で、一緒に考えながら進めたいと考えています。社内のIT担当に近い立場で、WebやAI活用の相談役として継続的にサポートします。'
  },
  {
    id: '03',
    title: '売り手よし、買い手よし、\n世間よしの精神で。',
    description: '自社の利益だけでなく、クライアントとその顧客、さらには社会全体にとって価値あるものをつくる。三方よしの視点を持って、持続可能なビジネスの実現に貢献します。'
  }
];

interface MissionContentProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function MissionContent({ scrollContainerRef }: MissionContentProps) {
  return (
    <>
      <div className="hidden md:block">
        <MissionContentDesktop scrollContainerRef={scrollContainerRef} />
      </div>
      <div className="block md:hidden">
        <MissionContentMobile />
      </div>
    </>
  );
}

// === Desktop Implementation (Sticky Scroll) ===
function MissionContentDesktop({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLDivElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    offset: ["start start", "end end"]
  });

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  });

  // Unified Phase Logic: 0 to 3 (since there are 3 items)
  const currentPhase = useTransform(smoothProgress, [0, 1], [0, 3]);

  // Shapes Transforms (Syncing perfectly with phase)
  // Shape 1: Square (Business) - Phase 0-1
  const squareOpacity = useTransform(currentPhase, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const squareScale = useTransform(currentPhase, [0, 1], [0.95, 1.05]);
  const squareRotate = useTransform(currentPhase, [0, 1], [0, 10]);

  // Shape 2: Pair (Partner) - Phase 1-2
  const pairOpacity = useTransform(currentPhase, [1, 1.2, 1.8, 2], [0, 1, 1, 0]);
  const pairScale = useTransform(currentPhase, [1, 2], [0.95, 1.05]);
  const pairGap = useTransform(currentPhase, [1, 2], [-50, 50]);

  // Shape 3: Sanpo-yoshi (Triangle/Circles) - Phase 2-3
  const sanpoOpacity = useTransform(currentPhase, [2, 2.2, 2.8, 3.0], [0, 1, 1, 0]);
  const sanpoScale = useTransform(currentPhase, [2, 3], [0.95, 1.05]);
  const sanpoRotate = useTransform(currentPhase, [2, 3], [180, 0]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[1600px] mx-auto" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen w-full flex flex-row overflow-hidden">

        {/* Left Column: Visuals (50%) - Centered */}
        <div className="w-1/2 h-full flex items-center justify-center relative">
          <div className="relative w-[500px] h-[500px] flex items-center justify-center">

             {/* Shape 1: Square */}
             <motion.div
               className="absolute bg-[#0066CC] rounded-3xl"
               style={{
                 width: 280,
                 height: 280,
                 scale: squareScale,
                 opacity: squareOpacity,
                 rotate: squareRotate,
                 zIndex: 10
               }}
             />

             {/* Shape 2: Pair */}
             <motion.div
               className="absolute flex items-center justify-center"
               style={{
                 scale: pairScale,
                 opacity: pairOpacity,
                 zIndex: 10
               }}
             >
                <div className="relative flex items-center justify-center">
                    <motion.div
                        className="w-[180px] h-[180px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90"
                        style={{ x: pairGap }}
                    />
                    <motion.div
                        className="w-[180px] h-[180px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90"
                        style={{ x: useTransform(pairGap, v => -v) }}
                    />
                </div>
             </motion.div>

             {/* Shape 3: Sanpo-yoshi */}
             <motion.div
                className="absolute w-[300px] h-[300px]"
                style={{
                    scale: sanpoScale,
                    opacity: sanpoOpacity,
                    rotate: sanpoRotate,
                    zIndex: 10
                }}
             >
                 {/* Top Circle */}
                 <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[160px] h-[160px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90" />
                 {/* Bottom Left Circle */}
                 <div className="absolute bottom-[30px] left-[35px] w-[160px] h-[160px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90" />
                 {/* Bottom Right Circle */}
                 <div className="absolute bottom-[30px] right-[35px] w-[160px] h-[160px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90" />
             </motion.div>

          </div>
        </div>

        {/* Right Column: Text Content (50%) - Check padding */}
        <div className="w-1/2 h-full flex flex-col justify-center relative pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-auto">
             {CONTENT_ITEMS.map((item, index) => (
                <ScrollOpacityItem
                  key={item.id}
                  data={item}
                  index={index}
                  phase={currentPhase}
                />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function ScrollOpacityItem({ data, index, phase }: { data: any, index: number, phase: any }) {
  const opacity = useTransform(
    phase,
    [index, index + 0.2, index + 0.8, index + 1.0],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    phase,
    [index, index + 1],
    [50, -50]
  );

  return (
    <motion.div
      className="absolute w-full max-w-4xl"
      style={{ opacity, y }}
    >
      <span className="block text-[#0066CC] font-bold text-xl mb-4">{data.id}.</span>
      <h3 className="text-2xl lg:text-4xl font-black text-white mb-6 leading-relaxed font-sans tracking-wide whitespace-pre-line">
        {data.title}
      </h3>
      <p className="text-base text-gray-300 leading-loose">
        {data.description}
      </p>
    </motion.div>
  );
}

// === Mobile Implementation (Static Column) ===
function MissionContentMobile() {
  return (
    <div className="w-full py-10 px-4 flex flex-col gap-24">
      {CONTENT_ITEMS.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-8">
          {/* Visual Area */}
          <div className="flex justify-center items-center h-[240px]">
             {index === 0 && (
               /* Square */
               <div className="relative w-[160px] h-[160px] bg-[#0066CC] rounded-3xl rotate-[10deg]" />
             )}
             {index === 1 && (
               /* Pair */
               <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                  <div className="absolute w-[100px] h-[100px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90 -translate-x-8" />
                  <div className="absolute w-[100px] h-[100px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90 translate-x-8" />
               </div>
             )}
             {index === 2 && (
               /* Sanpo (3 circles) */
               <div className="relative w-[160px] h-[160px]">
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[90px] h-[90px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90" />
                  <div className="absolute bottom-[20px] left-[15px] w-[90px] h-[90px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90" />
                  <div className="absolute bottom-[20px] right-[15px] w-[90px] h-[90px] bg-[#0066CC] rounded-full mix-blend-multiply opacity-90" />
               </div>
             )}
          </div>

          {/* Text Area */}
          <div className="flex flex-col gap-4">
             <span className="text-[#0066CC] font-bold text-xl">{item.id}.</span>
             <h3 className="text-2xl font-black text-white leading-relaxed whitespace-pre-line">
                {item.title}
             </h3>
             <p className="text-base text-gray-300 leading-relaxed">
                {item.description}
             </p>
          </div>
        </div>
      ))}
    </div>
  );
}
