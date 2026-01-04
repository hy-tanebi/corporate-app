// src/app/components/ContactSection.tsx
"use client";

interface ContactSectionProps {
  scrollProgress: number;
  missionSectionProgress: number;
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const _remap01 = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export default function ContactSection({
  scrollProgress: _scrollProgress,
  missionSectionProgress: _missionSectionProgress,
}: ContactSectionProps) {
  // ここでは表示しない - Missionセクション内でスクロールさせる設計のため
  return null;
}
