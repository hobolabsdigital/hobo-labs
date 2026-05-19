import { motion } from 'framer-motion';
import Image from 'next/image';

interface GallerySliderProps {
  isSettled: boolean;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  imagesCount: number;
  m: any; // using any temporarily to avoid tight coupling to theme store in presentational component
  finalHeroSrc: string;
  title: string;
  gallery: string[];
}

export function GallerySlider({
  isSettled,
  currentIndex,
  setCurrentIndex,
  imagesCount,
  m,
  finalHeroSrc,
  title,
  gallery,
}: GallerySliderProps) {
  if (!isSettled) return null;

  return (
    <>
      <motion.div
        className="absolute inset-0 w-full h-full z-10"
        animate={{ x: `calc(-${currentIndex * 100}% - ${currentIndex * 32}px)` }}
        transition={{ type: 'spring', stiffness: m.modal.stiffness, damping: m.modal.damping }}
        drag={imagesCount > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = offset.x + velocity.x * 0.2;
          if (swipe < -50) {
            setCurrentIndex(i => Math.min(imagesCount - 1, i + 1));
          } else if (swipe > 50) {
            setCurrentIndex(i => Math.max(0, i - 1));
          }
        }}
        style={{ cursor: imagesCount > 1 ? 'grab' : 'auto' }}
        whileTap={{ cursor: imagesCount > 1 ? 'grabbing' : 'auto' }}
      >
        {/* The Swapped Hero Image (Index 0) */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full cursor-pointer bg-black"
          animate={{ opacity: currentIndex === 0 ? 1 : 0.3 }}
          whileHover={{ opacity: 1 }}
          onClick={() => setCurrentIndex(0)}
        >
          <Image
            draggable={false}
            src={finalHeroSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) calc(100vw - 64px), min(896px, calc(100vw - 128px))"
            data-modal-image
            className="object-cover shadow-2xl"
          />
        </motion.div>

        {/* Gallery Images (Index 1+) */}
        {gallery.map((src, i) => {
          const index = i + 1;
          return (
            <motion.div
              key={src}
              className="absolute top-0 w-full h-full cursor-pointer bg-black"
              style={{ left: `calc(${index * 100}% + ${index * 32}px)` }}
              animate={{ opacity: currentIndex === index ? 1 : 0.3 }}
              whileHover={{ opacity: 1 }}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                draggable={false}
                src={src}
                alt={`${title} gallery ${index}`}
                fill
                sizes="(max-width: 768px) calc(100vw - 64px), min(896px, calc(100vw - 128px))"
                data-modal-image
                className="object-cover shadow-2xl"
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dot Navigation */}
      {imagesCount > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 left-0 right-0 flex justify-center gap-3 z-20"
        >
          {Array.from({ length: imagesCount }).map((_, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 transition-all duration-300 ${
                i === currentIndex ? `w-6 bg-foreground` : `w-1.5 bg-foreground/20 hover:bg-foreground/50`
              }`}
              style={{ borderRadius: 'var(--radius-pill)' }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </motion.div>
      )}
    </>
  );
}
