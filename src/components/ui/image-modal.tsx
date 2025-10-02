"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	imageAlt: string;
	title: string;
}

export function ImageModal({
	isOpen,
	onClose,
	imageUrl,
	imageAlt,
	title,
}: ImageModalProps) {
	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-w-4xl max-h-[90vh] w-[90vw] overflow-hidden">
					<div className="relative">
						{/* Close button */}
						<Dialog.Close asChild>
							<button
								type="button"
								className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
								aria-label="Close modal"
							>
								<X className="w-5 h-5" />
							</button>
						</Dialog.Close>

						{/* Image */}
						<div className="relative w-full h-[70vh] bg-gray-100 dark:bg-gray-700">
							<Image
								src={imageUrl}
								alt={imageAlt}
								fill
								className="object-contain"
								sizes="90vw"
								priority
							/>
						</div>

						{/* Title */}
						<div className="p-6 border-t border-gray-200 dark:border-gray-600">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
								{title}
							</h2>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
