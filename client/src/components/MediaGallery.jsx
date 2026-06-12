import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';
import VideoPlayer from './VideoPlayer';

export default function MediaGallery({ images = [], video }) {
  const [mainIndex, setMainIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasMedia = images.length > 0 || video;

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    },
    [closeLightbox, nextLightbox, prevLightbox]
  );

  if (!hasMedia) {
    return (
      <div className="aspect-video rounded-xl bg-gradient-to-br from-gaming-card via-gaming-deeper to-gaming-dark 
                      flex items-center justify-center border border-gaming-border">
        <div className="text-center">
          <span className="text-gray-600 text-5xl font-gaming block mb-2">SG</span>
          <span className="text-gray-600 text-sm">No media</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Video Player */}
      {video && <VideoPlayer src={video} />}

      {/* Main Image */}
      {images.length > 0 && (
        <motion.div
          className="relative aspect-video rounded-xl overflow-hidden border border-gaming-border 
                     cursor-pointer group"
          onClick={() => openLightbox(mainIndex)}
          whileHover={{ scale: 1.005 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={mainIndex}
              src={images[mainIndex]}
              alt={`Image ${mainIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 
                          flex items-center justify-center">
            <span className="text-white/0 group-hover:text-white/80 transition-colors text-sm font-medium">
              Click to enlarge
            </span>
          </div>
        </motion.div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <motion.button
              key={index}
              onClick={() => setMainIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300
                ${mainIndex === index
                  ? 'border-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'border-gaming-border hover:border-gray-500 opacity-60 hover:opacity-100'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white 
                         bg-white/10 rounded-full transition-colors z-10"
            >
              <HiX className="text-2xl" />
            </button>

            {/* Image */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[85vh]"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={images[lightboxIndex]}
                  alt={`Full ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </motion.div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                  className="absolute left-4 p-3 text-white/70 hover:text-white bg-white/10 
                             hover:bg-white/20 rounded-full transition-all"
                >
                  <HiChevronLeft className="text-2xl" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                  className="absolute right-4 p-3 text-white/70 hover:text-white bg-white/10 
                             hover:bg-white/20 rounded-full transition-all"
                >
                  <HiChevronRight className="text-2xl" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300
                      ${lightboxIndex === index
                        ? 'bg-accent-cyan w-6 shadow-[0_0_6px_rgba(0,240,255,0.5)]'
                        : 'bg-white/30 hover:bg-white/60'
                      }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
