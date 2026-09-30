import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatPercent } from '../utils/fiscalCalculations';

interface DebtStabilizingGapChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const DebtStabilizingGapChart: React.FC<DebtStabilizingGapChartProps> = ({
  projections,
  country,
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const years = projections.map((p) => p.year);
  const actualPbs = projections.map((p) => p.primaryBalanceToGdp);
  const stabPbs = projections.map((p) => p.debtStabilizingPbToGdp);

  const allVals = [...actualPbs, ...stabPbs];
  const minVal = Math.min(-6, Math.floor(Math.min(...allVals) - 1));
  const maxVal = Math.max(6, Math.ceil(Math.max(...allVals) + 1));
  const range = maxVal - minVal;

  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getY = (val: number) => {
    return padding.top + chartH * (1 - (val - minVal) / (range || 1));
  };

  const zeroY = getY(0);

  const terminalData = projections[projections.length - 1];
  const isStabilizing = terminalData.stabilizationGap >= 0;

  const hoveredData = projections.find((p) => p.year === hoveredYear);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs flex flex-col justify-between text-right">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md shrink-0">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                فجوة الميزان الأولي المثبت للدين (Debt-Stabilizing Primary Gap)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                المقارنة بين الفائض الأولي الفعلي والرصيد الرياضي الحرج اللازم لتثبيت نسبة الدين للناتج
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs pt-1 sm:pt-0">
            <div className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-3 h-0.5 bg-emerald-600"></span>
              <span>الرصيد الفعلي</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-500">
              <span className="w-3 h-0.5 bg-slate-400 border-dashed"></span>
              <span>المستهدف المثبت (p*)</span>
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
            {/* Grid & Zero Axis */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={zeroY}
              y2={zeroY}
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={zeroY + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              0.0%
            </text>

            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(maxVal)}
              y2={getY(maxVal)}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 8}
              y={getY(maxVal) + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              +{maxVal.toFixed(0)}%
            </text>

            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(minVal)}
              y2={getY(minVal)}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 8}
              y={getY(minVal) + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              {minVal.toFixed(0)}%
            </text>

            {/* Shaded Area between Actual and Stabilizing PB */}
            {(() => {
              const actualPoints = projections.map((p, i) => {
                const x = padding.left + (i / (projections.length - 1)) * chartW;
                const y = getY(p.primaryBalanceToGdp);
                return `${x},${y}`;
              });
              const stabPointsRev = [...projections].reverse().map((p, i) => {
                const origIndex = projections.length - 1 - i;
                const x = padding.left + (origIndex / (projections.length - 1)) * chartW;
                const y = getY(p.debtStabilizingPbToGdp);
                return `${x},${y}`;
              });
              const polygonPath = [...actualPoints, ...stabPointsRev].join(' ');

              return (
                <polygon
                  points={polygonPath}
                  fill={isStabilizing ? '#10b981' : '#f43f5e'}
                  opacity="0.15"
                />
              );
            })()}

            {/* Stabilizing PB Curve (p*) */}
            {(() => {
              const points = projections
                .map((p, i) => {
                  const x = padding.left + (i / (projections.length - 1)) * chartW;
                  const y = getY(p.debtStabilizingPbToGdp);
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
              );
            })()}

            {/* Actual Primary Balance Curve */}
            {(() => {
              const points = projections
                .map((p, i) => {
                  const x = padding.left + (i / (projections.length - 1)) * chartW;
                  const y = getY(p.primaryBalanceToGdp);
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })()}

            {/* Interactive Data Nodes */}
            {projections.map((p, i) => {
              const x = padding.left + (i / (projections.length - 1)) * chartW;
              const yActual = getY(p.primaryBalanceToGdp);
              const yStab = getY(p.debtStabilizingPbToGdp);
              const isHovered = hoveredYear === p.year;

              return (
                <g key={p.year}>
                  {/* Hitbox */}
                  <rect
                    x={x - chartW / projections.length / 2}
                    y={padding.top}
                    width={chartW / projections.length}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredYear(p.year)}
                    onClick={() => setHoveredYear(hoveredYear === p.year ? null : p.year)}
                  />

                  {/* Year Axis Label */}
                  <text
                    x={x}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-mono ${
                      isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-600'
                    }`}
                  >
                    {p.year}
                  </text>

                  {/* Node on Actual PB */}
                  <circle
                    cx={x}
                    cy={yActual}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#059669"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150"
                  />

                  {/* Node on Stabilizing PB */}
                  <circle
                    cx={x}
                    cy={yStab}
                    r={isHovered ? 4.5 : 2.5}
                    fill="#64748b"
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip Card */}
          {hoveredData && (
            <div className="mt-2 p-2.5 sm:p-3 bg-slate-900 text-white rounded-md text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                  السنة {hoveredData.year}
                </span>
                <span className="text-slate-400">·</span>
                <span className="flex items-center gap-1 font-bold text-[11px] sm:text-xs">
                  {hoveredData.stabilizationGap >= 0 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      منطقة خفض الدين (+{hoveredData.stabilizationGap.toFixed(2)}%)
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      فجوة انضباط ({hoveredData.stabilizationGap.toFixed(2)}%)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] sm:text-xs">
                <div>
                  <span className="text-slate-400 font-sans ml-1">الفعلي:</span>
                  <span className="font-bold tabular-nums">{formatPercent(hoveredData.primaryBalanceToGdp)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">المثبت (p*):</span>
                  <span className="font-bold text-slate-300 tabular-nums">{formatPercent(hoveredData.debtStabilizingPbToGdp)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">r - g:</span>
                  <span className="font-bold text-amber-300 tabular-nums">
                    {(country.sovereignInterestRate - hoveredData.realGdpGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 truncate max-w-[80%]">
          {isStabilizing ? (
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span className="truncate">
            {isStabilizing
              ? `المسار المالي يولد فائضاً كافياً لخفض نسبة الدين العام لـ ${country.name}.`
              : `المسار المالي يتطلب جهداً إضافياً قدره ${Math.abs(terminalData.stabilizationGap).toFixed(1)}% من الناتج.`}
          </span>
        </span>
        <span className="font-mono text-slate-700 font-bold shrink-0">
          p* = d(r - g)
        </span>
      </div>
    </div>
  );
};
