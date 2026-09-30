import React, { useState } from 'react';
import { Calendar, ShieldAlert, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency } from '../utils/fiscalCalculations';

interface DebtMaturityProfileChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const DebtMaturityProfileChart: React.FC<DebtMaturityProfileChartProps> = ({
  projections,
  country,
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const displayData = projections.slice(1); // 2025 to 2032

  const maxTotal = Math.max(
    ...displayData.map(
      (d) => d.domesticAmortization + d.externalAmortization + Math.max(0, -d.overallBalance)
    ),
    1
  );

  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const hoveredData = displayData.find((d) => d.year === hoveredYear);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs flex flex-col justify-between text-right">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-md shrink-0">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                هيكل استحقاق وإطفاء الدين السيادي (Debt Amortization & Rollover)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                توزيع التزامات سداد أصل الدين المحلي والخارجي وصافي الاحتياج الاقتراضي السنوي
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs pt-1 sm:pt-0">
            <div className="flex items-center gap-1 font-semibold text-blue-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span>
              <span>أصل الدين المحلي</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
              <span>أصل الدين الخارجي</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-rose-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-400"></span>
              <span>صافي اقتراض العجز</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative mt-2 sm:mt-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none overflow-visible"
            style={{ minHeight: '190px' }}
            onMouseLeave={() => setHoveredYear(null)}
          >
            {/* Gridlines */}
            {[0, 0.5, 1.0].map((ratio) => {
              const y = padding.top + chartH * (1 - ratio);
              const val = maxTotal * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="0.8"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}T` : `${val.toFixed(0)}B`}
                  </text>
                </g>
              );
            })}

            {/* Stacked Bars */}
            {displayData.map((d, i) => {
              const xCenter = padding.left + (i / (displayData.length - 1)) * chartW;
              const barWidth = (chartW / displayData.length) * 0.58;
              const isHovered = hoveredYear === d.year;

              const domesticH = (d.domesticAmortization / maxTotal) * chartH;
              const externalH = (d.externalAmortization / maxTotal) * chartH;
              const deficitBorrowing = Math.max(0, -d.overallBalance);
              const deficitH = (deficitBorrowing / maxTotal) * chartH;

              const baseBottom = height - padding.bottom;
              const domesticY = baseBottom - domesticH;
              const externalY = domesticY - externalH;
              const deficitY = externalY - deficitH;

              return (
                <g key={d.year}>
                  {/* Hitbox */}
                  <rect
                    x={xCenter - barWidth}
                    y={padding.top}
                    width={barWidth * 2}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredYear(d.year)}
                    onClick={() => setHoveredYear(hoveredYear === d.year ? null : d.year)}
                  />

                  {/* Domestic Bar Segment */}
                  <rect
                    x={xCenter - barWidth / 2}
                    y={domesticY}
                    width={barWidth}
                    height={Math.max(1, domesticH)}
                    fill="#3b82f6"
                    opacity={isHovered ? 1 : 0.85}
                    rx={deficitH === 0 && externalH === 0 ? 2 : 0}
                    className="transition-all duration-150"
                  />

                  {/* External Bar Segment */}
                  {externalH > 0 && (
                    <rect
                      x={xCenter - barWidth / 2}
                      y={externalY}
                      width={barWidth}
                      height={Math.max(1, externalH)}
                      fill="#f59e0b"
                      opacity={isHovered ? 1 : 0.85}
                      rx={deficitH === 0 ? 2 : 0}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Deficit Borrowing Segment */}
                  {deficitH > 0 && (
                    <rect
                      x={xCenter - barWidth / 2}
                      y={deficitY}
                      width={barWidth}
                      height={Math.max(1, deficitH)}
                      fill="#f43f5e"
                      opacity={isHovered ? 1 : 0.85}
                      rx={2}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Year Axis Label */}
                  <text
                    x={xCenter}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-mono ${
                      isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-600'
                    }`}
                  >
                    {d.year}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredData && (
            <div className="mt-2 p-2.5 sm:p-3 bg-slate-900 text-white rounded-md text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                  السنة المالية {hoveredData.year}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] sm:text-xs">
                  إجمالي السداد والتمويل:{' '}
                  <strong className="text-white font-mono tabular-nums">
                    {formatCurrency(
                      hoveredData.domesticAmortization +
                        hoveredData.externalAmortization +
                        Math.max(0, -hoveredData.overallBalance),
                      country.currencySymbol
                    )}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] sm:text-xs">
                <div>
                  <span className="text-slate-400 font-sans ml-1">محلي:</span>
                  <span className="font-bold text-blue-300 tabular-nums">
                    {formatCurrency(hoveredData.domesticAmortization, country.currencySymbol)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">خارجي:</span>
                  <span className="font-bold text-amber-300 tabular-nums">
                    {formatCurrency(hoveredData.externalAmortization, country.currencySymbol)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">اقتراض:</span>
                  <span className="font-bold text-rose-300 tabular-nums">
                    {formatCurrency(Math.max(0, -hoveredData.overallBalance), country.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 truncate max-w-[80%]">
          <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">
            حصة الدين الأجنبي لـ {country.name} تبلغ {country.foreignDebtShare.toFixed(1)}% مع إطفاء سنوي {country.amortizationRate.toFixed(1)}%.
          </span>
        </span>
        <span className="font-mono text-slate-700 font-bold shrink-0">
          GFN: {hoveredData ? hoveredData.grossFinancingNeedsToGdp.toFixed(1) : displayData[0].grossFinancingNeedsToGdp.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
