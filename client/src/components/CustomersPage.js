import React, { useState } from 'react';
import { api, fmt } from '../App';

export default function CustomersPage({ customers, invoices, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', phone: '', email: '', address: '' });
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(false);

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    await api('/customers', { method: 'POST', body: form });
    setSaving(false);
    setForm({ name: '', phone: '', email: '', address: '' });
    setShowForm(false);
    onUpdate();
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div>
      <h2 className="section-title">Customers</h2>

      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
          <div className="card-header">
            <span className="card-title">Add Customer</span>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Customer'}</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">{filtered.length} Customers</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
            <button className="btn btn-gold" onClick={() => setShowForm(true)}>+ Add Customer</button>
          </div>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Purchases</th><th>Total Spent</th></tr></thead>
          <tbody>
            {filtered.map(c => {
              const cinv  = invoices.filter(i => i.customer?.phone === c.phone && c.phone);
              const spent = cinv.reduce((s, i) => s + i.total, 0);
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{c.address || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{cinv.length}</td>
                  <td style={{ fontWeight: 500, color: 'var(--gold)' }}>{fmt(spent)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-state">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
