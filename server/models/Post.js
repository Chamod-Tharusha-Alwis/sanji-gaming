import mongoose from 'mongoose';

/**
 * Polymorphic Post schema — handles both 'Sale' and 'Recovery' post types.
 * Sale posts represent game accounts for sale.
 * Recovery posts represent account recovery success stories.
 */
const postSchema = new mongoose.Schema(
  {
    // --- Shared fields ---
    postType: {
      type: String,
      enum: ['Sale', 'Recovery'],
      required: [true, 'Post type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },

    // Media (shared)
    images: [String], // Cloudinary URLs
    video: String, // Single Cloudinary URL
    previewImage: String, // URL of the selected preview image

    // --- Sale-specific fields ---
    price: {
      type: Number, // in LKR
    },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
    accountPlatforms: [
      {
        type: String,
        enum: ['Activision', 'Google', 'Apple', 'Facebook', 'LINE'],
      },
    ],
    accessType: {
      type: String,
    },

    // --- Recovery-specific fields ---
    clientName: String,
    clientFacebookUrl: String,
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

// --- Indexes for common query patterns ---
postSchema.index({ postType: 1, status: 1 });
postSchema.index({ title: 'text' }); // text index for search

// --- Virtuals ---

/**
 * Returns a human-readable formatted price string in LKR.
 * Example: "Rs. 2,500.00"
 */
postSchema.virtual('formattedPrice').get(function () {
  if (this.price == null) return null;
  return `Rs. ${this.price.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

// Ensure virtuals are included when converting to JSON/Object
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
