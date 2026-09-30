import {
  HISTORICAL_YEAR,
  PROJECTION_YEARS,
  REAL_IMF_COUNTRIES,
} from '../data/defaultData';
import {
  CountryProfile,
  DsaAssessment,
  DsaRiskLevel,
  FiscalScenario,
  YearlyFiscalData,
} from '../types/fiscal';

/**
 * حساب توقعات إطار المالية العامة متوسط الأجل (MTFF)
 * مع المعايرة التامة وفق منهجية ومعايير صندوق النقد الدولي (IMF WEO & Fiscal Monitor)
 */
export function calculateFiscalProjections(
  scenario: FiscalScenario,
  country: CountryProfile = REAL_IMF_COUNTRIES[0]
): YearlyFiscalData[] {
  const result: YearlyFiscalData[] = [];

  // 1. حساب سنة الأساس 2024 وفق البيانات الفعلية المعتمدة
  const baseNominalGdp = country.nominalGdp;
  const baseDebt = country.debtStock;
  const baseDebtToGdp = country.debtToGdp;

  const baseTax = {
    corporate: country.corporateTax,
    personal: country.personalTax,
    vat: country.vatRevenue,
    customs: country.customsRevenue,
    otherTax: country.otherTaxRevenue,
    totalTax:
      country.corporateTax +
      country.personalTax +
      country.vatRevenue +
      country.customsRevenue +
      country.otherTaxRevenue,
  };
  const baseTotalRev = baseTax.totalTax + country.nonTaxRevenue;
  const basePrimaryExp = {
    wages: country.wages,
    transfers: country.transfers,
    capital: country.capital,
    operational: country.operational,
    total: country.wages + country.transfers + country.capital + country.operational,
  };

  const basePrimaryBalance = baseTotalRev - basePrimaryExp.total;
  const baseInterest = baseDebt * (country.sovereignInterestRate / 100);
  const baseOverall = basePrimaryBalance - baseInterest;
  const baseAmortization = baseDebt * (country.amortizationRate / 100);
  const baseForeignShare = country.foreignDebtShare / 100;
  const baseDomesticAmort = baseAmortization * (1 - baseForeignShare);
  const baseExternalAmort = baseAmortization * baseForeignShare;
  const baseGfn = Math.max(0, -baseOverall) + baseAmortization;

  const baseEffR = country.sovereignInterestRate / 100;
  const baseNomGrowth =
    (1 + country.realGdpGrowth / 100) * (1 + country.inflationRate / 100) - 1;
  const baseDebtStabPb = (baseDebtToGdp * (baseEffR - baseNomGrowth)) / (1 + baseNomGrowth);
  const basePbToGdp = (basePrimaryBalance / baseNominalGdp) * 100;

  const baseYearData: YearlyFiscalData = {
    year: HISTORICAL_YEAR,
    nominalGdp: baseNominalGdp,
    realGdpGrowth: country.realGdpGrowth,
    inflation: country.inflationRate,
    taxRevenue: baseTax,
    nonTaxRevenue: country.nonTaxRevenue,
    totalRevenue: baseTotalRev,
    revenueToGdp: (baseTotalRev / baseNominalGdp) * 100,
    primaryExpenditure: basePrimaryExp,
    primaryExpenditureToGdp: (basePrimaryExp.total / baseNominalGdp) * 100,
    primaryBalance: basePrimaryBalance,
    primaryBalanceToGdp: basePbToGdp,
    interestPayment: baseInterest,
    interestPaymentToGdp: (baseInterest / baseNominalGdp) * 100,
    overallBalance: baseOverall,
    overallBalanceToGdp: (baseOverall / baseNominalGdp) * 100,
    debtStock: baseDebt,
    debtToGdp: baseDebtToGdp,
    deltaDebtToGdp: 0,
    decomposition: {
      primaryDeficitContrib: -basePbToGdp,
      interestGrowthSnowball: 0,
      fxValuationContrib: 0,
      stockFlowAdjustment: 0,
    },
    debtAmortization: baseAmortization,
    domesticAmortization: baseDomesticAmort,
    externalAmortization: baseExternalAmort,
    grossFinancingNeeds: baseGfn,
    grossFinancingNeedsToGdp: (baseGfn / baseNominalGdp) * 100,
    debtStabilizingPbToGdp: baseDebtStabPb,
    stabilizationGap: basePbToGdp - baseDebtStabPb,
    cyclicallyAdjustedPbToGdp: basePbToGdp,
    fiscalImpulse: 0,
    taxBuoyancy: 1.0,
  };

  result.push(baseYearData);

  // 2. إسقاط السنوات المستقبلية (2025 إلى 2032)
  let prevYear = baseYearData;
  let accumulatedNonTax = country.nonTaxRevenue;
  let cumulativeOutputGap = 0;

  const baseCapexShare = (country.capital / baseNominalGdp) * 100;

  for (let i = 0; i < PROJECTION_YEARS.length; i++) {
    const year = PROJECTION_YEARS[i];

    // أثر مضاعف الإنفاق الاستثماري العام على نمو الناتج
    const capitalShareDiff =
      scenario.expenditure.capitalExpenditureGdpShare - baseCapexShare;
    const growthBoost = Math.max(
      -0.6,
      capitalShareDiff * scenario.expenditure.capitalMultiplier
    );
    const effectiveRealGrowth = Math.max(
      -4.0,
      scenario.macro.realGdpGrowth + growthBoost
    );
    const inflation = scenario.macro.inflationRate;

    // معدل النمو الاسمي للناتج المحلي الإجمالي
    const nominalGrowthRate =
      (1 + effectiveRealGrowth / 100) * (1 + inflation / 100) - 1;
    const currentNominalGdp = prevYear.nominalGdp * (1 + nominalGrowthRate);
    const gdpExpansionFactor = currentNominalGdp / country.nominalGdp;

    // مؤشرات الامتثال وتعديل السياسات الضريبية
    const complianceFactor = scenario.tax.taxComplianceEfficiency / 100;
    const citRatio = scenario.tax.corporateTaxRate / 20.0;
    const pitRatio = country.personalTax > 0 ? scenario.tax.personalIncomeTaxRate / 20.0 : 0;
    const vatRatio = scenario.tax.vatStandardRate / 15.0;
    const customsRatio = scenario.tax.customsExciseRate / 2.5;

    // الإيرادات الضريبية المفككة
    const corporateTax =
      country.corporateTax * gdpExpansionFactor * citRatio * complianceFactor;
    const personalTax =
      country.personalTax * gdpExpansionFactor * (pitRatio || 1) * complianceFactor;
    const vatRevenue =
      country.vatRevenue * gdpExpansionFactor * vatRatio * complianceFactor;
    const customsRevenue =
      country.customsRevenue * gdpExpansionFactor * customsRatio * complianceFactor;
    const otherTax =
      country.otherTaxRevenue * gdpExpansionFactor * complianceFactor;
    const totalTax =
      corporateTax + personalTax + vatRevenue + customsRevenue + otherTax;

    accumulatedNonTax *= 1 + scenario.tax.nonTaxRevenueGrowth / 100;
    const totalRevenue = totalTax + accumulatedNonTax;

    // النفقات كنسبة من الناتج المحلي الإجمالي
    const wages =
      (scenario.expenditure.wageBillGdpShare / 100) * currentNominalGdp;
    const transfers =
      (scenario.expenditure.socialTransfersGdpShare / 100) * currentNominalGdp;
    const capital =
      (scenario.expenditure.capitalExpenditureGdpShare / 100) * currentNominalGdp;
    const operational =
      (scenario.expenditure.otherOperationalGdpShare / 100) * currentNominalGdp;
    const totalPrimaryExp = wages + transfers + capital + operational;

    // الأرصدة المالية الأولية والكلية
    const primaryBalance = totalRevenue - totalPrimaryExp;
    const primaryBalanceToGdp = (primaryBalance / currentNominalGdp) * 100;

    // ديناميكيات الفوائد والدين العام
    const effectiveRate = scenario.macro.sovereignInterestRate / 100;
    const interestPayment = prevYear.debtStock * effectiveRate;
    const interestPaymentToGdp = (interestPayment / currentNominalGdp) * 100;

    const overallBalance = primaryBalance - interestPayment;
    const overallBalanceToGdp = (overallBalance / currentNominalGdp) * 100;

    // إعادة تقييم سعر الصرف على رصيد الدين الخارجي
    const foreignDebtShareDecimal = scenario.macro.foreignDebtShare / 100;
    const foreignDebtPortion = prevYear.debtStock * foreignDebtShareDecimal;
    const fxValuation =
      foreignDebtPortion * (scenario.macro.fxDepreciationRate / 100);

    // رصيد الدين الجديد
    const debtStock = prevYear.debtStock - overallBalance + fxValuation;
    const debtToGdp = (debtStock / currentNominalGdp) * 100;
    const deltaDebtToGdp = debtToGdp - prevYear.debtToGdp;

    // تفكيك تغير نسبة الدين:
    const primaryDeficitContrib = -primaryBalanceToGdp;
    const interestGrowthSnowball =
      (prevYear.debtToGdp * (effectiveRate - nominalGrowthRate)) /
      (1 + nominalGrowthRate);
    const fxValuationContrib = (fxValuation / currentNominalGdp) * 100;
    const stockFlowAdjustment =
      deltaDebtToGdp -
      (primaryDeficitContrib + interestGrowthSnowball + fxValuationContrib);

    // تفكيك إطفاء الدين والاحتياجات التمويلية الإجمالية (GFN)
    const amortizationRate = country.amortizationRate;
    const debtAmortization = prevYear.debtStock * (amortizationRate / 100);
    const domesticAmortization = debtAmortization * (1 - foreignDebtShareDecimal);
    const externalAmortization = debtAmortization * foreignDebtShareDecimal;
    const gfn = Math.max(0, -overallBalance) + debtAmortization;
    const gfnToGdp = (gfn / currentNominalGdp) * 100;

    // الرصيد الأولي المثبت للدين p* = d_{t-1} * (r - g) / (1 + g)
    const debtStabilizingPbToGdp =
      (prevYear.debtToGdp * (effectiveRate - nominalGrowthRate)) /
      (1 + nominalGrowthRate);
    const stabilizationGap = primaryBalanceToGdp - debtStabilizingPbToGdp;

    // فجوة الناتج والميزان الأولي المعدل دورياً (CAPB)
    const annualOutputGap = effectiveRealGrowth - country.realGdpGrowth;
    cumulativeOutputGap = cumulativeOutputGap * 0.5 + annualOutputGap;
    const cyclicalComponent = 0.42 * cumulativeOutputGap; // حساسية الميزانية للدورة
    const cyclicallyAdjustedPbToGdp = primaryBalanceToGdp - cyclicalComponent;

    // الحافز المالي التقديري (Fiscal Impulse) = - التغير في CAPB
    const fiscalImpulse = -(cyclicallyAdjustedPbToGdp - prevYear.cyclicallyAdjustedPbToGdp);

    // مرونة الحصيلة الضريبية (Tax Buoyancy)
    const gdpPctChange = ((currentNominalGdp - prevYear.nominalGdp) / prevYear.nominalGdp) * 100;
    const taxPctChange = ((totalTax - prevYear.taxRevenue.totalTax) / prevYear.taxRevenue.totalTax) * 100;
    const taxBuoyancy = gdpPctChange !== 0 ? Math.max(0.2, Math.min(2.5, taxPctChange / gdpPctChange)) : 1.0;

    const currentData: YearlyFiscalData = {
      year,
      nominalGdp: currentNominalGdp,
      realGdpGrowth: effectiveRealGrowth,
      inflation,
      taxRevenue: {
        corporate: corporateTax,
        personal: personalTax,
        vat: vatRevenue,
        customs: customsRevenue,
        otherTax,
        totalTax,
      },
      nonTaxRevenue: accumulatedNonTax,
      totalRevenue,
      revenueToGdp: (totalRevenue / currentNominalGdp) * 100,
      primaryExpenditure: {
        wages,
        transfers,
        capital,
        operational,
        total: totalPrimaryExp,
      },
      primaryExpenditureToGdp: (totalPrimaryExp / currentNominalGdp) * 100,
      primaryBalance,
      primaryBalanceToGdp,
      interestPayment,
      interestPaymentToGdp,
      overallBalance,
      overallBalanceToGdp,
      debtStock,
      debtToGdp,
      deltaDebtToGdp,
      decomposition: {
        primaryDeficitContrib,
        interestGrowthSnowball,
        fxValuationContrib,
        stockFlowAdjustment,
      },
      debtAmortization,
      domesticAmortization,
      externalAmortization,
      grossFinancingNeeds: gfn,
      grossFinancingNeedsToGdp: gfnToGdp,
      debtStabilizingPbToGdp,
      stabilizationGap,
      cyclicallyAdjustedPbToGdp,
      fiscalImpulse,
      taxBuoyancy,
    };

    result.push(currentData);
    prevYear = currentData;
  }

  return result;
}

/**
 * تقييم استدامة الدين (DSA) وفق أحدث أطر صندوق النقد الدولي
 */
export function evaluateDsa(
  projections: YearlyFiscalData[],
  scenario: FiscalScenario
): DsaAssessment {
  const terminalYearData = projections[projections.length - 1]; // 2032
  const targetYearData =
    projections.find((p) => p.year === scenario.fiscalRule.targetYear) ||
    terminalYearData;
  const initialYearData = projections[0]; // 2024

  const initialDebt = initialYearData.debtToGdp;
  const terminalDebt = terminalYearData.debtToGdp;
  const targetYearDebt = targetYearData.debtToGdp;

  // الرصيد الأولي المثبت للدين: pb* = d * (r - n) / (1 + n)
  const avgRealGrowth = scenario.macro.realGdpGrowth;
  const avgInflation = scenario.macro.inflationRate;
  const nominalGrowth =
    (1 + avgRealGrowth / 100) * (1 + avgInflation / 100) - 1;
  const effectiveR = scenario.macro.sovereignInterestRate / 100;

  const debtStabilizingPb =
    (targetYearDebt * (effectiveR - nominalGrowth)) / (1 + nominalGrowth);
  const activeAvgPb =
    projections.slice(1).reduce((acc, p) => acc + p.primaryBalanceToGdp, 0) /
    (projections.length - 1);
  const fiscalGap = activeAvgPb - debtStabilizingPb;

  // تقييم مسار الدين
  const debtChange = terminalDebt - initialDebt;
  let debtTrajectoryRisk: DsaRiskLevel = 'Low';
  if (debtChange > 12) debtTrajectoryRisk = 'Critical';
  else if (debtChange > 5) debtTrajectoryRisk = 'High';
  else if (debtChange > 0) debtTrajectoryRisk = 'Moderate';
  else debtTrajectoryRisk = 'Low';

  // تقييم الاحتياجات التمويلية الإجمالية
  const avgGfn =
    projections.reduce((acc, p) => acc + p.grossFinancingNeedsToGdp, 0) /
    projections.length;
  let gfnRisk: DsaRiskLevel = 'Low';
  if (avgGfn > 22) gfnRisk = 'Critical';
  else if (avgGfn > 16) gfnRisk = 'High';
  else if (avgGfn > 12) gfnRisk = 'Moderate';
  else gfnRisk = 'Low';

  // التقييم الشامل للمخاطر
  let overallRisk: DsaRiskLevel = 'Low';
  const ceiling = scenario.fiscalRule.debtGdpCeiling;

  if (terminalDebt > ceiling + 15 || debtTrajectoryRisk === 'Critical') {
    overallRisk = 'Critical';
  } else if (terminalDebt > ceiling || debtTrajectoryRisk === 'High' || gfnRisk === 'High') {
    overallRisk = 'High';
  } else if (terminalDebt > ceiling - 5 || debtTrajectoryRisk === 'Moderate' || gfnRisk === 'Moderate') {
    overallRisk = 'Moderate';
  } else {
    overallRisk = 'Low';
  }

  const distanceToCeiling = ceiling - terminalDebt;
  const isCompliant = terminalDebt <= ceiling;
  const stabilizationEffortRequired = Math.max(0, debtStabilizingPb - activeAvgPb);

  return {
    overallRisk,
    debtTrajectoryRisk,
    gfnRisk,
    debtStabilizingPrimaryBalance: debtStabilizingPb,
    currentPrimaryBalance: activeAvgPb,
    fiscalGap,
    distanceToCeiling,
    isCompliantWithCeiling: isCompliant,
    stabilizationEffortRequired,
  };
}

/**
 * دالة حساب مصفوفة اختبارات الإجهاد
 */
export interface StressMatrixRow {
  gdpDelta: number;
  columns: {
    rateDelta: number;
    terminalDebtToGdp: number;
    terminalDeficitToGdp: number;
  }[];
}

export function computeStressMatrix(
  baseScenario: FiscalScenario,
  country: CountryProfile = REAL_IMF_COUNTRIES[0]
): {
  rateShockOffsets: number[];
  matrix: StressMatrixRow[];
} {
  const gdpShocks = [-2.0, -1.0, 0.0, 1.0];
  const rateShockOffsets = [-1.0, 0.0, 1.5, 3.0];
  const matrix: StressMatrixRow[] = [];

  for (const gShock of gdpShocks) {
    const columns: {
      rateDelta: number;
      terminalDebtToGdp: number;
      terminalDeficitToGdp: number;
    }[] = [];

    for (const rShock of rateShockOffsets) {
      const shockedScenario: FiscalScenario = {
        ...baseScenario,
        macro: {
          ...baseScenario.macro,
          realGdpGrowth: baseScenario.macro.realGdpGrowth + gShock,
          sovereignInterestRate: Math.max(
            0.5,
            baseScenario.macro.sovereignInterestRate + rShock
          ),
        },
      };

      const proj = calculateFiscalProjections(shockedScenario, country);
      const termData = proj[proj.length - 1];

      columns.push({
        rateDelta: rShock,
        terminalDebtToGdp: termData.debtToGdp,
        terminalDeficitToGdp: termData.overallBalanceToGdp,
      });
    }

    matrix.push({
      gdpDelta: gShock,
      columns,
    });
  }

  return {
    rateShockOffsets,
    matrix,
  };
}

/**
 * تنسيق الأرقام والعملات مع دعم الرموز السيادية الحقيقية
 */
export function formatCurrency(
  val: number,
  currencySymbol = 'ر.س',
  decimals = 1
): string {
  if (Math.abs(val) >= 1000) {
    return `${(val / 1000).toFixed(decimals)} ترليون ${currencySymbol}`;
  }
  return `${val.toFixed(decimals)} مليار ${currencySymbol}`;
}

export function formatPercent(val: number, showSign = true, decimals = 1): string {
  const sign = showSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

export function translateDsaRisk(risk: DsaRiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'منخفضة';
    case 'Moderate':
      return 'متوسطة';
    case 'High':
      return 'مرتفعة';
    case 'Critical':
      return 'حرجة';
    default:
      return risk;
  }
}

