"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex, images]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    onNavigate(nextIndex);
  };

  const getFullImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `/${path}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-in fade-in duration-250">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 bg-neutral-900/60 hover:bg-neutral-800 text-white rounded-full transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 z-50 p-3 bg-neutral-900/60 hover:bg-neutral-800 text-white rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 z-50 p-3 bg-neutral-900/60 hover:bg-neutral-800 text-white rounded-full transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] px-4 flex flex-col items-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getFullImageUrl(images[currentIndex])}
          alt={`Gallery screenshot ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
        />
        {images.length > 1 && (
          <p className="text-sm font-medium text-neutral-400 mt-4">
            {currentIndex + 1} of {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
