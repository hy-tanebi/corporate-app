"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 見出しの型
interface HeadingItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

// 見出しレベルに応じたインデント計算
function getIndentLevel(level: number): number {
  switch (level) {
    case 1:
      return 8; // h1: 基本インデント
    case 2:
      return 20; // h2: 少し右にインデント
    case 3:
      return 32; // h3: さらに右にインデント
    default:
      return 8;
  }
}

export function TableOfContentsClient() {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // クライアント側で見出しを抽出してIDを付与
  useEffect(() => {
    const proseElement = document.querySelector('.prose');
    if (!proseElement) return;

    const headingElements = proseElement.querySelectorAll('h1, h2, h3');
    const headingsData: HeadingItem[] = [];

    headingElements.forEach((element, index) => {
      const id = `heading-${index + 1}`;
      const text = element.textContent || '';
      const level = parseInt(element.tagName.replace('H', ''));
      
      // IDを設定
      element.id = id;
      
      headingsData.push({
        id,
        text,
        level,
        element: element as HTMLElement
      });
    });

    setHeadings(headingsData);
    console.log('Client-side headings:', headingsData); // デバッグログ
  }, []);

  // アクティブな見出しの追跡
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // オフセット調整

      // 現在のスクロール位置より上にある見出しを取得
      const visibleHeadings = headings.filter(heading => {
        return heading.element.offsetTop <= scrollPosition;
      });

      if (visibleHeadings.length > 0) {
        // 最後の見出し（最も下にある見出し）をアクティブにする
        const lastVisible = visibleHeadings[visibleHeadings.length - 1];
        setActiveId(lastVisible.id);
      } else if (headings.length > 0) {
        // すべての見出しがスクロール位置より下にある場合は最初の見出しをアクティブ
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 初期化時に実行

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleHeadingClick = (id: string) => {
    console.log('Clicking heading:', id); // デバッグログ
    const element = document.getElementById(id);
    
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      console.log('Scrolling to:', offsetPosition); // デバッグログ

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.log('Element not found:', id); // デバッグログ
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-4 max-h-[80vh] overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          📋 目次
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav>
          {/* タイムライン */}
          <div className="relative">
            {headings.length > 0 && (
              <>
                {/* 縦のライン */}
                <div 
                  className="absolute w-0.5 bg-gray-200 dark:bg-gray-700"
                  style={{
                    left: '15px', // 1px右にずらす (14px + 1px)
                    top: '24px',
                    bottom: '24px'
                  }}
                />
                
                {/* 進捗ライン */}
                <div 
                  className="absolute w-0.5 bg-gradient-to-b from-blue-500 via-blue-600 to-purple-600 transition-all duration-500 ease-out shadow-sm"
                  style={{
                    left: '15px', // 1px右にずらす (14px + 1px)
                    top: '24px',
                    height: activeId ? 
                      `calc((100% - 48px) * ${headings.findIndex(h => h.id === activeId) / Math.max(1, headings.length - 1)})` 
                      : '0%'
                  }}
                >
                  {/* 光る効果 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-500 blur-sm opacity-50"></div>
                </div>
              </>
            )}

            <ul className="space-y-0 text-sm relative">
              {headings.map((heading, index) => {
                const isActive = activeId === heading.id;
                const isPassed = headings.findIndex(h => h.id === activeId) >= index;
                
                return (
                  <li key={heading.id} className="relative">
                    <button
                      onClick={() => handleHeadingClick(heading.id)}
                      className={`
                        block w-full text-left py-3 pr-2 transition-all duration-200 ease-out hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-r-md
                        ${isActive 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                          : "text-gray-700 dark:text-gray-300"
                        }
                      `}
                      style={{ 
                        paddingLeft: `${getIndentLevel(heading.level) + 16}px` // タイムライン分の余白追加
                      }}
                    >
                      {/* タイムラインのドット */}
                      <div 
                        className={`
                          absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 ease-out
                          ${isActive 
                            ? "w-3 h-3 bg-blue-500 border-blue-500 shadow-lg scale-125 animate-pulse" 
                            : isPassed
                            ? "w-2 h-2 bg-blue-400 border-blue-400"
                            : "w-2 h-2 bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
                          }
                        `}
                      >
                        {/* アクティブ時のリング効果 */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-25 animate-ping"></div>
                        )}
                      </div>

                      {/* レベル別アイコン */}
                      <div className="flex items-center gap-3">
                        <div className={`
                          flex items-center justify-center transition-all duration-200
                          ${heading.level === 1 ? "w-5 h-5" : heading.level === 2 ? "w-4 h-4" : "w-3 h-3"}
                        `}>
                          {heading.level === 1 && (
                            <span className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                              📄
                            </span>
                          )}
                          {heading.level === 2 && (
                            <span className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                              📝
                            </span>
                          )}
                          {heading.level === 3 && (
                            <span className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                              📌
                            </span>
                          )}
                        </div>
                        
                        <span className={`
                          transition-all duration-200 leading-relaxed
                          ${heading.level === 1 ? "font-semibold text-base" : ""}
                          ${heading.level === 2 ? "font-medium text-sm" : ""}
                          ${heading.level === 3 ? "font-normal text-xs" : ""}
                          ${isActive ? "font-medium" : ""}
                        `}>
                          {heading.text}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}