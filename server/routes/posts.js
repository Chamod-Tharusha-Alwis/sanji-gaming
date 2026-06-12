import { Router } from 'express';
import { param, body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';
import upload, {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from '../middleware/upload.js';

const router = Router();

// =========================================================================
// Helper: safely parse JSON strings that arrive via form-data
// =========================================================================
const safeJsonParse = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value; // already parsed
  try {
    return JSON.parse(value);
  } catch {
    return value; // return as-is if not valid JSON
  }
};

// =========================================================================
// PUBLIC ROUTES
// =========================================================================

/**
 * GET /api/posts
 * List posts with optional filters:
 *   ?type=Sale|Recovery
 *   &status=available|sold
 *   &platform=activision,google,...
 *   &sort=newest|oldest|price-asc|price-desc
 *   &search=keyword
 */
router.get('/', async (req, res) => {
  try {
    const { type, status, platform, sort, search } = req.query;

    // Build filter object
    const filter = {};

    if (type) filter.postType = type;
    if (status) filter.status = status;
    if (platform) {
      // Support comma-separated platforms
      const platforms = platform.split(',').map((p) => p.trim());
      filter.accountPlatforms = { $in: platforms };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // default: newest first
    switch (sort) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'price-asc':
        sortObj = { price: 1 };
        break;
      case 'price-desc':
        sortObj = { price: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
    }

    const posts = await Post.find(filter).sort(sortObj);

    return res.json({ count: posts.length, posts });
  } catch (error) {
    console.error('GET /posts error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch posts.' });
  }
});

/**
 * GET /api/posts/:id
 * Get a single post by its MongoDB ObjectId.
 */
router.get(
  '/:id',
  [param('id').custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid post ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }
      return res.json(post);
    } catch (error) {
      console.error('GET /posts/:id error:', error.message);
      return res.status(500).json({ message: 'Failed to fetch post.' });
    }
  }
);

// =========================================================================
// PROTECTED ROUTES (admin only)
// =========================================================================

/**
 * POST /api/posts
 * Create a new post with optional media uploads.
 * Expects multipart/form-data.
 */
router.post('/', auth, upload, async (req, res) => {
  try {
    const {
      postType,
      title,
      description,
      price,
      status: postStatus,
      accountPlatforms,
      accessType,
      clientName,
      clientFacebookUrl,
      previewImageIndex,
    } = req.body;

    // Basic validation
    if (!postType || !title || !description) {
      return res.status(400).json({
        message: 'postType, title, and description are required.',
      });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.buffer, 'sanji-gaming', 'image');
        imageUrls.push(url);
      }
    }

    // Upload video to Cloudinary
    let videoUrl = null;
    if (req.files?.video?.[0]) {
      videoUrl = await uploadToCloudinary(req.files.video[0].buffer, 'sanji-gaming', 'video');
    }

    // Determine preview image
    const pIndex = Number(previewImageIndex);
    const selectedPreviewImage = imageUrls[isNaN(pIndex) ? 0 : pIndex] || imageUrls[0] || null;

    // Build the post document
    const postData = {
      postType,
      title,
      description,
      images: imageUrls,
      video: videoUrl,
      previewImage: selectedPreviewImage,
    };

    // Sale-specific fields
    if (postType === 'Sale') {
      if (price === '' || price == null) {
        postData.price = undefined;
      } else {
        postData.price = Number(price);
      }
      if (postStatus) postData.status = postStatus;
      postData.accountPlatforms = safeJsonParse(accountPlatforms) || [];
      postData.accessType = accessType;
    }

    // Recovery-specific fields
    if (postType === 'Recovery') {
      if (clientName) postData.clientName = clientName;
      if (clientFacebookUrl) postData.clientFacebookUrl = clientFacebookUrl;
    }

    const post = await Post.create(postData);

    return res.status(201).json({ message: 'Post created successfully.', post });
  } catch (error) {
    console.error('💥 POST /posts error details:', error);
    return res.status(500).json({ message: 'Failed to create post.', error: error.message });
  }
});

/**
 * PUT /api/posts/:id
 * Update a post. Handles media replacement:
 * - If new images are uploaded, old ones not in `keepExistingImages` are deleted from Cloudinary.
 * - If a new video is uploaded, the old video is deleted from Cloudinary.
 * - `keepExistingImages` is a JSON array of Cloudinary URLs to preserve.
 */
router.put(
  '/:id',
  auth,
  upload,
  [param('id').custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid post ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      const {
        postType,
        title,
        description,
        price,
        status: postStatus,
        accountPlatforms,
        accessType,
        clientName,
        clientFacebookUrl,
        keepExistingImages,
        previewImageIndex,
      } = req.body;

      // --- Handle image replacement ---
      const imagesToKeep = safeJsonParse(keepExistingImages) || [];
      let finalImages = [...imagesToKeep];

      // Delete old images that are NOT in the keep list
      if (req.files?.images?.length > 0 || keepExistingImages !== undefined) {
        const oldImages = post.images || [];
        for (const oldUrl of oldImages) {
          if (!imagesToKeep.includes(oldUrl)) {
            const publicId = extractPublicId(oldUrl);
            if (publicId) {
              await deleteFromCloudinary(publicId, 'image').catch(() => {});
            }
          }
        }
      }

      // Upload new images
      if (req.files?.images) {
        for (const file of req.files.images) {
          const url = await uploadToCloudinary(file.buffer, 'sanji-gaming', 'image');
          finalImages.push(url);
        }
      }

      // If no new images and no keepExistingImages specified, preserve current images
      if (!req.files?.images?.length && !keepExistingImages) {
        finalImages = post.images || [];
      }

      // --- Handle video replacement ---
      let finalVideo = post.video;
      if (req.files?.video?.[0]) {
        // Delete old video if it exists
        if (post.video) {
          const publicId = extractPublicId(post.video);
          if (publicId) {
            await deleteFromCloudinary(publicId, 'video').catch(() => {});
          }
        }
        finalVideo = await uploadToCloudinary(req.files.video[0].buffer, 'sanji-gaming', 'video');
      } else if (!req.body.existingVideo && post.video) {
        // If no new video was uploaded, and existingVideo is not specified (meaning it was removed), delete it
        const publicId = extractPublicId(post.video);
        if (publicId) {
          await deleteFromCloudinary(publicId, 'video').catch(() => {});
        }
        finalVideo = null;
      }

      // Determine preview image
      const pIndex = Number(previewImageIndex);
      const selectedPreviewImage = finalImages[isNaN(pIndex) ? 0 : pIndex] || finalImages[0] || null;

      // --- Update fields ---
      if (postType) post.postType = postType;
      if (title) post.title = title;
      if (description) post.description = description;
      post.images = finalImages;
      post.video = finalVideo;
      post.previewImage = selectedPreviewImage;

      // Type-specific field updates and cleanup
      if (post.postType === 'Sale') {
        if (price !== undefined) {
          post.price = (price === '' || price == null) ? undefined : Number(price);
        }
        if (postStatus) post.status = postStatus;
        if (accountPlatforms !== undefined) {
          post.accountPlatforms = safeJsonParse(accountPlatforms) || [];
        }
        if (accessType !== undefined) {
          post.accessType = accessType;
        }
        
        // Clear recovery fields
        post.clientName = undefined;
        post.clientFacebookUrl = undefined;
      } else if (post.postType === 'Recovery') {
        if (clientName !== undefined) post.clientName = clientName;
        if (clientFacebookUrl !== undefined) post.clientFacebookUrl = clientFacebookUrl;
        
        // Clear sale fields
        post.price = undefined;
        post.status = undefined;
        post.accountPlatforms = [];
        post.accessType = undefined;
      }
      
      await post.save();

      return res.json({ message: 'Post updated successfully.', post });
    } catch (error) {
      console.error('💥 PUT /posts/:id error details:', error);
      return res.status(500).json({ message: 'Failed to update post.', error: error.message });
    }
  }
);

/**
 * DELETE /api/posts/:id
 * Delete a post and all its associated Cloudinary assets.
 */
router.delete(
  '/:id',
  auth,
  [param('id').custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid post ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      // Delete all images from Cloudinary
      if (post.images?.length > 0) {
        for (const url of post.images) {
          const publicId = extractPublicId(url);
          if (publicId) {
            await deleteFromCloudinary(publicId, 'image').catch(() => {});
          }
        }
      }

      // Delete video from Cloudinary
      if (post.video) {
        const publicId = extractPublicId(post.video);
        if (publicId) {
          await deleteFromCloudinary(publicId, 'video').catch(() => {});
        }
      }

      await Post.findByIdAndDelete(req.params.id);

      return res.json({ message: 'Post deleted successfully.' });
    } catch (error) {
      console.error('DELETE /posts/:id error:', error.message);
      return res.status(500).json({ message: 'Failed to delete post.' });
    }
  }
);

/**
 * PATCH /api/posts/:id/status
 * Toggle status between 'available' and 'sold'.
 * Only applicable to Sale posts.
 */
router.patch(
  '/:id/status',
  auth,
  [param('id').custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid post ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      if (post.postType !== 'Sale') {
        return res.status(400).json({ message: 'Status toggle is only available for Sale posts.' });
      }

      // Toggle the status
      post.status = post.status === 'available' ? 'sold' : 'available';
      await post.save();

      return res.json({
        message: `Post status changed to "${post.status}".`,
        post,
      });
    } catch (error) {
      console.error('PATCH /posts/:id/status error:', error.message);
      return res.status(500).json({ message: 'Failed to toggle post status.' });
    }
  }
);

export default router;
