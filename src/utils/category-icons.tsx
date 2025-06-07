import { FaCar, FaHome } from 'react-icons/fa';
import { IoPhonePortrait } from 'react-icons/io5';
import { MdDevices, MdKitchen, MdMoreHoriz, MdTv } from 'react-icons/md';
import { ReactNode } from 'react';

export function getCategoryIcon(icon?: string): ReactNode {
  if (!icon) return null;
  
  console.log('Getting icon for:', icon);
  
  switch (icon.toLowerCase()) {
    case 'car':
      return <FaCar className="w-5 h-5" />;
    case 'phone':
      return <IoPhonePortrait className="w-5 h-5" />;
    case 'kitchen':
      return <MdKitchen className="w-5 h-5" />;
    case 'tv':
      return <MdTv className="w-5 h-5" />;
    case 'devices':
      return <MdDevices className="w-5 h-5" />;
    case 'home':
      return <FaHome className="w-5 h-5" />;
    case 'more_horiz':
      return <MdMoreHoriz className="w-5 h-5" />;
    default:
      console.log('No icon found for:', icon);
      return null;
  }
}
