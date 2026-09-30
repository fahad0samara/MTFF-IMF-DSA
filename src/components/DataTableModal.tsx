import React from 'react';
import { X, Download, Table as TableIcon } from 'lucide-react';
import { CountryProfile, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent } from '../utils/fiscalCalculations';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  projections: YearlyFiscalData[];
  scenarioName: string;
  country: CountryProfile;
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  projections,
  scenarioName,
  country,
}) => {
  if (!isOpen) return null;

  const downloadCsv = () => {
    const headers = [
      'البند المالي',
      ...projections.map((p) => `${p.year}${p.year === 2024 ? ' (سنة الأساس)' : ''}`),
    ];

    const rows: (string | number)[][] = [
      [`الناتج المحلي الاسمي (${country.currency})`, ...projections.map((p) => p.nominalGdp.toFixed(1))],
      ['معدل نمو الناتج الحقيقي (%)', ...projections.map((p) => p.realGdpGrowth.toFixed(1))],
      ['معدل التضخم / مخفض الناتج (%)', ...projections.map((p) => p.inflation.toFixed(1))],
      [`ضرائب الشركات والزكاة (${country.currency})`, ...projections.map((p) => p.taxRevenue.corporate.toFixed(2))],
      [`ضرائب دخل الأفراد (${country.currency})`, ...projections.map((p) => p.taxRevenue.personal.toFixed(2))],
      [`ضريبة القيمة المضافة / الاستهلاك (${country.currency})`, ...projections.map((p) => p.taxRevenue.vat.toFixed(2))],
      [`الرسوم الجمركية والضرائب الانتقائية (${country.currency})`, ...projections.map((p) => p.taxRevenue.customs.toFixed(2))],
      [`إجمالي الإيرادات الضريبية (${country.currency})`, ...projections.map((p) => p.taxRevenue.totalTax.toFixed(2))],
      [`الإيرادات النفطية وغير الضريبية (${country.currency})`, ...projections.map((p) => p.nonTaxRevenue.toFixed(2))],
      [`إجمالي الإيرادات العامة (${country.currency})`, ...projections.map((p) => p.totalRevenue.toFixed(2))],
      ['نسبة الإيرادات إلى الناتج (%)', ...projections.map((p) => p.revenueToGdp.toFixed(1))],
      [`تعويضات العاملين والأجور (${country.currency})`, ...projections.map((p) => p.primaryExpenditure.wages.toFixed(2))],
      [`المنافع الاجتماعية والإعانات (${country.currency})`, ...projections.map((p) => p.primaryExpenditure.transfers.toFixed(2))],
      [`الإنفاق الاستثماري والرأسمالي (${country.currency})`, ...projections.map((p) => p.primaryExpenditure.capital.toFixed(2))],
      [`السلع والخدمات والتشغيل (${country.currency})`, ...projections.map((p) => p.primaryExpenditure.operational.toFixed(2))],
      [`إجمالي النفقات الأولية (${country.currency})`, ...projections.map((p) => p.primaryExpenditure.total.toFixed(2))],
      [`الرصيد الأولي للميزانية (${country.currency})`, ...projections.map((p) => p.primaryBalance.toFixed(2))],
      ['الرصيد الأولي (% من الناتج)', ...projections.map((p) => p.primaryBalanceToGdp.toFixed(1))],
      [`نفقات فوائد الدين العام (${country.currency})`, ...projections.map((p) => p.interestPayment.toFixed(2))],
      [`الرصيد الكلي للميزانية (${country.currency})`, ...projections.map((p) => p.overallBalance.toFixed(2))],
      ['الرصيد الكلي (% من الناتج)', ...projections.map((p) => p.overallBalanceToGdp.toFixed(1))],
      [`رصيد الدين العام الحكومي (${country.currency})`, ...projections.map((p) => p.debtStock.toFixed(2))],
      ['نسبة الدين العام إلى الناتج (%)', ...projections.map((p) => p.debtToGdp.toFixed(1))],
      [`الاحتياجات التمويلية الإجمالية (${country.currency})`, ...projections.map((p) => p.grossFinancingNeeds.toFixed(2))],
      ['الاحتياجات التمويلية (% من الناتج)', ...projections.map((p) => p.grossFinancingNeedsToGdp.toFixed(1))],
      ['الرصيد الأولي المثبت للدين p* (%)', ...projections.map((p) => p.debtStabilizingPbToGdp.toFixed(2))],
      ['فجوة التثبيت المالي (% من الناتج)', ...projections.map((p) => p.stabilizationGap.toFixed(2))],
      ['الميزان المعدل دورياً CAPB (%)', ...projections.map((p) => p.cyclicallyAdjustedPbToGdp.toFixed(2))],
      ['الحافز المالي التقديري (%)', ...projections.map((p) => p.fiscalImpulse.toFixed(2))],
      ['معامل المرونة الضريبية (Buoyancy)', ...projections.map((p) => p.taxBuoyancy.toFixed(2))],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MTFF_${country.id.toUpperCase()}_${scenarioName.replace(/\s+/g, '_')}_2024_2032.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rows = [
    { label: `الناتج المحلي الاسمي (${country.currencySymbol})`, key: 'nominalGdp', fmt: (v: number) => formatCurrency(v, country.currencySymbol), isBold: true },
    { label: 'معدل نمو الناتج الحقيقي (%)', key: 'realGdpGrowth', fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'معدل التضخم / مخفض الناتج (%)', key: 'inflation', fmt: (v: number) => `${v.toFixed(1)}%` },
    
    { category: `تفكيك الإيرادات العامة (${country.currencySymbol})` },
    { label: country.id === 'sau' ? 'ضرائب الشركات والزكاة الشرعية' : 'ضريبة دخل الشركات (CIT)', key: 'taxRevenue.corporate', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: country.personalTax === 0 ? 'ضرائب دخل الأفراد (معفى)' : 'ضريبة دخل الأفراد (PIT)', key: 'taxRevenue.personal', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: country.id === 'sau' || country.id === 'uae' || country.id === 'egy' ? 'ضريبة القيمة المضافة (VAT)' : 'ضرائب الاستهلاك والمبيعات', key: 'taxRevenue.vat', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'الرسوم الجمركية والضرائب الانتقائية', key: 'taxRevenue.customs', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'إجمالي الإيرادات الضريبية', key: 'taxRevenue.totalTax', fmt: (v: number) => formatCurrency(v, country.currencySymbol), isBold: true },
    { label: country.id === 'sau' || country.id === 'uae' ? 'الإيرادات النفطية وعوائد الكيانات السيادية' : 'الإيرادات غير الضريبية واشتراكات التأمين', key: 'nonTaxRevenue', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'إجمالي الإيرادات العامة', key: 'totalRevenue', fmt: (v: number) => formatCurrency(v, country.currencySymbol), isBold: true },
    { label: 'نسبة الإيرادات إلى الناتج (%)', key: 'revenueToGdp', fmt: (v: number) => `${v.toFixed(1)}%` },

    { category: `النفقات العامة الأولية (${country.currencySymbol})` },
    { label: 'تعويضات العاملين وأجور القطاع العام', key: 'primaryExpenditure.wages', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'المنافع الاجتماعية والإعانات والدعم', key: 'primaryExpenditure.transfers', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'الإنفاق الاستثماري والرأسمالي (CAPEX)', key: 'primaryExpenditure.capital', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'السلع والخدمات والنفقات التشغيلية', key: 'primaryExpenditure.operational', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'إجمالي النفقات الأولية', key: 'primaryExpenditure.total', fmt: (v: number) => formatCurrency(v, country.currencySymbol), isBold: true },
    
    { category: 'الأرصدة وديناميكيات الدين العام' },
    { label: 'الرصيد المالي الأولي', key: 'primaryBalance', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'الرصيد الأولي (% من الناتج)', key: 'primaryBalanceToGdp', fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`, isBold: true },
    { label: 'نفقات خدمة فوائد الدين العام', key: 'interestPayment', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'الرصيد الكلي للميزانية', key: 'overallBalance', fmt: (v: number) => formatCurrency(v, country.currencySymbol) },
    { label: 'الرصيد الكلي (% من الناتج)', key: 'overallBalanceToGdp', fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`, isBold: true },
    { label: 'رصيد إجمالي الدين العام', key: 'debtStock', fmt: (v: number) => formatCurrency(v, country.currencySymbol), isBold: true },
    { label: 'نسبة الدين إلى الناتج (%)', key: 'debtToGdp', fmt: (v: number) => `${v.toFixed(1)}%`, isBold: true, highlight: true },
    { label: 'الاحتياجات التمويلية الإجمالية / الناتج (%)', key: 'grossFinancingNeedsToGdp', fmt: (v: number) => `${v.toFixed(1)}%` },

    { category: 'المؤشرات الكلية المتقدمة وإطار النقد الدولي (DSA & CAPB)' },
    { label: 'الرصيد الأولي المثبت للدين p* (% من الناتج)', key: 'debtStabilizingPbToGdp', fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%` },
    { label: 'فجوة تثبيت الدين (% من الناتج)', key: 'stabilizationGap', fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`, isBold: true },
    { label: 'الميزان الأولي المعدل دورياً (CAPB %)', key: 'cyclicallyAdjustedPbToGdp', fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%` },
    { label: 'الحافز المالي التقديري (Fiscal Impulse %)', key: 'fiscalImpulse', fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%` },
    { label: 'معامل مرونة الحصيلة الضريبية (Tax Buoyancy)', key: 'taxBuoyancy', fmt: (v: number) => `${v.toFixed(2)}x` },
  ];

  const getVal = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-2 sm:p-4 text-right" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-auto flex flex-col border border-slate-300 max-h-[92vh]">
        {/* Header in Arabic */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-xl shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">{country.flagEmoji}</span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  جدول إطار المالية العامة (MTFF 2024–2032)
                </h2>
                <span className="text-[10px] sm:text-xs bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {country.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                صندوق النقد الدولي (IMF WEO) · السيناريو: <span className="text-amber-400 font-bold">{scenarioName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCsv}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded transition-colors flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Table View with responsive sticky column */}
        <div className="overflow-x-auto p-3 sm:p-6 text-xs font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-sans">
                <th className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-right font-bold text-slate-900 sticky right-0 bg-slate-100 min-w-[150px] sm:min-w-[230px] z-10 shadow-xs">
                  البند المالي
                </th>
                {projections.map((p) => (
                  <th key={p.year} className="py-2 sm:py-2.5 px-2.5 sm:px-3 font-bold text-slate-900 min-w-[85px] text-left">
                    {p.year}
                    {p.year === 2024 ? ' (الأساس)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r, i) => {
                if (r.category) {
                  return (
                    <tr key={i} className="bg-slate-50">
                      <td
                        colSpan={projections.length + 1}
                        className="py-1.5 px-2.5 sm:px-3 text-right font-sans font-bold text-[10px] text-slate-500 uppercase tracking-wider sticky right-0 bg-slate-50"
                      >
                        {r.category}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={i}
                    className={`hover:bg-amber-50/30 transition-colors ${
                      r.highlight ? 'bg-amber-50/60 font-bold' : ''
                    }`}
                  >
                    <td
                      className={`py-1.5 sm:py-2 px-2.5 sm:px-3 text-right font-sans sticky right-0 bg-white shadow-xs text-[11px] sm:text-xs ${
                        r.isBold ? 'font-bold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {r.label}
                    </td>
                    {projections.map((p) => {
                      const rawVal = getVal(p, r.key!);
                      return (
                        <td
                          key={p.year}
                          className={`py-1.5 sm:py-2 px-2.5 sm:px-3 tabular-nums text-left text-[11px] sm:text-xs ${
                            r.highlight
                              ? 'font-bold text-slate-950'
                              : r.isBold
                              ? 'font-bold text-slate-900'
                              : 'text-slate-700'
                          }`}
                        >
                          {r.fmt!(rawVal)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-xl shrink-0 font-sans">
          <span className="truncate max-w-[240px] sm:max-w-none text-[11px] sm:text-xs">المصدر: {country.dataSourceCitation}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
