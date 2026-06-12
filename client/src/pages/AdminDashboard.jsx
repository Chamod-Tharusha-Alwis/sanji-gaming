import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus, HiPencil, HiTrash, HiSwitchHorizontal,
  HiShoppingCart, HiShieldCheck, HiCollection, HiCurrencyDollar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';

const tabOptions = [
  { key: 'all', label: 'All' },
  { key: 'Sale', label: 'Sale' },
  { key: 'Recovery', label: 'Recovery' },
];

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts');
      setPosts(data.posts || data || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleToggleSold = async (post) => {
    try {
      const { data } = await api.patch(`/posts/${post._id}/status`);
      const updatedPost = data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, status: updatedPost.status } : p))
      );
      toast.success(`Marked as ${updatedPost.status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredPosts = activeTab === 'all'
    ? posts
    : posts.filter((p) => p.postType === activeTab);

  // Stats
  const totalPosts = posts.length;
  const salePosts = posts.filter((p) => p.postType === 'Sale').length;
  const soldPosts = posts.filter((p) => p.status === 'sold').length;
  const recoveryPosts = posts.filter((p) => p.postType === 'Recovery').length;

  const stats = [
    { label: 'Total Posts', value: totalPosts, icon: HiCollection, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'For Sale', value: salePosts, icon: HiShoppingCart, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
    { label: 'Sold', value: soldPosts, icon: HiCurrencyDollar, color: 'text-status-sold', bg: 'bg-status-sold/10' },
    { label: 'Recoveries', value: recoveryPosts, icon: HiShieldCheck, color: 'text-status-available', bg: 'bg-status-available/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 pb-20"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-gaming font-bold text-2xl text-gradient-cyan tracking-wider">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your listings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/admin/posts/new')}
            className="btn-primary flex items-center gap-2 animate-glow-pulse"
          >
            <HiPlus className="text-lg" />
            Create New Post
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`text-xl ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-6">
          {tabOptions.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                ${activeTab === tab.key
                  ? 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
                  : 'bg-gaming-deeper border border-gaming-border text-gray-400 hover:border-gray-500'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel p-4 space-y-3">
                <div className="aspect-video skeleton-shimmer rounded-lg" />
                <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                <div className="h-4 w-1/2 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <HiCollection className="text-5xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post._id}
                  layout
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden">
                    {post.previewImage || post.images?.[0] ? (
                      <img
                        src={post.previewImage || post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gaming-card to-gaming-dark 
                                      flex items-center justify-center">
                        <span className="text-gray-700 font-gaming text-2xl">SG</span>
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold
                        ${post.postType === 'Sale'
                          ? 'bg-accent-orange/90 text-white'
                          : 'bg-emerald-600/90 text-white'
                        }`}
                      >
                        {post.postType}
                      </span>
                    </div>

                    {/* Status badge (Sale only) */}
                    {post.postType === 'Sale' && (
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold
                          ${post.status === 'sold'
                            ? 'bg-status-sold/90 text-white'
                            : 'bg-status-available/90 text-white'
                          }`}
                        >
                          {post.status === 'sold' ? 'SOLD' : 'Available'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-200 text-sm line-clamp-1 mb-3">
                      {post.title}
                    </h3>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/posts/${post._id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                                   bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 
                                   text-xs font-medium hover:bg-blue-500/20 transition-all"
                      >
                        <HiPencil />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                                   bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 
                                   text-xs font-medium hover:bg-red-500/20 transition-all"
                      >
                        <HiTrash />
                        Delete
                      </button>
                      {post.postType === 'Sale' && (
                        <button
                          onClick={() => handleToggleSold(post)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                                     bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 
                                     text-xs font-medium hover:bg-amber-500/20 transition-all"
                        >
                          <HiSwitchHorizontal />
                          {post.status === 'sold' ? 'Unsold' : 'Sold'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget._id)}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </motion.div>
  );
}
