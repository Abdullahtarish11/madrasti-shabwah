export const directorates = [
  'عتق', 'بيحان', 'عرماء', 'الصعيد', 'الروضة', 'دهر', 'حبان', 'حطيب',
  'جردان', 'ميفعة', 'مرخة العليا', 'مرخة السفلى', 'نصاب', 'رضوم', 'عسيلان', 'عين', 'حجر',
];

// Starter content is intentionally empty: no unverified school names or copyrighted books are included.
export const initialSchools = [];
export const initialBooks = [];
export const initialInstitutions = [
  { id: 'shabwa-university', name: 'جامعة شبوة', type: 'جامعة', location: 'عتق', programs: [], verified: false },
];

export const stages = [
  { id: 'basic', name: 'التعليم الأساسي', grades: ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع'], subjects: ['اللغة العربية', 'الرياضيات', 'العلوم', 'اللغة الإنجليزية'] },
  { id: 'secondary', name: 'التعليم الثانوي', grades: ['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'], subjects: ['اللغة العربية', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء'] },
  { id: 'higher', name: 'التعليم العالي', grades: [], subjects: [] },
];

export const navigation = [
  ['home', 'الرئيسية'], ['directorates', 'المديريات'], ['schools', 'المدارس'],
  ['stages', 'المراحل والمواد'], ['books', 'الكتب والمناهج'], ['institutions', 'الكليات والجامعات'],
  ['search', 'البحث'], ['admin', 'إدارة المحتوى'],
];
