import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlatformBadge from './PlatformBadge';
import { CURRENCY } from '../lib/constants';

export default function PostCard({ post }) {
  const isSale = post.postType === 'Sale';
  const isSold = post.status === 'sold';
  const thumbnail = post.previewImage || post.images?.[0] || null;
  const hasVideo = !!post.video;

  const formattedPrice = post.price
    ? `${CURRENCY} ${Number(post.price).toLocaleString()}`
    : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/post/${post._id}`}
        className="block glass-panel gradient-border overflow-hidden group
                   hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-shadow duration-500"
      >
        {/* Image Section */}
        <div className="relative aspect-video overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gaming-card via-gaming-deeper to-gaming-dark 
                            flex items-center justify-center">
              <span className="text-gray-600 text-4xl font-gaming">SG</span>
            </div>
          )}

          {/* Video indicator */}
          {hasVideo && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md 
                            text-xs text-white flex items-center gap-1">
              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent" />
              Video
            </div>
          )}

          {/* Status badge */}
          {isSale && (
            <div className="absolute top-3 right-3">
              {isSold ? (
                <span className="px-3 py-1 bg-status-sold/90 backdrop-blur-sm text-white text-xs 
                                 font-bold rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  SOLD
                </span>
              ) : (
                <span className="px-3 py-1 bg-status-available/90 backdrop-blur-sm text-white text-xs 
                                 font-bold rounded-md shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  Available
                </span>
              )}
            </div>
          )}

          {/* Recovery badge */}
          {!isSale && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-500 backdrop-blur-sm 
                               text-white text-xs font-bold rounded-md shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                Recovery ✓
              </span>
            </div>
          )}

          {/* SOLD Overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-status-sold font-gaming font-bold text-2xl tracking-widest 
                               transform -rotate-12 opacity-60 border-2 border-status-sold px-4 py-1">
                SOLD
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gaming-deeper to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-gaming text-sm font-semibold text-gray-100 line-clamp-2 mb-3 
                         group-hover:text-accent-cyan transition-colors duration-300">
            {post.title}
          </h3>

          {/* Price for Sale posts */}
          {isSale && (
            <div className="mb-3">
              {formattedPrice && Number(post.price) > 0 ? (
                <p className="text-accent-orange font-bold text-lg">
                  {formattedPrice}
                </p>
              ) : (
                <span className="inline-block px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold rounded-md">
                  Contact for Price
                </span>
              )}
            </div>
          )}

          {/* Client name for Recovery posts */}
          {!isSale && post.clientName && (
            <p className="text-sm text-gray-400 mb-3">
              <span className="text-gray-500">Recovered for:</span>{' '}
              <span className="text-accent-cyan">{post.clientName}</span>
            </p>
          )}

          {/* Platform badges */}
          {isSale && post.accountPlatforms?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.accountPlatforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
