import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Percent,
} from 'lucide-react';
import { CountryProfile, DsaAssessment, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent, translateDsaRisk } from '../utils/fiscalCalculations';

interface KpiMetricsRowProps {
  projections: YearlyFiscalData[];
  dsa: DsaAssessment;
  debtCeiling: number;
  country: CountryProfile;
}

export const KpiMetricsRow: React.FC<KpiMetricsRowProps> = ({
  projections,
  dsa,
  debtCeiling,
  country,
}) => {
  const baseYear = projections[0];
  const terminalYear = projections[projections.length - 1];

  const debtDelta = terminalYear.debtToGdp - baseYear.debtToGdp;
  const isDebtRising = debtDelta > 0.1;

  // متوسط فارق سعر الفائدة عن النمو (أثر كرة الثلج)
  const avgSnowball =
    projections.slice(1).reduce((acc, p) => {
      const g = p.realGdpGrowth + p.inflation;
      return acc + ((p.interestPaymentToGdp * 100) / p.debtToGdp - g);
    }, 0) / (projections.length - 1);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Moderate':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'High':
        return 'text-orange-800 bg-orange-50 border-orange-200';
      case 'Critical':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 text-right">
      {/* 1. نسبة الدين إلى الناتج المحلي الإجمالي */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">الدين إلى الناتج (2032)</span>
            <span className="font-mono tabular-nums text-[10px] sm:text-[11px] text-slate-400">
              2024: {baseYear.debtToGdp.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-950">
              {terminalYear.debtToGdp.toFixed(1)}%
            </span>
            <span
              className={`text-[10px] sm:text-xs font-bold font-mono tabular-nums flex items-center ${
                isDebtRising ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {isDebtRising ? (
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline ml-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline ml-0.5" />
              )}
              {formatPercent(debtDelta, true)}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>السقف ({debtCeiling.toFixed(0)}%):</span>
          <span className={`font-semibold font-mono ${terminalYear.debtToGdp <= debtCeiling ? 'text-emerald-600' : 'text-rose-600'}`}>
            {dsa.distanceToCeiling >= 0 ? `+${dsa.distanceToCeiling.toFixed(1)}% أمان` : `${Math.abs(dsa.distanceToCeiling).toFixed(1)}% تجاوز`}
          </span>
        </div>
      </div>

      {/* 2. الرصيد المالي الأولي */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">الرصيد الأولي (2032)</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:inline">
              {formatCurrency(terminalYear.primaryBalance, country.currencySymbol)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${
                terminalYear.primaryBalanceToGdp >= 0
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {formatPercent(terminalYear.primaryBalanceToGdp, true)}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">من الناتج</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>الرصيد الكلي:</span>
          <span className="font-mono tabular-nums text-slate-700 font-bold">
            {formatPercent(terminalYear.overallBalanceToGdp, true)}
          </span>
        </div>
      </div>

      {/* 3. الإيرادات الضريبية كنسبة من الناتج */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">الضرائب / الناتج</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:inline">
              {formatCurrency(terminalYear.taxRevenue.totalTax, country.currencySymbol)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-950">
              {((terminalYear.taxRevenue.totalTax / terminalYear.nominalGdp) * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-bold font-mono tabular-nums">
              +{(
                (terminalYear.taxRevenue.totalTax / terminalYear.nominalGdp) * 100 -
                (baseYear.taxRevenue.totalTax / baseYear.nominalGdp) * 100
              ).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="mt-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>إجمالي الإيرادات:</span>
          <span className="font-mono tabular-nums text-slate-700 font-bold">
            {terminalYear.revenueToGdp.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 4. أثر كرة الثلج (r - g) */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">الفائدة والنمو (r - g)</span>
            <span className="font-mono tabular-nums text-[10px] sm:text-[11px] text-slate-400 hidden sm:inline">
              r: {country.sovereignInterestRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${
                avgSnowball <= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatPercent(avgSnowball, true)}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">
              {avgSnowball <= 0 ? 'انحداري آمن' : 'كرة الثلج'}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>المثبت (p*):</span>
          <span className="font-mono tabular-nums text-slate-700 font-bold">
            {formatPercent(dsa.debtStabilizingPrimaryBalance, true)}
          </span>
        </div>
      </div>

      {/* 5. تقييم استدامة الدين (DSA) - Full width on 2-col mobile */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">استدامة الدين (IMF DSA)</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">معيار النقد الدولي</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`px-2.5 py-0.5 rounded text-xs sm:text-sm font-bold border ${getRiskBadge(
                dsa.overallRisk
              )}`}
            >
              مخاطر {translateDsaRisk(dsa.overallRisk)}
            </span>
          </div>
        </div>
        <div className="mt-2 text-[10px] sm:text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>التصنيف الائتماني:</span>
          <span className="font-mono tabular-nums text-slate-700 font-bold text-[11px] truncate max-w-[130px]" title={country.creditRating}>
            {country.creditRating.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
