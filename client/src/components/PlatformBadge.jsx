import { FaGoogle, FaApple, FaFacebook, FaGamepad } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import { PLATFORM_MAP } from '../lib/constants';

const ICONS = {
  Activision: FaGamepad,
  Google: FaGoogle,
  Apple: FaApple,
  Facebook: FaFacebook,
  LINE: SiLine,
};

export default function PlatformBadge({ platform }) {
  const config = PLATFORM_MAP[platform] || {
    label: platform,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
  };

  const Icon = ICONS[platform] || FaGamepad;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
        ${config.color} ${config.bg} ${config.border}`}
    >
      <Icon className="text-[10px]" />
      {config.label}
    </span>
  );
}
