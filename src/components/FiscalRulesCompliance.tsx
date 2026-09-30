import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { CountryProfile, DsaAssessment, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface FiscalRulesComplianceProps {
  projections: YearlyFiscalData[];
  dsa: DsaAssessment;
  debtCeiling: number;
  country: CountryProfile;
}

export const FiscalRulesCompliance: React.FC<FiscalRulesComplianceProps> = ({
  projections,
  dsa,
  debtCeiling,
  country,
}) => {
  const terminalYear = projections[projections.length - 1];

  const netBorrowing = Math.max(0, -terminalYear.overallBalance);
  const capitalExpenditure = terminalYear.primaryExpenditure.capital;
  const satisfiesGoldenRule = netBorrowing <= capitalExpenditure;

  const satisfiesDeficitRule =
    terminalYear.overallBalanceToGdp >= country.statutoryFiscalRule.overallDeficitCeiling;

  const satisfiesDebtRule = terminalYear.debtToGdp <= debtCeiling;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs text-right">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">{country.flagEmoji}</span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            مراقبة الامتثال للقواعد والأسقف المالية
          </h3>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {country.name}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          التدقيق المالي وفق {country.statutoryFiscalRule.ruleName} ومستهدف الرصيد الأولي المثبت للدين
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rule 1: Debt Ceiling */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                سقف نسبة الدين العام / الناتج
              </span>
              {satisfiesDebtRule ? (
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> ملتزم بالسقف
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> تجاوز السقف
                </span>
              )}
            </div>
            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span className="font-sans">السقف التشريعي:</span>
                <span className="font-bold text-slate-800">{debtCeiling.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">الدين بنهاية 2032:</span>
                <span className={`font-bold ${satisfiesDebtRule ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {terminalYear.debtToGdp.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-1">
                <span className="font-sans">المساحة المالية المتاحة:</span>
                <span className={`font-bold ${dsa.distanceToCeiling >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatPercent(dsa.distanceToCeiling, true)} ناتج
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-600 font-sans">
            يعادل هامش أمان سيادي بقيمة{' '}
            <strong className="text-slate-800 font-mono">
              {formatCurrency(
                Math.abs((dsa.distanceToCeiling * terminalYear.nominalGdp) / 100),
                country.currencySymbol
              )}
            </strong>.
          </div>
        </div>

        {/* Rule 2: Deficit Ceiling */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                سقف عجز الموازنة ({country.statutoryFiscalRule.overallDeficitCeiling.toFixed(1)}%)
              </span>
              {satisfiesDeficitRule ? (
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> منضبط
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> متجاوز للحد
                </span>
              )}
            </div>
            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span className="font-sans">الحد الأقصى للعجز:</span>
                <span className="font-bold text-slate-800">
                  {country.statutoryFiscalRule.overallDeficitCeiling.toFixed(1)}% ناتج
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">العجز المتوقع 2032:</span>
                <span className={`font-bold ${satisfiesDeficitRule ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatPercent(terminalYear.overallBalanceToGdp, true)} ناتج
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-1">
                <span className="font-sans">فاتورة فوائد الدين:</span>
                <span className="text-slate-800 font-semibold">
                  {formatPercent(terminalYear.interestPaymentToGdp)} ناتج
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-600 font-sans">
            {satisfiesDeficitRule
              ? 'ضمن حدود الاستقرار المالي والانضباط الكلي.'
              : 'يتطلب ترشيد نفقات أو خفض تكلفة الاقتراض السيادي.'}
          </div>
        </div>

        {/* Rule 3: Debt-Stabilizing Balance */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                الرصيد الأولي المثبت للدين (pb*)
              </span>
              {dsa.fiscalGap >= 0 ? (
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> مسار مستقر
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> فجوة تصحيح
                </span>
              )}
            </div>
            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span className="font-sans">المستهدف لتثبيت الدين:</span>
                <span className="font-bold text-slate-800">
                  {formatPercent(dsa.debtStabilizingPrimaryBalance, true)} ناتج
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">الرصيد الأولي المحاكى:</span>
                <span className="font-bold text-slate-800">
                  {formatPercent(dsa.currentPrimaryBalance, true)} ناتج
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-1">
                <span className="font-sans">الفجوة المالية (Gap):</span>
                <span className={`font-bold ${dsa.fiscalGap >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatPercent(dsa.fiscalGap, true)} ناتج
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-600 font-sans">
            {dsa.fiscalGap >= 0
              ? 'يحافظ المسار الحالي على ثبات نسبة الدين العام أو تراجعها.'
              : `يلزم تصحيح مالي بمقدار ${Math.abs(dsa.fiscalGap).toFixed(1)}% من الناتج لمنع تفاقم الدين.`}
          </div>
        </div>
      </div>
    </div>
  );
};
