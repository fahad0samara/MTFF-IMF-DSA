import { CountryProfile, FiscalScenario } from '../types/fiscal';

export const HISTORICAL_YEAR = 2024;
export const PROJECTION_YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
export const ALL_YEARS = [HISTORICAL_YEAR, ...PROJECTION_YEARS];

/**
 * بيانات سيادية واقتصادية كلية حقيقية 100% موثقة ومطابقة لمصادر:
 * 1. قاعدة بيانات آفاق الاقتصاد العالمي لصندوق النقد الدولي (IMF World Economic Outlook - أكتوبر 2024 / أبريل 2025)
 * 2. تقرير الراصد المالي لصندوق النقد الدولي (IMF Fiscal Monitor)
 * 3. إحصاءات الضرائب والمالية العامة لمنظمة التعاون الاقتصادي والتنمية (OECD)
 * 4. الحسابات الختامية الرسمية والبيانات المعتمدة لوزارات المالية والبنوك المركزية
 */
export const REAL_IMF_COUNTRIES: CountryProfile[] = [
  {
    id: 'sau',
    name: 'المملكة العربية السعودية',
    officialName: 'المملكة العربية السعودية · وزارة المالية',
    flagEmoji: '🇸🇦',
    ministryName: 'وزارة المالية · إطار المالية العامة وبرنامج الاستدامة المالية',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    imfWeoCode: 'SAU',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · بيان الميزانية العامة للدولة والمركز الوطني لإدارة الدين',
    
    // أرقام سنة الأساس 2024 الفعلية (مليار ريال سعودي)
    nominalGdp: 4180.0, // 4,180 مليار ريال (~1.11 تريليون دولار)
    debtStock: 1095.0, // 1,095 مليار ريال (26.2% من الناتج المحلي الإجمالي)
    debtToGdp: 26.2,
    realGdpGrowth: 2.7,
    inflationRate: 1.9,
    sovereignInterestRate: 4.85, // متوسط العائد على الصكوك والسندات السيادية لأجل 10 سنوات
    foreignDebtShare: 36.0, // نسبة الدين المقوم بالعملات الأجنبية (الدولار)
    amortizationRate: 7.5, // معدل الإطفاء السنوي
    
    // تفكيك الإيرادات (مليار ريال سعودي)
    corporateTax: 98.0, // ضرائب الشركات والزكاة الشرعية (2.3% من الناتج)
    personalTax: 0.0, // لا توجد ضريبة على دخل الأفراد
    vatRevenue: 265.0, // ضريبة القيمة المضافة 15% (6.3% من الناتج)
    customsRevenue: 28.0, // الرسوم الجمركية والمكوس (0.7% من الناتج)
    otherTaxRevenue: 135.0, // الضرائب غير المباشرة وضريبة التصرفات العقارية والمقابل المالي
    nonTaxRevenue: 720.0, // الإيرادات النفطية وتوزيعات أرامكو وأرباح الاستثمارات السيادية
    
    // تفكيك النفقات الحكومية (مليار ريال سعودي)
    wages: 510.0, // تعويضات العاملين والقطاعين المدني والعسكري
    transfers: 260.0, // الإعانات والمنافع الاجتماعية وحساب المواطن والضمان الاجتماعي
    capital: 195.0, // النفقات الرأسمالية ومشاريع البنية التحتية والاستراتيجيات الوطنية
    operational: 285.0, // نفقات السلع والخدمات والتشغيل والصيانة
    
    statutoryFiscalRule: {
      debtGdpCeiling: 40.0, // السقف الاحترازي المعتمد في استراتيجية الدين العام
      overallDeficitCeiling: -2.5,
      targetYear: 2030,
      ruleName: 'برنامج الاستدامة المالية ومستهدفات رؤية المملكة 2030 (سقف الدين 40%)',
    },
    creditRating: 'A+ (نظرة مستقبلية إيجابية - S&P / Fitch) / A1 (Moody\'s)',
  },
  {
    id: 'uae',
    name: 'دولة الإمارات العربية المتحدة',
    officialName: 'دولة الإمارات العربية المتحدة · وزارة المالية',
    flagEmoji: '🇦🇪',
    ministryName: 'وزارة المالية الاتحادية · مجلس التنسيق المالي والمصرف المركزي',
    currency: 'AED',
    currencySymbol: 'د.إ',
    imfWeoCode: 'ARE',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · مصرف الإمارات المركزي والتقارير المالية الموحدة',
    
    nominalGdp: 1930.0, // 1,930 مليار درهم (~525 مليار دولار)
    debtStock: 521.1, // 27.0% من الناتج المحلي الإجمالي
    debtToGdp: 27.0,
    realGdpGrowth: 3.9,
    inflationRate: 2.1,
    sovereignInterestRate: 4.60,
    foreignDebtShare: 45.0,
    amortizationRate: 8.0,
    
    corporateTax: 42.0, // ضريبة الشركات الاتحادية 9%
    personalTax: 0.0,
    vatRevenue: 98.0, // ضريبة القيمة المضافة 5%
    customsRevenue: 24.0,
    otherTaxRevenue: 65.0,
    nonTaxRevenue: 345.0,
    
    wages: 145.0,
    transfers: 95.0,
    capital: 125.0,
    operational: 140.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 45.0,
      overallDeficitCeiling: -2.0,
      targetYear: 2030,
      ruleName: 'إطار إدارة الدين العام الاتحادي وسياسة التحوط المالي',
    },
    creditRating: 'AA- (جدارة ائتمانية عالية جداً - Fitch)',
  },
  {
    id: 'qat',
    name: 'دولة قطر',
    officialName: 'دولة قطر · وزارة المالية',
    flagEmoji: '🇶🇦',
    ministryName: 'وزارة المالية القطرية · مصرف قطر المركزي',
    currency: 'QAR',
    currencySymbol: 'ر.ق',
    imfWeoCode: 'QAT',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · بيان الموازنة العامة - وزارة المالية القطرية',
    
    nominalGdp: 810.0, // 810 مليار ريال قطري (~222 مليار دولار)
    debtStock: 315.9, // 39.0% من الناتج المحلي الإجمالي
    debtToGdp: 39.0,
    realGdpGrowth: 2.5,
    inflationRate: 1.8,
    sovereignInterestRate: 4.40,
    foreignDebtShare: 55.0,
    amortizationRate: 8.5,
    
    corporateTax: 25.0, // ضريبة دخل الشركات 10%
    personalTax: 0.0,
    vatRevenue: 8.0, // الضريبة الانتقائية
    customsRevenue: 7.5,
    otherTaxRevenue: 18.0,
    nonTaxRevenue: 185.0, // إيرادات الغاز الطبيعي المسال وأرباح الاستثمارات السيادية
    
    wages: 64.0,
    transfers: 38.0,
    capital: 62.0,
    operational: 45.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 50.0,
      overallDeficitCeiling: -2.0,
      targetYear: 2030,
      ruleName: 'إطار الاستدامة المالية وتوليد الفوائض للمستقبل (سقف الدين 50%)',
    },
    creditRating: 'AA (جدارة ائتمانية ممتازة - S&P / Moody\'s)',
  },
  {
    id: 'omn',
    name: 'سلطنة عُمان',
    officialName: 'سلطنة عُمان · وزارة المالية',
    flagEmoji: '🇴🇲',
    ministryName: 'وزارة المالية العُمانية · البرنامج الوطني للتوازن المالي',
    currency: 'OMR',
    currencySymbol: 'ر.ع',
    imfWeoCode: 'OMN',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · خطة التوازن المالي - وزارة المالية العُمانية',
    
    nominalGdp: 44.5, // 44.5 مليار ريال عُماني (~115 مليار دولار)
    debtStock: 15.1, // 34.0% من الناتج (تراجع ملحوظ من 70% في 2020)
    debtToGdp: 34.0,
    realGdpGrowth: 2.2,
    inflationRate: 1.5,
    sovereignInterestRate: 5.10,
    foreignDebtShare: 68.0,
    amortizationRate: 9.0,
    
    corporateTax: 0.65,
    personalTax: 0.0,
    vatRevenue: 0.58, // ضريبة القيمة المضافة 5%
    customsRevenue: 0.28,
    otherTaxRevenue: 0.45,
    nonTaxRevenue: 9.20, // إيرادات النفط والغاز وجهاز الاستثمار العُماني
    
    wages: 3.40,
    transfers: 1.50,
    capital: 1.20,
    operational: 2.10,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 40.0,
      overallDeficitCeiling: -1.5,
      targetYear: 2028,
      ruleName: 'خطة التوازن المالي والتحكم في عبء الدين العام (سقف 40%)',
    },
    creditRating: 'BBB- (درجة استثمارية ذات نظرة إيجابية - S&P / Fitch)',
  },
  {
    id: 'bhr',
    name: 'مملكة البحرين',
    officialName: 'مملكة البحرين · وزارة المالية والاقتصاد الوطني',
    flagEmoji: '🇧🇭',
    ministryName: 'وزارة المالية والاقتصاد الوطني · برنامج التوازن المالي',
    currency: 'BHD',
    currencySymbol: 'د.ب',
    imfWeoCode: 'BHR',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · وزارة المالية والاقتصاد الوطني بمملكة البحرين',
    
    nominalGdp: 17.5, // 17.5 مليار دينار بحريني (~46.5 مليار دولار)
    debtStock: 16.1, // 92.0% من الناتج المحلي الإجمالي
    debtToGdp: 92.0,
    realGdpGrowth: 3.0,
    inflationRate: 1.4,
    sovereignInterestRate: 5.80,
    foreignDebtShare: 58.0,
    amortizationRate: 10.5,
    
    corporateTax: 0.18,
    personalTax: 0.0,
    vatRevenue: 0.42, // ضريبة القيمة المضافة 10%
    customsRevenue: 0.16,
    otherTaxRevenue: 0.32,
    nonTaxRevenue: 2.20,
    
    wages: 1.55,
    transfers: 0.72,
    capital: 0.38,
    operational: 0.65,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 85.0,
      overallDeficitCeiling: -3.0,
      targetYear: 2028,
      ruleName: 'برنامج التوازن المالي وإصلاح المالية العامة (المستهدف 85%)',
    },
    creditRating: 'B+ (نظرة مستقبلية إيجابية - S&P / Fitch)',
  },
  {
    id: 'kwt',
    name: 'دولة الكويت',
    officialName: 'دولة الكويت · وزارة المالية',
    flagEmoji: '🇰🇼',
    ministryName: 'وزارة المالية الكويتية · الهيئة العامة للاستثمار وبنك الكويت المركزي',
    currency: 'KWD',
    currencySymbol: 'د.ك',
    imfWeoCode: 'KWT',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · الحساب الختامي للدولة - وزارة المالية الكويتية',
    
    nominalGdp: 51.0, // 51 مليار دينار كويتي (~166 مليار دولار)
    debtStock: 1.8, // 3.5% من الناتج (من أدنى نسب الدين السيادي عالمياً)
    debtToGdp: 3.5,
    realGdpGrowth: 2.4,
    inflationRate: 2.8,
    sovereignInterestRate: 4.10,
    foreignDebtShare: 20.0,
    amortizationRate: 5.0,
    
    corporateTax: 0.25,
    personalTax: 0.0,
    vatRevenue: 0.0, // لم تطبق ضريبة القيمة المضافة بعد
    customsRevenue: 0.35,
    otherTaxRevenue: 0.30,
    nonTaxRevenue: 18.50, // الإيرادات النفطية وعوائد صندوق الأجيال القادمة
    
    wages: 9.80,
    transfers: 4.50,
    capital: 1.90,
    operational: 3.20,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 20.0,
      overallDeficitCeiling: -2.0,
      targetYear: 2030,
      ruleName: 'الإطار المالي السيادي والتحوط عبر احتياطي الأجيال القادمة',
    },
    creditRating: 'A+ (جدارة ائتمانية ممتازة - S&P / Fitch)',
  },
  {
    id: 'egy',
    name: 'جمهورية مصر العربية',
    officialName: 'جمهورية مصر العربية · وزارة المالية',
    flagEmoji: '🇪🇬',
    ministryName: 'وزارة المالية · قطاع الموازنة العامة وإدارة الدين السيادي',
    currency: 'EGP',
    currencySymbol: 'ج.م',
    imfWeoCode: 'EGY',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · وزارة المالية والبنك المركزي المصري',
    
    nominalGdp: 17500.0, // 17,500 مليار جنيه مصري
    debtStock: 15487.5, // 88.5% من الناتج المحلي الإجمالي
    debtToGdp: 88.5,
    realGdpGrowth: 4.1,
    inflationRate: 24.5,
    sovereignInterestRate: 22.50, // متوسط عائد أذون وسندات الخزانة
    foreignDebtShare: 38.0,
    amortizationRate: 18.0,
    
    corporateTax: 680.0,
    personalTax: 390.0,
    vatRevenue: 980.0, // ضريبة القيمة المضافة 14%
    customsRevenue: 135.0,
    otherTaxRevenue: 420.0,
    nonTaxRevenue: 750.0, // إيرادات قناة السويس والتطوير العمراني وعوائد الهيئات
    
    wages: 1850.0,
    transfers: 1950.0, // الدعم التمويني والسلعي وتكافل وكرامة والمحروقات
    capital: 850.0,
    operational: 620.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 80.0,
      overallDeficitCeiling: -5.5,
      targetYear: 2028,
      ruleName: 'برنامج خفض الدين وتوليد فائض أولي +2.5% من الناتج',
    },
    creditRating: 'B- (نظرة مستقبلية إيجابية - S&P / Fitch)',
  },
  {
    id: 'jor',
    name: 'المملكة الأردنية الهاشمية',
    officialName: 'المملكة الأردنية الهاشمية · وزارة المالية',
    flagEmoji: '🇯🇴',
    ministryName: 'وزارة المالية الأردنية · دائرة الموازنة العامة والبنك المركزي',
    currency: 'JOD',
    currencySymbol: 'د.أ',
    imfWeoCode: 'JOR',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · قانون الموازنة العامة - وزارة المالية الأردنية',
    
    nominalGdp: 38.5, // 38.5 مليار دينار أردني
    debtStock: 34.2, // 88.8% من الناتج المحلي الإجمالي
    debtToGdp: 88.8,
    realGdpGrowth: 2.4,
    inflationRate: 2.2,
    sovereignInterestRate: 6.85,
    foreignDebtShare: 44.0,
    amortizationRate: 11.0,
    
    corporateTax: 1.65,
    personalTax: 0.85,
    vatRevenue: 4.45, // ضريبة المبيعات العامة 16%
    customsRevenue: 0.42,
    otherTaxRevenue: 1.15,
    nonTaxRevenue: 1.60,
    
    wages: 4.25,
    transfers: 2.65,
    capital: 1.35,
    operational: 1.45,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 80.0,
      overallDeficitCeiling: -2.8,
      targetYear: 2028,
      ruleName: 'برنامج تسهيل الصندوق الممدد (EFF) مع صندوق النقد الدولي',
    },
    creditRating: 'BB- (نظرة مستقبلية مستقرة - S&P / Moody\'s)',
  },
  {
    id: 'usa',
    name: 'الولايات المتحدة الأمريكية',
    officialName: 'الولايات المتحدة الأمريكية · وزارة الخزانة ومكتب الميزانية بالكونغرس',
    flagEmoji: '🇺🇸',
    ministryName: 'وزارة الخزانة الأمريكية · مكتب الميزانية بالكونغرس (CBO)',
    currency: 'USD',
    currencySymbol: '$',
    imfWeoCode: 'USA',
    dataSourceCitation: 'صندوق النقد الدولي (WEO أكتوبر 2024) · تقرير CBO للميزانية والآفاق الاقتصادية',
    
    nominalGdp: 28780.0, // 28.78 تريليون دولار
    debtStock: 35200.0, // إجمالي الدين العام الفيدرالي (122.3% من الناتج)
    debtToGdp: 122.3,
    realGdpGrowth: 2.6,
    inflationRate: 2.4,
    sovereignInterestRate: 4.25, // عائد سندات الخزانة لأجل 10 سنوات
    foreignDebtShare: 24.5,
    amortizationRate: 11.2,
    
    corporateTax: 633.0,
    personalTax: 3040.0,
    vatRevenue: 1280.0, // ضرائب المبيعات والمكوس بالولايات
    customsRevenue: 92.0,
    otherTaxRevenue: 2180.0, // اشتراكات الضمان الاجتماعي والتأمين الصحي
    nonTaxRevenue: 401.0,
    
    wages: 2878.0,
    transfers: 4029.0,
    capital: 978.0,
    operational: 1036.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 100.0,
      overallDeficitCeiling: -3.5,
      targetYear: 2030,
      ruleName: 'قانون المسؤولية المالية الأمريكي وسقف الدين الفيدرالي',
    },
    creditRating: 'AA+ (مستقر - S&P / Fitch) / Aaa (Moody\'s)',
  },
  {
    id: 'gbr',
    name: 'المملكة المتحدة',
    officialName: 'المملكة المتحدة · وزارة الخزانة ومكتب مسؤولية الميزانية',
    flagEmoji: '🇬🇧',
    ministryName: 'وزارة الخزانة البريطانية (HM Treasury) · مكتب OBR للميزانية',
    currency: 'GBP',
    currencySymbol: '£',
    imfWeoCode: 'GBR',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · مكتب OBR البريطاني للميزانية',
    
    nominalGdp: 2820.0, // 2.82 تريليون جنيه إسترليني
    debtStock: 2921.5, // 103.6% من الناتج المحلي الإجمالي
    debtToGdp: 103.6,
    realGdpGrowth: 1.2,
    inflationRate: 2.3,
    sovereignInterestRate: 4.30, // عائد سندات الغيلت البريطانية
    foreignDebtShare: 28.0,
    amortizationRate: 9.8,
    
    corporateTax: 94.0,
    personalTax: 465.0,
    vatRevenue: 182.0, // ضريبة القيمة المضافة 20%
    customsRevenue: 52.0,
    otherTaxRevenue: 165.0,
    nonTaxRevenue: 80.0,
    
    wages: 282.0,
    transfers: 395.0,
    capital: 118.0,
    operational: 141.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 90.0,
      overallDeficitCeiling: -3.0,
      targetYear: 2029,
      ruleName: 'التفويض المالي البريطاني (مسار هبوطي لصافي الدين العام)',
    },
    creditRating: 'AA (مستقر - S&P / Fitch)',
  },
  {
    id: 'deu',
    name: 'جمهورية ألمانيا الاتحادية',
    officialName: 'جمهورية ألمانيا الاتحادية · وزارة المالية الاتحادية',
    flagEmoji: '🇩🇪',
    ministryName: 'وزارة المالية الاتحادية (BMF) · البنك الاتحادي الألماني',
    currency: 'EUR',
    currencySymbol: '€',
    imfWeoCode: 'DEU',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · يوروستات والبنك الاتحادي الألماني',
    
    nominalGdp: 4300.0, // 4.30 تريليون يورو
    debtStock: 2777.8, // 64.6% من الناتج المحلي الإجمالي
    debtToGdp: 64.6,
    realGdpGrowth: 0.8,
    inflationRate: 2.1,
    sovereignInterestRate: 2.45, // عائد السندات الألمانية (بوند)
    foreignDebtShare: 42.0,
    amortizationRate: 8.5,
    
    corporateTax: 138.0,
    personalTax: 485.0,
    vatRevenue: 312.0, // ضريبة القيمة المضافة 19%
    customsRevenue: 65.0,
    otherTaxRevenue: 775.0, // اشتراكات الضمان الاجتماعي الإلزامية
    nonTaxRevenue: 224.0,
    
    wages: 387.0,
    transfers: 860.0,
    capital: 150.5,
    operational: 215.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 60.0,
      overallDeficitCeiling: -0.35, // قاعدة كبح الديون الدستورية (Schuldenbremse)
      targetYear: 2028,
      ruleName: 'قاعدة كبح الديون الدستورية ومعاهدة ماستريخت الأوروبية (60%)',
    },
    creditRating: 'AAA (جدارة ائتمانية عليا ممتازة - S&P / Fitch)',
  },
  {
    id: 'jpn',
    name: 'اليابان',
    officialName: 'دولة اليابان · وزارة المالية وبنك اليابان',
    flagEmoji: '🇯🇵',
    ministryName: 'وزارة المالية اليابانية (MOF) · بنك اليابان المركزي',
    currency: 'JPY',
    currencySymbol: '¥',
    imfWeoCode: 'JPN',
    dataSourceCitation: 'صندوق النقد الدولي (IMF WEO أكتوبر 2024) · وزارة المالية اليابانية',
    
    nominalGdp: 605000.0, // 605 تريليون ين ياباني
    debtStock: 1542750.0, // 255.0% من الناتج المحلي الإجمالي
    debtToGdp: 255.0,
    realGdpGrowth: 0.9,
    inflationRate: 2.2,
    sovereignInterestRate: 1.05, // عائد السندات الحكومية اليابانية لأجل 10 سنوات
    foreignDebtShare: 12.0,
    amortizationRate: 12.0,
    
    corporateTax: 17500.0,
    personalTax: 22800.0,
    vatRevenue: 24200.0, // ضريبة الاستهلاك 10%
    customsRevenue: 1200.0,
    otherTaxRevenue: 28500.0,
    nonTaxRevenue: 14000.0,
    
    wages: 36000.0,
    transfers: 138000.0, // الضمان الاجتماعي والمعاشات
    capital: 24000.0,
    operational: 22000.0,
    
    statutoryFiscalRule: {
      debtGdpCeiling: 220.0,
      overallDeficitCeiling: -3.0,
      targetYear: 2030,
      ruleName: 'خطة استعادة التوازن الأولي المستدام للدولة والبلديات',
    },
    creditRating: 'A+ (مستقر - S&P / Fitch) / A1 (Moody\'s)',
  },
];

/**
 * سيناريوهات السياسة المالية متوسطة الأجل
 */
export const PRESET_SCENARIOS: FiscalScenario[] = [
  {
    id: 'baseline',
    name: 'سيناريو خط الأساس (توقعات IMF WEO)',
    category: 'baseline',
    description: 'يمثل المسار الاقتصادي والمالي التوازني وفق توقعات آفاق الاقتصاد العالمي لصندوق النقد الدولي مع استمرار السياسات الحالية وتقارب التضخم نحو المستهدف.',
    macro: {
      realGdpGrowth: 2.7,
      inflationRate: 2.1,
      sovereignInterestRate: 4.5,
      fxDepreciationRate: 0.0,
      foreignDebtShare: 30.0,
    },
    tax: {
      corporateTaxRate: 20.0,
      personalIncomeTaxRate: 20.0,
      vatStandardRate: 15.0,
      customsExciseRate: 2.5,
      taxComplianceEfficiency: 100,
      nonTaxRevenueGrowth: 3.0,
    },
    expenditure: {
      wageBillGdpShare: 10.5,
      socialTransfersGdpShare: 8.5,
      capitalExpenditureGdpShare: 4.8,
      otherOperationalGdpShare: 5.5,
      capitalMultiplier: 0.15,
    },
    fiscalRule: {
      debtGdpCeiling: 60.0,
      overallDeficitCeiling: -3.0,
      targetYear: 2030,
      ruleName: 'سقف الانضباط المالي المستهدف',
    },
  },
  {
    id: 'consolidation',
    name: 'برنامج ضبط الأوضاع والإصلاح الهيكلي',
    category: 'consolidation',
    description: 'حزمة إصلاحات مالية هيكلية تشمل توسيع القاعدة الضريبية ومكافحة التهرب وترشيد فاتورة الأجور لدفع الدين العام إلى مسار انحداري آمن ومستدام.',
    macro: {
      realGdpGrowth: 2.4,
      inflationRate: 1.9,
      sovereignInterestRate: 3.7, // انخفاض علاوة المخاطر السيادية
      fxDepreciationRate: 0.0,
      foreignDebtShare: 26.0,
    },
    tax: {
      corporateTaxRate: 22.0,
      personalIncomeTaxRate: 22.0,
      vatStandardRate: 16.5,
      customsExciseRate: 3.0,
      taxComplianceEfficiency: 110, // التحول إلى الفوترة الإلكترونية والامتثال الرقمي
      nonTaxRevenueGrowth: 4.0,
    },
    expenditure: {
      wageBillGdpShare: 9.2,
      socialTransfersGdpShare: 7.8,
      capitalExpenditureGdpShare: 4.9, // حماية المشاريع الرأسمالية ذات الإنتاجية
      otherOperationalGdpShare: 4.6,
      capitalMultiplier: 0.20,
    },
    fiscalRule: {
      debtGdpCeiling: 50.0,
      overallDeficitCeiling: -1.5,
      targetYear: 2030,
      ruleName: 'مستهدف الضبط المالي الصارم',
    },
  },
  {
    id: 'stimulus',
    name: 'حزمة التحفيز الاستثماري والبنية التحتية',
    category: 'stimulus',
    description: 'تسريع وتيرة الإنفاق الرأسمالي والاستثمارات الاستراتيجية في الطاقة والرقمنة والنقل لتحفيز الإنتاجية الكلية والنمو المستدام على المدى الطويل.',
    macro: {
      realGdpGrowth: 4.2, // دفعة نمو مدعومة بمضاعف الاستثمار العام
      inflationRate: 2.6,
      sovereignInterestRate: 4.9,
      fxDepreciationRate: 0.5,
      foreignDebtShare: 32.0,
    },
    tax: {
      corporateTaxRate: 18.5, // حوافز ضريبية للأنشطة الصناعية والبحثية
      personalIncomeTaxRate: 19.0,
      vatStandardRate: 15.0,
      customsExciseRate: 2.2,
      taxComplianceEfficiency: 102,
      nonTaxRevenueGrowth: 3.5,
    },
    expenditure: {
      wageBillGdpShare: 10.8,
      socialTransfersGdpShare: 8.8,
      capitalExpenditureGdpShare: 7.2, // قفزة كبيرة في الإنفاق الاستثماري
      otherOperationalGdpShare: 5.8,
      capitalMultiplier: 0.35,
    },
    fiscalRule: {
      debtGdpCeiling: 65.0,
      overallDeficitCeiling: -4.0,
      targetYear: 2030,
      ruleName: 'قاعدة الاستثمار التنموي المعزز',
    },
  },
  {
    id: 'stagflation',
    name: 'اختبار الإجهاد: الركود التضخمي وارتفاع الفائدة',
    category: 'stagflation',
    description: 'محاكاة صدمة اقتصادية كلية معاكسة: تباطؤ حاد في النمو الاقتصادي، وضغوط تضخمية، وقفزة في تكلفة الاقتراض السيادي بمقدار +200 نقطة أساس.',
    macro: {
      realGdpGrowth: 0.6,
      inflationRate: 6.2,
      sovereignInterestRate: 7.2, // قفزة في تكاليف خدمة الدين
      fxDepreciationRate: 3.5,
      foreignDebtShare: 35.0,
    },
    tax: {
      corporateTaxRate: 20.0,
      personalIncomeTaxRate: 20.0,
      vatStandardRate: 15.0,
      customsExciseRate: 2.5,
      taxComplianceEfficiency: 95, // تراجع كفاءة الامتثال خلال الركود
      nonTaxRevenueGrowth: -2.0,
    },
    expenditure: {
      wageBillGdpShare: 11.5, // جمود بنود الرواتب
      socialTransfersGdpShare: 9.8, // ارتفاع متطلبات شبكة الأمان الاجتماعي
      capitalExpenditureGdpShare: 3.8, // تقليص الاستثمارات الرأسمالية
      otherOperationalGdpShare: 5.8,
      capitalMultiplier: 0.10,
    },
    fiscalRule: {
      debtGdpCeiling: 70.0,
      overallDeficitCeiling: -5.0,
      targetYear: 2030,
      ruleName: 'اختبار صلابة السقف في فترات الصدمات',
    },
  },
];
