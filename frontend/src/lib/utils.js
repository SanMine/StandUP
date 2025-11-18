import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getMatchColor(score) {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-gray-600';
}

export function getMatchBgColor(score) {
  if (score >= 85) return 'bg-green-100';
  if (score >= 70) return 'bg-blue-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-gray-100';
}

// Profile Strength color utilities
export function getProfileStrengthColor(score) {
  if (score >= 80) return 'bg-green-600';
  if (score >= 41) return 'bg-yellow-500';
  return 'bg-red-600';
}

export function getProfileStrengthBgColor(score) {
  if (score >= 80) return 'bg-green-100';
  if (score >= 41) return 'bg-yellow-100';
  return 'bg-red-100';
}

export function getProfileStrengthTextColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 41) return 'text-yellow-600';
  return 'text-red-600';
}
