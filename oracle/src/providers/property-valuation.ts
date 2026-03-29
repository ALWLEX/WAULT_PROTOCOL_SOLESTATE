import { config } from "../config";

export interface ValuationResult {
  estimatedValue: number; // in USDC with 6 decimals
  confidence: number; // 0-100
  source: string;
  comparables: number;
  timestamp: number;
}

/**
 * Property Valuation Provider
 * Aggregates data from multiple real estate data sources
 */
export class PropertyValuationProvider {
  /**
   * Get property valuation from external sources
   * In production: Zillow, Redfin, CoreLogic APIs
   */
  async getValuation(
    location: string,
    propertyType: string,
    squareMeters?: number
  ): Promise<ValuationResult> {
    console.log(`[Valuation] Fetching for: ${location} (${propertyType})`);

    // Simulate API call to property valuation service
    // In production, this would aggregate from:
    // 1. Zillow Zestimate API
    // 2. Redfin Data API
    // 3. CoreLogic property data
    // 4. Local government assessment databases

    const baseValues: Record<string, number> = {
      "Dubai Marina": 1_000_000,
      "New York": 5_000_000,
      "London": 3_000_000,
      "Tokyo": 2_500_000,
      "Nevada": 2_000_000,
      default: 1_000_000,
    };

    // Find matching base value
    let baseValue = baseValues.default;
    for (const [key, value] of Object.entries(baseValues)) {
      if (location.toLowerCase().includes(key.toLowerCase())) {
        baseValue = value;
        break;
      }
    }

    // Apply market variation (±5%)
    const marketVariation = 1 + (Math.random() * 0.1 - 0.05);
    const estimatedValue = Math.round(baseValue * marketVariation * 1_000_000); // Convert to 6 decimals

    return {
      estimatedValue,
      confidence: 75 + Math.round(Math.random() * 20), // 75-95%
      source: "wault-valuation-engine-v1",
      comparables: 3 + Math.round(Math.random() * 7),
      timestamp: Date.now(),
    };
  }

  /**
   * Get historical valuation trend
   */
  async getValuationHistory(
    location: string,
    months: number = 12
  ): Promise<Array<{ month: number; value: number }>> {
    const data = [];
    let value = 1_000_000_000_000; // $1M base

    for (let i = months; i >= 0; i--) {
      value *= 1 + (Math.random() * 0.03 - 0.01); // ±1-3% monthly change
      data.push({
        month: i,
        value: Math.round(value),
      });
    }

    return data.reverse();
  }

  /**
   * Validate valuation change is within acceptable bounds
   */
  validateValuationChange(
    previousValue: number,
    newValue: number
  ): { valid: boolean; changePercent: number; reason?: string } {
    if (previousValue === 0) {
      return { valid: true, changePercent: 0 };
    }

    const changePercent =
      ((newValue - previousValue) / previousValue) * 100;

    if (Math.abs(changePercent) > config.maxValuationChangePct) {
      return {
        valid: false,
        changePercent,
        reason: `Valuation change of ${changePercent.toFixed(1)}% exceeds maximum of ${config.maxValuationChangePct}%`,
      };
    }

    return { valid: true, changePercent };
  }
}

export const propertyValuationProvider = new PropertyValuationProvider();