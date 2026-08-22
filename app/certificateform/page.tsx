'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';

interface CertificateData {
  certificateType: string;
  certificateNumber: string;
  studentName: string;
  studentId: string;
  parentName: string;
  dateOfBirth: string;
  className: string;
  section: string;
  academicSession: string;
  dateOfIssue: string;
  description: string;
  principalName: string;
  classTeacherName: string;
  schoolName: string;
  schoolAddress: string;
  schoolContact: string;
}
type TemplateFields = Pick<
  CertificateData,
  | 'certificateType'
  | 'description'
  | 'principalName'
  | 'classTeacherName'
  | 'schoolName'
  | 'schoolAddress'
  | 'schoolContact'
>;

interface Template {
  id: string;
  name: string;
  data: TemplateFields;
  updatedAt: string;
}

const TEMPLATE_KEYS: (keyof TemplateFields)[] = [
  'certificateType',
  'description',
  'principalName',
  'classTeacherName',
  'schoolName',
  'schoolAddress',
  'schoolContact',
];

const CERTIFICATE_TYPES = [
  'Bonafide Certificate',
  'Transfer Certificate',
  'Character Certificate',
  'Study Certificate',
  'Merit Certificate',
  'Participation Certificate',
  'Custom',
];

const STORAGE_KEY = 'certificate-templates';

const emptyForm: CertificateData = {
  certificateType: 'Bonafide Certificate',
  certificateNumber: '',
  studentName: '',
  studentId: '',
  parentName: '',
  dateOfBirth: '',
  className: '',
  section: '',
  academicSession: '',
  dateOfIssue: '',
  description: 'This is to certify that the above-named student is a bonafide student of this institution during the academic session mentioned above.',
  principalName: '',
  classTeacherName: '',
  schoolName: '',
  schoolAddress: '',
  schoolContact: '',
};
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors';

export default function CertificateForm() {
  const [form, setForm] = useState<CertificateData>(emptyForm);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTemplates(JSON.parse(raw));
    } catch {
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }
  function update<K extends keyof CertificateData>(key: K, value: CertificateData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function applyTemplate(id: string) {
    setSelectedTemplateId(id);
    if (!id) return;
    const t = templates.find((tpl) => tpl.id === id);
    if (!t) return;
    setForm((prev) => ({ ...prev, ...t.data }));
    showToast(`Applied template "${t.name}"`);
  }
  function openSaveModal() {
    setTemplateName('');
    setSaveModalOpen(true);
  }
  function saveTemplate() {
    const name = templateName.trim();
    if (!name) return;
    const data = TEMPLATE_KEYS.reduce((acc, key) => {
      acc[key] = form[key];
      return acc;
    },{} as TemplateFields);
    const existing = templates.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existing){
      setTemplates((prev)=>
        prev.map((t)=>
          t.id === existing.id
            ? {...t,data,updatedAt:new Date().toISOString() }
            : t
        )
      );
      showToast(`Updated template "${name}"`);
    } else {
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        name,
        data,
        updatedAt: new Date().toISOString(),
      };
      setTemplates((prev) => [...prev, newTemplate]);
      setSelectedTemplateId(newTemplate.id);
      showToast(`Saved template "${name}"`);
    }
    setSaveModalOpen(false);
  }

  function deleteTemplate(id: string) {
    const t = templates.find((tpl) => tpl.id === id);
    setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId('');
    if (t) showToast(`Deleted template "${t.name}"`);
  }

  function resetForm() {
    setForm(emptyForm);
    setSelectedTemplateId('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Certificate submitted:', form);
    showToast('Certificate saved');
  }

  return (
    <AppLayout
      title="Certificate Generator"
      subtitle="Fill in the student and certificate details, or start from a saved template."
    >
      <div className="mx-auto max-w-7xl">
        {/* Template controls — page-specific actions, title/subtitle now live in AppLayout */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => applyTemplate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Load a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {selectedTemplateId && (
            <button
              type="button"
              onClick={() => deleteTemplate(selectedTemplateId)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={openSaveModal}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Save as Template
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <Section title="Certificate Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Certificate Type" required>
                  <select
                    className={inputClass}
                    value={form.certificateType}
                    onChange={(e) => update('certificateType', e.target.value)}
                    required
                  >
                    {CERTIFICATE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Certificate Number" required>
                  <input
                    className={inputClass}
                    value={form.certificateNumber}
                    onChange={(e) => update('certificateNumber', e.target.value)}
                    placeholder="e.g. CERT-2026-0142"
                    required
                  />
                </Field>
              </div>
            </Section>

            <Section title="Student Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Student Name" required>
                  <input
                    className={inputClass}
                    value={form.studentName}
                    onChange={(e) => update('studentName', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </Field>
                <Field label="Student ID / Admission Number" required>
                  <input
                    className={inputClass}
                    value={form.studentId}
                    onChange={(e) => update('studentId', e.target.value)}
                    placeholder="e.g. ADM-3021"
                    required
                  />
                </Field>
                <Field label="Father's / Mother's Name">
                  <input
                    className={inputClass}
                    value={form.parentName}
                    onChange={(e) => update('parentName', e.target.value)}
                    placeholder="Parent / guardian name"
                  />
                </Field>
                <Field label="Date of Birth">
                  <input
                    type="date"
                    className={inputClass}
                    value={form.dateOfBirth}
                    onChange={(e) => update('dateOfBirth', e.target.value)}
                  />
                </Field>
                <Field label="Class" required>
                  <input
                    className={inputClass}
                    value={form.className}
                    onChange={(e) => update('className', e.target.value)}
                    placeholder="e.g. 10"
                    required
                  />
                </Field>
                <Field label="Section">
                  <input
                    className={inputClass}
                    value={form.section}
                    onChange={(e) => update('section', e.target.value)}
                    placeholder="e.g. A"
                  />
                </Field>
                <Field label="Academic Session" required>
                  <input
                    className={inputClass}
                    value={form.academicSession}
                    onChange={(e) => update('academicSession', e.target.value)}
                    placeholder="e.g. 2025–2026"
                    required
                  />
                </Field>
                <Field label="Date of Issue" required>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.dateOfIssue}
                    onChange={(e) => update('dateOfIssue', e.target.value)}
                    required
                  />
                </Field>
              </div>
            </Section>

            <Section title="Certificate Content" hint="Reusable — included when you save a template">
              <Field label="Certificate Description" required>
                <textarea
                  className={`${inputClass} min-h-[110px] resize-y`}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="The statement printed on the certificate body…"
                  required
                />
              </Field>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Principal Name">
                  <input
                    className={inputClass}
                    value={form.principalName}
                    onChange={(e) => update('principalName', e.target.value)}
                    placeholder="Principal's full name"
                  />
                </Field>
                <Field label="Class Teacher Name">
                  <input
                    className={inputClass}
                    value={form.classTeacherName}
                    onChange={(e) => update('classTeacherName', e.target.value)}
                    placeholder="Class teacher's full name"
                  />
                </Field>
              </div>
            </Section>

            <Section title="School Information" hint="Reusable — included when you save a template">
              <div className="grid grid-cols-1 gap-4">
                <Field label="School Name" required>
                  <input
                    className={inputClass}
                    value={form.schoolName}
                    onChange={(e) => update('schoolName', e.target.value)}
                    placeholder="School / institution name"
                    required
                  />
                </Field>
                <Field label="School Address" required>
                  <input
                    className={inputClass}
                    value={form.schoolAddress}
                    onChange={(e) => update('schoolAddress', e.target.value)}
                    placeholder="Full postal address"
                    required
                  />
                </Field>
                <Field label="School Contact Information">
                  <input
                    className={inputClass}
                    value={form.schoolContact}
                    onChange={(e) => update('schoolContact', e.target.value)}
                    placeholder="Phone, email, or website"
                  />
                </Field>
              </div>
            </Section>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Save Certificate
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear Form
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <p className="mb-2 text-sm font-medium text-slate-500">Live Preview</p>
              <CertificatePreview data={form} />
            </div>
          </div>
        </form>
      </div>
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900">Save as Template</h2>
            <p className="mt-1 text-sm text-slate-500">
              Saves the certificate type, description, signatories, and school info for reuse.
            </p>
            <input
              autoFocus
              className={`${inputClass} mt-4`}
              placeholder="Template name, e.g. Bonafide — Default"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                disabled={!templateName.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </AppLayout>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
function CertificatePreview({ data }: { data: CertificateData }) {
  const formatDate = (value: string) => {
    if (!value) return '__________';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  return (
    <div className="rounded-xl border-[3px] border-double border-indigo-900/80 bg-[#fdfbf5] p-8 shadow-md">
      <div className="border border-indigo-900/20 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-900/70">
          {data.schoolName || 'School Name'}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {data.schoolAddress || 'School Address'}
        </p>
        {data.schoolContact && (
          <p className="text-[11px] text-slate-500">{data.schoolContact}</p>
        )}

        <div className="mx-auto my-4 h-px w-24 bg-indigo-900/30" />

        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide text-indigo-950">
          {data.certificateType || 'Certificate'}
        </h1>
        <p className="mt-1 text-[11px] text-slate-400">
          Certificate No. {data.certificateNumber || '—'}
        </p>

        <p className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed text-slate-700">
          {data.description}
        </p>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-x-6 gap-y-2 text-left text-[12px] text-slate-700">
          <PreviewRow label="Name" value={data.studentName} />
          <PreviewRow label="Student ID" value={data.studentId} />
          <PreviewRow label="Parent/Guardian" value={data.parentName} />
          <PreviewRow label="Date of Birth" value={data.dateOfBirth ? formatDate(data.dateOfBirth) : ''} />
          <PreviewRow label="Class" value={data.className} />
          <PreviewRow label="Section" value={data.section} />
          <PreviewRow label="Session" value={data.academicSession} />
          <PreviewRow label="Date of Issue" value={formatDate(data.dateOfIssue)} />
        </div>

        <div className="mt-10 flex items-end justify-between text-[11px] text-slate-600">
          <div className="text-center">
            <div className="mb-1 h-8 w-28 border-b border-slate-400" />
            {data.classTeacherName || 'Class Teacher'}
          </div>
          <div className="text-center">
            <div className="mb-1 h-8 w-28 border-b border-slate-400" />
            {data.principalName || 'Principal'}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400">{label}: </span>
      <span className="font-medium text-slate-800">{value || '—'}</span>
    </div>
  );
}