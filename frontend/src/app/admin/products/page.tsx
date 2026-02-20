'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; nameEs: string; }
interface Product {
  id: string; name: string; nameEs: string; slug: string;
  price: string; stock: number; isActive: boolean; isFeatured: boolean;
  imageUrls: string[]; category: Category; sku: string | null;
}

const EMPTY_FORM = {
  name: '', nameEs: '', slug: '', description: '', descriptionEs: '',
  price: '', comparePrice: '', stock: '', sku: '', imageUrls: '',
  categoryId: '', isFeatured: false, weight: '',
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    api.get('/admin/products?limit=100').then((r) => setProducts(r.data.products)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, nameEs: p.nameEs, slug: p.slug,
      description: '', descriptionEs: '', price: p.price,
      comparePrice: '', stock: String(p.stock), sku: p.sku || '',
      imageUrls: p.imageUrls.join(', '), categoryId: p.category.id,
      isFeatured: p.isFeatured, weight: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        weight: form.weight ? parseFloat(form.weight) : null,
        imageUrls: form.imageUrls.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editing) {
        await api.patch(`/admin/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error saving product';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      if (p.isActive) {
        await api.delete(`/admin/products/${p.id}`);
        toast.success('Product deactivated');
      } else {
        await api.patch(`/admin/products/${p.id}`, { isActive: true });
        toast.success('Product activated');
      }
      fetchProducts();
    } catch {
      toast.error('Error updating product');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-gray-400 text-xs">{p.sku || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => toggleActive(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={p.isActive ? 'Deactivate' : 'Activate'}>
                        {p.isActive ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} className="text-gray-400" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name (EN)</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre (ES)</label>
                  <input value={form.nameEs} onChange={(e) => setForm({ ...form, nameEs: e.target.value })} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Description (EN)</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[80px]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción (ES)</label>
                  <textarea value={form.descriptionEs} onChange={(e) => setForm({ ...form, descriptionEs: e.target.value })} className="input min-h-[80px]" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compare Price ($)</label>
                  <input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input" required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (comma-separated)</label>
                <input value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} className="input" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                <label htmlFor="featured" className="text-sm font-medium">Featured product</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
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

export default function AdminProductsPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <ProductsContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
