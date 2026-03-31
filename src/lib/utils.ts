import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getMatchType(matchedCount: number): string {
  switch (matchedCount) {
    case 5: return 'Jackpot (5-Number Match)';
    case 4: return '4-Number Match';
    case 3: return '3-Number Match';
    default: return 'No Match';
  }
}
