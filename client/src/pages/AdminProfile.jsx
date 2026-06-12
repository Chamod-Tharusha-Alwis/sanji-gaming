import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiMail, HiLockClosed, HiPhone } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useSettingsStore from '../store/settingsStore';

export default function AdminProfile() {
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/admin/profile');
      setEmail(data.email || '');
      setWhatsappNumber(data.whatsappNumber || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load profile details.');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!/^\d+$/.test(whatsappNumber.trim())) {
      newErrors.whatsappNumber = 'WhatsApp number must contain digits only (e.g. 94700000000)';
    }

    if (password) {
      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const updateData = {
        email: email.trim(),
        whatsappNumber: whatsappNumber.trim(),
      };
      if (password) {
        updateData.password = password;
      }

      await api.put('/admin/profile', updateData);
      toast.success('Settings updated successfully!');
      
      // Update global settings cache
      fetchSettings();

      // Clear password fields
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
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
      <div className="max-w-xl mx-auto px-4">
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
              Profile & Settings
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Update admin login details and contact preferences
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel p-6 space-y-5">
            <h2 className="font-gaming text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Contact Preferences
            </h2>

            <div>
              <label className="label-gaming">WhatsApp Contact Number *</label>
              <div className="relative">
                <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 94700000000 (Sri Lanka country code, digits only)"
                  className={`input-gaming pl-10 ${
                    errors.whatsappNumber ? 'border-red-500/50' : ''
                  }`}
                />
              </div>
              {errors.whatsappNumber ? (
                <p className="text-red-400 text-xs mt-1">{errors.whatsappNumber}</p>
              ) : (
                <p className="text-gray-500 text-[11px] mt-1">
                  Provide the number including the country code (without + or leading zeros),
                  e.g., 94700000000.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 space-y-5">
            <h2 className="font-gaming text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Login Credentials
            </h2>

            <div>
              <label className="label-gaming">Admin Email *</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={`input-gaming pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label-gaming">New Password (leave blank to keep current)</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`input-gaming pl-10 ${errors.password ? 'border-red-500/50' : ''}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {password && (
              <div>
                <label className="label-gaming">Confirm New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype new password"
                    className={`input-gaming pl-10 ${
                      errors.confirmPassword ? 'border-red-500/50' : ''
                    }`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}
          </div>

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
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
