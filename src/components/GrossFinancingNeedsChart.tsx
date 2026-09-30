import React, { useState } from 'react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface GrossFinancingNeedsChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const GrossFinancingNeedsChart: React.FC<GrossFinancingNeedsChartProps> = ({
  projections,
  country,
}) => {
  const [viewMode, setViewMode] = useState<'ratio' | 'nominal'>('ratio');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 800;
  const height = 340;
  const padding = { top: 25, right: 35, bottom: 45, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Thresholds: IMF DSA benchmark (15% is warning threshold for EMs, 20% for Advanced)
  const gfnThresholdRatio = country.id === 'usa' || country.id === 'gbr' || country.id === 'deu' ? 20.0 : 15.0;

  const stackData = projections.map((p) => {
    const deficitShare = Math.max(0, -p.overallBalanceToGdp);
    const deficitNominal = Math.max(0, -p.overallBalance);
    const amortShare = (p.debtAmortization / p.nominalGdp) * 100;
    const amortNominal = p.debtAmortization;

    const totalShare = deficitShare + amortShare;
    const totalNominal = deficitNominal + amortNominal;

    return {
      year: p.year,
      nominalGdp: p.nominalGdp,
      deficit: viewMode === 'ratio' ? deficitShare : deficitNominal,
      amortization: viewMode === 'ratio' ? amortShare : amortNominal,
      total: viewMode === 'ratio' ? totalShare : totalNominal,
      rawDeficit: deficitNominal,
      rawAmort: amortNominal,
      rawTotal: totalNominal,
      totalRatio: totalShare,
    };
  });

  const maxTotal = Math.max(...stackData.map((d) => d.total));
  const maxY = viewMode === 'ratio' ? Math.max(25, Math.ceil(maxTotal / 5) * 5) : Math.ceil((maxTotal * 1.15) / 50) * 50;

  const barWidth = (chartWidth / projections.length) * 0.55;
  const getX = (i: number) => padding.left + (i + 0.5) * (chartWidth / projections.length);
  const getY = (val: number) => padding.top + chartHeight - (val / (maxY || 1)) * chartHeight;

  const thresholdY = getY(gfnThresholdRatio);

  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
  const activeData = hoveredIdx !== null ? stackData[hoveredIdx] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            الاحتياجات التمويلية الإجمالية واستحقاقات سداد أصل الدين (GFN Profile)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            توزيع متطلبات الاقتراض السنوية بين سداد الديون المستحقة وتمويل عجز الموازنة مع فحص سقف المخاطر ({gfnThresholdRatio}%)
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('ratio')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewMode === 'ratio'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نسبة من الناتج (%)
          </button>
          <button
            onClick={() => setViewMode('nominal')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewMode === 'nominal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المبالغ ({country.currencySymbol})
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '220px' }}
        >
          {/* Y Grid */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="2 2"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-slate-500"
                >
                  {viewMode === 'ratio' ? `${tick.toFixed(0)}%` : formatCurrency(tick, country.currencySymbol)}
                </text>
              </g>
            );
          })}

          {/* IMF Benchmark Line (if ratio mode) */}
          {viewMode === 'ratio' && thresholdY >= padding.top && (
            <g>
              <line
                x1={padding.left}
                y1={thresholdY}
                x2={padding.left + chartWidth}
                y2={thresholdY}
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left + chartWidth - 8}
                y={thresholdY - 6}
                textAnchor="end"
                className="font-sans text-[10px] sm:text-[11px] fill-rose-600 font-bold"
              >
                عتبة مخاطر السيولة لصندوق النقد ({gfnThresholdRatio}%)
              </text>
            </g>
          )}

          {/* Stacked Bars */}
          {stackData.map((d, i) => {
            const cx = getX(i);
            const isHovered = hoveredIdx === i;

            // Stack 1: Amortization (bottom)
            const yAmortTop = getY(d.amortization);
            const yAmortBottom = getY(0);
            const hAmort = Math.max(0, yAmortBottom - yAmortTop);

            // Stack 2: Deficit (top)
            const yDeficitTop = getY(d.total);
            const hDeficit = Math.max(0, yAmortTop - yDeficitTop);

            return (
              <g
                key={d.year}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
              >
                <rect
                  x={cx - barWidth}
                  y={padding.top}
                  width={barWidth * 2}
                  height={chartHeight}
                  fill={isHovered ? 'rgba(241, 245, 249, 0.7)' : 'transparent'}
                  className="transition-colors"
                />

                {/* Amortization Bar (Teal) */}
                <rect
                  x={cx - barWidth / 2}
                  y={yAmortTop}
                  width={barWidth}
                  height={hAmort}
                  fill="#0d9488"
                  opacity={isHovered ? 1 : 0.88}
                  className="transition-opacity"
                />

                {/* Deficit Financing Bar (Amber) */}
                {hDeficit > 0 && (
                  <rect
                    x={cx - barWidth / 2}
                    y={yDeficitTop}
                    width={barWidth}
                    height={hDeficit}
                    fill="#f59e0b"
                    opacity={isHovered ? 1 : 0.88}
                    rx={2}
                    className="transition-opacity"
                  />
                )}

                {/* Total label */}
                <text
                  x={cx}
                  y={getY(d.total) - 6}
                  textAnchor="middle"
                  className="font-mono text-[10px] font-bold fill-slate-800"
                >
                  {viewMode === 'ratio' ? `${d.total.toFixed(1)}%` : formatCurrency(d.total, country.currencySymbol)}
                </text>

                {/* Year Label */}
                <text
                  x={cx}
                  y={padding.top + chartHeight + 18}
                  textAnchor="middle"
                  className={`font-mono text-[11px] ${
                    d.year === 2024 ? 'fill-slate-900 font-bold' : 'fill-slate-600'
                  }`}
                >
                  {d.year}
                  {d.year === 2024 && ' (الأساس)'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Breakdown in Arabic - Mobile Clamped */}
        {activeData && (
          <div className="absolute top-2 left-2 bg-slate-900/95 backdrop-blur-xs text-white p-2.5 sm:p-3 rounded-lg shadow-lg border border-slate-700 text-xs max-w-[calc(100%-1rem)] sm:w-72 pointer-events-none transition-all font-sans text-right z-10">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5 font-bold text-amber-400 gap-2">
              <span className="truncate">الاحتياجات التمويلية {activeData.year}</span>
              <span className="font-mono text-white text-[10px] sm:text-xs shrink-0">
                {activeData.totalRatio.toFixed(1)}% من الناتج
              </span>
            </div>
            <div className="space-y-1 font-mono text-[10px] sm:text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5 text-teal-300 font-sans truncate">
                  <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                  أقساط أصل الدين:
                </span>
                <span className="shrink-0">{formatCurrency(activeData.rawAmort, country.currencySymbol)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5 text-amber-300 font-sans truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  تمويل عجز الميزانية:
                </span>
                <span className="shrink-0">{formatCurrency(activeData.rawDeficit, country.currencySymbol)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-1 text-white font-bold gap-2">
                <span className="font-sans">إجمالي الاحتياجات:</span>
                <span className="shrink-0">{formatCurrency(activeData.rawTotal, country.currencySymbol)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded-xs bg-teal-600 shrink-0" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">سداد الديون القائمة (Amortization)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded-xs bg-amber-500 shrink-0" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">صافي تمويل العجز (Deficit)</span>
          </div>
        </div>

        <div className="text-[10px] sm:text-[11px] text-slate-500 font-sans">
          معايير اختبار مخاطر السيولة وإعادة التمويل (IMF GFN Framework)
        </div>
      </div>
    </div>
  );
};
