import React, { useState } from 'react';
import { api, fmt } from '../App';
import PrintBill from './PrintBill';

export default function InvoicesPage({ invoices, onUpdate }) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]       = useState(null);

  const filtered = invoices.filter(inv => {
    const ms = (inv.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
               inv.id.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || inv.status === statusFilter;
    return ms && mf;
  });

  const total   = invoices.reduce((s, i) => s + i.total, 0);
  const paid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0);

  async function markStatus(id, status) {
    await api(`/invoices/${id}/status`, { method: 'PUT', body: { status } });
    onUpdate();
  }

  return (
    <div>
      <h2 className="section-title">Invoices</h2>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="stat-card stat-accent">
          <div className="stat-label">Total Billed</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(total)}</div>
          <div className="stat-sub">{invoices.length} invoices</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #2d6a4f' }}>
          <div className="stat-label">Collected</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(paid)}</div>
          <div className="stat-sub">{invoices.filter(i => i.status === 'paid').length} paid</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #e76f51' }}>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(pending)}</div>
          <div className="stat-sub">{invoices.filter(i => i.status === 'pending').length} invoices</div>
        </div>
      </div>

      {selected ? (
        <div>
          <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)} style={{ marginBottom: 12 }}>
            ← Back to list
          </button>
          <PrintBill bill={selected} onNew={() => setSelected(null)} />
          {selected.status !== 'paid' && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="btn btn-success" onClick={() => { markStatus(selected.id, 'paid'); setSelected(null); }}>
                ✓ Mark as Paid
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'paid', 'pending', 'cancelled'].map(s => (
                <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setStatusFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
            <input className="form-input" placeholder="Search by name or invoice #…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          </div>
          <table>
            <thead><tr><th>Invoice #</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-state">No invoices found</td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 500, color: 'var(--gold)' }}>{inv.id}</td>
                  <td>{inv.date}</td>
                  <td>
                    <div>{inv.customer?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{inv.customer?.phone}</div>
                  </td>
                  <td>{(inv.items || []).length} item(s)</td>
                  <td style={{ fontWeight: 500 }}>{fmt(inv.total)}</td>
                  <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(inv)}>View</button>
                      {inv.status === 'pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => markStatus(inv.id, 'paid')}>✓ Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
