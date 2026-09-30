import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Edit3,
} from 'lucide-react';
import { CountryProfile, DsaAssessment, FiscalScenario, YearlyFiscalData } from '../types/fiscal';
import { formatCurrency, formatPercent, translateDsaRisk } from '../utils/fiscalCalculations';

interface StakeholderReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: FiscalScenario;
  baselineScenario: FiscalScenario;
  projections: YearlyFiscalData[];
  baselineProjections: YearlyFiscalData[];
  dsa: DsaAssessment;
  country: CountryProfile;
}

export const StakeholderReportModal: React.FC<StakeholderReportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  baselineScenario,
  projections,
  baselineProjections,
  dsa,
  country,
}) => {
  const [memoAuthor, setMemoAuthor] = useState(`${country.ministryName} · المجلس التنسيقي للاستدامة المالية`);
  const [ministerDirective, setMinisterDirective] = useState(
    `يستعرض هذا التقرير الموجز نتائج محاكاة مسارات إطار المالية العامة متوسط الأجل (2025–2032) لـ ${country.name} والمعاير وفق معايير صندوق النقد الدولي (IMF WEO). ترتكز التوجيهات على المواءمة الدقيقة بين تسريع وتيرة المشاريع التنموية والرأسمالية، وضمان الامتثال الصارم للأسقف التشريعية للدين العام، وتوسيع القاعدة الضريبية غير النفطية.`
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!isOpen) return null;

  const baseYear = projections[0];
  const terminalYear = projections[projections.length - 1];
  const baseTerminalYear = baselineProjections[baselineProjections.length - 1];

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static text-right" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-6 flex flex-col border border-slate-300 print:border-none print:shadow-none print:my-0 print:max-w-none">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white rounded-t-xl print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">{country.flagEmoji}</span>
            <span className="text-sm font-bold tracking-tight">
              الملف المالي التنفيذي لأصحاب المصلحة
            </span>
            <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
              {country.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingNotes ? 'حفظ التعديل' : 'تخصيص التوجيه الوزاري'}</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="px-3.5 py-1 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ كملف PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content in Arabic */}
        <div className="p-8 sm:p-12 text-slate-900 font-sans print:p-4" id="printable-fiscal-dossier">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-start justify-between gap-6">
              
              <div className="flex items-center gap-4">
                {/* Official Crest */}
                <div className="w-16 h-16 rounded border border-slate-300 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src="/src/assets/images/treasury_seal_emblem_1790765316560.jpg"
                    alt="الشعار الرسمي لوزارة المالية"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    {country.officialName}
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-0.5">
                    إطار المالية العامة متوسط الأجل وتقرير استدامة الدين السيادي
                  </h1>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 font-sans">
                    <span>رقم المرجع: MTFF-{country.imfWeoCode}-2025/32</span>
                    <span>·</span>
                    <span>الفترة المالية: 2024–2032</span>
                    <span>·</span>
                    <span>العملة: {country.currencySymbol}</span>
                    <span>·</span>
                    <span>تاريخ الإصدار: {currentDate}</span>
                  </div>
                </div>
              </div>

              {/* Classification Tag */}
              <div className="text-left shrink-0">
                <span className="inline-block text-[11px] font-bold px-2 py-0.5 border border-slate-900 text-slate-900 uppercase">
                  وثيقة سياسات رسمية
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  معايير IMF WEO
                </div>
              </div>

            </div>
          </div>

          {/* Scenario Overview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6 text-xs text-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">السيناريو المحاكى</span>
                <span className="font-bold text-slate-900 text-sm">{scenario.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">سقف الانضباط المالي</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{country.statutoryFiscalRule.debtGdpCeiling.toFixed(0)}% من الناتج</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">تقييم استدامة الدين (DSA)</span>
                <span className={`font-bold text-sm ${dsa.overallRisk === 'Low' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  مخاطر {translateDsaRisk(dsa.overallRisk)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">نسبة الدين بنهاية 2032</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {terminalYear.debtToGdp.toFixed(1)}% ({formatPercent(terminalYear.debtToGdp - baseYear.debtToGdp, true)} نقطة)
                </span>
              </div>
            </div>
            
            <p className="mt-3 pt-2.5 border-t border-slate-200 text-slate-600 text-xs leading-relaxed">
              <strong>مصدر البيانات المعتمد:</strong> {country.dataSourceCitation}.
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
              1. الملخص التنفيذي وتوليف السياسات المالية
            </h2>
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                وفقاً لنتائج المحاكاة لإطار المالية العامة في <strong>{country.name}</strong>، يُتوقع أن تنتقل نسبة الدين العام إلى الناتج المحلي الإجمالي من{' '}
                <strong className="font-mono">{baseYear.debtToGdp.toFixed(1)}%</strong> في سنة الأساس 2024 لتستقر عند{' '}
                <strong className="font-mono">{terminalYear.debtToGdp.toFixed(1)}%</strong> بحلول عام 2032 (مقارنة بتوقعات خط أساس صندوق النقد الدولي البالغة{' '}
                <strong className="font-mono">{baseTerminalYear.debtToGdp.toFixed(1)}%</strong>). 
                {terminalYear.debtToGdp <= country.statutoryFiscalRule.debtGdpCeiling ? (
                  <span className="text-emerald-800 font-bold">
                    {' '}وتؤكد النتائج نجاح حزمة السياسات في الالتزام بالسقف التشريعي المعتمد ({country.statutoryFiscalRule.ruleName})،
                    مع الحفاظ على مساحة مالية احتياطية تبلغ {dsa.distanceToCeiling.toFixed(1)} نقطة مئوية من الناتج.
                  </span>
                ) : (
                  <span className="text-rose-800 font-bold">
                    {' '}ويتجاوز المسار المحاكى السقف المحدد بمقدار{' '}
                    {Math.abs(dsa.distanceToCeiling).toFixed(1)} نقطة مئوية، مما يؤكد ضرورة تبني إصلاحات ضبط مالي إضافية.
                  </span>
                )}
              </p>
              <p>
                ومن المتوقع أن تبلغ الإيرادات العامة الإجمالية نحو{' '}
                <strong className="font-mono">{formatCurrency(terminalYear.totalRevenue, country.currencySymbol)}</strong> ({terminalYear.revenueToGdp.toFixed(1)}% من الناتج المحلي)،
                في حين تستوعب النفقات الأولية ما نسبته {terminalYear.primaryExpenditureToGdp.toFixed(1)}% من الناتج، مما يحقق رصيداً أولياً يبلغ{' '}
                <strong className="font-mono">{formatPercent(terminalYear.primaryBalanceToGdp, true)} من الناتج</strong>.
              </p>
            </div>
          </div>

          {/* Section 2: Key Macroeconomic & Fiscal Indicators Table */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
              2. مصفوفة المؤشرات المالية والاقتصادية الكلية (2024 مقابل 2032)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-800 font-mono border border-slate-200 text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-sans">
                    <th className="py-2 px-3">المؤشر المالي / الاقتصادي</th>
                    <th className="py-2 px-3 text-left">2024 (الأساس)</th>
                    <th className="py-2 px-3 text-left">2032 (خط أساس النقد الدولي)</th>
                    <th className="py-2 px-3 text-left bg-amber-50/70 text-slate-950 font-bold">2032 (المحاكى)</th>
                    <th className="py-2 px-3 text-left">فارق السياسة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">الناتج المحلي الاسمي</td>
                    <td className="py-2 px-3 text-left">{formatCurrency(baseYear.nominalGdp, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left">{formatCurrency(baseTerminalYear.nominalGdp, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatCurrency(terminalYear.nominalGdp, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatCurrency(terminalYear.nominalGdp - baseTerminalYear.nominalGdp, country.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">معدل نمو الناتج الحقيقي (%)</td>
                    <td className="py-2 px-3 text-left">{country.realGdpGrowth.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-left">{baselineScenario.macro.realGdpGrowth.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{terminalYear.realGdpGrowth.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-left">
                      {formatPercent(terminalYear.realGdpGrowth - baselineScenario.macro.realGdpGrowth, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">رصيد الدين العام الحكومي</td>
                    <td className="py-2 px-3 text-left">{formatCurrency(baseYear.debtStock, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left">{formatCurrency(baseTerminalYear.debtStock, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatCurrency(terminalYear.debtStock, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatCurrency(terminalYear.debtStock - baseTerminalYear.debtStock, country.currencySymbol)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="py-2 px-3 font-sans font-bold">نسبة الدين إلى الناتج (%)</td>
                    <td className="py-2 px-3 text-left font-bold">{baseYear.debtToGdp.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-left">{baseTerminalYear.debtToGdp.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/70 text-slate-950">
                      {terminalYear.debtToGdp.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-left font-bold">
                      {formatPercent(terminalYear.debtToGdp - baseTerminalYear.debtToGdp, true)} نقطة
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">إجمالي الإيرادات الضريبية</td>
                    <td className="py-2 px-3 text-left">{formatCurrency(baseYear.taxRevenue.totalTax, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left">{formatCurrency(baseTerminalYear.taxRevenue.totalTax, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatCurrency(terminalYear.taxRevenue.totalTax, country.currencySymbol)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatCurrency(terminalYear.taxRevenue.totalTax - baseTerminalYear.taxRevenue.totalTax, country.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">الرصيد الأولي (% من الناتج)</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseYear.primaryBalanceToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseTerminalYear.primaryBalanceToGdp, true)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatPercent(terminalYear.primaryBalanceToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatPercent(terminalYear.primaryBalanceToGdp - baseTerminalYear.primaryBalanceToGdp, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">الرصيد الكلي (% من الناتج)</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseYear.overallBalanceToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseTerminalYear.overallBalanceToGdp, true)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatPercent(terminalYear.overallBalanceToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatPercent(terminalYear.overallBalanceToGdp - baseTerminalYear.overallBalanceToGdp, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">الرصيد الأولي المثبت للدين (p*)</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseYear.debtStabilizingPbToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseTerminalYear.debtStabilizingPbToGdp, true)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatPercent(terminalYear.debtStabilizingPbToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatPercent(terminalYear.debtStabilizingPbToGdp - baseTerminalYear.debtStabilizingPbToGdp, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">الميزان الأولي المعدل دورياً (CAPB)</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseYear.cyclicallyAdjustedPbToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">{formatPercent(baseTerminalYear.cyclicallyAdjustedPbToGdp, true)}</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{formatPercent(terminalYear.cyclicallyAdjustedPbToGdp, true)}</td>
                    <td className="py-2 px-3 text-left">
                      {formatPercent(terminalYear.cyclicallyAdjustedPbToGdp - baseTerminalYear.cyclicallyAdjustedPbToGdp, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-bold">عائد السندات السيادية (10 سنوات)</td>
                    <td className="py-2 px-3 text-left">{country.sovereignInterestRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-left">{country.sovereignInterestRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-left font-bold bg-amber-50/40">{scenario.macro.sovereignInterestRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-left">
                      {formatPercent(scenario.macro.sovereignInterestRate - country.sovereignInterestRate, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Annual Projection Trajectory */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
              3. جدول الإسقاطات السنوية لإطار المالية العامة (2024–2032)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono border border-slate-200 text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-sans">
                    <th className="py-1.5 px-2">السنة</th>
                    <th className="py-1.5 px-2">الناتج المحلي</th>
                    <th className="py-1.5 px-2">القيمة المضافة</th>
                    <th className="py-1.5 px-2">الشركات/الزكاة</th>
                    <th className="py-1.5 px-2">إجمالي الإيرادات</th>
                    <th className="py-1.5 px-2">النفقات الأولية</th>
                    <th className="py-1.5 px-2">الرصيد الكلي (%)</th>
                    <th className="py-1.5 px-2 font-bold text-slate-900">الدين/الناتج (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projections.map((p) => (
                    <tr key={p.year}>
                      <td className="py-1.5 px-2 font-bold text-slate-900 font-sans">
                        {p.year} {p.year === 2024 && '(الأساس)'}
                      </td>
                      <td className="py-1.5 px-2">{formatCurrency(p.nominalGdp, country.currencySymbol)}</td>
                      <td className="py-1.5 px-2">{formatCurrency(p.taxRevenue.vat, country.currencySymbol)}</td>
                      <td className="py-1.5 px-2">{formatCurrency(p.taxRevenue.corporate, country.currencySymbol)}</td>
                      <td className="py-1.5 px-2 font-medium">{formatCurrency(p.totalRevenue, country.currencySymbol)}</td>
                      <td className="py-1.5 px-2">{formatCurrency(p.primaryExpenditure.total, country.currencySymbol)}</td>
                      <td className={`py-1.5 px-2 font-bold ${p.overallBalanceToGdp >= 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {formatPercent(p.overallBalanceToGdp, true)}
                      </td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">
                        {p.debtToGdp.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Ministerial Directive & Policy Recommendations */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
              4. التوجيهات الوزارية والتوصيات الاستراتيجية
            </h2>
            
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={ministerDirective}
                  onChange={(e) => setMinisterDirective(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 font-sans"
                />
                <input
                  type="text"
                  value={memoAuthor}
                  onChange={(e) => setMemoAuthor(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded font-sans"
                  placeholder="اللجنة والجهة المصدرة"
                />
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded p-3.5 text-xs text-slate-700 leading-relaxed italic">
                "{ministerDirective}"
                <div className="not-italic text-[11px] font-bold text-slate-900 mt-2">
                  — {memoAuthor}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Official Signatures */}
          <div className="pt-6 border-t-2 border-slate-900">
            <div className="grid grid-cols-3 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-8 mb-2 font-mono text-[11px] text-slate-400">
                  [الختم الرسمي والاعتماد]
                </div>
                <div className="font-bold text-slate-900">وكيل الوزارة لشؤون الميزانية العامة</div>
                <div className="text-[11px] text-slate-500">{country.ministryName.split('·')[0]}</div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-8 mb-2 font-mono text-[11px] text-slate-400">
                  [الختم الرسمي والاعتماد]
                </div>
                <div className="font-bold text-slate-900">رئيس مكتب إدارة الدين العام</div>
                <div className="text-[11px] text-slate-500">المركز الوطني لإدارة الدين</div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-8 mb-2 font-mono text-[11px] text-slate-400">
                  [الختم الرسمي والاعتماد]
                </div>
                <div className="font-bold text-slate-900">وزير المالية</div>
                <div className="text-[11px] text-slate-500">{country.officialName}</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
