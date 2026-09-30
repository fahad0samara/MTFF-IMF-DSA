import React, { useState } from 'react';
import { Activity, Info, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatPercent } from '../utils/fiscalCalculations';

interface FiscalImpulseChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const FiscalImpulseChart: React.FC<FiscalImpulseChartProps> = ({
  projections,
  country,
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const displayData = projections.slice(1); // 2025–2032
  const maxImpulse = Math.max(
    2.5,
    ...displayData.map((d) => Math.abs(d.fiscalImpulse))
  );

  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const zeroY = padding.top + chartH / 2;

  const hoveredData = displayData.find((d) => d.year === hoveredYear);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs flex flex-col justify-between text-right">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md shrink-0">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                الموقف المالي والحافز التقديري (Fiscal Stance & CAPB)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                الميزان الأولي المعدل دورياً واستبعاد أثر الدورة الاقتصادية لتحديد التوجه التوسعي أو الانكماشي
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs pt-1 sm:pt-0">
            <div className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
              <span>حافز توسعي (+Impulse)</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-rose-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
              <span>ضبط مالي (-Impulse)</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-indigo-700">
              <span className="w-3 h-0.5 bg-indigo-600"></span>
              <span>الميزان (CAPB)</span>
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
            {/* Zero Axis */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={zeroY}
              y2={zeroY}
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 8}
              y={zeroY + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              0.0%
            </text>

            {/* Upper & Lower Limits */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top}
              y2={padding.top}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 8}
              y={padding.top + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              +{maxImpulse.toFixed(1)}%
            </text>

            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={height - padding.bottom}
              y2={height - padding.bottom}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 8}
              y={height - padding.bottom + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              -{maxImpulse.toFixed(1)}%
            </text>

            {/* Bars for Fiscal Impulse */}
            {displayData.map((d, i) => {
              const xCenter =
                padding.left +
                (i / (displayData.length - 1)) * chartW;
              const barWidth = (chartW / displayData.length) * 0.55;
              const val = d.fiscalImpulse;
              const barH = (Math.abs(val) / maxImpulse) * (chartH / 2);
              const barY = val >= 0 ? zeroY - barH : zeroY;
              const isHovered = hoveredYear === d.year;

              return (
                <g key={d.year}>
                  {/* Hover Hitbox */}
                  <rect
                    x={xCenter - barWidth}
                    y={padding.top}
                    width={barWidth * 2}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredYear(d.year)}
                  />

                  {/* Impulse Bar */}
                  <rect
                    x={xCenter - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={Math.max(2, barH)}
                    rx={2}
                    fill={val >= 0 ? '#10b981' : '#f43f5e'}
                    opacity={isHovered ? 1 : 0.85}
                    className="transition-all duration-150"
                  />

                  {/* Year Label */}
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

            {/* Line for Cyclically Adjusted Primary Balance (CAPB) */}
            {(() => {
              const points = displayData
                .map((d, i) => {
                  const x =
                    padding.left +
                    (i / (displayData.length - 1)) * chartW;
                  const y = zeroY - (d.cyclicallyAdjustedPbToGdp / maxImpulse) * (chartH / 2);
                  return `${x},${Math.max(padding.top, Math.min(height - padding.bottom, y))}`;
                })
                .join(' ');

              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })()}

            {/* Points on CAPB line */}
            {displayData.map((d, i) => {
              const x =
                padding.left +
                (i / (displayData.length - 1)) * chartW;
              const y = zeroY - (d.cyclicallyAdjustedPbToGdp / maxImpulse) * (chartH / 2);
              const isHovered = hoveredYear === d.year;

              return (
                <circle
                  key={`capb-${d.year}`}
                  cx={x}
                  cy={Math.max(padding.top, Math.min(height - padding.bottom, y))}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredData && (
            <div className="mt-2 p-2.5 sm:p-3 bg-slate-900 text-white rounded-md text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                  السنة {hoveredData.year}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] sm:text-xs">
                  الموقف:{' '}
                  <strong className={hoveredData.fiscalImpulse >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {hoveredData.fiscalImpulse >= 0 ? 'تحفيز توسعي (+Stimulus)' : 'ضبط وتقشف (-Consolidation)'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] sm:text-xs">
                <div>
                  <span className="text-slate-400 font-sans ml-1">الحافز:</span>
                  <span className="font-bold tabular-nums">{formatPercent(hoveredData.fiscalImpulse)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">CAPB:</span>
                  <span className="font-bold text-indigo-300 tabular-nums">{formatPercent(hoveredData.cyclicallyAdjustedPbToGdp)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">الفعلي:</span>
                  <span className="font-bold tabular-nums">{formatPercent(hoveredData.primaryBalanceToGdp)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Economic Insights Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 truncate max-w-[80%]">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">
            يفصل مؤشر CAPB أثر المثبتات التلقائية عن قرارات السياسة المالية المباشرة لـ {country.name}.
          </span>
        </span>
        <span className="font-mono text-slate-700 font-bold shrink-0">
          مرونة: 0.42
        </span>
      </div>
    </div>
  );
};
