"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Image from "next/image";
import type { VideoSlide } from "../../types/content";

interface CardDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	slide: VideoSlide;
	index: number;
}

export function CardDetailModal({
	isOpen,
	onClose,
	slide,
	index,
}: CardDetailModalProps) {
	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]" />
				<Dialog.Content
                    className="modal-content fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black rounded-2xl shadow-2xl z-[101] w-[90vw] md:w-[30vw] md:max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                    aria-describedby={undefined}
                >
					<Dialog.Title className="sr-only">
						{slide.title} - 詳細情報
					</Dialog.Title>

                    {/* Close Button - Overlay */}
                    <div className="absolute top-4 right-4 z-50">
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className="bg-[#1c50a1] hover:bg-[#1c50a1]/90 text-white p-2 rounded-full transition-colors shadow-lg"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Top: Media Content (Video/Image) */}
                    <div className="w-full aspect-video relative bg-black shrink-0">
                        {slide.mediaType === "video" && slide.mp4 ? (
                            <video
                                src={slide.mp4}
                                className="w-full h-full object-cover"
                                controls
                                autoPlay
                                loop
                                muted
                                playsInline
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
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                <span className="text-white/50">
                                    No media available
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bottom: Text Content */}
                    <div className="w-full flex-1 overflow-y-auto bg-[#1c50a1] text-white p-6 md:p-8 flex flex-col">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {slide.category && (
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${
                                        slide.category.includes('Technology') || slide.category.includes('技術')
                                            ? 'bg-rose-400'
                                            : 'bg-white/20'
                                    }`}
                                >
                                    {slide.category}
                                </span>
                            )}
                            {slide.publishedAt && (
                                <span className="inline-block bg-white text-[#1c50a1] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono">
                                    {new Date(slide.publishedAt).toLocaleDateString("ja-JP", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black mb-4 leading-none tracking-tighter uppercase font-sans">
                            {slide.title}
                        </h2>

                        <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium whitespace-pre-wrap">
                            {slide.description || "No description available."}
                        </p>

                        <div className="mt-auto pt-4">
                             <button
                                className="group relative inline-flex items-center justify-center px-6 py-2.5 bg-white text-[#1c50a1] font-bold rounded-full overflow-hidden transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (slide.liveUrl) {
                                        window.open(slide.liveUrl, '_blank', 'noopener,noreferrer');
                                    }
                                }}
                            >
                                <span className="relative z-10">Read More</span>
                            </button>
                        </div>
                    </div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
