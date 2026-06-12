import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        {/* Glitch 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative mb-8"
        >
          <h1 className="font-gaming font-black text-8xl md:text-9xl text-transparent 
                         bg-clip-text bg-gradient-to-r from-accent-cyan via-cyan-300 to-accent-orange
                         select-none relative z-10">
            404
          </h1>
          {/* Glitch layers */}
          <motion.h1
            animate={{ x: [0, -3, 3, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute inset-0 font-gaming font-black text-8xl md:text-9xl text-accent-cyan/20 
                       select-none z-0"
          >
            404
          </motion.h1>
          <motion.h1
            animate={{ x: [0, 3, -3, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute inset-0 font-gaming font-black text-8xl md:text-9xl text-accent-orange/15 
                       select-none z-0"
          >
            404
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-gaming text-gray-400 mb-3"
        >
          Page Not Found
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8 max-w-md mx-auto"
        >
          The page you're looking for has been moved, deleted, or never existed in this dimension.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
