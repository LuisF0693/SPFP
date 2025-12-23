
import React from 'react';
import { 
  Home, Car, HeartPulse, GraduationCap, ShoppingCart, Utensils, 
  ShoppingBag, Palmtree, Gamepad2, Gift, Wrench, Zap, Wifi, 
  Smartphone, PiggyBank, TrendingUp, Shield, DollarSign, Briefcase, 
  Coffee, Music, Film, Book, Circle, Plane
} from 'lucide-react';

// Mapeamento de String -> Componente Lucide
export const iconMap: Record<string, React.ElementType> = {
  'home': Home,
  'car': Car,
  'health': HeartPulse,
  'education': GraduationCap,
  'market': ShoppingCart,
  'food': Utensils,
  'shopping': ShoppingBag,
  'leisure': Palmtree,
  'game': Gamepad2,
  'gift': Gift,
  'tools': Wrench,
  'energy': Zap,
  'internet': Wifi,
  'phone': Smartphone,
  'savings': PiggyBank,
  'invest': TrendingUp,
  'insurance': Shield,
  'money': DollarSign,
  'work': Briefcase,
  'coffee': Coffee,
  'music': Music,
  'movie': Film,
  'book': Book,
  'travel': Plane,
  'default': Circle
};

interface CategoryIconProps {
  iconName?: string;
  size?: number;
  color?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, size = 20, color, className }) => {
  const IconComponent = (iconName && iconMap[iconName]) ? iconMap[iconName] : iconMap['default'];
  
  return <IconComponent size={size} color={color} className={className} />;
};

export const AVAILABLE_ICONS = Object.keys(iconMap).filter(k => k !== 'default');
