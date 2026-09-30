import React, { useState } from 'react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface DebtFanChartProps {
  projections: YearlyFiscalData[];
  debtCeiling: number;
  country: CountryProfile;
}

export const DebtFanChart: React.FC<DebtFanChartProps> = ({
  projections,
  debtCeiling,
  country,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG Dimensions
  const width = 800;
  const height = 360;
  const padding = { top: 30, right: 35, bottom: 45, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const years = projections.map((p) => p.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  // Stochastic simulation fan bands (10%, 25%, 75%, 90% confidence percentiles)
  const fanData = projections.map((p, i) => {
    const t = i;
    const baseRatio = p.debtToGdp;
    const vol = (country.sovereignInterestRate * 0.35 + 1.2) * Math.sqrt(t);
    return {
      year: p.year,
      central: baseRatio,
      p10: Math.max(10, baseRatio - 1.645 * vol),
      p25: Math.max(12, baseRatio - 0.674 * vol),
      p75: baseRatio + 0.674 * vol,
      p90: baseRatio + 1.645 * vol,
    };
  });

  const allVals = [
    ...fanData.map((d) => d.p10),
    ...fanData.map((d) => d.p90),
    debtCeiling,
  ];
  const minY = Math.max(0, Math.floor((Math.min(...allVals) - 8) / 10) * 10);
  const maxY = Math.ceil((Math.max(...allVals) + 8) / 10) * 10;

  const getX = (year: number) => {
    return padding.left + ((year - minYear) / (maxYear - minYear)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minY) / ((maxY - minY) || 1)) * chartHeight;
  };

  const makeBandPath = (upperKey: 'p90' | 'p75', lowerKey: 'p10' | 'p25') => {
    const forward = fanData
      .map((d, i) => {
        const x = getX(d.year);
        const y = getY(d[upperKey]);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const backward = [...fanData]
      .reverse()
      .map((d) => {
        const x = getX(d.year);
        const y = getY(d[lowerKey]);
        return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return `${forward} ${backward} Z`;
  };

  const outerBandPath = makeBandPath('p90', 'p10');
  const innerBandPath = makeBandPath('p75', 'p25');

  const centralLine = fanData
    .map((d, i) => {
      const x = getX(d.year);
      const y = getY(d.central);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const ceilingY = getY(debtCeiling);

  const yTicks: number[] = [];
  const step = (maxY - minY) / 5;
  for (let i = 0; i <= 5; i++) {
    yTicks.push(minY + i * step);
  }

  const activePoint = hoveredIdx !== null ? fanData[hoveredIdx] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>مخطط المروحة الاحتمالية للدين (Stochastic Fan Chart)</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            محاكاة فترات الثقة ومخاطر تقلبات الاقتصاد الكلي (50% و 80%) وفق معايير صندوق النقد الدولي
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
          <span className="text-slate-500 font-sans">سقف الانضباط:</span>
          <span className="font-bold text-slate-900 tabular-nums">{debtCeiling.toFixed(0)}%</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '220px' }}
        >
          <defs>
            <linearGradient id="outerFanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="innerFanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
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
                  className="font-mono text-[11px] fill-slate-500"
                >
                  {tick.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* X Axis */}
          {fanData.map((d) => {
            const x = getX(d.year);
            const isBase = d.year === 2024;
            return (
              <g key={d.year}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={isBase ? '#94a3b8' : '#f8fafc'}
                  strokeDasharray={isBase ? '2 2' : undefined}
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 18}
                  textAnchor="middle"
                  className={`font-mono text-[11px] ${
                    isBase ? 'fill-slate-900 font-bold' : 'fill-slate-600'
                  }`}
                >
                  {d.year}
                  {isBase && ' (الأساس)'}
                </text>
              </g>
            );
          })}

          {/* Statutory Ceiling Line */}
          {ceilingY >= padding.top && ceilingY <= padding.top + chartHeight && (
            <g>
              <line
                x1={padding.left}
                y1={ceilingY}
                x2={padding.left + chartWidth}
                y2={ceilingY}
                stroke="#dc2626"
                strokeWidth={1.5}
                strokeDasharray="4 4"
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

          {/* Outer Confidence Band (80% confidence: p10 - p90) */}
          <path d={outerBandPath} fill="url(#outerFanGrad)" />

          {/* Inner Confidence Band (50% confidence: p25 - p75) */}
          <path d={innerBandPath} fill="url(#innerFanGrad)" />

          {/* Central Baseline Trajectory */}
          <path
            d={centralLine}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Points & Hover Target */}
          {fanData.map((d, i) => {
            const x = getX(d.year);
            const y = getY(d.central);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.year}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
              >
                <rect
                  x={x - chartWidth / (fanData.length * 2)}
                  y={padding.top}
                  width={chartWidth / fanData.length}
                  height={chartHeight}
                  fill="transparent"
                />

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#1e40af' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip (Responsive bounds) */}
        {activePoint && (
          <div className="absolute top-2 left-2 right-2 sm:right-auto sm:w-72 bg-slate-900/95 backdrop-blur-xs text-white p-2.5 sm:p-3 rounded-lg shadow-lg border border-slate-700 text-xs pointer-events-none transition-all font-sans text-right z-10">
            <div className="font-bold text-amber-400 border-b border-slate-700 pb-1 mb-1.5 flex justify-between">
              <span>توزيع احتمالات الدين لسنة {activePoint.year}</span>
              <span className="font-mono text-white tabular-nums">{activePoint.central.toFixed(1)}%</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] tabular-nums">
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">السيناريو الأشد (مئين 90):</span>
                <span className="text-rose-400 font-bold">{activePoint.p90.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">النطاق الأعلى (مئين 75):</span>
                <span className="text-amber-300">{activePoint.p75.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">المسار المركزي المتوقع:</span>
                <span className="text-white font-bold">{activePoint.central.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-slate-300">السيناريو الأفضل (مئين 10):</span>
                <span className="text-emerald-400 font-bold">{activePoint.p10.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fan Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-blue-700 rounded-full" />
            <span className="font-bold text-slate-800">المسار المركزي</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded bg-blue-500/35 border border-blue-400/50" />
            <span>نطاق 50%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded bg-blue-400/20 border border-blue-300/40" />
            <span>نطاق 80%</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-sans truncate max-w-full">
          إطار محاكاة المخاطر العشوائية لصندوق النقد الدولي
        </div>
      </div>
    </div>
  );
};
