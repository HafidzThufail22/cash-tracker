import React from 'react';
import {
  ShoppingBag,
  Utensils,
  Coffee,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  Film,
  Gift,
  Briefcase,
  TrendingUp,
  Tag,
  Zap,
  Wifi,
  Plane,
  Smartphone,
  Dumbbell,
  BookOpen,
  Music,
  Wallet,
  LucideIcon,
} from 'lucide-react-native';

export interface CategoryIconOption {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const AVAILABLE_CATEGORY_ICONS: CategoryIconOption[] = [
  { id: 'tag', label: 'Umum', Icon: Tag },
  { id: 'shopping-bag', label: 'Belanja', Icon: ShoppingBag },
  { id: 'utensils', label: 'Makanan', Icon: Utensils },
  { id: 'coffee', label: 'Kafe / Kopi', Icon: Coffee },
  { id: 'car', label: 'Transportasi', Icon: Car },
  { id: 'home', label: 'Tempat Tinggal', Icon: Home },
  { id: 'zap', label: 'Tagihan / Listrik', Icon: Zap },
  { id: 'wifi', label: 'Internet', Icon: Wifi },
  { id: 'smartphone', label: 'Pulsa / Gadget', Icon: Smartphone },
  { id: 'heart-pulse', label: 'Kesehatan', Icon: HeartPulse },
  { id: 'graduation-cap', label: 'Pendidikan', Icon: GraduationCap },
  { id: 'film', label: 'Hiburan', Icon: Film },
  { id: 'gift', label: 'Hadiah / Amal', Icon: Gift },
  { id: 'plane', label: 'Liburan', Icon: Plane },
  { id: 'dumbbell', label: 'Olahraga', Icon: Dumbbell },
  { id: 'book-open', label: 'Buku', Icon: BookOpen },
  { id: 'music', label: 'Langganan', Icon: Music },
  { id: 'briefcase', label: 'Pekerjaan / Gaji', Icon: Briefcase },
  { id: 'trending-up', label: 'Investasi', Icon: TrendingUp },
  { id: 'wallet', label: 'Kantong Kas', Icon: Wallet },
];

export const AVAILABLE_CATEGORY_COLORS: string[] = [
  '#EAB308', // Gold Primary
  '#10B981', // Emerald
  '#EF4444', // Crimson
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

export function getCategoryIconComponent(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Tag;
  const match = AVAILABLE_CATEGORY_ICONS.find((item) => item.id === iconName);
  return match ? match.Icon : Tag;
}
