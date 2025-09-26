"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import { VideoSlide } from "../../types/content";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: VideoSlide;
  index: number;
}

export function CardDetailModal({ isOpen, onClose, slide, index }: CardDetailModalProps) {
  console.log('CardDetailModal rendered:', { isOpen, slide: slide?.title, index });
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="modal-content fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 max-w-4xl max-h-[90vh] w-[90vw] overflow-hidden">
          <Dialog.Title className="sr-only">
            {slide.title} - 詳細情報
          </Dialog.Title>
          <div className="relative">
            {/* Close button */}
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>

            {/* メディア表示 */}
            <div className="relative w-full h-[50vh] bg-gray-100 dark:bg-gray-800">
              {slide.mediaType === "video" && slide.mp4 ? (
                <video
                  src={slide.mp4}
                  className="w-full h-full object-cover"
                  controls
                  poster={slide.imageSrc}
                >
                  Your browser does not support the video tag.
                </video>
              ) : slide.imageSrc ? (
                <Image
                  src={slide.imageSrc}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="90vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">No media available</span>
                </div>
              )}
            </div>

            {/* コンテンツ詳細 */}
            <div className="p-6 max-h-[40vh] overflow-y-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
              {/* 記事カード */}
              <div 
                className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4 duration-400 delay-300"
                onClick={(e) => {
                  console.log('🎯 記事カード clicked!', e);
                  console.log('🔗 記事カードクリック:', slide.title);
                  console.log('📄 slide data:', slide);
                  console.log('📄 slide JSON:', JSON.stringify(slide, null, 2));
                  console.log('🔍 liveUrl:', slide.liveUrl);
                  console.log('🔍 githubUrl:', slide.githubUrl);
                  console.log('🔍 slide keys:', Object.keys(slide));
                  
                  // イベントの伝播を停止
                  e.stopPropagation();
                  e.preventDefault();
                  
                  if (slide.liveUrl) {
                    console.log('✅ 記事ページに遷移:', slide.liveUrl);
                    window.location.href = slide.liveUrl;
                  } else {
                    console.log('❌ 記事URLがありません');
                  }
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {slide.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {slide.description && slide.description.length > 30 
                    ? `${slide.description.slice(0, 30)}...`
                    : slide.description || "詳細な説明はありません"
                  }
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {slide.publishedAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(slide.publishedAt).toLocaleDateString("ja-JP")}</span>
                      </div>
                    )}
                    {slide.category && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="w-3 h-3" />
                        <span>{slide.category}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      console.log('🔗 記事を読む ボタンクリック');
                      e.stopPropagation();
                      
                      if (slide.liveUrl) {
                        window.location.href = slide.liveUrl;
                      }
                    }}
                  >
                    記事を読む →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}