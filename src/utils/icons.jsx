import React from 'react';
import {
  ShoppingBag, Car, Coffee, Gamepad2, GraduationCap, Shirt,
  User, Music, Activity, Dog, Zap, Gift, Wine, Monitor,
  Baby, HeartPulse, Film, ShoppingCart, Bike, Utensils,
  Home, Plane, Briefcase, HelpCircle, Package, Receipt, Target,
  Smartphone, Wifi, Phone, CreditCard, Landmark, Wallet, Tag,
  Fuel, BookOpen, Dumbbell, Sparkles
} from 'lucide-react';

export const ICONS = {
  ShoppingBag, Car, Coffee, Gamepad2, GraduationCap, Shirt,
  User, Music, Activity, Dog, Zap, Gift, Wine, Monitor,
  Baby, HeartPulse, Film, ShoppingCart, Bike, Utensils,
  Home, Plane, Briefcase, HelpCircle, Package, Receipt, Target,
  Smartphone, Wifi, Phone, CreditCard, Landmark, Wallet, Tag,
  Fuel, BookOpen, Dumbbell, Sparkles
};

export const ICON_NAMES = Object.keys(ICONS);

export function getIconComponent(iconName) {
  return ICONS[iconName] || HelpCircle;
}

export function RenderIcon({ name, ...props }) {
  const Icon = getIconComponent(name);
  return <Icon {...props} />;
}
