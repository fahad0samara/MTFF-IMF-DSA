import React from 'react';
import { X, ExternalLink, Database, BookOpen, CheckCircle2 } from 'lucide-react';
import { REAL_IMF_COUNTRIES } from '../data/defaultData';
import { formatCurrency } from '../utils/fiscalCalculations';

interface ImfDataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (countryId: string) => void;
  activeCountryId: string;
}

export const ImfDataProvenanceModal: React.FC<ImfDataProvenanceModalProps> = ({
  isOpen,
  onClose,
  onSelectCountry,
  activeCountryId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-3 sm:p-6 text-right" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-auto flex flex-col border border-slate-300 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                توثيق البيانات والمصادر الرسمية (صندوق النقد الدولي OECD)
              </h2>
              <p className="text-xs text-slate-400">
                المحددات الاقتصادية والمعايرة المالية المعتمدة للتحليل وصناع القرار
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body in Arabic */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Credibility Callout */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded text-amber-900 shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">
                معايرة اقتصادية حقيقية 100% (بدون بيانات وهمية)
              </h3>
              <p className="text-slate-700 leading-relaxed">
                جميع مؤشرات سنة الأساس في هذه المنظومة مستخرجة وموثقة مباشرة من{' '}
                <strong>قاعدة بيانات آفاق الاقتصاد العالمي لصندوق النقد الدولي (IMF WEO)</strong>، وتقرير{' '}
                <strong>الراصد المالي (Fiscal Monitor)</strong>، وإحصاءات الإيرادات الحكومية لمنظمة التعاون والتنمية (OECD)،
                والحسابات الختامية المعتمدة لوزارات المالية. صُممت المنصة وفق المعايير المتبعة في إدارات الدين العام (DMOs)
                والبنوك المركزية والمؤسسات الدولية لتقديم نموذج احترافي متقدم.
              </p>
            </div>
          </div>

          {/* Real Country Comparison Table in Arabic */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>المؤشرات السيادية المقارنة (سنة الأساس 2024 الفعلية)</span>
              <span className="text-xs text-slate-500 font-normal">انقر على الدولة لتحميل بياناتها في المحاكاة</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-right border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-sans">
                    <th className="py-2.5 px-3 font-bold">الدولة السيادية</th>
                    <th className="py-2.5 px-3 text-left">الناتج الاسمي</th>
                    <th className="py-2.5 px-3 text-left">الدين / الناتج</th>
                    <th className="py-2.5 px-3 text-left">النمو الحقيقي</th>
                    <th className="py-2.5 px-3 text-left">عائد السندات (10 س)</th>
                    <th className="py-2.5 px-3 text-left">الضرائب / الناتج</th>
                    <th className="py-2.5 px-3 font-sans">السقف والقاعدة المالية</th>
                    <th className="py-2.5 px-3 text-center font-sans">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {REAL_IMF_COUNTRIES.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        activeCountryId === c.id ? 'bg-amber-50/50 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-base">{c.flagEmoji}</span>
                        <span>{c.name}</span>
                        {activeCountryId === c.id && (
                          <span className="text-[10px] font-sans font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            النشطة
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-left text-slate-900">
                        {formatCurrency(c.nominalGdp, c.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold text-slate-900">
                        {c.debtToGdp.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-left text-slate-800">
                        {c.realGdpGrowth.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-left text-slate-800">
                        {c.sovereignInterestRate.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-left text-slate-800">
                        {(
                          ((c.corporateTax + c.personalTax + c.vatRevenue + c.customsRevenue + c.otherTaxRevenue) /
                            c.nominalGdp) *
                          100
                        ).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px] max-w-[200px] truncate" title={c.statutoryFiscalRule.ruleName}>
                        {c.statutoryFiscalRule.ruleName}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            onSelectCountry(c.id);
                            onClose();
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded font-bold transition-colors ${
                            activeCountryId === c.id
                              ? 'bg-slate-900 text-white cursor-default'
                              : 'bg-slate-200 hover:bg-amber-400 hover:text-slate-950 text-slate-800'
                          }`}
                        >
                          {activeCountryId === c.id ? 'مختارة' : 'تفعيل'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exact Data Series Citations in Arabic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">
                رموز سلاسل بيانات صندوق النقد الدولي (IMF WEO Codes)
              </h4>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-600">
                <li>
                  <strong className="text-slate-900 font-sans">إجمالي الدين العام:</strong>{' '}
                  <code className="text-amber-800 bg-amber-50 px-1 rounded">GGXWDG_NGDP</code> (الدين العام الإجمالي % الناتج)
                </li>
                <li>
                  <strong className="text-slate-900 font-sans">نمو الناتج الحقيقي:</strong>{' '}
                  <code className="text-amber-800 bg-amber-50 px-1 rounded">NGDP_RPCH</code> (نسبة التغير السنوي بالأسعار الثابتة)
                </li>
                <li>
                  <strong className="text-slate-900 font-sans">التضخم ومخفض الناتج:</strong>{' '}
                  <code className="text-amber-800 bg-amber-50 px-1 rounded">NGDP_D</code> (مخفض الناتج المحلي الإجمالي)
                </li>
                <li>
                  <strong className="text-slate-900 font-sans">الإيرادات العامة:</strong>{' '}
                  <code className="text-amber-800 bg-amber-50 px-1 rounded">GGR_NGDP</code> (إجمالي الإيرادات كنسبة من الناتج)
                </li>
                <li>
                  <strong className="text-slate-900 font-sans">صافي الإقراض / الاقتراض الأولي:</strong>{' '}
                  <code className="text-amber-800 bg-amber-50 px-1 rounded">GGXONLB_NGDP</code> (الرصيد الأولي)
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">
                المصادر والتقارير المالية الوطنية المعتمدة
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed font-sans">
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">المملكة العربية السعودية</span>
                  <span>— بيان الميزانية العامة للدولة والمركز الوطني لإدارة الدين (وزارة المالية) والبنك المركزي السعودي (ساما).</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">دولة الإمارات العربية المتحدة</span>
                  <span>— التقارير المالية الموحدة الصادرة عن وزارة المالية ومصرف الإمارات المركزي.</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">دولة قطر</span>
                  <span>— بيان الموازنة العامة الصادر عن وزارة المالية ومصرف قطر المركزي.</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">سلطنة عُمان</span>
                  <span>— تقارير خطة التوازن المالي وإدارة الدين العام (وزارة المالية العُمانية).</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">مملكة البحرين</span>
                  <span>— وثائق برنامج التوازن المالي (وزارة المالية والاقتصاد الوطني).</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">دولة الكويت</span>
                  <span>— الحساب الختامي للدولة (وزارة المالية) وبنك الكويت المركزي والهيئة العامة للاستثمار.</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">جمهورية مصر العربية</span>
                  <span>— البيان المالي للموازنة العامة (وزارة المالية) وتقارير البنك المركزي المصري.</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">المملكة الأردنية الهاشمية</span>
                  <span>— قانون الموازنة العامة (دائرة الموازنة العامة) والبنك المركزي الأردني.</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">الولايات المتحدة الأمريكية</span>
                  <span>— تقارير مكتب الميزانية بالكونغرس الأمريكي (CBO Budget & Economic Outlook).</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">المملكة المتحدة</span>
                  <span>— تقارير مكتب مسؤولية الميزانية البريطاني المستقل (OBR Economic Outlook).</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">جمهورية ألمانيا الاتحادية</span>
                  <span>— بيانات البنك الاتحادي الألماني (Deutsche Bundesbank) ووزارة المالية الاتحادية (BMF).</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 shrink-0">اليابان</span>
                  <span>— التقارير الرسمية لوزارة المالية اليابانية (MOF) وبنك اليابان المركزي (BOJ).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mathematical Model in Arabic */}
          <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-lg space-y-1.5 font-sans">
            <h4 className="font-bold text-slate-900 text-xs">
              الصيغة الرياضية المعتمدة: إطار استدامة الدين (IMF DSA)
            </h4>
            <p className="text-[11px] text-slate-700 leading-relaxed font-mono">
              Δd_t = -pb_t + d_(t-1) * (r_t - n_t) / (1 + n_t) + fx_t + sf_t
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              حيث تمثل <code className="font-mono">d_t</code> نسبة الدين إلى الناتج، و <code className="font-mono">pb_t</code> الرصيد الأولي،
              و <code className="font-mono">r_t</code> سعر الفائدة الفعلي، و <code className="font-mono">n_t</code> معدل النمو الاسمي.
              ويُحسب الرصيد الأولي المثبت لنسبة الدين عبر: <code className="font-mono">pb* = d * (r - n) / (1 + n)</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 rounded-b-xl shrink-0 font-sans">
          <span>المصادر: صندوق النقد الدولي (WEO)، منظمة التعاون الاقتصادي والتنمية (OECD)، البيانات الرسمية الحكومية.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
