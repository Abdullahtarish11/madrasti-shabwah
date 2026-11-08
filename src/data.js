export const quickStats = [
  { label: 'المديريات', value: '10', icon: '🏫' },
  { label: 'المدارس', value: '120', icon: '🎒' },
  { label: 'المراحل', value: '6', icon: '📚' },
  { label: 'الكتب', value: '250+', icon: '📖' },
];

export const directorates = [
  {
    id: 'azar',
    name: 'مديرية أزال',
    schools: [
      { id: 'azar-1', name: 'مدرسة النور الابتدائية', stage: 'ابتدائي', district: 'حي الروضة' },
      { id: 'azar-2', name: 'مدرسة المنهل المتوسطة', stage: 'متوسط', district: 'حي السلام' },
      { id: 'azar-3', name: 'مدرسة النخبة الثانوية', stage: 'ثانوي', district: 'حي الربيع' },
    ],
  },
  {
    id: 'attaq',
    name: 'مديرية التواهي',
    schools: [
      { id: 'ataq-1', name: 'مدرسة الأمل الأساسية', stage: 'ابتدائي', district: 'حي الشهداء' },
      { id: 'ataq-2', name: 'مدرسة العلوم المتوسطة', stage: 'متوسط', district: 'حي الزهراء' },
      { id: 'ataq-3', name: 'مدرسة المستقبل الثانوية', stage: 'ثانوي', district: 'حي العرب' },
    ],
  },
  {
    id: 'bani-harish',
    name: 'مديرية بني حريش',
    schools: [
      { id: 'bani-1', name: 'مدرسة القيم الابتدائية', stage: 'ابتدائي', district: 'حي المطار' },
      { id: 'bani-2', name: 'مدرسة الشروق المتوسطة', stage: 'متوسط', district: 'حي النور' },
      { id: 'bani-3', name: 'مدرسة عروج الثانوية', stage: 'ثانوي', district: 'حي المروة' },
    ],
  },
];

export const schools = directorates.flatMap((directorate) =>
  directorate.schools.map((school) => ({
    ...school,
    directorateName: directorate.name,
  }))
);

export const stages = [
  {
    id: 'primary',
    name: 'المرحلة الابتدائية',
    grades: ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
    subjects: ['اللغة العربية', 'الرياضيات', 'العلوم', 'اللغة الإنجليزية', 'المدنية'],
  },
  {
    id: 'middle',
    name: 'المرحلة المتوسطة',
    grades: ['الصف السابع', 'الصف الثامن', 'الصف التاسع'],
    subjects: ['اللغة العربية', 'الرياضيات', 'العلوم', 'الفيزياء', 'اللغة الإنجليزية'],
  },
  {
    id: 'secondary',
    name: 'المرحلة الثانوية',
    grades: ['العاشر', 'الحادي عشر', 'الثاني عشر'],
    subjects: ['الفيزياء', 'الكيمياء', 'الأحياء', 'الرياضيات', 'الاقتصاد'],
  },
  {
    id: 'university',
    name: 'المرحلة الجامعية',
    grades: ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع'],
    subjects: ['البرمجة', 'التحليل', 'الإدارة', 'التربية', 'العلوم الإنسانية'],
  },
];

export const books = [
  {
    id: 'book-1',
    title: 'رياضيات الصف السادس',
    stage: 'المرحلة الابتدائية',
    subject: 'الرياضيات',
    directorate: 'مديرية أزال',
    format: 'PDF',
    size: '3.1 MB',
    pages: 96,
    featured: true,
    description: 'مذكرة تدريبية مخصصة للصف السادس مع تمارين وتطبيقات متدرجة.',
  },
  {
    id: 'book-2',
    title: 'علوم الصف التاسع',
    stage: 'المرحلة المتوسطة',
    subject: 'العلوم',
    directorate: 'مديرية التواهي',
    format: 'PDF',
    size: '4.8 MB',
    pages: 118,
    featured: true,
    description: 'كتاب شرح مبسط يضم التجارب والأنشطة التطبيقية في مادة العلوم.',
  },
  {
    id: 'book-3',
    title: 'اللغة العربية للثانوية',
    stage: 'المرحلة الثانوية',
    subject: 'اللغة العربية',
    directorate: 'مديرية بني حريش',
    format: 'PDF',
    size: '2.7 MB',
    pages: 88,
    featured: false,
    description: 'محتوى لغوي مشروح مع أسئلة مراجعة وملفات قراءة.',
  },
  {
    id: 'book-4',
    title: 'مقدمة في البرمجة',
    stage: 'المرحلة الجامعية',
    subject: 'البرمجة',
    directorate: 'جامعة شبوة',
    format: 'PDF',
    size: '5.6 MB',
    pages: 140,
    featured: true,
    description: 'مبادئ البرمجة الأساسية والتفكير المنطقي مع أمثلة عملية.',
  },
];

export const universities = [
  {
    id: 'shabwa',
    name: 'جامعة شبوة',
    type: 'جامعة',
    city: 'مدينة عدن',
    programs: ['علوم الحاسب', 'التربية', 'الاقتصاد', 'الهندسة'],
  },
  {
    id: 'technical',
    name: 'الكلية التقنية',
    type: 'كلية',
    city: 'مدينة زنجبار',
    programs: ['البرمجة', 'التصميم', 'الصيانة', 'الالكترونيات'],
  },
  {
    id: 'health',
    name: 'الكلية الصحية',
    type: 'كلية',
    city: 'مدينة عتق',
    programs: ['تمريض', 'صيدلة', 'مختبرات', 'علوم صحية'],
  },
];

export const homeHighlights = [
  {
    title: 'إدارة محتوى مرنة',
    description: 'واجهة مستقبلية لإضافة وتعديل وحذف الكتب والمواد والمراحل بسهولة.',
    icon: '⚙️',
  },
  {
    title: 'دعم العمل offline',
    description: 'يمكن للطلاب تحميل الكتب والمواد لاستخدامها في أي وقت دون اتصال.',
    icon: '📶',
  },
  {
    title: 'بحث سريع',
    description: 'البحث عن المدارس، الكتب، الجامعات والمناهج في ثوانٍ.',
    icon: '🔎',
  },
];
