import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { IoGameController } from 'react-icons/io5';
import useAuthStore from '../store/authStore';

const navLinks = [
  { to: '/', label: 'Home' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/profile', label: 'Settings' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthStore();

  const allLinks = [...navLinks, ...(isAuthenticated ? adminLinks : [])];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gaming-dark/70 backdrop-blur-xl border-b border-gaming-border">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <IoGameController className="text-accent-cyan text-2xl drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          </motion.div>
          <span className="font-gaming font-bold text-lg tracking-wider text-gradient-cyan">
            SANJI GAMING
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {allLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                ${isActive(link.to)
                  ? 'text-accent-cyan'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              {link.label}
              {isActive(link.to) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-cyan rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 
                         hover:bg-red-400/10 rounded-lg transition-all duration-300"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-accent-cyan transition-colors"
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HiX className="text-2xl" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HiMenu className="text-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-gaming-deeper/95 backdrop-blur-xl border-b border-gaming-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {allLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                    ${isActive(link.to)
                      ? 'text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-400 
                             hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
