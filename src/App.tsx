import React, { useState, useMemo } from 'react';
import {
  FileText,
  Table as TableIcon,
  RefreshCw,
  TrendingUp,
  Receipt,
  Building,
  Target,
  Download,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Globe,
  Database,
  CheckCircle2,
  ExternalLink,
  PieChart,
  BarChart3,
  ShieldAlert,
  Activity,
  Scale,
  Calendar,
  Percent,
} from 'lucide-react';
import { Header } from './components/Header';
import { KpiMetricsRow } from './components/KpiMetricsRow';
import { DebtTrajectoryChart } from './components/DebtTrajectoryChart';
import { TaxRevenueChart } from './components/TaxRevenueChart';
import { DebtFanChart } from './components/DebtFanChart';
import { GrossFinancingNeedsChart } from './components/GrossFinancingNeedsChart';
import { FiscalScissorsChart } from './components/FiscalScissorsChart';
import { InteractiveSliders } from './components/InteractiveSliders';
import { DebtDynamicsWaterfall } from './components/DebtDynamicsWaterfall';
import { StressTestingMatrix } from './components/StressTestingMatrix';
import { FiscalRulesCompliance } from './components/FiscalRulesCompliance';
import { FiscalImpulseChart } from './components/FiscalImpulseChart';
import { DebtStabilizingGapChart } from './components/DebtStabilizingGapChart';
import { DebtMaturityProfileChart } from './components/DebtMaturityProfileChart';
import { TaxBuoyancyChart } from './components/TaxBuoyancyChart';
import { StakeholderReportModal } from './components/StakeholderReportModal';
import { DataTableModal } from './components/DataTableModal';
import { ImfDataProvenanceModal } from './components/ImfDataProvenanceModal';
import {
  REAL_IMF_COUNTRIES,
  PRESET_SCENARIOS,
  HISTORICAL_YEAR,
} from './data/defaultData';
import { CountryProfile, FiscalScenario } from './types/fiscal';
import {
  calculateFiscalProjections,
  evaluateDsa,
  formatCurrency,
  formatPercent,
} from './utils/fiscalCalculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeCountryId, setActiveCountryId] = useState<string>('sau');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('baseline');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isDataTableOpen, setIsDataTableOpen] = useState<boolean>(false);
  const [isImfModalOpen, setIsImfModalOpen] = useState<boolean>(false);

  // Active sovereign country profile
  const activeCountry = useMemo(() => {
    return REAL_IMF_COUNTRIES.find((c) => c.id === activeCountryId) || REAL_IMF_COUNTRIES[0];
  }, [activeCountryId]);

  // Synchronize base macroeconomic parameters
  const createScenarioForCountry = (baseScenario: FiscalScenario, country: CountryProfile): FiscalScenario => {
    return {
      ...baseScenario,
      macro: {
        ...baseScenario.macro,
        realGdpGrowth: country.realGdpGrowth,
        inflationRate: country.inflationRate,
        sovereignInterestRate: country.sovereignInterestRate,
        foreignDebtShare: country.foreignDebtShare,
      },
      fiscalRule: {
        ...country.statutoryFiscalRule,
      },
    };
  };

  const [activeScenario, setActiveScenario] = useState<FiscalScenario>(() => {
    return createScenarioForCountry(PRESET_SCENARIOS[0], REAL_IMF_COUNTRIES[0]);
  });

  const handleSelectCountry = (countryId: string) => {
    const newCountry = REAL_IMF_COUNTRIES.find((c) => c.id === countryId) || REAL_IMF_COUNTRIES[0];
    setActiveCountryId(countryId);
    const basePreset = PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];
    setActiveScenario(createScenarioForCountry(basePreset, newCountry));
  };

  const baselineScenario = useMemo(() => {
    return createScenarioForCountry(PRESET_SCENARIOS[0], activeCountry);
  }, [activeCountry]);

  const activeProjections = useMemo(() => {
    return calculateFiscalProjections(activeScenario, activeCountry);
  }, [activeScenario, activeCountry]);

  const baselineProjections = useMemo(() => {
    return calculateFiscalProjections(baselineScenario, activeCountry);
  }, [baselineScenario, activeCountry]);

  const dsaAssessment = useMemo(() => {
    return evaluateDsa(activeProjections, activeScenario);
  }, [activeProjections, activeScenario]);

  const handleSelectScenario = (id: string) => {
    const found = PRESET_SCENARIOS.find((s) => s.id === id);
    if (found) {
      setSelectedScenarioId(id);
      setActiveScenario(createScenarioForCountry(found, activeCountry));
    }
  };

  const handleResetScenario = () => {
    const found = PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];
    setActiveScenario(createScenarioForCountry(found, activeCountry));
  };

  const terminalActive = activeProjections[activeProjections.length - 1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-200 antialiased" dir="rtl">
      {/* Top Header */}
      <Header
        currentScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        presetScenarios={PRESET_SCENARIOS}
        activeCountry={activeCountry}
        onSelectCountry={handleSelectCountry}
        countries={REAL_IMF_COUNTRIES}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenDataTable={() => setIsDataTableOpen(true)}
        onOpenImfModal={() => setIsImfModalOpen(true)}
        onResetScenario={handleResetScenario}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Real Data Provenance Callout Strip */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>آفاق الاقتصاد العالمي (IMF WEO)</span>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-800 font-bold truncate max-w-[280px] sm:max-w-none">
                  {activeCountry.ministryName}
                </span>
                <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                <span className="font-mono text-slate-600 tabular-nums hidden sm:inline">
                  عائد السندات: {activeCountry.sovereignInterestRate.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xl sm:text-2xl">{activeCountry.flagEmoji}</span>
                <h1 className="text-base sm:text-xl font-extrabold text-slate-950 tracking-tight">
                  إطار التخطيط المالي متوسط الأجل واستدامة الدين السيادي
                </h1>
                <span className="text-xs text-slate-500 font-medium">
                  ({activeCountry.name})
                </span>
              </div>
            </div>

            {/* Quick Actions / IMF documentation trigger */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={() => setIsImfModalOpen(true)}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 px-2.5 py-1 bg-amber-50/80 hover:bg-amber-100/80 rounded border border-amber-200/80 transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                <span>توثيق البيانات والمصادر (WEO)</span>
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Sovereign Countries Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">الدول:</span>
            {REAL_IMF_COUNTRIES.map((c) => {
              const isSelected = activeCountry.id === c.id;
              const shortName = c.name
                .replace('المملكة العربية السعودية', 'السعودية')
                .replace('دولة الإمارات العربية المتحدة', 'الإمارات')
                .replace('المملكة الأردنية الهاشمية', 'الأردن')
                .replace('الولايات المتحدة الأمريكية', 'أمريكا')
                .replace('جمهورية ألمانيا الاتحادية', 'ألمانيا')
                .replace('جمهورية مصر العربية', 'مصر')
                .replace('دولة قطر', 'قطر')
                .replace('سلطنة عُمان', 'عُمان')
                .replace('مملكة البحرين', 'البحرين')
                .replace('دولة الكويت', 'الكويت');

              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCountry(c.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 min-h-[32px] ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={c.name}
                >
                  <span className="text-sm">{c.flagEmoji}</span>
                  <span>{shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Headline KPI Metrics Row */}
        <KpiMetricsRow
          projections={activeProjections}
          dsa={dsaAssessment}
          debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
          country={activeCountry}
        />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Primary Row: Debt Trajectory & Stochastic Debt Fan Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtTrajectoryChart
                projections={activeProjections}
                baselineProjections={baselineProjections}
                debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
                country={activeCountry}
              />
              <DebtFanChart
                projections={activeProjections}
                debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
                country={activeCountry}
              />
            </div>

            {/* Secondary Row: Debt-Stabilizing Gap & Fiscal Impulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtStabilizingGapChart
                projections={activeProjections}
                country={activeCountry}
              />
              <FiscalImpulseChart
                projections={activeProjections}
                country={activeCountry}
              />
            </div>

            {/* Third Row: Tax Revenue Trends & Fiscal Scissors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TaxRevenueChart
                projections={activeProjections}
                country={activeCountry}
              />
              <FiscalScissorsChart
                projections={activeProjections}
                country={activeCountry}
              />
            </div>

            {/* Fourth Row: Debt Maturity Profile & Quick Simulation Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <DebtMaturityProfileChart
                  projections={activeProjections}
                  country={activeCountry}
                />
              </div>

              {/* Quick Policy Adjustment Widget in Arabic */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between text-right">
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      محاكاة السياسات السريعة
                    </h3>
                    <button
                      onClick={() => setActiveTab('simulation')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                    >
                      <span>المختبر الكامل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    تحريك المتغيرات لمعاينة أثر السياسات على مسار مديونية {activeCountry.name} فورياً:
                  </p>

                  <div className="space-y-3.5">
                    {/* Real Growth */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-700 font-sans font-bold">نمو الناتج الحقيقي</span>
                        <span className="font-bold tabular-nums text-slate-900">{activeScenario.macro.realGdpGrowth.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="-2.0"
                        max="8.0"
                        step="0.1"
                        value={activeScenario.macro.realGdpGrowth}
                        onChange={(e) =>
                          setActiveScenario({
                            ...activeScenario,
                            macro: {
                              ...activeScenario.macro,
                              realGdpGrowth: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                      />
                    </div>

                    {/* Borrowing Cost */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-700 font-sans font-bold">عائد السندات السيادية</span>
                        <span className="font-bold tabular-nums text-slate-900">{activeScenario.macro.sovereignInterestRate.toFixed(2)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="14.0"
                        step="0.1"
                        value={activeScenario.macro.sovereignInterestRate}
                        onChange={(e) =>
                          setActiveScenario({
                            ...activeScenario,
                            macro: {
                              ...activeScenario.macro,
                              sovereignInterestRate: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                      />
                    </div>

                    {/* VAT Rate */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-700 font-sans font-bold">ضريبة القيمة المضافة / الاستهلاك</span>
                        <span className="font-bold tabular-nums text-slate-900">{activeScenario.tax.vatStandardRate.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="28.0"
                        step="0.5"
                        value={activeScenario.tax.vatStandardRate}
                        onChange={(e) =>
                          setActiveScenario({
                            ...activeScenario,
                            tax: {
                              ...activeScenario.tax,
                              vatStandardRate: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-sans">
                    الدين في 2032: <strong className="text-slate-900 font-mono tabular-nums">{terminalActive.debtToGdp.toFixed(1)}%</strong>
                  </span>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="text-amber-700 hover:text-amber-800 font-bold"
                  >
                    إصدار التقرير الوزاري ←
                  </button>
                </div>
              </div>
            </div>

            {/* Fifth Row: Fiscal Rules & Space Compliance */}
            <FiscalRulesCompliance
              projections={activeProjections}
              dsa={dsaAssessment}
              debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
              country={activeCountry}
            />
          </div>
        )}

        {/* TAB 2: POLICY SIMULATION LAB */}
        {activeTab === 'simulation' && (
          <div className="space-y-4 sm:space-y-6">
            <InteractiveSliders
              scenario={activeScenario}
              onUpdateScenario={(updated) => setActiveScenario(updated)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtTrajectoryChart
                projections={activeProjections}
                baselineProjections={baselineProjections}
                debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
                country={activeCountry}
              />
              <DebtFanChart
                projections={activeProjections}
                debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
                country={activeCountry}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtStabilizingGapChart
                projections={activeProjections}
                country={activeCountry}
              />
              <FiscalImpulseChart
                projections={activeProjections}
                country={activeCountry}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtDynamicsWaterfall projections={activeProjections} />
              <GrossFinancingNeedsChart projections={activeProjections} country={activeCountry} />
            </div>
          </div>
        )}

        {/* TAB 3: TAX REVENUE TRENDS & COMPOSITION */}
        {activeTab === 'tax_breakdown' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TaxRevenueChart projections={activeProjections} country={activeCountry} />
              <FiscalScissorsChart projections={activeProjections} country={activeCountry} />
            </div>

            {/* Tax Buoyancy Chart */}
            <TaxBuoyancyChart projections={activeProjections} country={activeCountry} />

            {/* Revenue Policy Levers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs text-right">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  الضرائب المباشرة والشركات
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700 font-sans font-bold">
                        {activeCountry.id === 'sau' ? 'ضرائب الشركات والزكاة' : 'ضريبة دخل الشركات (CIT)'}
                      </span>
                      <span className="font-bold tabular-nums">{activeScenario.tax.corporateTaxRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="35.0"
                      step="0.5"
                      value={activeScenario.tax.corporateTaxRate}
                      onChange={(e) =>
                        setActiveScenario({
                          ...activeScenario,
                          tax: { ...activeScenario.tax, corporateTaxRate: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                    />
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      حصيلة 2032 المتوقعة: <span className="font-mono font-bold">{formatCurrency(terminalActive.taxRevenue.corporate, activeCountry.currencySymbol)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700 font-sans font-bold">
                        {activeCountry.personalTax === 0 ? 'ضريبة دخل الأفراد (غير مفروضة)' : 'ضريبة دخل الأفراد (PIT)'}
                      </span>
                      <span className="font-bold tabular-nums">{activeScenario.tax.personalIncomeTaxRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="35.0"
                      step="0.5"
                      value={activeScenario.tax.personalIncomeTaxRate}
                      onChange={(e) =>
                        setActiveScenario({
                          ...activeScenario,
                          tax: { ...activeScenario.tax, personalIncomeTaxRate: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                    />
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      حصيلة 2032: <span className="font-mono font-bold">{formatCurrency(terminalActive.taxRevenue.personal, activeCountry.currencySymbol)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs text-right">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  ضرائب الاستهلاك والتجارة
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700 font-sans font-bold">ضريبة القيمة المضافة / الاستهلاك</span>
                      <span className="font-bold tabular-nums">{activeScenario.tax.vatStandardRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="28.0"
                      step="0.5"
                      value={activeScenario.tax.vatStandardRate}
                      onChange={(e) =>
                        setActiveScenario({
                          ...activeScenario,
                          tax: { ...activeScenario.tax, vatStandardRate: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                    />
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      حصيلة 2032: <span className="font-mono font-bold">{formatCurrency(terminalActive.taxRevenue.vat, activeCountry.currencySymbol)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700 font-sans font-bold">الرسوم الجمركية والضرائب الانتقائية</span>
                      <span className="font-bold tabular-nums">{activeScenario.tax.customsExciseRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="8.0"
                      step="0.1"
                      value={activeScenario.tax.customsExciseRate}
                      onChange={(e) =>
                        setActiveScenario({
                          ...activeScenario,
                          tax: { ...activeScenario.tax, customsExciseRate: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                    />
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      حصيلة 2032: <span className="font-mono font-bold">{formatCurrency(terminalActive.taxRevenue.customs, activeCountry.currencySymbol)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs text-right">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  الإدارة الضريبية والموارد السيادية
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700 font-sans font-bold">مؤشر الامتثال والفوترة الإلكترونية</span>
                      <span className="font-bold tabular-nums">{activeScenario.tax.taxComplianceEfficiency}%</span>
                    </div>
                    <input
                      type="range"
                      min="85"
                      max="125"
                      step="1"
                      value={activeScenario.tax.taxComplianceEfficiency}
                      onChange={(e) =>
                        setActiveScenario({
                          ...activeScenario,
                          tax: { ...activeScenario.tax, taxComplianceEfficiency: parseInt(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                    />
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      مكاسب التحصيل: {activeScenario.tax.taxComplianceEfficiency >= 100 ? `+${activeScenario.tax.taxComplianceEfficiency - 100}%` : `-${100 - activeScenario.tax.taxComplianceEfficiency}%`}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700 font-sans font-bold">نمو الإيرادات غير الضريبية سنوياً</span>
                      <span className="font-bold tabular-nums">{activeScenario.tax.nonTaxRevenueGrowth.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-5.0"
                      max="8.0"
                      step="0.5"
                      value={activeScenario.tax.nonTaxRevenueGrowth}
                      onChange={(e) =>
                        setActiveScenario({
                          ...activeScenario,
                          tax: { ...activeScenario.tax, nonTaxRevenueGrowth: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded"
                    />
                    <div className="text-[11px] text-slate-600 mt-1 font-sans">
                      إيرادات 2032 غير الضريبية: <span className="font-mono font-bold">{formatCurrency(terminalActive.nonTaxRevenue, activeCountry.currencySymbol)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEBT DYNAMICS & AMORTIZATION */}
        {activeTab === 'debt_dynamics' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtDynamicsWaterfall projections={activeProjections} />
              <DebtMaturityProfileChart projections={activeProjections} country={activeCountry} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <GrossFinancingNeedsChart projections={activeProjections} country={activeCountry} />
              <DebtFanChart
                projections={activeProjections}
                debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
                country={activeCountry}
              />
            </div>

            <FiscalRulesCompliance
              projections={activeProjections}
              dsa={dsaAssessment}
              debtCeiling={activeScenario.fiscalRule.debtGdpCeiling}
              country={activeCountry}
            />
          </div>
        )}

        {/* TAB 5: FISCAL STANCE & DEBT STABILIZATION */}
        {activeTab === 'fiscal_stance' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DebtStabilizingGapChart
                projections={activeProjections}
                country={activeCountry}
              />
              <FiscalImpulseChart
                projections={activeProjections}
                country={activeCountry}
              />
            </div>

            {/* In-depth Public Finance & Macroeconomic Rigor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-right">
              {/* Card 1: Domar Condition & Snowball Effect */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
                    <Scale className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    شرط دومار ومعادلة ديناميكية الدين
                  </h4>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-sans">
                  <p>
                    تتحكم في نسبة الدين معادلة الاستدامة السيادية:
                  </p>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 text-center">
                    Δd = -pb + d · (r - g) / (1 + g)
                  </div>
                  <p>
                    فارق العائد والنمو الحالي لـ <strong>{activeCountry.name}</strong> هو{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {(activeCountry.sovereignInterestRate - activeScenario.macro.realGdpGrowth).toFixed(2)}%
                    </span>.
                    {activeCountry.sovereignInterestRate <= activeScenario.macro.realGdpGrowth ? (
                      <span className="text-emerald-700 font-bold block mt-1">
                        ✓ النمو يفوق الفائدة (r &lt; g): الدين ينخفض تلقائياً حتى مع عجز أولي طفيف.
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold block mt-1">
                        ! الفائدة تفوق النمو (r &gt; g): يتطلب تثبيت الدين توليد فائض أولي موجب حتماً.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Card 2: Required Fiscal Effort */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    الرصيد الأولي المستهدف والجهد المالي
                  </h4>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-sans">
                  <p>
                    الرصيد الأولي المثبت للدين المطلوب في 2032 هو:{' '}
                    <strong className="font-mono text-slate-900 text-sm">
                      {formatPercent(terminalActive.debtStabilizingPbToGdp)}
                    </strong> من الناتج.
                  </p>
                  <p>
                    الرصيد الأولي المتوقع وفق هذا السيناريو:{' '}
                    <strong className="font-mono text-slate-900 text-sm">
                      {formatPercent(terminalActive.primaryBalanceToGdp)}
                    </strong>.
                  </p>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-0.5">فجوة التثبيت (Stabilization Margin):</span>
                    <span className={`font-mono font-bold text-sm ${terminalActive.stabilizationGap >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {terminalActive.stabilizationGap >= 0
                        ? `+${terminalActive.stabilizationGap.toFixed(2)}% فائض انحداري آمن`
                        : `${terminalActive.stabilizationGap.toFixed(2)}% فجوة تتطلب ضبطاً إضافياً`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: CAPB & Discretionary Fiscal Policy */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md">
                    <Activity className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    الموقف المالي والمثبتات التلقائية (CAPB)
                  </h4>
                </div>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-sans">
                  <p>
                    وفق منهجية صندوق النقد الدولي، يعزل مؤشر الميزان المعدل دورياً (CAPB) الإيرادات والنفقات المرتبطة بتقلبات الدورة الاقتصادية.
                  </p>
                  <p>
                    متوسط الحافز المالي التقديري للسنوات القادمة يعكس توجهاً{' '}
                    <strong className="text-slate-900 font-bold">
                      {terminalActive.fiscalImpulse >= 0 ? 'توسعياً استثمارياً' : 'انضباطياً هيكلياً'}
                    </strong>{' '}
                    يهدف لتحقيق التوازن بين دعم النمو الاقتصادي وضمان استدامة الملاءة السيادية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STRESS TESTING MATRIX */}
        {activeTab === 'stress_testing' && (
          <div className="space-y-4 sm:space-y-6">
            <StressTestingMatrix scenario={activeScenario} country={activeCountry} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-right">
              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  مخاطر الاقتصاد الكلي لاستدامة الدين العام ({activeCountry.name})
                </h4>
                <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
                  <p>
                    • <strong>مخاطر اتساع فروق العوائد:</strong> يؤدي ارتفاع عوائد الاقتراض السيادي بمقدار 150 نقطة أساس
                    إلى زيادة إضافية في عبء الدين العام بنسبة تتراوح بين <strong>+2.5% إلى +3.8% من الناتج</strong> بحلول 2032.
                  </p>
                  <p>
                    • <strong>صدمات تباطؤ النمو:</strong> يؤدي انخفاض النمو الحقيقي بمقدار 1.0% إلى تراجع التوسع الطبيعي للمقام وتراجع مرونة الحصيلة الضريبية.
                  </p>
                  <p>
                    • <strong>المرتكز التشريعي:</strong> يبلغ سقف الأمان التشريعي المعتمد حالياً{' '}
                    <strong className="text-slate-900 font-mono">{activeScenario.fiscalRule.debtGdpCeiling.toFixed(1)}% من الناتج</strong>{' '}
                    وفق مستهدفات {activeCountry.statutoryFiscalRule.ruleName}.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">
                    القيمة المهنية والتحليلية للمنظومة
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    توفر هذه المنصة نموذج محاكاة سيادية شامل يدمج بين إطار المالية العامة متوسط الأجل (MTFF)
                    ومعايير صندوق النقد الدولي (IMF DSA) ومخططات المروحة الاحتمالية (Fan Charts) ومحددات الانضباط المالي الوطني.
                    تتيح المنظومة للمختصين وصناع القرار اختبار السيناريوهات وتوليد ملفات PDF رسمية معتمدة.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-sans">
                    التصنيف السيادي: <strong className="text-slate-800 font-mono">{activeCountry.creditRating}</strong>
                  </span>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    تصدير التقرير الرسمي المعتمد
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer in Arabic */}
      <footer className="border-t border-slate-200 bg-white py-5 sm:py-6 mt-8 sm:mt-12 text-xs text-slate-500 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">منظومة التخطيط المالي متوسط الأجل (MTFF)</span>
            <span>·</span>
            <span>معايرة ومطابقة لقواعد بيانات صندوق النقد الدولي (IMF WEO) ومنظمة OECD</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-600">
            <button
              onClick={() => setIsImfModalOpen(true)}
              className="text-amber-700 hover:text-amber-800 font-bold underline flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>توثيق البيانات والمصادر</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsDataTableOpen(true)}
              className="text-slate-800 hover:text-slate-950 font-bold underline"
            >
              تصدير جدول البيانات (CSV)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-slate-800 hover:text-slate-950 font-bold underline"
            >
              طباعة ملف PDF الوزاري
            </button>
          </div>
        </div>
      </footer>

      {/* Stakeholder PDF Dossier Modal */}
      <StakeholderReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        scenario={activeScenario}
        baselineScenario={baselineScenario}
        projections={activeProjections}
        baselineProjections={baselineProjections}
        dsa={dsaAssessment}
        country={activeCountry}
      />

      {/* Data Table & CSV Export Modal */}
      <DataTableModal
        isOpen={isDataTableOpen}
        onClose={() => setIsDataTableOpen(false)}
        projections={activeProjections}
        scenarioName={activeScenario.name}
        country={activeCountry}
      />

      {/* IMF Data Provenance Modal */}
      <ImfDataProvenanceModal
        isOpen={isImfModalOpen}
        onClose={() => setIsImfModalOpen(false)}
        onSelectCountry={handleSelectCountry}
        activeCountryId={activeCountry.id}
      />
    </div>
  );
}
