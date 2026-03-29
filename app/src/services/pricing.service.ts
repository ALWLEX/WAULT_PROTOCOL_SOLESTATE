/**
 * Pricing Service for real-time asset valuation data
 * Aggregates pricing from multiple sources
 */

export interface PriceData {
  assetId: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

export interface PropertyValuation {
  estimatedValue: number;
  pricePerSqft: number;
  rentalYield: number;
  occupancyRate: number;
  comparableProperties: ComparableProperty[];
  lastAppraisal: number;
  source: string;
}

export interface ComparableProperty {
  address: string;
  price: number;
  sqft: number;
  soldDate: string;
}

export interface MarketStats {
  totalVolume24h: number;
  totalListings: number;
  averageApy: number;
  totalValueLocked: number;
  uniqueInvestors: number;
  topPerformingAsset: string;
}

class PricingService {
  /**
   * Get real-time pricing for a tokenized asset
   * In production: aggregate from DEX pools, oracle feeds, etc.
   */
  async getTokenPrice(assetId: string): Promise<PriceData> {
    // Demo data - in production would call Birdeye/Jupiter APIs
    const basePrice = 100;
    const change = (Math.random() - 0.45) * 10;

    return {
      assetId,
      currentPrice: basePrice + change,
      priceChange24h: change,
      priceChangePercent24h: (change / basePrice) * 100,
      volume24h: Math.round(Math.random() * 500000),
      marketCap: Math.round((basePrice + change) * 10000),
      lastUpdated: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Get property valuation from external APIs
   * In production: Zillow, Redfin, local assessors
   */
  async getPropertyValuation(location: string): Promise<PropertyValuation> {
    return {
      estimatedValue: 1_000_000 + Math.round(Math.random() * 200_000 - 100_000),
      pricePerSqft: 450 + Math.round(Math.random() * 100),
      rentalYield: 6 + Math.random() * 4,
      occupancyRate: 85 + Math.random() * 15,
      comparableProperties: [
        {
          address: "123 Nearby St, Same City",
          price: 950_000,
          sqft: 2100,
          soldDate: "2024-10-15",
        },
        {
          address: "456 Adjacent Ave, Same City",
          price: 1_100_000,
          sqft: 2400,
          soldDate: "2024-11-02",
        },
        {
          address: "789 Close Blvd, Same City",
          price: 1_050_000,
          sqft: 2250,
          soldDate: "2024-09-28",
        },
      ],
      lastAppraisal: Math.floor(Date.now() / 1000) - 86400 * 30,
      source: "wault-valuation-engine",
    };
  }

  /**
   * Get marketplace statistics
   */
  async getMarketStats(): Promise<MarketStats> {
    return {
      totalVolume24h: 2_450_000,
      totalListings: 156,
      averageApy: 7.8,
      totalValueLocked: 12_500_000,
      uniqueInvestors: 2341,
      topPerformingAsset: "WSFA",
    };
  }

  /**
   * Calculate historical price data for charts
   */
  async getHistoricalPrices(
    assetId: string,
    days: number = 30
  ): Promise<Array<{ timestamp: number; price: number; volume: number }>> {
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    let price = 100;

    for (let i = days; i >= 0; i--) {
      price += (Math.random() - 0.48) * 3;
      price = Math.max(price, 80);
      data.push({
        timestamp: now - i * 86400,
        price: Math.round(price * 100) / 100,
        volume: Math.round(Math.random() * 100000),
      });
    }

    return data;
  }

  /**
   * Get revenue history for an asset
   */
  async getRevenueHistory(
    assetId: string,
    months: number = 12
  ): Promise<Array<{ month: string; revenue: number; cumulative: number }>> {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const data = [];
    let cumulative = 0;
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthRevenue = 5000 + Math.round(Math.random() * 5000);
      cumulative += monthRevenue;

      data.push({
        month: monthNames[date.getMonth()],
        revenue: monthRevenue,
        cumulative,
      });
    }

    return data;
  }
}

export const pricingService = new PricingService();