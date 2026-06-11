
import { Asset } from './types';
import { differenceInMonths, parseISO } from 'date-fns';

/**
 * Calculates the depreciation for an asset.
 * Logic:
 * - Assets owned less than 6 months (approx 180 days) get 50% of the annual rate.
 * - Remaining value must not go below 1.
 * - Written Down Value (WDV) method is used.
 */
export function calculateDepreciation(asset: Asset, calculationDate: string = new Date().toISOString()): { amount: number, newValue: number } {
  const purchaseDate = parseISO(asset.purchaseDate);
  const targetDate = parseISO(calculationDate);
  const monthsOwned = differenceInMonths(targetDate, purchaseDate);
  
  let rate = asset.depreciationRate / 100;
  
  // Rule: If owned less than 6 months in the first year, use 50% rate
  // This is a simplified fiscal year implementation
  if (monthsOwned < 6) {
    rate = rate / 2;
  }
  
  const depreciationAmount = asset.currentBookValue * rate;
  let newValue = asset.currentBookValue - depreciationAmount;
  
  // Floor at 1
  if (newValue < 1) {
    newValue = 1;
  }
  
  return {
    amount: asset.currentBookValue - newValue,
    newValue
  };
}
