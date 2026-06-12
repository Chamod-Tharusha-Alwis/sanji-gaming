import { IoGameController } from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />

      <div className="bg-gaming-deeper/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <IoGameController className="text-accent-cyan text-xl" />
            <span className="font-gaming font-bold text-sm tracking-wider text-gradient-cyan">
              SANJI GAMING
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            COD Mobile Account Marketplace
          </p>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} SANJI GAMING. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
