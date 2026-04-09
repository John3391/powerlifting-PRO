import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Maxes } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateWeight(liftType: string, percent: string | number, maxes: Maxes) {
  if (!percent || !liftType || liftType === 'accessory') return null;
  let p = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(p)) return null;
  if (p > 1.5) p = p / 100;
  return Math.round(maxes[liftType as keyof Maxes] * p);
}

export function parseSets(setsReps: string | number) {
  if (!setsReps) return 1;
  const parts = setsReps.toString().split('x');
  return parts.length === 2 ? parseInt(parts[0]) || 1 : 1;
}

export function escapeHtml(str: string) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}
