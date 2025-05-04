import React from 'react';
import { 
  Home, 
  Grid2X2, 
  Bookmark,
  ArrowDownToLine,
  Share2,
  X,
  // Add other icons you need here
} from 'lucide-react-native';
import { SvgProps } from 'react-native-svg';

// Map of icon names to components
const icons = {
  home: Home,
  grid: Grid2X2,
  bookmark: Bookmark,
  download: ArrowDownToLine,
  share: Share2,
  remove: X,
  // Add other icons you need here
};

type IconName = keyof typeof icons;

interface LucideIconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const LucideIcon = ({ 
  name, 
  size = 24, 
  color = 'currentColor',
  ...rest 
}: LucideIconProps) => {
  const IconComponent = icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icons map`);
    return null;
  }

  return <IconComponent size={size} color={color} {...rest} />;
};
