import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  Building,
  Target,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FiscalScenario } from '../types/fiscal';

interface InteractiveSlidersProps {
  scenario: FiscalScenario;
  onUpdateScenario: (updated: FiscalScenario) => void;
}

export const InteractiveSliders: React.FC<InteractiveSlidersProps> = ({
  scenario,
  onUpdateScenario,
}) => {
  const [activeCategory, setActiveCategory] = useState<'macro' | 'tax' | 'expenditure' | 'rule'>('macro');

  const updateMacro = (key: keyof FiscalScenario['macro'], value: number) => {
    onUpdateScenario({
      ...scenario,
      macro: {
        ...scenario.macro,
        [key]: value,
      },
    });
  };

  const updateTax = (key: keyof FiscalScenario['tax'], value: number) => {
    onUpdateScenario({
      ...scenario,
      tax: {
        ...scenario.tax,
        [key]: value,
      },
    });
  };

  const updateExp = (key: keyof FiscalScenario['expenditure'], value: number) => {
    onUpdateScenario({
      ...scenario,
      expenditure: {
        ...scenario.expenditure,
        [key]: value,
      },
    });
  };

  const updateRule = (key: keyof FiscalScenario['fiscalRule'], value: number) => {
    onUpdateScenario({
      ...scenario,
      fiscalRule: {
        ...scenario.fiscalRule,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden text-right">
      {/* Category selector: 2x2 grid on mobile for instant visibility, flex on tablet/desktop */}
      <div className="border-b border-slate-200 bg-slate-50/90 p-2">
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-1.5 gap-1.5">
          <button
            onClick={() => setActiveCategory('macro')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 text-xs font-bold rounded-md transition-colors min-h-[40px] ${
              activeCategory === 'macro'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white sm:bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 border sm:border-transparent border-slate-200/80'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">الاقتصاد الكلي</span>
          </button>

          <button
            onClick={() => setActiveCategory('tax')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 text-xs font-bold rounded-md transition-colors min-h-[40px] ${
              activeCategory === 'tax'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white sm:bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 border sm:border-transparent border-slate-200/80'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">السياسة الضريبية</span>
          </button>

          <button
            onClick={() => setActiveCategory('expenditure')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 text-xs font-bold rounded-md transition-colors min-h-[40px] ${
              activeCategory === 'expenditure'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white sm:bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 border sm:border-transparent border-slate-200/80'
            }`}
          >
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">الإنفاق العام</span>
          </button>

          <button
            onClick={() => setActiveCategory('rule')}
            className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 text-xs font-bold rounded-md transition-colors min-h-[40px] ${
              activeCategory === 'rule'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white sm:bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 border sm:border-transparent border-slate-200/80'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">الأسقف والقواعد</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-5">
        {/* MACRO SECTION */}
        {activeCategory === 'macro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Real GDP Growth */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  معدل نمو الناتج المحلي الحقيقي (سنوي)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.macro.realGdpGrowth.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="8.0"
                step="0.1"
                value={scenario.macro.realGdpGrowth}
                onChange={(e) => updateMacro('realGdpGrowth', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateMacro('realGdpGrowth', -1.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  ركود (-1.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('realGdpGrowth', 2.7)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  معتدل (2.7%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('realGdpGrowth', 6.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  طفرة (+6.0%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                يتحكم في توسيع مقام نسبة الدين إلى الناتج ونمو الحصيلة الضريبية العضوية.
              </p>
            </div>

            {/* Inflation (GDP Deflator) */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  معدل التضخم (مخفض الناتج المحلي)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.macro.inflationRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.1"
                value={scenario.macro.inflationRate}
                onChange={(e) => updateMacro('inflationRate', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateMacro('inflationRate', 1.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  انحسار (1.0%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('inflationRate', 2.2)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  المستهدف (2.2%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('inflationRate', 7.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  ضغوط (7.5%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                يقلص القيمة الحقيقية للدين في الأجل القصير ولكنه يزيد تكاليف تجديد السندات.
              </p>
            </div>

            {/* Sovereign Interest Rate */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  متوسط عائد الاقتراض السيادي الفعلي (10 سنوات)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.macro.sovereignInterestRate.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="14.0"
                step="0.1"
                value={scenario.macro.sovereignInterestRate}
                onChange={(e) => updateMacro('sovereignInterestRate', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateMacro('sovereignInterestRate', 2.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  تيسيري (2.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('sovereignInterestRate', 4.8)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  قياسي (4.8%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('sovereignInterestRate', 9.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-rose-700"
                >
                  صدمة أسواق (9.0%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                عائد السندات والصكوك السيادية؛ كل زيادة بنسبة 1% ترفع فاتورة خدمة الدين.
              </p>
            </div>

            {/* FX Depreciation Rate */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  معدل التغير في سعر الصرف أمام الدولار
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.macro.fxDepreciationRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="15.0"
                step="0.5"
                value={scenario.macro.fxDepreciationRate}
                onChange={(e) => updateMacro('fxDepreciationRate', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateMacro('fxDepreciationRate', 0.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  ربط ثابت (0.0%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('fxDepreciationRate', 5.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  مرونة (5.0%)
                </button>
                <button
                  type="button"
                  onClick={() => updateMacro('fxDepreciationRate', 12.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-rose-700"
                >
                  انخفاض حاد (12%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                يؤثر مباشرة على تقييم حصة الدين المقومة بالنقد الأجنبي ({scenario.macro.foreignDebtShare.toFixed(0)}% من الإجمالي).
              </p>
            </div>
          </div>
        )}

        {/* TAX POLICY SECTION */}
        {activeCategory === 'tax' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* VAT Rate */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  المعدل العام لضريبة القيمة المضافة / الاستهلاك
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.tax.vatStandardRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="25.0"
                step="0.5"
                value={scenario.tax.vatStandardRate}
                onChange={(e) => updateTax('vatStandardRate', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateTax('vatStandardRate', 5.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  5.0% (الإمارات/عُمان)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('vatStandardRate', 15.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  15.0% (السعودية)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('vatStandardRate', 20.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  20.0% (أوروبا)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ركيزة الإيرادات غير النفطية والاستهلاكية الأكثر استقراراً وموثوقية في التحصيل.
              </p>
            </div>

            {/* Corporate Income Tax */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  معدل ضريبة أرباح الشركات والكيانات التجارية
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.tax.corporateTaxRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="35.0"
                step="0.5"
                value={scenario.tax.corporateTaxRate}
                onChange={(e) => updateTax('corporateTaxRate', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateTax('corporateTaxRate', 9.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  9.0% (الإمارات)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('corporateTaxRate', 20.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  20.0% (السعودية)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('corporateTaxRate', 25.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  25.0% (OECD)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                ضرائب الشركات والزكاة؛ الموازنة بين تنافسية بيئة الأعمال وتوليد الموارد السيادية.
              </p>
            </div>

            {/* Tax Compliance Efficiency */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  كفاءة الامتثال والفوترة الإلكترونية (مؤشر 100 = الأساس)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.tax.taxComplianceEfficiency}%
                </span>
              </div>
              <input
                type="range"
                min="85"
                max="125"
                step="1"
                value={scenario.tax.taxComplianceEfficiency}
                onChange={(e) => updateTax('taxComplianceEfficiency', parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateTax('taxComplianceEfficiency', 90)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  فجوة امتثال (90%)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('taxComplianceEfficiency', 100)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  الأساس (100%)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('taxComplianceEfficiency', 115)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-emerald-700 font-bold"
                >
                  رقمنة متكاملة (115%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                مكاسب التحصيل من خلال الفوترة الإلكترونية ومكافحة التهرب دون رفع المعدلات.
              </p>
            </div>

            {/* Non-Tax Revenue Growth */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  معدل نمو الإيرادات السيادية غير الضريبية والنفطية
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.tax.nonTaxRevenueGrowth.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="-5.0"
                max="10.0"
                step="0.5"
                value={scenario.tax.nonTaxRevenueGrowth}
                onChange={(e) => updateTax('nonTaxRevenueGrowth', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateTax('nonTaxRevenueGrowth', -3.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  هبوط سلع (-3.0%)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('nonTaxRevenueGrowth', 3.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  متوازن (3.0%)
                </button>
                <button
                  type="button"
                  onClick={() => updateTax('nonTaxRevenueGrowth', 8.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-emerald-700"
                >
                  انتعاش (+8.0%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                توزيعات الأرباح للشركات العامة، عوائد الصناديق السيادية، والنفط والغاز.
              </p>
            </div>
          </div>
        )}

        {/* EXPENDITURE SECTION */}
        {activeCategory === 'expenditure' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Wage Bill Share */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  فاتورة أجور وتعويضات العاملين بالقطاع العام (% ناتج)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.expenditure.wageBillGdpShare.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="6.0"
                max="18.0"
                step="0.2"
                value={scenario.expenditure.wageBillGdpShare}
                onChange={(e) => updateExp('wageBillGdpShare', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateExp('wageBillGdpShare', 7.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  كفاءة عالية (7.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('wageBillGdpShare', 10.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  متوسط (10.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('wageBillGdpShare', 15.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-rose-700"
                >
                  عبء مرتفع (15%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                أكبر بند إنفاق أولي؛ ضبطه يوفر مساحة مالية حيوية للمشاريع التنموية.
              </p>
            </div>

            {/* Social Transfers */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  المنافع الاجتماعية والإعانات الموجهة (% ناتج)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.expenditure.socialTransfersGdpShare.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="16.0"
                step="0.2"
                value={scenario.expenditure.socialTransfersGdpShare}
                onChange={(e) => updateExp('socialTransfersGdpShare', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateExp('socialTransfersGdpShare', 5.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  استهداف دقيق (5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('socialTransfersGdpShare', 8.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  تغطية واسعة (8.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('socialTransfersGdpShare', 13.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-amber-700"
                >
                  شامل (13%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                برامج الدعم الاجتماعي (مثل حساب المواطن والضمان الاجتماعي) وشبكات الأمان.
              </p>
            </div>

            {/* Capital Expenditure (CAPEX) */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  الإنفاق الرأسمالي والاستثماري العام (% ناتج)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.expenditure.capitalExpenditureGdpShare.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.2"
                value={scenario.expenditure.capitalExpenditureGdpShare}
                onChange={(e) => updateExp('capitalExpenditureGdpShare', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateExp('capitalExpenditureGdpShare', 3.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  صيانة أساسية (3.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('capitalExpenditureGdpShare', 5.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  متوازن (5.5%)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('capitalExpenditureGdpShare', 9.5)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-emerald-700 font-bold"
                >
                  تسريع استثماري (9.5%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                مشاريع البنية التحتية، التحول الرقمي، والاستراتيجيات التنموية الكبرى.
              </p>
            </div>

            {/* Fiscal Multiplier */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  مضاعف الاستثمار العام على النمو (Multiplier)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.expenditure.capitalMultiplier.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={scenario.expenditure.capitalMultiplier}
                onChange={(e) => updateExp('capitalMultiplier', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateExp('capitalMultiplier', 0.15)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  تسرب واردات (0.15x)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('capitalMultiplier', 0.25)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  متوسط (0.25x)
                </button>
                <button
                  type="button"
                  onClick={() => updateExp('capitalMultiplier', 0.45)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors text-emerald-700"
                >
                  عائد مرتفع (0.45x)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                معدل تحويل كل 1% إنفاق استثماري إضافي إلى نمو حقيقي في الناتج المحلي الإجمالي.
              </p>
            </div>
          </div>
        )}

        {/* FISCAL RULES SECTION */}
        {activeCategory === 'rule' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Debt/GDP Ceiling */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  سقف الانضباط المالي للدين العام (% ناتج)
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.fiscalRule.debtGdpCeiling.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="20.0"
                max="120.0"
                step="5.0"
                value={scenario.fiscalRule.debtGdpCeiling}
                onChange={(e) => updateRule('debtGdpCeiling', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateRule('debtGdpCeiling', 40.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  تحفظي (40%)
                </button>
                <button
                  type="button"
                  onClick={() => updateRule('debtGdpCeiling', 60.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  معياري (60%)
                </button>
                <button
                  type="button"
                  onClick={() => updateRule('debtGdpCeiling', 90.0)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  متقدم (90%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                السقف الاحترازي المعتمد في استراتيجية الدين العام لضمان الملاءة والجدارة الائتمانية.
              </p>
            </div>

            {/* Target Year */}
            <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-800">
                  السنة المستهدفة لتحقيق الانضباط التام
                </label>
                <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {scenario.fiscalRule.targetYear}
                </span>
              </div>
              <input
                type="range"
                min="2026"
                max="2032"
                step="1"
                value={scenario.fiscalRule.targetYear}
                onChange={(e) => updateRule('targetYear', parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg touch-pan-y"
              />
              <div className="flex items-center justify-between gap-1 pt-1 text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={() => updateRule('targetYear', 2027)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  2027
                </button>
                <button
                  type="button"
                  onClick={() => updateRule('targetYear', 2030)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors font-bold text-slate-700"
                >
                  2030 (الرؤية)
                </button>
                <button
                  type="button"
                  onClick={() => updateRule('targetYear', 2032)}
                  className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  2032 (الكامل)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                تاريخ قياس مساحة الأمان المالية وهامش المناورة المتاح للميزانية العامة للدولة.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
