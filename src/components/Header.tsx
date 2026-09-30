import React, { useState } from 'react';
import {
  FileText,
  Table,
  RotateCcw,
  Database,
  Sliders,
  ChevronDown,
  Layers,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { CountryProfile, FiscalScenario } from '../types/fiscal';

interface HeaderProps {
  currentScenario: FiscalScenario;
  onSelectScenario: (scenarioId: string) => void;
  presetScenarios: FiscalScenario[];
  activeCountry: CountryProfile;
  onSelectCountry: (countryId: string) => void;
  countries: CountryProfile[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenDataTable: () => void;
  onOpenImfModal: () => void;
  onResetScenario: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  presetScenarios,
  activeCountry,
  onSelectCountry,
  countries,
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenDataTable,
  onOpenImfModal,
  onResetScenario,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'simulation', label: 'مختبر المحاكاة' },
    { id: 'tax_breakdown', label: 'الإيرادات والضرائب' },
    { id: 'debt_dynamics', label: 'استحقاق وديناميكيات الدين' },
    { id: 'fiscal_stance', label: 'الموقف المالي وتثبيت الدين' },
    { id: 'stress_testing', label: 'اختبارات الإجهاد' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Zone 1: Wordmark & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs sm:text-sm shadow-sm ring-1 ring-amber-300/30">
            مال
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
            <span className="text-xs sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              <span className="hidden sm:inline">منظومة التخطيط المالي</span>
              <span className="sm:hidden">التخطيط المالي</span>
            </span>
            <span className="hidden md:inline-block text-[10px] font-mono text-amber-400/90 tracking-wider">
              MTFF · IMF DSA
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-3 text-xs font-semibold text-slate-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`transition-colors py-1.5 px-1 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-400 text-white font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & Selectors */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Sovereign Country Selector */}
          <div className="relative">
            <select
              value={activeCountry.id}
              onChange={(e) => onSelectCountry(e.target.value)}
              className="bg-slate-800 text-amber-300 font-bold text-[11px] sm:text-xs border border-slate-700 hover:border-slate-600 rounded-md py-1 sm:py-1.5 px-1.5 sm:px-2.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[105px] sm:max-w-[170px] truncate"
              title="اختر الدولة"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flagEmoji} {c.name} ({c.currencySymbol})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Selector Dropdown (Hidden on mobile/tablets) */}
          <div className="relative hidden md:block">
            <select
              value={currentScenario.id}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[140px] truncate"
              title="اختر السيناريو الاقتصادي"
            >
              {presetScenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Only Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            {/* IMF Data Modal Trigger */}
            <button
              onClick={onOpenImfModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
              title="عرض توثيق بيانات صندوق النقد الدولي (IMF WEO) والمراجع"
            >
              <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden lg:inline">بيانات النقد الدولي</span>
            </button>

            {/* Data Table */}
            <button
              onClick={onOpenDataTable}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="عرض جدول البيانات المالية وتصدير CSV"
            >
              <Table className="w-4 h-4" />
            </button>

            {/* Reset button */}
            <button
              onClick={onResetScenario}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="إعادة ضبط المقابض لخط الأساس للدولة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Action: Export PDF Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-xs whitespace-nowrap min-h-[30px] sm:min-h-[34px]"
          >
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">تقرير PDF الوزاري</span>
            <span className="sm:hidden font-bold">تقرير PDF</span>
          </button>

          {/* Mobile Quick Menu Trigger */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="المزيد من الأدوات والخيارات"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Mobile Actions Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1.5 z-50 text-right">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDataTable();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-md text-right"
                >
                  <Table className="w-3.5 h-3.5 text-amber-400" />
                  <span>جدول البيانات وتصدير CSV</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenImfModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-md text-right"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>مصادر وبيانات صندوق النقد</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onResetScenario();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-300 hover:bg-slate-800 rounded-md text-right"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>إعادة ضبط السيناريو</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs (Scrollable on Tablets & Mobile) */}
      <div className="xl:hidden bg-slate-950/80 border-t border-slate-800/90 px-2 sm:px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-2.5 sm:px-3 py-1.5 text-xs rounded-md transition-colors font-medium shrink-0 min-h-[34px] flex items-center ${
              activeTab === tab.id
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
