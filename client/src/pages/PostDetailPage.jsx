import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiExternalLink } from 'react-icons/hi';
import { IoGameController } from 'react-icons/io5';
import api from '../lib/api';
import { CURRENCY } from '../lib/constants';
import MediaGallery from '../components/MediaGallery';
import PlatformBadge from '../components/PlatformBadge';
import WhatsAppButton from '../components/WhatsAppButton';
import { FaWhatsapp } from 'react-icons/fa';
import useSettingsStore from '../store/settingsStore';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { whatsappNumber } = useSettingsStore();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data.post || data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (notFound || !post) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
        <IoGameController className="text-6xl text-gray-700 mb-4" />
        <h2 className="text-2xl font-gaming text-gray-400 mb-2">Post Not Found</h2>
        <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isSale = post.postType === 'Sale';
  const isSold = post.status === 'sold';
  const formattedPrice = post.price
    ? `${CURRENCY} ${Number(post.price).toLocaleString()}`
    : null;

  const messageText = isSale
    ? `Hi SANJI GAMING, is this account still available? "${post.title || 'this account'}"`
    : `Hi SANJI GAMING, I saw your successful recovery of "${post.title}" and I would like to get help recovering my account as well.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 pb-20"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-accent-cyan 
                     transition-colors mb-6 group"
        >
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to listings</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Media */}
          <div className="relative">
            <MediaGallery images={post.images || []} video={post.video} />

            {/* SOLD Watermark overlay */}
            {isSale && isSold && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className="text-status-sold/30 font-gaming font-bold text-6xl md:text-8xl tracking-[0.3em]
                                 transform -rotate-12 select-none border-4 border-status-sold/20 px-8 py-4">
                  SOLD
                </span>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-gaming font-bold text-2xl md:text-3xl text-gray-100 leading-tight"
            >
              {post.title}
            </motion.h1>

            {/* Recovery Header Badge */}
            {!isSale && (
              <div className="flex flex-wrap items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/20 
                             to-green-500/20 border border-emerald-500/30 rounded-lg"
                >
                  <span className="text-emerald-400 font-semibold text-sm">✓ Account Recovery Success</span>
                </motion.div>
                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 bg-[#25D366] hover:bg-[#1ebe57] 
                             text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(37,211,102,0.3)]
                             transition-colors duration-300"
                >
                  <FaWhatsapp className="mr-2 text-lg" />
                  Get Recovery Help
                </motion.a>
              </div>
            )}

            {/* Price & Status (Sale) */}
            {isSale && (
              <div className="flex flex-wrap items-center gap-3">
                {formattedPrice && Number(post.price) > 0 ? (
                  <span className="text-accent-orange font-bold text-3xl">
                    {formattedPrice}
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan text-sm font-semibold rounded-lg">
                    Contact for Price
                  </span>
                )}
                {isSold ? (
                  <span className="px-4 py-1.5 bg-status-sold/10 border border-status-sold/30 
                                   text-status-sold font-bold text-sm rounded-lg">
                    SOLD
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-status-available/10 border border-status-available/30 
                                   text-status-available font-bold text-sm rounded-lg
                                   shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                    Available
                  </span>
                )}
                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 bg-[#25D366] hover:bg-[#1ebe57] 
                             text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(37,211,102,0.3)]
                             transition-colors duration-300"
                >
                  <FaWhatsapp className="mr-2 text-lg" />
                  Inquire on WhatsApp
                </motion.a>
              </div>
            )}

            {/* Client name (Recovery) */}
            {!isSale && post.clientName && (
              <div className="glass-panel p-4">
                <p className="text-sm text-gray-500 mb-1">Recovered for:</p>
                {post.clientFacebookUrl ? (
                  <a
                    href={post.clientFacebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent-cyan hover:text-cyan-300 
                                text-lg font-semibold underline underline-offset-2 transition-colors"
                  >
                    {post.clientName}
                    <HiExternalLink className="text-sm" />
                  </a>
                ) : (
                  <span className="text-accent-cyan text-lg font-semibold">{post.clientName}</span>
                )}
              </div>
            )}

            {/* Description */}
            {post.description && (
              <div className="glass-panel p-5">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {post.description}
                </p>
              </div>
            )}

            {/* Platform badges (Sale) */}
            {isSale && post.accountPlatforms?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Linked Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.accountPlatforms.map((platform) => (
                    <PlatformBadge key={platform} platform={platform} />
                  ))}
                </div>
              </div>
            )}

            {/* Account Access (Sale) */}
            {isSale && post.accessType && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Account Access
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1.5 bg-gaming-card border border-gaming-border rounded-lg 
                               text-sm text-gray-300"
                  >
                    {post.accessType}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <WhatsAppButton postTitle={post.title} postType={post.postType} />
    </motion.div>
  );
}
