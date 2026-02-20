'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

interface Category {
  id: string; name: string; nameEs: string; slug: string;
  description: string | null; isActive: boolean; _count: { products: number };
}

const EMPTY_FORM = { name: '', nameEs: '', slug: '', description: '', imageUrl: '' };

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    api.get('/admin/categories').then((r) => setCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, nameEs: c.nameEs, slug: c.slug, description: c.description || '', imageUrl: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/admin/categories/${editing.id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error saving category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    try {
      await api.patch(`/admin/categories/${c.id}`, { isActive: !c.isActive });
      toast.success(c.isActive ? 'Category deactivated' : 'Category activated');
      fetchCategories();
    } catch {
      toast.error('Error updating category');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3">Name (EN)</th>
                <th className="text-left px-4 py-3">Nombre (ES)</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Products</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.nameEs}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700">{c._count?.products || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${c.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name (EN)</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre (ES)</label>
                <input value={form.nameEs} onChange={(e) => setForm({ ...form, nameEs: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[80px]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminCategoriesPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <CategoriesContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
