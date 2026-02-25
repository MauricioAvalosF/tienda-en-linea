'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Save, Globe, Layout, Settings2, Eye, EyeOff, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CmsSection {
  key: string; label: string; type: string; isActive: boolean; order: number;
  heading?: string; headingEs?: string; subheading?: string; subheadingEs?: string;
  badge?: string; badgeEs?: string; body?: string; bodyEs?: string;
  imageUrl?: string; ctaText?: string; ctaTextEs?: string; ctaUrl?: string;
  ctaText2?: string; ctaText2Es?: string; ctaUrl2?: string;
}

interface SiteSetting {
  key: string; value: string; type: string; label: string; group: string;
}

type Tab = 'sections' | 'settings';

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Banner', announcement: 'Announcement Bar', text: 'Text Section', banner: 'Promo Banner',
};

const SETTING_GROUPS: Record<string, { label: string; icon: string }> = {
  general: { label: 'General', icon: '🏪' },
  contact: { label: 'Contact', icon: '📞' },
  social: { label: 'Social Media', icon: '📱' },
  seo: { label: 'SEO', icon: '🔍' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ImagePreview({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <div className="mt-2 rounded-lg overflow-hidden border aspect-video bg-gray-100 dark:bg-gray-800">
      <img src={url} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

// ─── Section Editor ───────────────────────────────────────────────────────────

function SectionEditor({ section, onSave }: { section: CmsSection; onSave: () => void }) {
  const t = useTranslations('admin');
  const [form, setForm] = useState<CmsSection>(section);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(section); }, [section]);

  const set = (field: keyof CmsSection, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/cms/sections/${form.key}`, form);
      toast.success(t('cms.saveSection'));
      onSave();
    } catch {
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    const newActive = !form.isActive;
    set('isActive', newActive);
    try {
      await api.patch(`/admin/cms/sections/${form.key}`, { isActive: newActive });
      toast.success(newActive ? t('cms.visible') : t('cms.hidden'));
      onSave();
    } catch {
      toast.error('Error updating section');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{form.label}</h2>
          <span className="text-xs text-gray-400">{SECTION_TYPE_LABELS[form.type] || form.type} · key: {form.key}</span>
        </div>
        <button onClick={toggleActive} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors ${form.isActive ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          {form.isActive ? <><Eye size={14} /> {t('cms.visible')}</> : <><EyeOff size={14} /> {t('cms.hidden')}</>}
        </button>
      </div>

      {/* Badge (hero only) */}
      {form.type === 'hero' && (
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Badge (EN)">
            <input value={form.badge || ''} onChange={(e) => set('badge', e.target.value)} className="input text-sm" placeholder="e.g. Premium Fragrances" />
          </FieldGroup>
          <FieldGroup label="Badge (ES)">
            <input value={form.badgeEs || ''} onChange={(e) => set('badgeEs', e.target.value)} className="input text-sm" placeholder="ej. Fragancias Premium" />
          </FieldGroup>
        </div>
      )}

      {/* Heading */}
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Heading (EN)">
          <input value={form.heading || ''} onChange={(e) => set('heading', e.target.value)} className="input text-sm" />
        </FieldGroup>
        <FieldGroup label="Título (ES)">
          <input value={form.headingEs || ''} onChange={(e) => set('headingEs', e.target.value)} className="input text-sm" />
        </FieldGroup>
      </div>

      {/* Subheading */}
      {form.type !== 'announcement' && (
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Subheading (EN)">
            <textarea value={form.subheading || ''} onChange={(e) => set('subheading', e.target.value)} className="input text-sm min-h-[80px]" />
          </FieldGroup>
          <FieldGroup label="Subtítulo (ES)">
            <textarea value={form.subheadingEs || ''} onChange={(e) => set('subheadingEs', e.target.value)} className="input text-sm min-h-[80px]" />
          </FieldGroup>
        </div>
      )}

      {/* Image */}
      {(form.type === 'hero' || form.type === 'banner') && (
        <FieldGroup label="Image URL">
          <div className="flex gap-2">
            <input value={form.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} className="input text-sm flex-1" placeholder="https://..." />
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Preview">
              <ImageIcon size={16} />
            </button>
          </div>
          <ImagePreview url={form.imageUrl} />
        </FieldGroup>
      )}

      {/* CTA Buttons */}
      {(form.type === 'hero' || form.type === 'banner' || form.type === 'announcement') && (
        <div className="space-y-4 border rounded-xl p-4 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('cms.ctaButton1')}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <FieldGroup label="Text (EN)">
                <input value={form.ctaText || ''} onChange={(e) => set('ctaText', e.target.value)} className="input text-sm" />
              </FieldGroup>
            </div>
            <div className="col-span-1">
              <FieldGroup label="Text (ES)">
                <input value={form.ctaTextEs || ''} onChange={(e) => set('ctaTextEs', e.target.value)} className="input text-sm" />
              </FieldGroup>
            </div>
            <div className="col-span-1">
              <FieldGroup label="URL">
                <input value={form.ctaUrl || ''} onChange={(e) => set('ctaUrl', e.target.value)} className="input text-sm" placeholder="/products" />
              </FieldGroup>
            </div>
          </div>

          {form.type === 'hero' && (
            <>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('cms.ctaButton2')}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <FieldGroup label="Text (EN)">
                    <input value={form.ctaText2 || ''} onChange={(e) => set('ctaText2', e.target.value)} className="input text-sm" />
                  </FieldGroup>
                </div>
                <div className="col-span-1">
                  <FieldGroup label="Text (ES)">
                    <input value={form.ctaText2Es || ''} onChange={(e) => set('ctaText2Es', e.target.value)} className="input text-sm" />
                  </FieldGroup>
                </div>
                <div className="col-span-1">
                  <FieldGroup label="URL">
                    <input value={form.ctaUrl2 || ''} onChange={(e) => set('ctaUrl2', e.target.value)} className="input text-sm" placeholder="/products?category=niche" />
                  </FieldGroup>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Body (text sections) */}
      {form.type === 'text' && (
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Body (EN)">
            <textarea value={form.body || ''} onChange={(e) => set('body', e.target.value)} className="input text-sm min-h-[100px]" />
          </FieldGroup>
          <FieldGroup label="Cuerpo (ES)">
            <textarea value={form.bodyEs || ''} onChange={(e) => set('bodyEs', e.target.value)} className="input text-sm min-h-[100px]" />
          </FieldGroup>
        </div>
      )}

      {/* Display order */}
      <FieldGroup label={t('cms.displayOrder')}>
        <input type="number" value={form.order} onChange={(e) => set('order', parseInt(e.target.value))} className="input text-sm w-24" />
      </FieldGroup>

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6">
        <Save size={16} />
        {saving ? t('cms.saving') : t('cms.saveSection')}
      </button>
    </div>
  );
}

// ─── Settings Editor ──────────────────────────────────────────────────────────

function SettingsEditor({ settings, onSave }: { settings: SiteSetting[]; onSave: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    setValues(map);
  }, [settings]);

  const handleSave = async (setting: SiteSetting) => {
    setSaving(setting.key);
    try {
      await api.patch(`/admin/cms/settings/${setting.key}`, { value: values[setting.key] });
      toast.success(`${setting.label} saved`);
      onSave();
    } catch {
      toast.error('Error saving setting');
    } finally {
      setSaving(null);
    }
  };

  const groups = Array.from(new Set(settings.map((s) => s.group)));

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const groupSettings = settings.filter((s) => s.group === group);
        const info = SETTING_GROUPS[group] || { label: group, icon: '⚙️' };
        return (
          <div key={group}>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <span>{info.icon}</span> {info.label}
            </h3>
            <div className="card divide-y dark:divide-gray-800">
              {groupSettings.map((s) => (
                <div key={s.key} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-40 shrink-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.key}</p>
                  </div>
                  <div className="flex-1">
                    {s.type === 'image' ? (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={values[s.key] || ''}
                          onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                          className="input text-sm"
                          placeholder="https://..."
                        />
                        {values[s.key] && (
                          <img src={values[s.key]} alt="preview" className="h-10 object-contain rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        )}
                      </div>
                    ) : s.type === 'color' ? (
                      <div className="flex gap-2 items-center">
                        <input type="color" value={values[s.key] || '#000000'} onChange={(e) => setValues({ ...values, [s.key]: e.target.value })} className="h-9 w-14 rounded border cursor-pointer" />
                        <input type="text" value={values[s.key] || ''} onChange={(e) => setValues({ ...values, [s.key]: e.target.value })} className="input text-sm w-32" />
                      </div>
                    ) : (
                      <input
                        type={s.type === 'url' ? 'url' : 'text'}
                        value={values[s.key] || ''}
                        onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                        className="input text-sm"
                        placeholder={s.type === 'url' ? 'https://...' : ''}
                      />
                    )}
                  </div>
                  <button onClick={() => handleSave(s)} disabled={saving === s.key} className="btn-primary text-sm px-3 py-2 shrink-0">
                    {saving === s.key ? '...' : <Save size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── New Section Modal ────────────────────────────────────────────────────────

function NewSectionModal({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [form, setForm] = useState({ key: '', label: '', type: 'text', order: 10 });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/cms/sections', { ...form, isActive: true });
      toast.success(t('cms.create'));
      onCreated();
      onClose();
    } catch {
      toast.error('Error (key must be unique)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6">
        <h2 className="font-bold text-lg mb-4">{t('cms.newSection')}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('cms.sectionKey')}</label>
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s/g, '_') })} className="input" placeholder="my_section" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('cms.sectionLabel')}</label>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input" placeholder="My Section" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('cms.sectionType')}</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              <option value="hero">Hero Banner</option>
              <option value="banner">Promo Banner</option>
              <option value="text">Text Section</option>
              <option value="announcement">Announcement Bar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('cms.sectionOrder')}</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="input w-24" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? t('cms.creating') : t('cms.create')}</button>
            <button type="button" onClick={onClose} className="btn-secondary px-5">{tc('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main CMS Page ────────────────────────────────────────────────────────────

function CmsContent() {
  const t = useTranslations('admin');
  const [tab, setTab] = useState<Tab>('sections');
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [selectedSection, setSelectedSection] = useState<CmsSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewSection, setShowNewSection] = useState(false);

  const fetchData = async () => {
    try {
      const [secRes, setRes] = await Promise.all([
        api.get('/admin/cms/sections'),
        api.get('/admin/cms/settings'),
      ]);
      setSections(secRes.data);
      setSettings(setRes.data);
      if (secRes.data.length && !selectedSection) setSelectedSection(secRes.data[0]);
    } catch {
      toast.error('Error loading CMS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete section "${key}"?`)) return;
    try {
      await api.delete(`/admin/cms/sections/${key}`);
      toast.success(t('cms.newSection'));
      setSelectedSection(null);
      fetchData();
    } catch {
      toast.error('Error deleting section');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('cms.title')}</h1>
        <div className="flex items-center gap-2">
          {tab === 'sections' && (
            <button onClick={() => setShowNewSection(true)} className="btn-secondary flex items-center gap-1.5 text-sm">
              <Plus size={16} /> {t('cms.newSection')}
            </button>
          )}
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setTab('sections')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'sections' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Layout size={15} /> {t('cms.sections')}
            </button>
            <button onClick={() => setTab('settings')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'settings' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Settings2 size={15} /> {t('cms.settings')}
            </button>
          </div>
        </div>
      </div>

      {tab === 'sections' ? (
        <div className="flex gap-6 min-h-[600px]">
          {/* Section list */}
          <div className="w-56 shrink-0 space-y-1">
            {sections.sort((a, b) => a.order - b.order).map((s) => (
              <div key={s.key} className="group relative">
                <button
                  onClick={() => setSelectedSection(s)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedSection?.key === s.key ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{s.label}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ml-2 ${s.isActive ? 'bg-green-400' : 'bg-gray-300'}`} title={s.isActive ? 'Visible' : 'Hidden'} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{SECTION_TYPE_LABELS[s.type] || s.type}</p>
                </button>
                {/* Delete button on hover */}
                <button onClick={() => handleDelete(s.key)} className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-all" title="Delete section">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Section editor */}
          <div className="flex-1 card p-6">
            {selectedSection ? (
              <SectionEditor
                key={selectedSection.key}
                section={selectedSection}
                onSave={() => { fetchData(); }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <Globe size={40} />
                <p>{t('cms.selectSection')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SettingsEditor settings={settings} onSave={fetchData} />
      )}

      {showNewSection && (
        <NewSectionModal onCreated={fetchData} onClose={() => setShowNewSection(false)} />
      )}
    </>
  );
}

export default function AdminCmsPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <CmsContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
