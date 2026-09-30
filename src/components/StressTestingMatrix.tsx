import React from 'react';
import { CountryProfile, FiscalScenario } from '../types/fiscal';
import { computeStressMatrix, StressMatrixRow } from '../utils/fiscalCalculations';

interface StressTestingMatrixProps {
  scenario: FiscalScenario;
  country: CountryProfile;
}

export const StressTestingMatrix: React.FC<StressTestingMatrixProps> = ({ scenario, country }) => {
  const { rateShockOffsets, matrix } = computeStressMatrix(scenario, country);

  const getCellBg = (debtRatio: number) => {
    const baseDebt = country.debtToGdp;
    if (debtRatio <= baseDebt - 5.0) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (debtRatio <= baseDebt + 3.0) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (debtRatio <= baseDebt + 10.0) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (debtRatio <= baseDebt + 18.0) return 'bg-orange-100 text-orange-900 border-orange-300';
    return 'bg-rose-100 text-rose-900 border-rose-300';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      <div className="mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{country.flagEmoji}</span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            مصفوفة اختبارات الإجهاد والحساسية الاقتصادية الكلية
          </h3>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            {country.name}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
          نسبة الدين العام المتوقعة بنهاية 2032 تحت صدمات متزامنة في نمو الناتج الحقيقي وعوائد الاقتراض
        </p>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/80 mb-2 font-medium">
        اسحب الجدول أفقياً لمشاهدة جميع صدمات أسعار الفائدة والنمو
      </div>

      {/* 2D Matrix Table in Arabic with smooth horizontal scroll */}
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-center border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="p-2 sm:p-3 text-[11px] sm:text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 uppercase tracking-wider text-right min-w-[130px]"
              >
                صدمة نمو الناتج الحقيقي
              </th>
              <th
                colSpan={rateShockOffsets.length}
                className="p-2 text-[11px] sm:text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 uppercase tracking-wider"
              >
                صدمة عائد الاقتراض السيادي (نقاط أساس)
              </th>
            </tr>
            <tr className="bg-slate-50 text-[10px] sm:text-xs font-mono font-semibold text-slate-700 border border-slate-200">
              {rateShockOffsets.map((rate: number) => (
                <th key={rate} className="p-1.5 sm:p-2 border border-slate-200 font-sans">
                  {rate > 0
                    ? `+${(rate * 100).toFixed(0)} نقطة`
                    : rate < 0
                    ? `${(rate * 100).toFixed(0)} نقطة`
                    : `الأساس (${country.sovereignInterestRate.toFixed(2)}%)`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row: StressMatrixRow) => (
              <tr key={row.gdpDelta}>
                {/* Row Header */}
                <td className="p-2 sm:p-2.5 text-[11px] sm:text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 text-right font-sans">
                  {row.gdpDelta > 0
                    ? `+${row.gdpDelta.toFixed(1)}% نمو`
                    : row.gdpDelta < 0
                    ? `${row.gdpDelta.toFixed(1)}% انكماش`
                    : `نمو الأساس (${country.realGdpGrowth.toFixed(1)}%)`}
                </td>

                {/* Data Cells */}
                {row.columns.map((col, idx: number) => (
                  <td
                    key={idx}
                    className={`p-2 sm:p-3 border font-mono text-xs transition-colors ${getCellBg(
                      col.terminalDebtToGdp
                    )}`}
                  >
                    <div className="font-bold text-xs sm:text-sm tabular-nums">
                      {col.terminalDebtToGdp.toFixed(1)}%
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-80 mt-0.5 font-sans">
                      عجز: {col.terminalDeficitToGdp.toFixed(1)}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend & Risk Zones */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <span className="font-bold text-slate-800">نطاقات المخاطر:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
            <span>انخفاض الدين</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
            <span>قريب من الأساس</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span>صعود تدريجي</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
            <span>إجهاد مالي</span>
          </div>
        </div>

        <div className="text-[10px] sm:text-[11px] text-slate-600">
          معايير إطار استدامة الدين (DSA) لصندوق النقد الدولي · الأفق الزمني 2032
        </div>
      </div>
    </div>
  );
};
