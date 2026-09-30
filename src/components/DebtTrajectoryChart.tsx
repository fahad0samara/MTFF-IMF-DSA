import React, { useState } from 'react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface DebtTrajectoryChartProps {
  projections: YearlyFiscalData[];
  baselineProjections: YearlyFiscalData[];
  debtCeiling: number;
  country: CountryProfile;
}

export const DebtTrajectoryChart: React.FC<DebtTrajectoryChartProps> = ({
  projections,
  baselineProjections,
  debtCeiling,
  country,
}) => {
  const [viewMode, setViewMode] = useState<'ratio' | 'nominal'>('ratio');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 360;
  const padding = { top: 30, right: 35, bottom: 45, left: 65 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Compute domains
  const years = projections.map((p) => p.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  let minY = 0;
  let maxY = 100;

  if (viewMode === 'ratio') {
    const allValues = [
      ...projections.map((p) => p.debtToGdp),
      ...baselineProjections.map((p) => p.debtToGdp),
      debtCeiling,
    ];
    minY = Math.max(0, Math.floor((Math.min(...allValues) - 8) / 10) * 10);
    maxY = Math.ceil((Math.max(...allValues) + 8) / 10) * 10;
  } else {
    const allValues = [
      ...projections.map((p) => p.debtStock),
      ...baselineProjections.map((p) => p.debtStock),
    ];
    minY = Math.floor((Math.min(...allValues) * 0.9) / 50) * 50;
    maxY = Math.ceil((Math.max(...allValues) * 1.1) / 50) * 50;
  }

  // Scales
  const getX = (year: number) => {
    return padding.left + ((year - minYear) / (maxYear - minYear)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minY) / ((maxY - minY) || 1)) * chartHeight;
  };

  // Build SVG Path
  const makeLinePath = (data: YearlyFiscalData[], field: 'debtToGdp' | 'debtStock') => {
    return data
      .map((d, i) => {
        const x = getX(d.year);
        const y = getY(field === 'debtToGdp' ? d.debtToGdp : d.debtStock);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const makeAreaPath = (data: YearlyFiscalData[], field: 'debtToGdp' | 'debtStock') => {
    const line = makeLinePath(data, field);
    const lastX = getX(data[data.length - 1].year);
    const firstX = getX(data[0].year);
    const bottomY = getY(minY);
    return `${line} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  };

  const activeLine = makeLinePath(
    projections,
    viewMode === 'ratio' ? 'debtToGdp' : 'debtStock'
  );
  const activeArea = makeAreaPath(
    projections,
    viewMode === 'ratio' ? 'debtToGdp' : 'debtStock'
  );
  const baselineLine = makeLinePath(
    baselineProjections,
    viewMode === 'ratio' ? 'debtToGdp' : 'debtStock'
  );

  const ceilingY = getY(debtCeiling);

  // Y-axis grid ticks
  const yTicks: number[] = [];
  const step = (maxY - minY) / 5;
  for (let i = 0; i <= 5; i++) {
    yTicks.push(minY + i * step);
  }

  const activePoint = hoveredIndex !== null ? projections[hoveredIndex] : null;
  const activeBasePoint = hoveredIndex !== null ? baselineProjections[hoveredIndex] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      {/* Title & Controls in Arabic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{country.flagEmoji}</span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              مسار الدين العام كنسبة من الناتج وسقف الانضباط
            </h3>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {country.name}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            مقارنة مسار السياسة المحاكى مقابل خط أساس صندوق النقد الدولي (WEO) وسقف الأمان ({debtCeiling.toFixed(0)}%)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200/80 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setViewMode('ratio')}
            className={`flex-1 sm:flex-initial px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${
              viewMode === 'ratio'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نسبة الدين / الناتج (%)
          </button>
          <button
            onClick={() => setViewMode('nominal')}
            className={`flex-1 sm:flex-initial px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${
              viewMode === 'nominal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الرصيد الاسمي ({country.currencySymbol})
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '220px' }}
        >
          <defs>
            <linearGradient id="debtAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="safeZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Safe Zone Shading */}
          {viewMode === 'ratio' && ceilingY >= padding.top && ceilingY <= padding.top + chartHeight && (
            <rect
              x={padding.left}
              y={ceilingY}
              width={chartWidth}
              height={padding.top + chartHeight - ceilingY}
              fill="url(#safeZoneGrad)"
            />
          )}

          {/* Grid lines (horizontal) */}
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
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[11px] fill-slate-500 font-medium"
                >
                  {viewMode === 'ratio'
                    ? `${tick.toFixed(0)}%`
                    : formatCurrency(tick, country.currencySymbol)}
                </text>
              </g>
            );
          })}

          {/* X Axis grid & labels */}
          {projections.map((p) => {
            const x = getX(p.year);
            const isHistorical = p.year === 2024;
            return (
              <g key={p.year}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={isHistorical ? '#94a3b8' : '#f8fafc'}
                  strokeWidth={isHistorical ? 1.5 : 1}
                  strokeDasharray={isHistorical ? '2 2' : undefined}
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 18}
                  textAnchor="middle"
                  className={`font-mono text-[11px] ${
                    isHistorical ? 'fill-slate-900 font-bold' : 'fill-slate-600'
                  }`}
                >
                  {p.year}
                  {isHistorical && ' (الأساس)'}
                </text>
              </g>
            );
          })}

          {/* Debt Ceiling Statutory Line */}
          {viewMode === 'ratio' && (
            <g>
              <line
                x1={padding.left}
                y1={ceilingY}
                x2={padding.left + chartWidth}
                y2={ceilingY}
                stroke="#dc2626"
                strokeWidth={1.5}
                strokeDasharray="5 3"
              />
              <text
                x={padding.left + chartWidth - 8}
                y={ceilingY - 6}
                textAnchor="end"
                className="font-sans text-[11px] fill-rose-600 font-bold"
              >
                سقف الانضباط المالي: {debtCeiling.toFixed(0)}%
              </text>
            </g>
          )}

          {/* Active Area Fill */}
          <path d={activeArea} fill="url(#debtAreaGrad)" />

          {/* Baseline Scenario Line */}
          <path
            d={baselineLine}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          {/* Active Scenario Line */}
          <path
            d={activeLine}
            fill="none"
            stroke="#d97706"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Data Points */}
          {projections.map((p, i) => {
            const x = getX(p.year);
            const val = viewMode === 'ratio' ? p.debtToGdp : p.debtStock;
            const y = getY(val);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={p.year}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <rect
                  x={x - chartWidth / (projections.length * 2)}
                  y={padding.top}
                  width={chartWidth / projections.length}
                  height={chartHeight}
                  fill="transparent"
                />

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#b45309' : '#d97706'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-150"
                />

                {(i === projections.length - 1 || isHovered) && (
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="font-mono text-[11px] font-bold fill-slate-900"
                  >
                    {viewMode === 'ratio'
                      ? `${val.toFixed(1)}%`
                      : formatCurrency(val, country.currencySymbol)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vertical cursor line */}
          {hoveredIndex !== null && (
            <line
              x1={getX(projections[hoveredIndex].year)}
              y1={padding.top}
              x2={getX(projections[hoveredIndex].year)}
              y2={padding.top + chartHeight}
              stroke="#64748b"
              strokeWidth={1}
              strokeDasharray="2 2"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Floating Tooltip Card (Mobile Friendly & Bound Protected) */}
        {activePoint && (
          <div className="absolute top-2 left-2 right-2 sm:right-auto sm:w-72 bg-slate-900/95 backdrop-blur-xs text-white p-2.5 sm:p-3 rounded-lg shadow-lg border border-slate-700 text-xs pointer-events-none transition-all text-right font-sans z-10">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 mb-1.5">
              <span className="font-bold text-amber-400 text-xs">
                {country.name} · السنة {activePoint.year} {activePoint.year === 2024 ? '(الفعلي)' : '(توقعات)'}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">نسبة الدين / الناتج:</span>
                <span className="font-bold text-white font-mono tabular-nums">
                  {activePoint.debtToGdp.toFixed(1)}%
                </span>
              </div>

              {activeBasePoint && (
                <div className="flex justify-between">
                  <span className="text-slate-400">خط أساس النقد الدولي:</span>
                  <span className="text-slate-300 font-mono tabular-nums">
                    {activeBasePoint.debtToGdp.toFixed(1)}%
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-400">رصيد الدين العام:</span>
                <span className="text-white font-mono tabular-nums">
                  {formatCurrency(activePoint.debtStock, country.currencySymbol)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">الرصيد الأولي:</span>
                <span className={`font-mono tabular-nums font-bold ${activePoint.primaryBalanceToGdp >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatPercent(activePoint.primaryBalanceToGdp, true)} ناتج
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend in Arabic */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-amber-600 rounded-full inline-block" />
            <span className="font-bold text-slate-800">مسار السياسة المحاكى</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t border-dashed border-slate-500 inline-block" />
            <span>خط أساس صندوق النقد الدولي (WEO)</span>
          </div>
          {viewMode === 'ratio' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t border-dashed border-rose-500 inline-block" />
              <span>سقف الانضباط ({debtCeiling.toFixed(0)}%)</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 truncate max-w-full">
          المصدر: {country.dataSourceCitation}
        </div>
      </div>
    </div>
  );
};
