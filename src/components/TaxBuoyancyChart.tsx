import React, { useState } from 'react';
import { Percent, CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatPercent } from '../utils/fiscalCalculations';

interface TaxBuoyancyChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const TaxBuoyancyChart: React.FC<TaxBuoyancyChartProps> = ({
  projections,
  country,
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const displayData = projections.slice(1); // 2025 to 2032

  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minB = 0.4;
  const maxB = 1.8;
  const range = maxB - minB;

  const getY = (val: number) => {
    return padding.top + chartH * (1 - (val - minB) / (range || 1));
  };

  const benchmarkY = getY(1.0);
  const hoveredData = displayData.find((d) => d.year === hoveredYear);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs flex flex-col justify-between text-right">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-md shrink-0">
              <Percent className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                مرونة الحصيلة الضريبية للناتج (Tax Buoyancy & Elasticity)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                مقياس استجابة نمو الإيرادات الضريبية للتوسع في الناتج الاسمي (مستهدف مرونة الوحدة e ≥ 1.0)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs pt-1 sm:pt-0">
            <div className="flex items-center gap-1 font-semibold text-teal-700">
              <span className="w-3 h-0.5 bg-teal-600"></span>
              <span>المرونة (e)</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-500">
              <span className="w-3 h-0.5 bg-slate-400 border-dashed"></span>
              <span>الوحدة (1.0x)</span>
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
            {/* Benchmark line 1.0 */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={benchmarkY}
              y2={benchmarkY}
              stroke="#0f766e"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={benchmarkY + 3}
              textAnchor="end"
              className="text-[10px] fill-teal-800 font-mono font-bold"
            >
              1.00x
            </text>

            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(maxB)}
              y2={getY(maxB)}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 8}
              y={getY(maxB) + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              {maxB.toFixed(1)}x
            </text>

            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={getY(minB)}
              y2={getY(minB)}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            <text
              x={padding.left - 8}
              y={getY(minB) + 3}
              textAnchor="end"
              className="text-[10px] fill-slate-500 font-mono"
            >
              {minB.toFixed(1)}x
            </text>

            {/* Gradient Area under Buoyancy */}
            {(() => {
              const points = displayData.map((d, i) => {
                const x = padding.left + (i / (displayData.length - 1)) * chartW;
                const y = getY(Math.max(minB, Math.min(maxB, d.taxBuoyancy)));
                return `${x},${y}`;
              });
              const baseLeft = `${padding.left},${height - padding.bottom}`;
              const baseRight = `${width - padding.right},${height - padding.bottom}`;
              const areaPath = `${baseLeft} ${points.join(' ')} ${baseRight}`;

              return (
                <polygon
                  points={areaPath}
                  fill="#0d9488"
                  opacity="0.12"
                />
              );
            })()}

            {/* Buoyancy Polyline */}
            {(() => {
              const points = displayData
                .map((d, i) => {
                  const x = padding.left + (i / (displayData.length - 1)) * chartW;
                  const y = getY(Math.max(minB, Math.min(maxB, d.taxBuoyancy)));
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })()}

            {/* Data Points */}
            {displayData.map((d, i) => {
              const x = padding.left + (i / (displayData.length - 1)) * chartW;
              const y = getY(Math.max(minB, Math.min(maxB, d.taxBuoyancy)));
              const isHovered = hoveredYear === d.year;

              return (
                <g key={d.year}>
                  {/* Hitbox */}
                  <rect
                    x={x - chartW / displayData.length / 2}
                    y={padding.top}
                    width={chartW / displayData.length}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredYear(d.year)}
                    onClick={() => setHoveredYear(hoveredYear === d.year ? null : d.year)}
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
                    {d.year}
                  </text>

                  {/* Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#0d9488"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredData && (
            <div className="mt-2 p-2.5 sm:p-3 bg-slate-900 text-white rounded-md text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-400 text-xs sm:text-sm">
                  السنة {hoveredData.year}
                </span>
                <span className="text-slate-400">·</span>
                <span className="flex items-center gap-1 font-bold text-[11px] sm:text-xs">
                  {hoveredData.taxBuoyancy >= 1.0 ? (
                    <span className="text-teal-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      مرونة تصاعدية إيجابية (e = {hoveredData.taxBuoyancy.toFixed(2)}x)
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      مرونة غير مكتملة (e = {hoveredData.taxBuoyancy.toFixed(2)}x)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] sm:text-xs">
                <div>
                  <span className="text-slate-400 font-sans ml-1">الحصيلة:</span>
                  <span className="font-bold text-teal-300 tabular-nums">
                    {hoveredData.taxRevenue.totalTax.toFixed(1)} {country.currencySymbol}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">الضرائب/الناتج:</span>
                  <span className="font-bold tabular-nums">
                    {((hoveredData.taxRevenue.totalTax / hoveredData.nominalGdp) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Insight */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 truncate max-w-[80%]">
          <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate">
            {displayData[0].taxBuoyancy >= 1.0
              ? `تعكس الحصيلة لـ ${country.name} كفاءة تحصيل وتوسيع القاعدة بوتيرة تفوق نمو الناتج.`
              : `تتطلب الهيكلية الضريبية تعزيز الرقمنة والامتثال لتحقيق مرونة تفوق 1.0x.`}
          </span>
        </span>
        <span className="font-mono text-slate-700 font-bold shrink-0">
          Δ% الإيراد ÷ Δ% الناتج
        </span>
      </div>
    </div>
  );
};
