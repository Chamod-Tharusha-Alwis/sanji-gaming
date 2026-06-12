import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// --- Constants ---
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB
const CLOUDINARY_FOLDER = 'sanji-gaming';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']; // quicktime = .mov

// --- Multer config with memory storage ---
const storage = multer.memoryStorage();

/**
 * File filter — validates MIME types for images and videos.
 * Rejects any file that doesn't match the allowed types.
 */
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type: ${file.mimetype}. Allowed: jpeg, jpg, png, webp`), false);
    }
  } else if (file.fieldname === 'video') {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid video type: ${file.mimetype}. Allowed: mp4, webm, mov`), false);
    }
  } else {
    cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

/**
 * Multer instance configured for multi-field upload:
 * - images: up to 7 files
 * - video: up to 1 file
 */
const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // use the larger limit; we validate per-field below
  },
}).fields([
  { name: 'images', maxCount: 7 },
  { name: 'video', maxCount: 1 },
]);

/**
 * Wraps multer in a promise so we can handle its errors cleanly.
 */
const runMulter = (req, res) => {
  return new Promise((resolve, reject) => {
    multerUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        reject(new Error(`Upload error: ${err.message}`));
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// =========================================================================
// Validation middleware — runs AFTER multer has parsed the files
// Enforces per-field size limits and the conditional image count rule.
// =========================================================================
const validateFiles = (req, res, next) => {
  const images = req.files?.images || [];
  const videos = req.files?.video || [];
  const hasVideo = videos.length > 0;

  // Validate individual image sizes
  for (const img of images) {
    if (img.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        message: `Image "${img.originalname}" exceeds the 5 MB limit.`,
      });
    }
  }

  // Validate individual video size
  for (const vid of videos) {
    if (vid.size > MAX_VIDEO_SIZE) {
      return res.status(400).json({
        message: `Video "${vid.originalname}" exceeds the 20 MB limit.`,
      });
    }
  }

  // Conditional image count: if a video is present, max 3 images; otherwise max 7
  const maxImages = hasVideo ? 3 : 7;
  if (images.length > maxImages) {
    return res.status(400).json({
      message: hasVideo
        ? `When uploading a video, you can include at most 3 images (got ${images.length}).`
        : `You can upload at most 7 images (got ${images.length}).`,
    });
  }

  next();
};

// =========================================================================
// Cloudinary helpers
// =========================================================================

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer — the raw file buffer from multer memoryStorage
 * @param {string} folder — Cloudinary folder path
 * @param {'image'|'video'} resourceType — Cloudinary resource type
 * @returns {Promise<string>} — the secure URL of the uploaded asset
 */
export const uploadToCloudinary = (fileBuffer, folder = CLOUDINARY_FOLDER, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary by its public ID.
 * @param {string} publicId — the Cloudinary public ID (without file extension)
 * @param {'image'|'video'} resourceType — defaults to 'image'
 * @returns {Promise<object>} — Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
    throw error;
  }
};

/**
 * Extracts the Cloudinary public ID from a full secure URL.
 * E.g. "https://res.cloudinary.com/demo/image/upload/v123/sanji-gaming/abc.jpg"
 *       → "sanji-gaming/abc"
 * @param {string} url — Cloudinary secure URL
 * @returns {string} — public ID
 */
export const extractPublicId = (url) => {
  if (!url) return '';
  // Match everything after /upload/v<digits>/ and strip the file extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : '';
};

// =========================================================================
// Combined upload middleware — use this in route definitions
// =========================================================================

/**
 * Express middleware that:
 * 1. Runs multer to parse multipart form-data
 * 2. Validates file types, sizes, and conditional count rules
 */
const upload = async (req, res, next) => {
  try {
    await runMulter(req, res);
    validateFiles(req, res, next);
  } catch (error) {
    console.error('💥 Upload middleware error:', error);
    return res.status(400).json({ message: error.message });
  }
};

export default upload;
