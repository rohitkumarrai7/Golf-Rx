/**
 * Draw Engine for Golf Charity Platform
 * Handles random and algorithmic number generation and match calculation
 */

/**
 * Generate 5 unique random numbers between 1 and 45
 */
export function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate 5 numbers weighted by score frequency across all users.
 * More frequently occurring scores have a higher chance of being drawn.
 */
export function generateAlgorithmicNumbers(allScores: number[]): number[] {
  if (allScores.length === 0) return generateRandomNumbers();

  // Count frequency of each score value (1-45)
  const frequency: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 0;
  for (const score of allScores) {
    if (score >= 1 && score <= 45) {
      frequency[score] = (frequency[score] || 0) + 1;
    }
  }

  // Create weighted pool - higher frequency = more entries
  const weightedPool: number[] = [];
  for (let num = 1; num <= 45; num++) {
    // Base weight of 1, plus frequency count
    const weight = 1 + (frequency[num] || 0);
    for (let j = 0; j < weight; j++) {
      weightedPool.push(num);
    }
  }

  // Pick 5 unique numbers from weighted pool
  const selected = new Set<number>();
  while (selected.size < 5) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    selected.add(weightedPool[idx]);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Calculate how many of the user's scores match the drawn numbers
 */
export function calculateMatches(userScores: number[], drawnNumbers: number[]): number {
  const drawnSet = new Set(drawnNumbers);
  return userScores.filter(score => drawnSet.has(score)).length;
}

/**
 * Calculate prize pool amounts based on active subscriber count
 */
export function calculatePrizePool(
  activeMonthlyCount: number,
  activeYearlyCount: number,
  monthlyFee: number = 9.99,
  yearlyFee: number = 89.99,
  prizePoolPercentage: number = 0.3,
  jackpotCarryover: number = 0
) {
  const monthlyRevenue = activeMonthlyCount * monthlyFee;
  const yearlyMonthlyRevenue = activeYearlyCount * (yearlyFee / 12);
  const totalMonthlyRevenue = monthlyRevenue + yearlyMonthlyRevenue;
  const totalPool = totalMonthlyRevenue * prizePoolPercentage + jackpotCarryover;

  return {
    total_pool: Math.round(totalPool * 100) / 100,
    tier_5_amount: Math.round(totalPool * 0.40 * 100) / 100,
    tier_4_amount: Math.round(totalPool * 0.35 * 100) / 100,
    tier_3_amount: Math.round(totalPool * 0.25 * 100) / 100,
    jackpot_carryover: jackpotCarryover,
  };
}
