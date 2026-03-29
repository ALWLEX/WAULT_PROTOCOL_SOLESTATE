export interface RentalIncomeResult {
  monthlyGrossRevenue: number; // in USDC with 6 decimals
  monthlyNetRevenue: number;
  occupancyRate: number; // percentage
  averageRentPerUnit: number;
  expenses: RentalExpenses;
  source: string;
  timestamp: number;
}

export interface RentalExpenses {
  management: number;
  maintenance: number;
  insurance: number;
  taxes: number;
  utilities: number;
  total: number;
}

/**
 * Rental Income Provider
 * Tracks and reports rental income from managed properties
 */
export class RentalIncomeProvider {
  /**
   * Get current rental income data
   * In production: connect to property management systems
   * (Yardi, AppFolio, Buildium APIs)
   */
  async getRentalIncome(
    assetId: string,
    propertyType: string
  ): Promise<RentalIncomeResult> {
    console.log(`[Rental] Fetching income for asset: ${assetId}`);

    // Simulate property management data
    const grossRevenue = this.simulateGrossRevenue(propertyType);
    const occupancyRate = 85 + Math.random() * 13; // 85-98%
    const actualRevenue = Math.round(grossRevenue * (occupancyRate / 100));

    const expenses = this.calculateExpenses(actualRevenue);
    const netRevenue = actualRevenue - expenses.total;

    return {
      monthlyGrossRevenue: actualRevenue * 1_000_000,
      monthlyNetRevenue: netRevenue * 1_000_000,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      averageRentPerUnit: actualRevenue,
      expenses: {
        management: expenses.management * 1_000_000,
        maintenance: expenses.maintenance * 1_000_000,
        insurance: expenses.insurance * 1_000_000,
        taxes: expenses.taxes * 1_000_000,
        utilities: expenses.utilities * 1_000_000,
        total: expenses.total * 1_000_000,
      },
      source: "wault-rental-tracker-v1",
      timestamp: Date.now(),
    };
  }

  /**
   * Get rental income history
   */
  async getRentalHistory(
    assetId: string,
    months: number = 12
  ): Promise<Array<{ month: string; gross: number; net: number; occupancy: number }>> {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const gross = 7000 + Math.round(Math.random() * 3000);
      const occupancy = 80 + Math.random() * 18;
      const actual = Math.round(gross * (occupancy / 100));
      const expenses = Math.round(actual * 0.15);

      data.push({
        month: monthNames[date.getMonth()],
        gross: actual,
        net: actual - expenses,
        occupancy: Math.round(occupancy),
      });
    }

    return data;
  }

  private simulateGrossRevenue(propertyType: string): number {
    const baseRevenues: Record<string, number> = {
      residential: 8000,
      commercial: 15000,
      mixed: 12000,
      industrial: 10000,
    };
    const base = baseRevenues[propertyType.toLowerCase()] || 8000;
    return base + Math.round(Math.random() * 2000 - 1000);
  }

  private calculateExpenses(revenue: number) {
    const management = Math.round(revenue * 0.05); // 5%
    const maintenance = Math.round(revenue * 0.03); // 3%
    const insurance = Math.round(revenue * 0.02); // 2%
    const taxes = Math.round(revenue * 0.04); // 4%
    const utilities = Math.round(revenue * 0.01); // 1%
    const total = management + maintenance + insurance + taxes + utilities;

    return { management, maintenance, insurance, taxes, utilities, total };
  }
}

export const rentalIncomeProvider = new RentalIncomeProvider();