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
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 max-w-4xl max-h-[90vh] w-[90vw] overflow-hidden">
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
            <div className="p-6 max-h-[40vh] overflow-y-auto">
              {/* タイトル */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {slide.title}
              </h2>

              {/* メタ情報 */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                {slide.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(slide.publishedAt).toLocaleDateString("ja-JP")}</span>
                  </div>
                )}
                {slide.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{slide.category}</span>
                  </div>
                )}
                <div className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>

              {/* 説明文 */}
              {slide.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              )}

              {/* 技術スタック */}
              {slide.techStack && slide.techStack.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    技術スタック
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {slide.techStack.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 外部リンク */}
              {(slide.githubUrl || slide.liveUrl) && (
                <div className="mt-6 flex gap-3">
                  {slide.githubUrl && (
                    <a
                      href={slide.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  {slide.liveUrl && (
                    <a
                      href={slide.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}