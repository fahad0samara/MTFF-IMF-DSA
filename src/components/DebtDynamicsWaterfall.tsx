import React, { useState } from 'react';
import { YearlyFiscalData } from '../types/fiscal';
import { formatPercent } from '../utils/fiscalCalculations';

interface DebtDynamicsWaterfallProps {
  projections: YearlyFiscalData[];
}

export const DebtDynamicsWaterfall: React.FC<DebtDynamicsWaterfallProps> = ({ projections }) => {
  const [viewType, setViewType] = useState<'cumulative' | 'yearly'>('cumulative');

  const baseYear = projections[0];
  const terminalYear = projections[projections.length - 1];
  const projectionSlice = projections.slice(1);

  // العوامل التراكمية لتغير نسبة الدين (2025 إلى 2032)
  const cumulativePrimaryDeficit = projectionSlice.reduce(
    (acc, p) => acc + p.decomposition.primaryDeficitContrib,
    0
  );
  const cumulativeSnowball = projectionSlice.reduce(
    (acc, p) => acc + p.decomposition.interestGrowthSnowball,
    0
  );
  const cumulativeFx = projectionSlice.reduce(
    (acc, p) => acc + p.decomposition.fxValuationContrib,
    0
  );
  const totalDelta = terminalYear.debtToGdp - baseYear.debtToGdp;
  const cumulativeResidual =
    totalDelta - (cumulativePrimaryDeficit + cumulativeSnowball + cumulativeFx);

  const cumulativeSteps = [
    {
      label: 'دين الأساس 2024',
      value: baseYear.debtToGdp,
      type: 'anchor' as const,
      color: '#475569',
      displayVal: `${baseYear.debtToGdp.toFixed(1)}%`,
    },
    {
      label: 'العجز / (الفائض) الأولي',
      value: cumulativePrimaryDeficit,
      type: 'delta' as const,
      color: cumulativePrimaryDeficit > 0 ? '#ef4444' : '#10b981',
      displayVal: formatPercent(cumulativePrimaryDeficit, true),
      desc: 'الفائض الأولي يقلص الدين، بينما العجز يضيف اقتراضاً.',
    },
    {
      label: 'كرة الثلج (r - g)',
      value: cumulativeSnowball,
      type: 'delta' as const,
      color: cumulativeSnowball > 0 ? '#f97316' : '#10b981',
      displayVal: formatPercent(cumulativeSnowball, true),
      desc: 'فارق الفائدة السيادية عن النمو الاسمي.',
    },
    {
      label: 'تقييم الصرف (FX)',
      value: cumulativeFx,
      type: 'delta' as const,
      color: cumulativeFx > 0 ? '#eab308' : '#10b981',
      displayVal: formatPercent(cumulativeFx, true),
      desc: 'أثر تقلبات العملة على الديون الأجنبية.',
    },
    {
      label: 'تعديلات التدفق والمقام',
      value: cumulativeResidual,
      type: 'delta' as const,
      color: cumulativeResidual > 0 ? '#a855f7' : '#10b981',
      displayVal: formatPercent(cumulativeResidual, true),
      desc: 'التعديلات المالية والمخاطر الطارئة.',
    },
    {
      label: 'الدين المستهدف 2032',
      value: terminalYear.debtToGdp,
      type: 'anchor' as const,
      color: terminalYear.debtToGdp > 60 ? '#b91c1c' : '#047857',
      displayVal: `${terminalYear.debtToGdp.toFixed(1)}%`,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-5 shadow-xs text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            تفكيك ديناميكيات الدين العام (معايير صندوق النقد الدولي DSA)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            تحليل مكونات التغير في نسبة الدين بين العجز الأولي، وفارق الفائدة والنمو، والصرف
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewType('cumulative')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewType === 'cumulative'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الأثر التراكمي
          </button>
          <button
            onClick={() => setViewType('yearly')}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              viewType === 'yearly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            التفكيك السنوي
          </button>
        </div>
      </div>

      {viewType === 'cumulative' ? (
        <div className="space-y-3.5">
          {/* Visual Waterfall Strip in Arabic */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {cumulativeSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between text-right"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1 leading-tight truncate" title={step.label}>
                    {step.label}
                  </div>
                  <div
                    className="font-mono text-base sm:text-lg font-bold tabular-nums"
                    style={{ color: step.color }}
                  >
                    {step.displayVal}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500 leading-snug">
                  {step.type === 'anchor' ? (
                    <span>رصيد مثبت</span>
                  ) : (
                    <span>{step.value >= 0 ? 'يوسع الدين' : 'يقلص الدين'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Analytical Explanation Card in Arabic */}
          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 text-right">
            <div className="font-bold text-slate-900 flex flex-wrap items-center justify-between gap-1">
              <span>الخلاصة التحليلية لديناميكيات واستدامة الدين:</span>
              <span className="font-mono tabular-nums text-slate-600 text-[11px]">
                صافي التغير: {formatPercent(totalDelta, true)} نقطة من الناتج
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
              {cumulativeSnowball > 0 ? (
                <>
                  يفرض الفارق بين سعر الفائدة ومعدل النمو $(r - g)$ <strong>أثراً متصاعداً (كرة ثلج معاكسة)</strong> يضيف{' '}
                  <strong className="text-rose-700">+{cumulativeSnowball.toFixed(1)} نقطة مئوية</strong> إلى الدين،
                  مما يستوجب الحفاظ على فوائض أولية لكبح هذا الأثر التلقائي.
                </>
              ) : (
                <>
                  تستفيد الدولة من <strong>عائد نمو مواتٍ $(g &gt; r)$</strong> يخفض عبء الدين العام تلقائياً بمقدار{' '}
                  <strong className="text-emerald-700">{Math.abs(cumulativeSnowball).toFixed(1)} نقطة مئوية</strong>{' '}
                  خلال الأفق الزمني المالي.
                </>
              )}
              {cumulativePrimaryDeficit > 0 ? (
                <>
                  {' '}كما يضيف العجز الأولي التراكمي{' '}
                  <strong className="text-rose-700">+{cumulativePrimaryDeficit.toFixed(1)} نقطة</strong> إلى مسار المديونية.
                </>
              ) : (
                <>
                  {' '}وتسهم الفوائض الأولية التراكمية في تقليص رصيد الدين العام بمقدار{' '}
                  <strong className="text-emerald-700">{Math.abs(cumulativePrimaryDeficit).toFixed(1)} نقطة</strong>.
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        /* Annual Trajectory Breakdown Table in Arabic with clean horizontal scroll */
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-right text-xs text-slate-700 font-mono min-w-[550px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600 uppercase font-sans">
                <th className="py-2 px-2.5 text-right">السنة</th>
                <th className="py-2 px-2.5 text-right">الدين / الناتج</th>
                <th className="py-2 px-2.5 text-right">Δ التغير السنوي</th>
                <th className="py-2 px-2.5 text-right">أثر العجز الأولي</th>
                <th className="py-2 px-2.5 text-right">كرة الثلج (r - g)</th>
                <th className="py-2 px-2.5 text-right">سعر الصرف (FX)</th>
                <th className="py-2 px-2.5 text-right">الاحتياجات (GFN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projections.map((p) => (
                <tr key={p.year} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-2.5 font-bold text-slate-900 font-sans">
                    {p.year} {p.year === 2024 && '(الأساس)'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                    {p.debtToGdp.toFixed(1)}%
                  </td>
                  <td
                    className={`py-2 px-2.5 text-right font-bold ${
                      p.deltaDebtToGdp > 0
                        ? 'text-rose-600'
                        : p.deltaDebtToGdp < 0
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {formatPercent(p.deltaDebtToGdp, true)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-700">
                    {formatPercent(p.decomposition.primaryDeficitContrib, true)}
                  </td>
                  <td
                    className={`py-2 px-2.5 text-right font-medium ${
                      p.decomposition.interestGrowthSnowball > 0
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {formatPercent(p.decomposition.interestGrowthSnowball, true)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-600">
                    {formatPercent(p.decomposition.fxValuationContrib, true)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-900 font-semibold">
                    {p.grossFinancingNeedsToGdp.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
