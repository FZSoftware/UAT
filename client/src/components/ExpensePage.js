import React, { useState } from 'react';
import { api, fmt } from '../App';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const EXPENSE_CATS = ['Rent', 'Salary', 'Utilities', 'Stock Purchase', 'Maintenance', 'Other'];

function curMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function today() { return new Date().toISOString().split('T')[0]; }

const catClass = {
  'Rent': 'exp-rent', 'Salary': 'exp-salary', 'Utilities': 'exp-utilities',
  'Stock Purchase': 'exp-stock', 'Maintenance': 'exp-maintenance', 'Other': 'exp-other',
};

export default function ExpensePage({ expenses, invoices, onUpdate }) {
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ date: today(), category: 'Rent', description: '', amount: '' });
  const [filterCat, setFilterCat]   = useState('All');
  const [filterMonth, setFilterMonth] = useState(curMonth());
  const [saving, setSaving]         = useState(false);

  async function handleSave() {
    if (!form.description || !form.amount) return;
    setSaving(true);
    await api('/expenses', { method: 'POST', body: { ...form, amount: Number(form.amount) } });
    setSaving(false);
    setForm({ date: today(), category: 'Rent', description: '', amount: '' });
    setShowForm(false);
    onUpdate();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return;
    await api(`/expenses/${id}`, { method: 'DELETE' });
    onUpdate();
  }

  const filtered = expenses.filter(e => {
    const mOk = e.date.startsWith(filterMonth);
    const cOk = filterCat === 'All' || e.category === filterCat;
    return mOk && cOk;
  });

  const totalExp = filtered.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const catTotals = {};
  filtered.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const catRows = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...Object.values(catTotals), 1);

  // P&L for selected month
  const monthRevenue = invoices
    .filter(i => i.status === 'paid' && i.date.startsWith(filterMonth))
    .reduce((s, i) => s + i.total, 0);
  const profit = monthRevenue - totalExp;

  const availableMonths = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, '0')}`);

  return (
    <div>
      <h2 className="section-title">Expense Tracker</h2>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
          <div className="card-header">
            <span className="card-title">Add Expense</span>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input className="form-input" type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
          </div>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Expense'}</button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat-card stat-accent">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(totalExp)}</div>
          <div className="stat-sub">{filtered.length} entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue (this month)</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(monthRevenue)}</div>
          <div className="stat-sub">Paid invoices</div>
        </div>
        <div className="stat-card" style={{ borderLeft: `3px solid ${profit >= 0 ? '#2d6a4f' : 'var(--danger)'}` }}>
          <div className="stat-label">Net Profit / Loss</div>
          <div className="stat-value" style={{ fontSize: 20, color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {profit >= 0 ? '' : '−'}{fmt(Math.abs(profit))}
          </div>
          <div className="stat-sub">{profit >= 0 ? 'Profit' : 'Loss'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Largest Expense</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{catRows[0] ? fmt(catRows[0][1]) : '₹0.00'}</div>
          <div className="stat-sub">{catRows[0]?.[0] || '—'}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Expense list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Expense Entries</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select className="form-input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 130 }}>
                {availableMonths.map(m => {
                  const [y, mo] = m.split('-');
                  return <option key={m} value={m}>{MONTHS[parseInt(mo) - 1]} {y}</option>;
                })}
              </select>
              <select className="form-input" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 140 }}>
                <option value="All">All Categories</option>
                {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn btn-gold btn-sm" onClick={() => setShowForm(true)}>+ Add</button>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No expenses for this period</div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td><span className={`exp-badge ${catClass[e.category] || 'exp-other'}`}>{e.category}</span></td>
                    <td>{e.description}</td>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{fmt(e.amount)}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>✕</button></td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--accent-bg)' }}>
                  <td colSpan={3} style={{ fontWeight: 600, textAlign: 'right' }}>Total</td>
                  <td colSpan={2} style={{ fontWeight: 600, color: 'var(--gold)' }}>{fmt(totalExp)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Breakdown + P&L */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Category Breakdown</span></div>
            {catRows.length === 0 ? (
              <div className="empty-state">No data for this period</div>
            ) : catRows.map(([cat, amt]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span className={`exp-badge ${catClass[cat] || 'exp-other'}`}>{cat}</span>
                  <span style={{ fontWeight: 500 }}>
                    {fmt(amt)} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({((amt / totalExp) * 100).toFixed(1)}%)</span>
                  </span>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'var(--gold)', width: `${(amt / maxCat) * 100}%`, transition: 'width .4s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* P&L card */}
          <div className="card" style={{ borderLeft: `3px solid ${profit >= 0 ? '#2d6a4f' : 'var(--danger)'}` }}>
            <div className="card-header">
              <span className="card-title">P&amp;L — {MONTHS[parseInt(filterMonth.split('-')[1]) - 1]}</span>
            </div>
            <div className="bill-row"><span style={{ color: 'var(--text2)' }}>Revenue</span><span style={{ color: 'var(--success)', fontWeight: 500 }}>{fmt(monthRevenue)}</span></div>
            <div className="bill-row"><span style={{ color: 'var(--text2)' }}>Expenses</span><span style={{ color: 'var(--danger)', fontWeight: 500 }}>− {fmt(totalExp)}</span></div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
            <div className="bill-row" style={{ fontSize: 16, fontWeight: 700 }}>
              <span>Net {profit >= 0 ? 'Profit' : 'Loss'}</span>
              <span style={{ color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>{profit >= 0 ? '' : '−'}{fmt(Math.abs(profit))}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              Profit margin: {monthRevenue > 0 ? ((profit / monthRevenue) * 100).toFixed(1) + '%' : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
