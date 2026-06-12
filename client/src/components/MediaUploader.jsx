import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPhotograph, HiVideoCamera, HiX, HiUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

export default function MediaUploader({
  images = [],
  video = null,
  onImagesChange,
  onVideoChange,
  mediaMode = 'images',
  onMediaModeChange,
  previewImageIndex = 0,
  onPreviewImageIndexChange,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const maxImages = mediaMode === 'video' ? 3 : 7;

  const handleImageFiles = (files) => {
    const valid = [];
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        continue;
      }
      valid.push(file);
    }

    const total = images.length + valid.length;
    if (total > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed (${mediaMode === 'video' ? 'with video' : 'images only'} mode)`);
      const allowed = valid.slice(0, maxImages - images.length);
      onImagesChange([...images, ...allowed]);
      return;
    }
    onImagesChange([...images, ...valid]);
  };

  const handleVideoFile = (file) => {
    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error('Only MP4 and WebM videos are allowed');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video must be under 20MB');
      return;
    }
    onVideoChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => IMAGE_TYPES.includes(f.type));
    const videoFile = files.find((f) => VIDEO_TYPES.includes(f.type));

    if (imageFiles.length > 0) handleImageFiles(imageFiles);
    if (videoFile && mediaMode === 'video') handleVideoFile(videoFile);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    if (onPreviewImageIndexChange) {
      if (updatedImages.length === 0) {
        onPreviewImageIndexChange(0);
      } else if (previewImageIndex === index) {
        onPreviewImageIndexChange(0);
      } else if (index < previewImageIndex) {
        onPreviewImageIndexChange(previewImageIndex - 1);
      }
    }
  };

  const removeVideo = () => {
    onVideoChange(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onMediaModeChange('images')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${mediaMode === 'images'
              ? 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
              : 'bg-gaming-dark border border-gaming-border text-gray-400 hover:border-gray-500'
            }`}
        >
          <HiPhotograph />
          Images Only
        </button>
        <button
          type="button"
          onClick={() => onMediaModeChange('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${mediaMode === 'video'
              ? 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
              : 'bg-gaming-dark border border-gaming-border text-gray-400 hover:border-gray-500'
            }`}
        >
          <HiVideoCamera />
          Images + Video
        </button>
      </div>

      {/* Video Upload (if video mode) */}
      {mediaMode === 'video' && (
        <div className="space-y-2">
          <label className="label-gaming">Video (max 20MB)</label>
          {video ? (
            <div className="flex items-center gap-3 p-3 bg-gaming-dark rounded-lg border border-gaming-border">
              <HiVideoCamera className="text-accent-cyan text-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  {video instanceof File ? video.name : 'Current video'}
                </p>
                {video instanceof File && (
                  <p className="text-xs text-gray-500">{formatSize(video.size)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={removeVideo}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <HiX />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gaming-border rounded-lg text-center
                         hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all duration-300"
            >
              <HiVideoCamera className="text-3xl text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Click to upload video</p>
              <p className="text-xs text-gray-600 mt-1">MP4 or WebM, max 20MB</p>
            </button>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept={VIDEO_TYPES.join(',')}
            onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="label-gaming">
          Images ({images.length}/{maxImages})
        </label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => imageInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300
            ${dragOver
              ? 'border-accent-cyan bg-accent-cyan/5'
              : 'border-gaming-border hover:border-accent-cyan/30 hover:bg-accent-cyan/5'
            }`}
        >
          <HiUpload className={`text-3xl mx-auto mb-2 transition-colors ${dragOver ? 'text-accent-cyan' : 'text-gray-500'}`} />
          <p className="text-sm text-gray-400">
            Drag & drop images or click to browse
          </p>
          <p className="text-xs text-gray-600 mt-1">
            JPEG, PNG, WebP — max {maxImages} images
          </p>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          multiple
          onChange={(e) => handleImageFiles(Array.from(e.target.files || []))}
          className="hidden"
        />

        {/* Image Previews */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
          <AnimatePresence>
            {images.map((file, index) => (
              <motion.div
                key={file instanceof File ? file.name + index : file + index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden border border-gaming-border group animate-fade-in"
              >
                <img
                  src={file instanceof File ? URL.createObjectURL(file) : file}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {onPreviewImageIndexChange && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewImageIndexChange(index);
                    }}
                    className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase transition-all duration-300 z-10
                      ${previewImageIndex === index
                        ? 'bg-accent-cyan text-gaming-dark border border-accent-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                        : 'bg-black/60 text-gray-400 border border-transparent hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
                      }`}
                  >
                    {previewImageIndex === index ? '★ Preview' : 'Set Preview'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute top-1 right-1 p-0.5 bg-red-500/80 rounded-full text-white
                             opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <HiX className="text-xs" />
                </button>
                {file instanceof File && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-gray-300 
                                  px-1 py-0.5 truncate">
                    {formatSize(file.size)}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
