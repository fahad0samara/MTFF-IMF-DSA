export interface MacroAssumptions {
  realGdpGrowth: number; // e.g. 2.6% (IMF WEO)
  inflationRate: number; // GDP deflator e.g. 2.4%
  sovereignInterestRate: number; // Effective sovereign borrowing cost e.g. 4.2%
  fxDepreciationRate: number; // Foreign currency depreciation vs domestic currency e.g. 1.0%
  foreignDebtShare: number; // % of total public debt denominated in foreign currency e.g. 0% for US/Japan, 35% for EM
}

export interface TaxPolicyParameters {
  corporateTaxRate: number; // % effective CIT
  personalIncomeTaxRate: number; // % average effective PIT
  vatStandardRate: number; // % VAT / Consumption tax rate (or sales tax equivalent)
  customsExciseRate: number; // % Trade / Excise effective yield
  taxComplianceEfficiency: number; // Compliance / collection efficiency index (100 = base, 80-120)
  nonTaxRevenueGrowth: number; // Annual % growth of non-tax revenues
}

export interface ExpenditureParameters {
  wageBillGdpShare: number; // Public sector compensation % of GDP
  socialTransfersGdpShare: number; // Pensions & subsidies % of GDP
  capitalExpenditureGdpShare: number; // Public investment % of GDP
  otherOperationalGdpShare: number; // Goods & services % of GDP
  capitalMultiplier: number; // Investment multiplier on future GDP growth
}

export interface FiscalRuleTarget {
  debtGdpCeiling: number; // e.g. 60.0% Maastricht or 100% US benchmark
  overallDeficitCeiling: number; // e.g. -3.0% of GDP
  targetYear: number; // e.g. 2030
  ruleName: string; // e.g. "EU Maastricht Treaty (60% Rule)", "US Fiscal Responsibility Act", "UK OBR Fiscal Mandate"
}

export interface FiscalScenario {
  id: string;
  name: string;
  category: 'baseline' | 'consolidation' | 'stimulus' | 'stagflation' | 'shock' | 'custom';
  description: string;
  macro: MacroAssumptions;
  tax: TaxPolicyParameters;
  expenditure: ExpenditureParameters;
  fiscalRule: FiscalRuleTarget;
}

export interface CountryProfile {
  id: string;
  name: string;
  officialName: string;
  flagEmoji: string;
  ministryName: string;
  currency: string;
  currencySymbol: string;
  imfWeoCode: string;
  dataSourceCitation: string;
  
  // Real IMF WEO 2024 Base Anchors
  nominalGdp: number; // in Billions local currency or USD
  debtStock: number; // in Billions
  debtToGdp: number; // % (IMF WEO General Government Gross Debt)
  realGdpGrowth: number; // % (IMF WEO 2024 baseline)
  inflationRate: number; // % (IMF WEO GDP Deflator)
  sovereignInterestRate: number; // % (10-Year Benchmark Sovereign Bond Yield)
  foreignDebtShare: number; // % of total debt in foreign currency
  amortizationRate: number; // % maturing annually
  
  // Real OECD / National Tax Breakdown (% of GDP and in Billions)
  corporateTax: number;
  personalTax: number;
  vatRevenue: number;
  customsRevenue: number;
  otherTaxRevenue: number;
  nonTaxRevenue: number;
  
  // Real Expenditure Breakdown (Billions)
  wages: number;
  transfers: number;
  capital: number;
  operational: number;
  
  // Statutory Fiscal Framework
  statutoryFiscalRule: FiscalRuleTarget;
  creditRating: string;
}

export interface YearlyFiscalData {
  year: number;
  nominalGdp: number; // in billions
  realGdpGrowth: number; // %
  inflation: number; // %
  
  // Revenues (in billions)
  taxRevenue: {
    corporate: number;
    personal: number;
    vat: number;
    customs: number;
    otherTax: number;
    totalTax: number;
  };
  nonTaxRevenue: number;
  totalRevenue: number;
  revenueToGdp: number; // %
  
  // Expenditures (in billions)
  primaryExpenditure: {
    wages: number;
    transfers: number;
    capital: number;
    operational: number;
    total: number;
  };
  primaryExpenditureToGdp: number; // %
  
  // Balances (in billions & %)
  primaryBalance: number;
  primaryBalanceToGdp: number;
  interestPayment: number;
  interestPaymentToGdp: number;
  overallBalance: number;
  overallBalanceToGdp: number;
  
  // Debt Dynamics
  debtStock: number;
  debtToGdp: number;
  deltaDebtToGdp: number; // change from previous year in percentage points
  
  // Decomposition of change in debt-to-GDP
  decomposition: {
    primaryDeficitContrib: number; // -pb_t
    interestGrowthSnowball: number; // d_{t-1} * (r - g) / (1 + g + pi)
    fxValuationContrib: number; // effect of FX change on foreign debt
    stockFlowAdjustment: number;
  };
  
  // Financing Needs & Maturity Profile
  debtAmortization: number;
  domesticAmortization: number;
  externalAmortization: number;
  grossFinancingNeeds: number;
  grossFinancingNeedsToGdp: number; // %
  
  // Advanced Macro-Fiscal Analytics
  debtStabilizingPbToGdp: number; // p* = (r - g) / (1 + g) * d
  stabilizationGap: number; // Actual PB% - p* (positive = debt reducing path)
  cyclicallyAdjustedPbToGdp: number; // CAPB % of GDP
  fiscalImpulse: number; // -d(CAPB) (+ = expansionary stimulus, - = fiscal consolidation)
  taxBuoyancy: number; // % change in tax revenue / % change in nominal GDP
}

export type DsaRiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface DsaAssessment {
  overallRisk: DsaRiskLevel;
  debtTrajectoryRisk: DsaRiskLevel;
  gfnRisk: DsaRiskLevel;
  debtStabilizingPrimaryBalance: number;
  currentPrimaryBalance: number;
  fiscalGap: number;
  distanceToCeiling: number;
  isCompliantWithCeiling: boolean;
  stabilizationEffortRequired: number; // In % points of GDP
}
