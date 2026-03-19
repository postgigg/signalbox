/**
 * Two-proportion z-test for A/B test significance.
 * Returns z-score, p-value, and whether the result is statistically significant at p < 0.05.
 */

interface VariantStats {
  readonly impressions: number;
  readonly submissions: number;
  readonly totalScore: number;
  readonly hotCount: number;
  readonly warmCount: number;
  readonly coldCount: number;
}

interface SignificanceResult {
  readonly zScore: number;
  readonly pValue: number;
  readonly significant: boolean;
  readonly conversionRateA: number;
  readonly conversionRateB: number;
  readonly avgScoreA: number;
  readonly avgScoreB: number;
  readonly winner: 'a' | 'b' | null;
  readonly enoughData: boolean;
}

const MIN_IMPRESSIONS = 100;
const SIGNIFICANCE_THRESHOLD = 0.05;

/**
 * Standard normal CDF approximation (Abramowitz & Stegun).
 */
function normalCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}

export function calculateSignificance(
  variantA: VariantStats,
  variantB: VariantStats,
): SignificanceResult {
  const enoughData =
    variantA.impressions >= MIN_IMPRESSIONS &&
    variantB.impressions >= MIN_IMPRESSIONS;

  const conversionRateA =
    variantA.impressions > 0 ? variantA.submissions / variantA.impressions : 0;
  const conversionRateB =
    variantB.impressions > 0 ? variantB.submissions / variantB.impressions : 0;

  const avgScoreA =
    variantA.submissions > 0 ? variantA.totalScore / variantA.submissions : 0;
  const avgScoreB =
    variantB.submissions > 0 ? variantB.totalScore / variantB.submissions : 0;

  if (!enoughData) {
    return {
      zScore: 0,
      pValue: 1,
      significant: false,
      conversionRateA,
      conversionRateB,
      avgScoreA,
      avgScoreB,
      winner: null,
      enoughData: false,
    };
  }

  const nA = variantA.impressions;
  const nB = variantB.impressions;

  // Pooled proportion for two-proportion z-test
  const pooledP = (variantA.submissions + variantB.submissions) / (nA + nB);

  // Handle edge case where pooledP is 0 or 1
  if (pooledP === 0 || pooledP === 1) {
    return {
      zScore: 0,
      pValue: 1,
      significant: false,
      conversionRateA,
      conversionRateB,
      avgScoreA,
      avgScoreB,
      winner: null,
      enoughData: true,
    };
  }

  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / nA + 1 / nB));

  if (se === 0) {
    return {
      zScore: 0,
      pValue: 1,
      significant: false,
      conversionRateA,
      conversionRateB,
      avgScoreA,
      avgScoreB,
      winner: null,
      enoughData: true,
    };
  }

  const zScore = (conversionRateA - conversionRateB) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const significant = pValue < SIGNIFICANCE_THRESHOLD;

  let winner: 'a' | 'b' | null = null;
  if (significant) {
    winner = conversionRateA > conversionRateB ? 'a' : 'b';
  }

  return {
    zScore: Math.round(zScore * 1000) / 1000,
    pValue: Math.round(pValue * 10000) / 10000,
    significant,
    conversionRateA: Math.round(conversionRateA * 10000) / 10000,
    conversionRateB: Math.round(conversionRateB * 10000) / 10000,
    avgScoreA: Math.round(avgScoreA * 100) / 100,
    avgScoreB: Math.round(avgScoreB * 100) / 100,
    winner,
    enoughData,
  };
}
