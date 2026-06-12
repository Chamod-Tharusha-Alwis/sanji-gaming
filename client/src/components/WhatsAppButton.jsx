import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import useSettingsStore from '../store/settingsStore';

export default function WhatsAppButton({ postTitle, postType }) {
  const { whatsappNumber } = useSettingsStore();
  const isSale = postType === 'Sale';
  const messageText = isSale
    ? `Hi SANJI GAMING, is this account still available? "${postTitle || 'this account'}"`
    : `Hi SANJI GAMING, I saw your successful recovery of "${postTitle}" and I would like to get help recovering my account as well.`;
  const message = encodeURIComponent(messageText);

  const url = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-whatsapp/30 animate-ping" />

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-whatsapp 
                      shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)]
                      transition-shadow duration-300">
        <FaWhatsapp className="text-white text-2xl" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gaming-card rounded-lg text-xs 
                      text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                      duration-300 pointer-events-none border border-gaming-border">
        Chat on WhatsApp
        <div className="absolute top-full right-5 w-2 h-2 bg-gaming-card border-r border-b 
                        border-gaming-border transform rotate-45 -translate-y-1" />
      </div>
    </motion.a>
  );
}
