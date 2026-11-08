import { useEffect, useMemo, useState } from 'react';
import {
  books,
  directorates,
  homeHighlights,
  quickStats,
  schools,
  stages,
  universities,
} from './data';

const STORAGE_KEY = 'madrasti-offline-books';

const navItems = [
  { key: 'home', label: 'الرئيسية' },
  { key: 'directorates', label: 'المديريات' },
  { key: 'schools', label: 'المدارس' },
  { key: 'stages', label: 'المراحل' },
  { key: 'books', label: 'الكتب' },
  { key: 'universities', label: 'الكليات' },
  { key: 'search', label: 'البحث' },
  { key: 'admin', label: 'الإدارة' },
];

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [query, setQuery] = useState('');
  const [selectedDirectorate, setSelectedDirectorate] = useState(directorates[0]?.id ?? '');
  const [downloadedBooks, setDownloadedBooks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(downloadedBooks));
  }, [downloadedBooks]);

  const filteredBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return books;

    return books.filter((book) => {
      const text = [
        book.title,
        book.subject,
        book.stage,
        book.directorate,
        book.description,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(term);
    });
  }, [query]);

  const filteredSchools = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return schools;

    return schools.filter((school) => {
      const text = [school.name, school.directorateName, school.stage, school.district].join(' ').toLowerCase();
      return text.includes(term);
    });
  }, [query]);

  const filteredUniversities = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return universities;

    return universities.filter((item) => {
      const text = [item.name, item.type, item.city, item.programs.join(' ')].join(' ').toLowerCase();
      return text.includes(term);
    });
  }, [query]);

  const selectedDirectorateSchools = useMemo(() => {
    const directorate = directorates.find((item) => item.id === selectedDirectorate);
    return directorate ? directorate.schools : [];
  }, [selectedDirectorate]);

  const toggleDownload = (bookId) => {
    setDownloadedBooks((current) =>
      current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">م</div>
          <div>
            <p className="eyebrow">منصة تعليمية</p>
            <h1>مدرستي شبوة</h1>
          </div>
        </div>

        <nav className="nav-menu" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={activeSection === item.key ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveSection(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="page-shell">
        {activeSection === 'home' && (
          <>
            <section className="hero card">
              <div className="hero-copy">
                <span className="badge">تجربة تعليمية عربية متكاملة</span>
                <h2>محتوى تعليمي موجه لطلبة محافظة شبوة</h2>
                <p>
                  منصة عربية حديثة لإدارة المدارس، المراحل، الكتب، المواد، والكليات، مع دعم
                  العمل دون اتصال وواجهة مناسبة للجوال.
                </p>

                <div className="hero-actions">
                  <button type="button" onClick={() => setActiveSection('search')}>
                    ابدأ البحث
                  </button>
                  <button type="button" className="secondary" onClick={() => setActiveSection('books')}>
                    تصفح الكتب
                  </button>
                </div>
              </div>

              <div className="hero-panel">
                <div className="mini-stat-grid">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="mini-stat">
                      <span className="mini-emoji">{stat.icon}</span>
                      <strong>{stat.value}</strong>
                      <small>{stat.label}</small>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="stats-row">
              {homeHighlights.map((item) => (
                <article key={item.title} className="info-card card">
                  <span className="feature-icon">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </section>
          </>
        )}

        {activeSection === 'directorates' && (
          <section className="section-block">
            <div className="section-head">
              <h2>المديريات</h2>
              <span>استعراض مديريات محافظة شبوة</span>
            </div>
            <div className="card-grid three-col">
              {directorates.map((directorate) => (
                <article key={directorate.id} className="card content-card">
                  <div className="card-header">
                    <h3>{directorate.name}</h3>
                    <span>{directorate.schools.length} مدرسة</span>
                  </div>
                  <ul>
                    {directorate.schools.map((school) => (
                      <li key={school.id}>{school.name}</li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => { setSelectedDirectorate(directorate.id); setActiveSection('schools'); }}>
                    عرض المدارس
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'schools' && (
          <section className="section-block">
            <div className="section-head">
              <h2>المدارس</h2>
              <span>تصفّح مدارس المديرية المختارة</span>
            </div>

            <div className="filter-row">
              <label htmlFor="directorate-select">اختر المديرية</label>
              <select
                id="directorate-select"
                value={selectedDirectorate}
                onChange={(event) => setSelectedDirectorate(event.target.value)}
              >
                {directorates.map((directorate) => (
                  <option key={directorate.id} value={directorate.id}>
                    {directorate.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="card-grid three-col">
              {selectedDirectorateSchools.map((school) => (
                <article key={school.id} className="card content-card">
                  <div className="card-header">
                    <h3>{school.name}</h3>
                    <span>{school.stage}</span>
                  </div>
                  <p>{school.district}</p>
                  <small>{directorates.find((item) => item.id === selectedDirectorate)?.name}</small>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'stages' && (
          <section className="section-block">
            <div className="section-head">
              <h2>المراحل الدراسية</h2>
              <span>الصفوف والمواد حسب المرحلة</span>
            </div>

            <div className="card-grid two-col">
              {stages.map((stage) => (
                <article key={stage.id} className="card content-card">
                  <div className="card-header">
                    <h3>{stage.name}</h3>
                    <span>{stage.grades.length} صفوف</span>
                  </div>
                  <ul className="tag-list">
                    {stage.grades.map((grade) => (
                      <li key={grade}>{grade}</li>
                    ))}
                  </ul>
                  <div className="divider" />
                  <ul className="subject-list">
                    {stage.subjects.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'books' && (
          <section className="section-block">
            <div className="section-head">
              <h2>الكتب والمناهج</h2>
              <span>منهج معتمد وتجريبي لإدارة الكتب</span>
            </div>

            <div className="card-grid two-col">
              {books.map((book) => {
                const isDownloaded = downloadedBooks.includes(book.id);

                return (
                  <article key={book.id} className="card content-card book-card">
                    <div className="book-meta">
                      <span>{book.stage}</span>
                      <span>{book.subject}</span>
                    </div>
                    <h3>{book.title}</h3>
                    <p>{book.description}</p>
                    <div className="book-detail-row">
                      <small>{book.directorate}</small>
                      <small>{book.pages} صفحة</small>
                    </div>
                    <div className="book-detail-row">
                      <small>نوع الملف: {book.format}</small>
                      <small>الحجم: {book.size}</small>
                    </div>
                    <div className="action-row">
                      <button type="button" className="download-button" onClick={() => toggleDownload(book.id)}>
                        {isDownloaded ? 'إلغاء التحميل' : 'تحميل للمشاهدة دون الاتصال'}
                      </button>
                      <button type="button" className="secondary">
                        قراءة
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeSection === 'universities' && (
          <section className="section-block">
            <div className="section-head">
              <h2>الكليات والجامعات</h2>
              <span>مؤسسات التعليم العالي في شبوة</span>
            </div>

            <div className="card-grid three-col">
              {universities.map((item) => (
                <article key={item.id} className="card content-card">
                  <div className="card-header">
                    <h3>{item.name}</h3>
                    <span>{item.type}</span>
                  </div>
                  <p>{item.city}</p>
                  <ul className="tag-list compact">
                    {item.programs.map((program) => (
                      <li key={program}>{program}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'search' && (
          <section className="section-block">
            <div className="section-head">
              <h2>البحث</h2>
              <span>ابحث عن الكتب والمدارس والكليات</span>
            </div>

            <div className="search-box-wrap">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="اكتب اسم المدرسة أو الكتاب أو الكلية..."
                aria-label="البحث"
              />
            </div>

            <div className="search-results-grid">
              <div className="card search-panel">
                <h3>المدارس</h3>
                {filteredSchools.length ? (
                  <ul>
                    {filteredSchools.map((school) => (
                      <li key={school.id}>{school.name} · {school.directorateName}</li>
                    ))}
                  </ul>
                ) : (
                  <p>لا توجد نتائج.</p>
                )}
              </div>

              <div className="card search-panel">
                <h3>الكتب</h3>
                {filteredBooks.length ? (
                  <ul>
                    {filteredBooks.map((book) => (
                      <li key={book.id}>{book.title} · {book.subject}</li>
                    ))}
                  </ul>
                ) : (
                  <p>لا توجد نتائج.</p>
                )}
              </div>

              <div className="card search-panel">
                <h3>الكليات</h3>
                {filteredUniversities.length ? (
                  <ul>
                    {filteredUniversities.map((item) => (
                      <li key={item.id}>{item.name} · {item.type}</li>
                    ))}
                  </ul>
                ) : (
                  <p>لا توجد نتائج.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'admin' && (
          <section className="section-block">
            <div className="section-head">
              <h2>لوحة الإدارة المستقبلية</h2>
              <span>إضافة وتعديل وحذف المحتوى</span>
            </div>

            <div className="card-grid three-col">
              <article className="card content-card admin-card">
                <h3>إضافة كتاب</h3>
                <p>إدخال عنوان الكتاب، المرحلة، المادة، الملف، وحالة التفعيل.</p>
              </article>

              <article className="card content-card admin-card">
                <h3>إضافة مدرسة</h3>
                <p>تخصيص اسم المدرسة، المديرية، المنطقة، والمراحل المتاحة داخلها.</p>
              </article>

              <article className="card content-card admin-card">
                <h3>إضافة جامعة/كلية</h3>
                <p>إدارة البرامج والخيارات الجامعية المتاحة للطلاب في المحافظة.</p>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
