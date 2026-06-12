import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary SDK with environment variables.
 * Must be called before any upload/delete operations.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
