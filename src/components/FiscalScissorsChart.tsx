import React, { useState } from 'react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface FiscalScissorsChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const FiscalScissorsChart: React.FC<FiscalScissorsChartProps> = ({
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

  const years = projections.map((p) => p.year);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  // Total expenditure including interest
  const seriesData = projections.map((p) => {
    const totalExpNominal = p.primaryExpenditure.total + p.interestPayment;
    const totalExpRatio = p.primaryExpenditureToGdp + p.interestPaymentToGdp;
    return {
      year: p.year,
      nominalGdp: p.nominalGdp,
      revNominal: p.totalRevenue,
      expNominal: totalExpNominal,
      revRatio: p.revenueToGdp,
      expRatio: totalExpRatio,
      balanceNominal: p.overallBalance,
      balanceRatio: p.overallBalanceToGdp,
    };
  });

  const allVals = [
    ...seriesData.map((d) => (viewMode === 'ratio' ? d.revRatio : d.revNominal)),
    ...seriesData.map((d) => (viewMode === 'ratio' ? d.expRatio : d.expNominal)),
  ];

  const minY = Math.max(0, Math.floor((Math.min(...allVals) * 0.85) / 10) * 10);
  const maxY = Math.ceil((Math.max(...allVals) * 1.15) / 10) * 10;

  const getX = (year: number) => padding.left + ((year - minYear) / (maxYear - minYear)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minY) / ((maxY - minY) || 1)) * chartHeight;

  const makeLine = (key: 'revRatio' | 'expRatio' | 'revNominal' | 'expNominal') => {
    return seriesData
      .map((d, i) => {
        const x = getX(d.year);
        const y = getY(d[key]);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const revLine = makeLine(viewMode === 'ratio' ? 'revRatio' : 'revNominal');
  const expLine = makeLine(viewMode === 'ratio' ? 'expRatio' : 'expNominal');

  const yTicks: number[] = [];
  const step = (maxY - minY) / 5;
  for (let i = 0; i <= 5; i++) {
    yTicks.push(minY + i * step);
  }

  const activeData = hoveredIdx !== null ? seriesData[hoveredIdx] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            مقص المالية العامة: الإيرادات مقابل النفقات الكلية (Fiscal Scissors)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            تطور حجم الإنفاق الشامل مقابل الإيرادات وتحديد فجوة العجز أو الفائض
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

          {/* X Grid & Axis */}
          {seriesData.map((d) => {
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

          {/* Revenue Line (Emerald) */}
          <path
            d={revLine}
            fill="none"
            stroke="#059669"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Expenditure Line (Rose) */}
          <path
            d={expLine}
            fill="none"
            stroke="#e11d48"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Points & Interactive Targets */}
          {seriesData.map((d, i) => {
            const x = getX(d.year);
            const yRev = getY(viewMode === 'ratio' ? d.revRatio : d.revNominal);
            const yExp = getY(viewMode === 'ratio' ? d.expRatio : d.expNominal);
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
                  x={x - chartWidth / (seriesData.length * 2)}
                  y={padding.top}
                  width={chartWidth / seriesData.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Revenue Point */}
                <circle
                  cx={x}
                  cy={yRev}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth={2}
                />

                {/* Expenditure Point */}
                <circle
                  cx={x}
                  cy={yExp}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#e11d48"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover/Tap Tooltip in Arabic - Responsive & Mobile Clamped */}
        {activeData && (
          <div className="absolute top-2 left-2 bg-slate-900/95 backdrop-blur-xs text-white p-2.5 sm:p-3 rounded-lg shadow-lg border border-slate-700 text-xs max-w-[calc(100%-1rem)] sm:w-72 pointer-events-none transition-all font-sans text-right z-10">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5 font-bold text-amber-400 gap-2">
              <span className="truncate">ميزان {activeData.year}</span>
              <span className={`font-mono shrink-0 ${activeData.balanceRatio >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activeData.balanceRatio >= 0 ? 'فائض مالي' : 'عجز مالي'}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[10px] sm:text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5 text-emerald-300 font-sans truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  إجمالي الإيرادات:
                </span>
                <span className="shrink-0">
                  {viewMode === 'ratio'
                    ? `${activeData.revRatio.toFixed(1)}% ناتج`
                    : formatCurrency(activeData.revNominal, country.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5 text-rose-300 font-sans truncate">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  إجمالي النفقات الكلية:
                </span>
                <span className="shrink-0">
                  {viewMode === 'ratio'
                    ? `${activeData.expRatio.toFixed(1)}% ناتج`
                    : formatCurrency(activeData.expNominal, country.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-1 text-white font-bold gap-2">
                <span className="font-sans">صافي الرصيد المالي:</span>
                <span className={`shrink-0 ${activeData.balanceRatio >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(activeData.balanceRatio, true)} ناتج
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-emerald-600 rounded-full" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">إجمالي الإيرادات العامة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-rose-600 rounded-full" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">إجمالي النفقات العامة</span>
          </div>
        </div>

        <div className="text-[10px] sm:text-[11px] text-slate-500 font-sans">
          تقاطع المنحنيين يعكس نقطة التوازن المالي
        </div>
      </div>
    </div>
  );
};
