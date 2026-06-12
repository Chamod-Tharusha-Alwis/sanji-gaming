import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiShoppingCart, HiShieldCheck, HiFilter, HiSortDescending } from 'react-icons/hi';
import { IoGameController } from 'react-icons/io5';
import api from '../lib/api';
import PostCard from '../components/PostCard';

const tabs = [
  { key: 'Sale', label: 'Accounts for Sale', icon: HiShoppingCart },
  { key: 'Recovery', label: 'Successful Recoveries', icon: HiShieldCheck },
];

const platformOptions = [
  { value: '', label: 'All Platforms' },
  { value: 'Activision', label: 'Activision' },
  { value: 'Google', label: 'Google' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'LINE', label: 'LINE' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="aspect-video skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton-shimmer rounded" />
        <div className="h-4 w-1/2 skeleton-shimmer rounded" />
        <div className="h-6 w-1/3 skeleton-shimmer rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 skeleton-shimmer rounded-full" />
          <div className="h-6 w-16 skeleton-shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('Sale');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/posts?type=${activeTab}`);
      setPosts(data.posts || data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter & sort
  const filteredPosts = posts
    .filter((post) => {
      if (platformFilter && !post.accountPlatforms?.includes(platformFilter)) return false;
      if (statusFilter && post.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low': return (a.price || 0) - (b.price || 0);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gaming-dark">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,240,255,0.08)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,107,53,0.05)_0%,transparent_50%)]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                <IoGameController className="text-accent-cyan text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
              </motion.div>
            </div>

            <h1 className="font-gaming font-bold text-4xl md:text-6xl lg:text-7xl mb-4 tracking-wider">
              <span className="text-gradient-cyan">SANJI</span>{' '}
              <span className="text-white">GAMING</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8"
            >
              Premium COD Mobile Accounts & Recovery Services
            </motion.p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {/* Tab Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-gaming-deeper rounded-xl border border-gaming-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPlatformFilter(''); setStatusFilter(''); }}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium 
                           transition-all duration-300
                  ${activeTab === tab.key
                    ? 'text-accent-cyan'
                    : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg
                               shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                <span className="relative z-10 sm:hidden">
                  {tab.key === 'Sale' ? 'Sale' : 'Recovery'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar (Sale tab only) */}
        <AnimatePresence>
          {activeTab === 'Sale' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-3 items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <HiFilter />
                  <span>Filter:</span>
                </div>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="input-gaming w-auto text-sm py-2"
                >
                  {platformOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-gaming w-auto text-sm py-2"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <HiSortDescending />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-gaming w-auto text-sm py-2"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <IoGameController className="text-6xl text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-gaming text-gray-500 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {activeTab === 'Sale'
                ? 'No accounts available at the moment. Check back soon!'
                : 'No recovery stories yet. Stay tuned!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {filteredPosts.map((post) => (
              <motion.div
                key={post._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}
