import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ImageAsset } from '@/types';

type LightboxProps = {
  images: ImageAsset[];
  index: number | null;
  onClose: () => void;
  onIndex: (index: number) => void;
};

export function Lightbox({ images, index, onClose, onIndex }: LightboxProps) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (event.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, onIndex]);

  if (index === null || !images[index]) return null;
  const image = images[index];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/92 p-4" role="dialog" aria-modal="true" aria-label="Project image">
      <button type="button" className="absolute right-4 top-4 rounded-full border border-white/20 p-2 text-cream" onClick={onClose} aria-label="Close image">
        <X className="h-5 w-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 rounded-full border border-white/20 p-2 text-cream"
            onClick={() => onIndex((index - 1 + images.length) % images.length)}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-16 rounded-full border border-white/20 p-2 text-cream sm:right-4 sm:translate-x-0"
            onClick={() => onIndex((index + 1) % images.length)}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <img src={image.url} alt="" className="max-h-[82vh] max-w-[92vw] object-contain" />
    </div>
  );
}
