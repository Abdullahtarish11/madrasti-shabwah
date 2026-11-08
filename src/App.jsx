import { useEffect, useMemo, useState } from 'react';
import { directorates, initialBooks, initialInstitutions, initialSchools, navigation, stages } from './data';
import { getPdf, listSavedPdfIds, removePdf, savePdf } from './storage';

const CONTENT_KEY = 'madrasti-content-v2';
const emptyContent = { schools: initialSchools, books: initialBooks, institutions: initialInstitutions };
const readContent = () => {
  try { return { ...emptyContent, ...JSON.parse(localStorage.getItem(CONTENT_KEY) || '{}') }; }
  catch { return emptyContent; }
};
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatSize = (bytes = 0) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت` : `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;

function App() {
  const [section, setSection] = useState('home');
  const [content, setContent] = useState(readContent);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState(directorates[0]);
  const [savedIds, setSavedIds] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [formType, setFormType] = useState('book');

  useEffect(() => {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    listSavedPdfIds().then(setSavedIds).catch(() => {});
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('./sw.js').catch(() => setNotice('تعذر تفعيل العمل دون اتصال. أعد تحميل الصفحة أو تحقق من الاتصال.'));
    }
    const onPrompt = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  const allSearchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('ar');
    if (!term) return [];
    const matches = (items, type, fields) => items.filter((item) => fields(item).join(' ').toLocaleLowerCase('ar').includes(term)).map((item) => ({ ...item, type }));
    return [
      ...matches(content.schools, 'مدرسة', (x) => [x.name, x.directorate, x.stage, x.location]),
      ...matches(content.books, 'كتاب', (x) => [x.title, x.subject, x.stage, x.description]),
      ...matches(content.institutions, 'كلية/جامعة', (x) => [x.name, x.type, x.location, ...(x.programs || [])]),
      ...matches(directorates.map((name) => ({ id: name, name })), 'مديرية', (x) => [x.name]),
    ];
  }, [content, query]);

  const updateContent = (type, updater) => setContent((current) => ({ ...current, [type]: updater(current[type]) }));
  const setMessage = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 4500); };

  async function saveBookOffline(book) {
    if (!book.file) { setMessage('هذا السجل لا يحتوي على ملف PDF. أضف ملفًا مرخصًا من إدارة المحتوى أولًا.'); return; }
    setBusy(book.id);
    try {
      await savePdf(book.id, book.file);
      setSavedIds(await listSavedPdfIds());
      setMessage('تم حفظ ملف PDF على هذا الجهاز ويمكن فتحه دون اتصال.');
    } catch (error) { setMessage(error.message || 'تعذر حفظ الملف. تحقق من مساحة التخزين.'); }
    finally { setBusy(''); }
  }

  async function openBook(book) {
    setBusy(book.id);
    try {
      const file = await getPdf(book.id);
      if (!file) { setMessage('لا يوجد ملف متاح للقراءة. حمّل PDF مرخصًا من إدارة المحتوى.'); return; }
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(file));
    } catch (error) { setMessage(error.message || 'تعذر فتح الملف.'); }
    finally { setBusy(''); }
  }

  async function removeBookOffline(book) {
    try {
      await removePdf(book.id);
      setSavedIds(await listSavedPdfIds());
      setMessage('تم حذف النسخة المحفوظة من هذا الجهاز.');
    } catch (error) { setMessage(error.message || 'تعذر الحذف.'); }
  }

  async function installApp() {
    if (!installPrompt) { setMessage('للتثبيت: افتح قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية». يلزم HTTPS.'); return; }
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  function submitContent(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = uid();
    if (formType === 'book') {
      const file = form.get('file');
      if (!(file instanceof File) || file.size === 0 || file.type !== 'application/pdf') { setMessage('اختر ملف PDF صالحًا تملك حق استخدامه.'); return; }
      const record = { id, title: form.get('title').trim(), subject: form.get('subject').trim(), stage: form.get('stage').trim(), description: form.get('description').trim(), file, size: formatSize(file.size), fileName: file.name };
      updateContent('books', (items) => [record, ...items]);
    } else if (formType === 'school') {
      updateContent('schools', (items) => [{ id, name: form.get('name').trim(), directorate: form.get('directorate'), stage: form.get('stage').trim(), location: form.get('location').trim() }, ...items]);
    } else {
      updateContent('institutions', (items) => [{ id, name: form.get('name').trim(), type: form.get('type'), location: form.get('location').trim(), programs: form.get('programs').split('،').map((x) => x.trim()).filter(Boolean), verified: false }, ...items]);
    }
    event.currentTarget.reset();
    setMessage('تمت الإضافة على هذا الجهاز.');
  }

  function deleteItem(type, item) {
    if (!window.confirm(`هل تريد حذف «${item.title || item.name}» من هذا الجهاز؟`)) return;
    updateContent(type, (items) => items.filter((entry) => entry.id !== item.id));
    if (type === 'books') removePdf(item.id).then(() => listSavedPdfIds().then(setSavedIds)).catch(() => {});
  }

  const filteredSchools = content.schools.filter((school) => school.directorate === district);
  const formLabel = formType === 'book' ? 'كتاب / ملف PDF' : formType === 'school' ? 'مدرسة' : 'كلية أو جامعة';

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setSection('home'); }} aria-label="مدرستي شبوة، الرئيسية"><span className="brand-mark">م</span><span><strong>مدرستي شبوة</strong><small>تعلم أقرب، معرفة متاحة للجميع</small></span></a>
      <button className="install-button" type="button" onClick={installApp}>＋ تثبيت التطبيق</button>
      <nav className="nav-menu" aria-label="التنقل الرئيسي">{navigation.map(([key, label]) => <button key={key} type="button" className={section === key ? 'nav-button active' : 'nav-button'} onClick={() => setSection(key)}>{label}</button>)}</nav>
    </header>
    <main>
      {notice && <div className="notice" role="status">{notice}<button type="button" aria-label="إغلاق" onClick={() => setNotice('')}>×</button></div>}
      {section === 'home' && <>
        <section className="hero"><div><span className="eyebrow">منصة تعليمية مجتمعية</span><h1>التعليم يصل إليك،<br /><em>حتى دون اتصال.</em></h1><p>مكان واحد لاستكشاف المدارس والمواد التعليمية في شبوة، مع حفظ ملفات PDF التي تملك حق استخدامها على جهازك.</p><div className="hero-actions"><button className="primary-button" onClick={() => setSection('search')}>ابحث في المحتوى <span>←</span></button><button className="text-button" onClick={() => setSection('books')}>استكشف الكتب</button></div></div><div className="hero-art" aria-hidden="true"><div className="art-circle"><span>ب</span></div><div className="art-card"><span>📚</span><strong>معرفتك<br />بين يديك</strong></div><div className="art-dot dot-one"/><div className="art-dot dot-two"/></div></section>
        <section className="quick-links"><button onClick={() => setSection('directorates')}><span>⌖</span><strong>المديريات</strong><small>{directorates.length} مديرية</small></button><button onClick={() => setSection('schools')}><span>⌂</span><strong>المدارس</strong><small>{content.schools.length} سجل مجتمعي</small></button><button onClick={() => setSection('books')}><span>▤</span><strong>الكتب والمواد</strong><small>{content.books.length} ملف متاح</small></button><button onClick={() => setSection('institutions')}><span>✦</span><strong>التعليم العالي</strong><small>{content.institutions.length} جهة مدرجة</small></button></section>
        <section className="welcome-note"><span>✳</span><div><h2>محتوى موثوق يبدأ بمشاركة المجتمع</h2><p>المدارس والكتب غير مضافة تلقائيًا حتى لا ننشر بيانات غير متحققة أو مواد بلا ترخيص. يمكن إضافة المحتوى من إدارة المحتوى.</p></div><button className="text-button" onClick={() => setSection('admin')}>أضف محتوى ←</button></section>
      </>}
      {section === 'directorates' && <section className="section"><SectionHeading eyebrow="دليل المحافظة" title="مديريات شبوة" subtitle="اختر مديرية لاستعراض المدارس التي أضافها المجتمع."/><div className="district-grid">{directorates.map((name, i) => <button key={name} className="district-card" onClick={() => { setDistrict(name); setSection('schools'); }}><span className="district-number">{String(i + 1).padStart(2, '0')}</span><strong>{name}</strong><small>{content.schools.filter((school) => school.directorate === name).length} مدرسة مضافة</small><span className="arrow">←</span></button>)}</div><p className="disclaimer">أسماء المديريات مدخلة كخيارات تنظيمية؛ يرجى التحقق محليًا من التهجئة والتقسيم الإداري قبل النشر الرسمي.</p></section>}
      {section === 'schools' && <section className="section"><SectionHeading eyebrow="دليل المدارس" title="المدارس" subtitle="السجلات المضافة محليًا من إدارة المحتوى."/><label className="field-label" htmlFor="district">المديرية</label><select className="select" id="district" value={district} onChange={(event) => setDistrict(event.target.value)}>{directorates.map((name) => <option key={name}>{name}</option>)}</select>{filteredSchools.length ? <div className="card-grid">{filteredSchools.map((school) => <article className="content-card" key={school.id}><span className="chip">{school.directorate}</span><h3>{school.name}</h3><p>{school.stage || 'المرحلة غير محددة'} · {school.location || 'الموقع غير محدد'}</p><button className="danger-button" onClick={() => deleteItem('schools', school)}>حذف من هذا الجهاز</button></article>)}</div> : <EmptyState title="لا توجد مدارس مضافة بعد" text="أضف بيانات مدرسة تملك صلاحية نشرها من صفحة إدارة المحتوى." action={() => setSection('admin')} />}</section>}
      {section === 'stages' && <section className="section"><SectionHeading eyebrow="المسار التعليمي" title="المراحل والمواد" subtitle="تصنيف إرشادي قابل للتعديل عند اعتماد المنهج المحلي."/><div className="card-grid">{stages.map((stage) => <article className="content-card" key={stage.id}><span className="chip">المراحل الدراسية</span><h3>{stage.name}</h3>{stage.grades.length ? <><h4>الصفوف</h4><div className="tag-list">{stage.grades.map((grade) => <span key={grade}>{grade}</span>)}</div></> : <p>تختلف البرامج بحسب المؤسسة التعليمية.</p>}<h4>مواد أمثلة</h4><div className="tag-list">{stage.subjects.map((subject) => <span key={subject}>{subject}</span>)}</div><p className="disclaimer">تصنيف أولي، وليس توثيقًا رسميًا للمناهج.</p></article>)}</div></section>}
      {section === 'books' && <section className="section"><SectionHeading eyebrow="مكتبة المحتوى" title="الكتب والمواد" subtitle="أضف ملفات PDF مرخصة لتصبح قابلة للحفظ والقراءة دون اتصال."/><div className="privacy-note">الملفات لا تُرفع إلى خادم؛ تحفظ محليًا في متصفح هذا الجهاز فقط. تأكد من امتلاكك حق استخدام الملف.</div>{content.books.length ? <div className="card-grid">{content.books.map((book) => <article className="content-card book-card" key={book.id}><div className="book-symbol">PDF</div><span className="chip">{book.stage || 'مادة تعليمية'}</span><h3>{book.title}</h3><p>{book.description || book.subject || 'ملف تعليمي مضاف محليًا.'}</p><small>{book.fileName} · {book.size}</small><div className="card-actions"><button className="primary-button small" disabled={busy === book.id} onClick={() => saveBookOffline(book)}>{busy === book.id ? 'جارٍ الحفظ…' : savedIds.includes(book.id) ? '✓ محفوظ دون اتصال' : 'حفظ على الجهاز'}</button><button className="text-button" onClick={() => openBook(book)}>قراءة</button><button className="danger-button" onClick={() => deleteItem('books', book)}>حذف</button></div></article>)}</div> : <EmptyState title="المكتبة جاهزة لاستقبال الكتب" text="لا يحتوي المشروع على كتب أو ملفات محمية. أضف ملفات PDF مرخصة من جهازك." action={() => setSection('admin')} />}</section>}
      {section === 'institutions' && <section className="section"><SectionHeading eyebrow="التعليم العالي" title="الكليات والجامعات" subtitle="بيانات أولية تحتاج إلى تحقق ومشاركة المجتمع."/><div className="card-grid">{content.institutions.map((item) => <article className="content-card" key={item.id}><span className="chip">{item.type}{item.verified ? ' · متحقق' : ' · يحتاج إلى تحقق'}</span><h3>{item.name}</h3><p>الموقع: {item.location || 'غير محدد'}</p>{item.programs?.length > 0 && <div className="tag-list">{item.programs.map((program) => <span key={program}>{program}</span>)}</div>}<button className="danger-button" onClick={() => deleteItem('institutions', item)}>حذف من هذا الجهاز</button></article>)}</div><p className="disclaimer">قائمة المؤسسات ليست حصرًا رسميًا. تحقق من الأسماء والمواقع والبرامج مع الجهات التعليمية قبل اعتمادها.</p></section>}
      {section === 'search' && <section className="section"><SectionHeading eyebrow="ابحث واكتشف" title="ما الذي تبحث عنه؟" subtitle="بحث فوري في المديريات والمدارس والكتب والكليات المحفوظة على جهازك."/><input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: عتق، رياضيات، مدرسة…" aria-label="ابحث في المحتوى"/>{query.trim() && (allSearchResults.length ? <div className="search-list">{allSearchResults.map((item) => <article className="search-result" key={`${item.type}-${item.id}`}><span className="chip">{item.type}</span><strong>{item.title || item.name}</strong><small>{item.directorate || item.location || item.subject || ''}</small></article>)}</div> : <EmptyState title="لا توجد نتائج" text="جرّب كلمة أخرى أو أضف المحتوى من إدارة المحتوى." />)}{!query.trim() && <div className="search-hint">ابدأ بكتابة كلمة للبحث في المحتوى المتاح.</div>}</section>}
      {section === 'admin' && <section className="section"><SectionHeading eyebrow="إدارة محلية" title="إضافة محتوى" subtitle="تُحفظ البيانات على هذا الجهاز فقط؛ هذه ليست لوحة إدارة متعددة المستخدمين."/><div className="privacy-note">لا يوجد تسجيل دخول أو خادم مركزي في هذه النسخة. البيانات المحلية لا تنتقل إلى أجهزة أو مستخدمين آخرين.</div><div className="form-tabs">{[['book','كتاب PDF'],['school','مدرسة'],['institution','كلية / جامعة']].map(([key,label]) => <button key={key} className={formType === key ? 'tab active' : 'tab'} onClick={() => setFormType(key)}>{label}</button>)}</div><form className="admin-form" onSubmit={submitContent}><h3>إضافة {formLabel}</h3><label>الاسم / العنوان<input name={formType === 'book' ? 'title' : 'name'} required maxLength="120"/></label>{formType === 'book' && <><label>المادة<input name="subject" maxLength="80" placeholder="مثال: الرياضيات"/></label><label>المرحلة أو الصف<input name="stage" maxLength="80" placeholder="مثال: الصف السادس"/></label><label>وصف موجز<textarea name="description" maxLength="300" rows="3"/></label><label>ملف PDF مرخص<input name="file" type="file" accept="application/pdf,.pdf" required/><small>يحفظ الملف محليًا عند اختيار «حفظ على الجهاز».</small></label></>}{formType === 'school' && <><label>المديرية<select name="directorate">{directorates.map((name) => <option key={name}>{name}</option>)}</select></label><label>المرحلة المتاحة<input name="stage" maxLength="80"/></label><label>المنطقة / الموقع<input name="location" maxLength="100"/></label></>}{formType === 'institution' && <><label>النوع<select name="type"><option>جامعة</option><option>كلية</option><option>معهد</option></select></label><label>المدينة / الموقع<input name="location" maxLength="100"/></label><label>البرامج (افصل بينها بعلامة ،)<input name="programs" maxLength="300"/></label></>}<button className="primary-button" type="submit">إضافة {formLabel}</button></form></section>}
      <footer className="footer"><span>مدرستي شبوة</span><span>نسخة أولية مجتمعية · المحتوى يحتاج إلى التحقق قبل الاعتماد</span></footer>
    </main>
    {pdfUrl && <div className="reader-backdrop" role="dialog" aria-modal="true" aria-label="قارئ PDF"><div className="reader-toolbar"><strong>قارئ PDF</strong><a href={pdfUrl} download>تنزيل نسخة</a><button onClick={() => { URL.revokeObjectURL(pdfUrl); setPdfUrl(''); }}>إغلاق</button></div><iframe title="ملف PDF" src={pdfUrl}/></div>}
  </div>;
}

function SectionHeading({ eyebrow, title, subtitle }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>; }
function EmptyState({ title, text, action }) { return <div className="empty-state"><span>✳</span><h2>{title}</h2><p>{text}</p>{action && <button className="primary-button small" onClick={action}>إضافة محتوى</button>}</div>; }

export default App;
