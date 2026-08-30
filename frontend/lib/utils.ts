import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Currency, SalaryDiffCalculation } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  NGN: '₦',
  SGD: 'SG$',
  JPY: '¥',
  CHF: 'CHF ',
};

export const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08, // 1 EUR = 1.08 USD
  GBP: 1.28, // 1 GBP = 1.28 USD
  CAD: 0.74,
  AUD: 0.65,
  NGN: 0.00065,
  SGD: 0.75,
  JPY: 0.0067,
  CHF: 1.13,
};

/**
 * Returns exchange rate between two currencies (relative to standard baseline)
 */
export function getExchangeRate(from: string, to: string): number {
  const fromRateInUSD = EXCHANGE_RATES_TO_USD[from.toUpperCase()] ?? 1.0;
  const toRateInUSD = EXCHANGE_RATES_TO_USD[to.toUpperCase()] ?? 1.0;
  return fromRateInUSD / toRateInUSD;
}

/**
 * Converts an amount from one currency to another
 */
export function convertCurrency(amount: number, from: string, to: string): number {
  if (from.toUpperCase() === to.toUpperCase()) return amount;
  const rate = getExchangeRate(from, to);
  return Math.round(amount * rate);
}

/**
 * Format a number as currency string with symbol (e.g. $125,000 or £75,000)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number; compact?: boolean } = {}
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0, compact = false } = options;
  const upperCurrency = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[upperCurrency] ?? `${upperCurrency} `;

  if (compact && Math.abs(amount) >= 1000) {
    return `${symbol}${formatCompactNumber(amount)}`;
  }

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return `${symbol}${formattedNum}`;
}

/**
 * Formats a number with compact notation (e.g., 1.2M, 350K)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formats a standard number with comma separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Calculates the difference and percentage change between previous and proposed salaries
 */
export function calculateSalaryDiff(previousSalary: number, proposedSalary: number): SalaryDiffCalculation {
  const diffAmount = proposedSalary - previousSalary;
  const diffPercentage = previousSalary > 0 ? (diffAmount / previousSalary) * 100 : 0;

  return {
    previousSalary,
    proposedSalary,
    diffAmount,
    diffPercentage: Number(diffPercentage.toFixed(2)),
    isIncrease: diffAmount > 0,
    isDecrease: diffAmount < 0,
    isUnchanged: diffAmount === 0,
  };
}

/**
 * Formats a percentage diff with explicit +/- sign (e.g. +12.5% or -5.0%)
 */
export function formatDiffPercentage(percentage: number): string {
  const prefix = percentage > 0 ? '+' : '';
  return `${prefix}${percentage.toFixed(1)}%`;
}
