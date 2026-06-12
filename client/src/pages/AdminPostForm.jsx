import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaApple, FaFacebook, FaGamepad } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import { HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { DEFAULT_ACCESS_SUGGESTIONS } from '../lib/constants';
import MediaUploader from '../components/MediaUploader';

const platformChoices = [
  { value: 'Activision', label: 'Activision', icon: FaGamepad },
  { value: 'Google', label: 'Google', icon: FaGoogle },
  { value: 'Apple', label: 'Apple', icon: FaApple },
  { value: 'Facebook', label: 'Facebook', icon: FaFacebook },
  { value: 'LINE', label: 'LINE', icon: SiLine },
];

export default function AdminPostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [postType, setPostType] = useState('Sale');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [accountPlatforms, setAccountPlatforms] = useState([]);
  const [accessType, setAccessType] = useState('Full Access');
  const [clientName, setClientName] = useState('');
  const [clientFacebookUrl, setClientFacebookUrl] = useState('');

  // Media
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [mediaMode, setMediaMode] = useState('images');
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideo, setExistingVideo] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/posts/${id}`);
      const post = data.post || data;
      setPostType(post.postType || 'Sale');
      setTitle(post.title || '');
      setDescription(post.description || '');
      setPrice(post.price?.toString() || '');
      setAccountPlatforms(post.accountPlatforms || []);
      setAccessType(post.accessType || 'Full Access');
      setClientName(post.clientName || '');
      setClientFacebookUrl(post.clientFacebookUrl || '');
      setExistingImages(post.images || []);
      setExistingVideo(post.video || null);
      setMediaMode(post.video ? 'video' : 'images');
      
      if (post.previewImage && post.images) {
        const idx = post.images.indexOf(post.previewImage);
        setPreviewImageIndex(idx !== -1 ? idx : 0);
      } else {
        setPreviewImageIndex(0);
      }
    } catch {
      toast.error('Failed to load post');
      navigate('/admin/dashboard');
    } finally {
      setFetching(false);
    }
  };

  const togglePlatform = (platform) => {
    setAccountPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (postType === 'Sale' && price && Number(price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (postType === 'Recovery' && !clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (postType === 'Recovery' && clientFacebookUrl && !clientFacebookUrl.startsWith('http')) {
      newErrors.clientFacebookUrl = 'Must be a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('postType', postType);
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      if (postType === 'Sale') {
        formData.append('price', price);
        formData.append('accountPlatforms', JSON.stringify(accountPlatforms));
        formData.append('accessType', accessType);
      } else {
        formData.append('clientName', clientName.trim());
        formData.append('clientFacebookUrl', clientFacebookUrl.trim());
      }

      // Existing images to keep (for edit mode)
      if (isEdit && existingImages.length > 0) {
        formData.append('keepExistingImages', JSON.stringify(existingImages));
      }

      // Existing video to keep
      if (isEdit && existingVideo && !(video instanceof File)) {
        formData.append('existingVideo', existingVideo);
      }

      // New image files
      const newImageFiles = images.filter((f) => f instanceof File);
      newImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // New video file
      if (video instanceof File) {
        formData.append('video', video);
      }

      formData.append('mediaMode', mediaMode);
      formData.append('previewImageIndex', previewImageIndex);

      if (isEdit) {
        await api.put(`/posts/${id}`, formData);
        toast.success('Post updated successfully!');
      } else {
        await api.post('/posts', formData);
        toast.success('Post created successfully!');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 pb-20"
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-gray-400 hover:text-accent-cyan transition-colors rounded-lg 
                       hover:bg-accent-cyan/10"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="font-gaming font-bold text-xl text-gradient-cyan tracking-wider">
              {isEdit ? 'Edit Post' : 'Create Post'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isEdit ? 'Update your listing' : 'Add a new listing'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Post Type Selector */}
          <div className="glass-panel p-6">
            <label className="label-gaming mb-3 block">Post Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['Sale', 'Recovery'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPostType(type)}
                  className={`relative p-4 rounded-xl border-2 text-center font-semibold transition-all duration-300
                    ${postType === type
                      ? type === 'Sale'
                        ? 'border-accent-orange bg-accent-orange/10 text-accent-orange'
                        : 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gaming-border bg-gaming-dark text-gray-400 hover:border-gray-500'
                    }`}
                >
                  <span className="text-2xl mb-1 block">
                    {type === 'Sale' ? '🏷️' : '🔒'}
                  </span>
                  {type === 'Sale' ? 'Account Sale' : 'Account Recovery'}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="glass-panel p-6 space-y-5">
            <h2 className="font-gaming text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Basic Info
            </h2>

            <div>
              <label className="label-gaming">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Legendary S1 COD Mobile Account"
                className={`input-gaming ${errors.title ? 'border-red-500/50' : ''}`}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="label-gaming">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the account details, skins, ranks, etc."
                className="input-gaming resize-none"
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="glass-panel p-6">
            <h2 className="font-gaming text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Media
            </h2>
            <MediaUploader
              images={isEdit ? [...existingImages, ...images.filter(f => f instanceof File)] : images}
              video={video instanceof File ? video : existingVideo}
              previewImageIndex={previewImageIndex}
              onPreviewImageIndexChange={setPreviewImageIndex}
              onImagesChange={(newImages) => {
                if (isEdit) {
                  const existing = newImages.filter((img) => typeof img === 'string');
                  const files = newImages.filter((img) => img instanceof File);
                  setExistingImages(existing);
                  setImages(files);
                } else {
                  setImages(newImages);
                }
              }}
              onVideoChange={(newVideo) => {
                if (newVideo instanceof File) {
                  setVideo(newVideo);
                  setExistingVideo(null);
                } else {
                  setVideo(null);
                  setExistingVideo(null);
                }
              }}
              mediaMode={mediaMode}
              onMediaModeChange={(mode) => {
                setMediaMode(mode);
                if (mode === 'images') {
                  setVideo(null);
                  setExistingVideo(null);
                }
              }}
            />
          </div>

          {/* Sale-specific fields */}
          <AnimatePresence mode="wait">
            {postType === 'Sale' && (
              <motion.div
                key="sale-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="glass-panel p-6 space-y-5">
                  <h2 className="font-gaming text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Sale Details
                  </h2>

                  {/* Price */}
                  <div>
                    <label className="label-gaming">Price (LKR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        LKR
                      </span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="15000 (leave empty for Contact for Price)"
                        min="0"
                        className={`input-gaming pl-12 ${errors.price ? 'border-red-500/50' : ''}`}
                      />
                    </div>
                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                  </div>

                  {/* Account Platform */}
                  <div>
                    <label className="label-gaming">Account Platforms</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {platformChoices.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => togglePlatform(p.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm 
                                     font-medium transition-all duration-300
                            ${accountPlatforms.includes(p.value)
                              ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                              : 'border-gaming-border bg-gaming-dark text-gray-400 hover:border-gray-500'
                            }`}
                        >
                          <p.icon className="text-base" />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Access */}
                  <div>
                    <label className="label-gaming mb-2 block">Access Type</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Full Access', 'Half Access'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAccessType(type)}
                          className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-300
                            ${accessType === type
                              ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                              : 'border-gaming-border bg-gaming-dark text-gray-400 hover:border-gray-500'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Or enter custom access type (e.g., Activision Only)..."
                        value={accessType !== 'Full Access' && accessType !== 'Half Access' ? accessType : ''}
                        onChange={(e) => setAccessType(e.target.value)}
                        className="input-gaming"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recovery-specific fields */}
            {postType === 'Recovery' && (
              <motion.div
                key="recovery-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="glass-panel p-6 space-y-5">
                  <h2 className="font-gaming text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Recovery Details
                  </h2>

                  <div>
                    <label className="label-gaming">Client Name *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Client's name"
                      className={`input-gaming ${errors.clientName ? 'border-red-500/50' : ''}`}
                    />
                    {errors.clientName && <p className="text-red-400 text-xs mt-1">{errors.clientName}</p>}
                  </div>

                  <div>
                    <label className="label-gaming">Client Facebook Profile URL</label>
                    <input
                      type="url"
                      value={clientFacebookUrl}
                      onChange={(e) => setClientFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/username"
                      className={`input-gaming ${errors.clientFacebookUrl ? 'border-red-500/50' : ''}`}
                    />
                    {errors.clientFacebookUrl && (
                      <p className="text-red-400 text-xs mt-1">{errors.clientFacebookUrl}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`w-full btn-primary py-4 text-base flex items-center justify-center gap-2
                       ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-gaming-dark/30 border-t-gaming-dark rounded-full"
                />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update Post' : 'Create Post'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
