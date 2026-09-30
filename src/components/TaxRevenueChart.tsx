import React, { useState } from 'react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface TaxRevenueChartProps {
  projections: YearlyFiscalData[];
  country: CountryProfile;
}

export const TaxRevenueChart: React.FC<TaxRevenueChartProps> = ({ projections, country }) => {
  const [viewMetric, setViewMetric] = useState<'nominal' | 'gdpShare'>('nominal');
  const [hoveredYearIndex, setHoveredYearIndex] = useState<number | null>(null);

  const baseYear = projections[0];
  const terminalYear = projections[projections.length - 1];

  // Tax categories config in Arabic
  const categories = [
    {
      key: 'vat',
      label: country.id === 'sau' || country.id === 'uae' || country.id === 'egy' ? 'ضريبة القيمة المضافة (VAT)' : 'ضرائب الاستهلاك والمبيعات',
      color: '#0284c7',
      light: '#bae6fd',
    },
    { key: 'personal', label: country.personalTax === 0 ? 'ضرائب الدخل (معفى)' : 'ضريبة دخل الأفراد (PIT)', color: '#0d9488', light: '#99f6e4' },
    { key: 'corporate', label: country.id === 'sau' ? 'ضرائب الشركات والزكاة' : 'ضريبة دخل الشركات (CIT)', color: '#d97706', light: '#fde68a' },
    { key: 'customs', label: 'الرسوم الجمركية والانتقائية', color: '#8b5cf6', light: '#ddd6fe' },
    { key: 'nonTax', label: country.id === 'sau' || country.id === 'uae' ? 'الإيرادات النفطية والسيادية' : 'الإيرادات غير الضريبية', color: '#64748b', light: '#e2e8f0' },
  ] as const;

  // Chart SVG layout
  const width = 800;
  const height = 340;
  const padding = { top: 25, right: 30, bottom: 45, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Compute stacks per year
  const stackedData = projections.map((p) => {
    const vatVal = viewMetric === 'nominal' ? p.taxRevenue.vat : (p.taxRevenue.vat / p.nominalGdp) * 100;
    const pitVal = viewMetric === 'nominal' ? p.taxRevenue.personal : (p.taxRevenue.personal / p.nominalGdp) * 100;
    const citVal = viewMetric === 'nominal' ? p.taxRevenue.corporate : (p.taxRevenue.corporate / p.nominalGdp) * 100;
    const cusVal = viewMetric === 'nominal' ? p.taxRevenue.customs : (p.taxRevenue.customs / p.nominalGdp) * 100;
    const nonTaxVal = viewMetric === 'nominal' ? p.nonTaxRevenue : (p.nonTaxRevenue / p.nominalGdp) * 100;

    const total = vatVal + pitVal + citVal + cusVal + nonTaxVal;

    return {
      year: p.year,
      nominalGdp: p.nominalGdp,
      totalRevenue: p.totalRevenue,
      stacks: [
        { key: 'nonTax', val: nonTaxVal, y0: 0, y1: nonTaxVal },
        { key: 'customs', val: cusVal, y0: nonTaxVal, y1: nonTaxVal + cusVal },
        { key: 'corporate', val: citVal, y0: nonTaxVal + cusVal, y1: nonTaxVal + cusVal + citVal },
        { key: 'personal', val: pitVal, y0: nonTaxVal + cusVal + citVal, y1: nonTaxVal + cusVal + citVal + pitVal },
        { key: 'vat', val: vatVal, y0: nonTaxVal + cusVal + citVal + pitVal, y1: total },
      ],
      total,
      raw: {
        vat: p.taxRevenue.vat,
        personal: p.taxRevenue.personal,
        corporate: p.taxRevenue.corporate,
        customs: p.taxRevenue.customs,
        nonTax: p.nonTaxRevenue,
        totalTax: p.taxRevenue.totalTax,
      },
    };
  });

  const maxStackTotal = Math.max(...stackedData.map((d) => d.total));
  const maxY = viewMetric === 'nominal' ? Math.ceil((maxStackTotal * 1.1) / 50) * 50 : 50;

  const barWidth = (chartWidth / projections.length) * 0.55;
  const getXCenter = (i: number) => {
    return padding.left + (i + 0.5) * (chartWidth / projections.length);
  };
  const getY = (val: number) => {
    return padding.top + chartHeight - (val / (maxY || 1)) * chartHeight;
  };

  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
  const activeStack = hoveredYearIndex !== null ? stackedData[hoveredYearIndex] : null;

  // Tax buoyancy calculation
  const gdpGrowthTotal = (terminalYear.nominalGdp - baseYear.nominalGdp) / baseYear.nominalGdp;
  const taxGrowthTotal =
    (terminalYear.taxRevenue.totalTax - baseYear.taxRevenue.totalTax) / baseYear.taxRevenue.totalTax;
  const taxBuoyancy = gdpGrowthTotal > 0 ? taxGrowthTotal / gdpGrowthTotal : 1.0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      {/* Header and Controls in Arabic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">{country.flagEmoji}</span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              مسار الإيرادات الضريبية وتكوين الحصيلة المالية
            </h3>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              {country.name}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            تفكيك الإيرادات بين القيمة المضافة، والشركات، والجمارك، والموارد السيادية
          </p>
        </div>

        {/* Units Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMetric('nominal')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewMetric === 'nominal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المبالغ ({country.currencySymbol})
          </button>
          <button
            onClick={() => setViewMetric('gdpShare')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewMetric === 'gdpShare'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نسبة من الناتج (%)
          </button>
        </div>
      </div>

      {/* SVG Stacked Bar Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '220px' }}
        >
          {/* Horizontal Grid lines */}
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
                  className="font-mono text-[10px] fill-slate-600"
                >
                  {viewMetric === 'nominal' ? formatCurrency(tick, country.currencySymbol) : `${tick.toFixed(0)}%`}
                </text>
              </g>
            );
          })}

          {/* Stacked bars per year */}
          {stackedData.map((d, i) => {
            const cx = getXCenter(i);
            const isHovered = hoveredYearIndex === i;

            return (
              <g
                key={d.year}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredYearIndex(i)}
                onMouseLeave={() => setHoveredYearIndex(null)}
                onClick={() => setHoveredYearIndex(hoveredYearIndex === i ? null : i)}
              >
                {/* Hit test area */}
                <rect
                  x={cx - barWidth}
                  y={padding.top}
                  width={barWidth * 2}
                  height={chartHeight}
                  fill={isHovered ? 'rgba(241, 245, 249, 0.6)' : 'transparent'}
                />

                {/* Stacks from bottom to top */}
                {d.stacks.map((s) => {
                  const yTop = getY(s.y1);
                  const yBottom = getY(s.y0);
                  const h = Math.max(0, yBottom - yTop);
                  const cat = categories.find((c) => c.key === s.key);

                  return (
                    <rect
                      key={s.key}
                      x={cx - barWidth / 2}
                      y={yTop}
                      width={barWidth}
                      height={h}
                      fill={cat?.color || '#cbd5e1'}
                      opacity={isHovered ? 1 : 0.88}
                      className="transition-opacity"
                    />
                  );
                })}

                {/* Total label above bar */}
                <text
                  x={cx}
                  y={getY(d.total) - 6}
                  textAnchor="middle"
                  className="font-mono text-[10px] font-bold fill-slate-700"
                >
                  {viewMetric === 'nominal' ? formatCurrency(d.total, country.currencySymbol) : `${d.total.toFixed(1)}%`}
                </text>

                {/* Year label below axis */}
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

        {/* Hover breakdown tooltip in Arabic - Mobile Clamped */}
        {activeStack && (
          <div className="absolute top-2 left-2 bg-slate-900/95 backdrop-blur-xs text-white p-2.5 sm:p-3 rounded-lg shadow-lg border border-slate-700 text-xs max-w-[calc(100%-1rem)] sm:w-72 pointer-events-none transition-all text-right font-sans z-10">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 mb-1.5 gap-2">
              <span className="font-bold text-amber-400 truncate">
                تفاصيل إيرادات {activeStack.year}
              </span>
              <span className="font-mono text-[10px] text-slate-300 shrink-0">
                {country.name}
              </span>
            </div>

            <div className="space-y-1 text-[10px] sm:text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sky-400 truncate">
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                  {categories[0].label}:
                </span>
                <span className="font-mono shrink-0">
                  {formatCurrency(activeStack.raw.vat, country.currencySymbol)} (
                  {((activeStack.raw.vat / activeStack.nominalGdp) * 100).toFixed(1)}%)
                </span>
              </div>

              {country.personalTax > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-teal-400 truncate">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    ضريبة الدخل الشخصي:
                  </span>
                  <span className="font-mono shrink-0">
                    {formatCurrency(activeStack.raw.personal, country.currencySymbol)} (
                    {((activeStack.raw.personal / activeStack.nominalGdp) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-amber-400 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  {categories[2].label}:
                </span>
                <span className="font-mono shrink-0">
                  {formatCurrency(activeStack.raw.corporate, country.currencySymbol)} (
                  {((activeStack.raw.corporate / activeStack.nominalGdp) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-purple-400 truncate">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  الرسوم الجمركية والخاصة:
                </span>
                <span className="font-mono shrink-0">
                  {formatCurrency(activeStack.raw.customs, country.currencySymbol)} (
                  {((activeStack.raw.customs / activeStack.nominalGdp) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-400 truncate">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  {categories[4].label}:
                </span>
                <span className="font-mono shrink-0">
                  {formatCurrency(activeStack.raw.nonTax, country.currencySymbol)} (
                  {((activeStack.raw.nonTax / activeStack.nominalGdp) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Legend & Buoyancy Indicators in Arabic */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {categories.map((c) => (
            <div key={c.key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-slate-700 font-medium text-[11px] sm:text-xs">{c.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 text-slate-700 font-mono text-[10px] sm:text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <span>
            مرونة التحصيل (Buoyancy):{' '}
            <strong className={taxBuoyancy >= 1.0 ? 'text-emerald-700' : 'text-amber-700'}>
              {taxBuoyancy.toFixed(2)}x
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            النمو السنوي للإيرادات:{' '}
            <strong className="text-slate-900">
              {(
                (Math.pow(terminalYear.totalRevenue / baseYear.totalRevenue, 1 / 8) - 1) *
                100
              ).toFixed(1)}%
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
