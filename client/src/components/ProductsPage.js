import React, { useState } from 'react';
import { api, fmt } from '../App';

export default function ProductsPage({ products, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState({ name: '', category: '', price: '', gst: 5, stock: '', barcode: '' });
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(false);

  function openNew()  { setForm({ name: '', category: '', price: '', gst: 5, stock: '', barcode: '' }); setEditId(null); setShowForm(true); }
  function openEdit(p){ setForm({ ...p }); setEditId(p.id); setShowForm(true); }

  async function handleSave() {
    if (!form.name || !form.price) return;
    setSaving(true);
    const body = { ...form, price: Number(form.price), gst: Number(form.gst), stock: Number(form.stock) };
    if (editId) await api(`/products/${editId}`, { method: 'PUT', body });
    else        await api('/products',            { method: 'POST', body });
    setSaving(false);
    setShowForm(false);
    onUpdate();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    await api(`/products/${id}`, { method: 'DELETE' });
    onUpdate();
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="section-title">Products &amp; Inventory</h2>

      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
          <div className="card-header">
            <span className="card-title">{editId ? 'Edit Product' : 'Add New Product'}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cotton Formal Shirt" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {['Shirts', 'Trousers', 'Ethnic', 'Casual', 'Formals', 'Accessories'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">GST %</label>
              <select className="form-input" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })}>
                {[0, 5, 12, 18].map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Qty</label>
              <input className="form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Barcode</label>
              <input className="form-input" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="e.g. 8901234560001" />
            </div>
          </div>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">{filtered.length} Products</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
            <button className="btn btn-gold" onClick={openNew}>+ Add Product</button>
          </div>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>GST</th><th>Final Price</th><th>Stock</th><th>Barcode</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className="tag">{p.category}</span></td>
                <td>{fmt(p.price)}</td>
                <td>{p.gst}%</td>
                <td style={{ fontWeight: 500, color: 'var(--gold)' }}>{fmt(p.price * (1 + p.gst / 100))}</td>
                <td>
                  <span style={{ fontWeight: 500, color: p.stock < 10 ? 'var(--danger)' : p.stock < 20 ? '#d97706' : 'var(--success)' }}>
                    {p.stock}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)' }}>{p.barcode || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
