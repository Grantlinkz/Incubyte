import { describe, it, expect } from 'vitest';
import {
  calculateSalaryDiff,
  formatDiffPercentage,
  convertCurrency,
  getExchangeRate,
  formatCurrency,
  formatCompactNumber,
  getCountryFlag,
  getOfficeCode,
} from '@/lib/utils';

describe('Salary & Currency Calculation Utilities', () => {
  describe('calculateSalaryDiff', () => {
    it('should calculate salary increase correctly', () => {
      const diff = calculateSalaryDiff(100000, 115000);
      expect(diff.previousSalary).toBe(100000);
      expect(diff.proposedSalary).toBe(115000);
      expect(diff.diffAmount).toBe(15000);
      expect(diff.diffPercentage).toBe(15);
      expect(diff.isIncrease).toBe(true);
      expect(diff.isDecrease).toBe(false);
      expect(diff.isUnchanged).toBe(false);
    });

    it('should calculate salary decrease correctly', () => {
      const diff = calculateSalaryDiff(80000, 72000);
      expect(diff.diffAmount).toBe(-8000);
      expect(diff.diffPercentage).toBe(-10);
      expect(diff.isIncrease).toBe(false);
      expect(diff.isDecrease).toBe(true);
      expect(diff.isUnchanged).toBe(false);
    });

    it('should identify unchanged salary correctly', () => {
      const diff = calculateSalaryDiff(95000, 95000);
      expect(diff.diffAmount).toBe(0);
      expect(diff.diffPercentage).toBe(0);
      expect(diff.isIncrease).toBe(false);
      expect(diff.isDecrease).toBe(false);
      expect(diff.isUnchanged).toBe(true);
    });

    it('should handle zero previous salary gracefully without division by zero', () => {
      const diff = calculateSalaryDiff(0, 50000);
      expect(diff.diffAmount).toBe(50000);
      expect(diff.diffPercentage).toBe(0);
    });
  });

  describe('formatDiffPercentage', () => {
    it('should prefix positive percentage with + sign', () => {
      expect(formatDiffPercentage(12.5)).toBe('+12.5%');
      expect(formatDiffPercentage(5)).toBe('+5.0%');
    });

    it('should keep negative sign for reductions', () => {
      expect(formatDiffPercentage(-8.25)).toBe('-8.3%');
    });

    it('should format 0 without a plus sign', () => {
      expect(formatDiffPercentage(0)).toBe('0.0%');
    });
  });

  describe('convertCurrency & getExchangeRate', () => {
    it('should return identical amount when from and to currencies match', () => {
      expect(convertCurrency(50000, 'USD', 'USD')).toBe(50000);
      expect(convertCurrency(75000, 'EUR', 'EUR')).toBe(75000);
    });

    it('should convert EUR to USD using static rate 1.08', () => {
      // 100,000 EUR * 1.08 = 108,000 USD
      expect(convertCurrency(100000, 'EUR', 'USD')).toBe(108000);
    });

    it('should convert USD to EUR using inverse rate (1.0 / 1.08)', () => {
      // 108,000 USD / 1.08 = 100,000 EUR
      expect(convertCurrency(108000, 'USD', 'EUR')).toBe(100000);
    });

    it('should calculate relative exchange rate between non-USD currencies', () => {
      const gbpToEur = getExchangeRate('GBP', 'EUR');
      // GBP rate (1.28) / EUR rate (1.08) ≈ 1.185
      expect(gbpToEur).toBeCloseTo(1.28 / 1.08, 2);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency with dollar symbol and commas', () => {
      expect(formatCurrency(125000, 'USD')).toBe('$125,000');
    });

    it('should format GBP currency with pound symbol', () => {
      expect(formatCurrency(75000, 'GBP')).toBe('£75,000');
    });

    it('should format EUR currency with euro symbol', () => {
      expect(formatCurrency(85000, 'EUR')).toBe('€85,000');
    });

    it('should support compact formatting when requested', () => {
      expect(formatCurrency(1500000, 'USD', { compact: true })).toBe('$1.5M');
      expect(formatCurrency(250000, 'USD', { compact: true })).toBe('$250K');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large values in short notation', () => {
      expect(formatCompactNumber(1200000)).toBe('1.2M');
      expect(formatCompactNumber(450000)).toBe('450K');
      expect(formatCompactNumber(950)).toBe('950');
    });
  });

  describe('getCountryFlag & getOfficeCode', () => {
    it('should return correct flag emojis', () => {
      expect(getCountryFlag('United States')).toBe('🇺🇸');
      expect(getCountryFlag('United Kingdom')).toBe('🇬🇧');
      expect(getCountryFlag('Germany')).toBe('🇩🇪');
      expect(getCountryFlag('Japan')).toBe('🇯🇵');
      expect(getCountryFlag('Unknown')).toBe('🌐');
    });

    it('should return correct regional office code', () => {
      expect(getOfficeCode('United States', 'San Francisco')).toBe('AMER-01');
      expect(getOfficeCode('United Kingdom', 'London')).toBe('EMEA-01');
      expect(getOfficeCode('Germany', 'Berlin')).toBe('EMEA-02');
      expect(getOfficeCode('Singapore', 'Singapore')).toBe('APAC-01');
    });
  });
});
