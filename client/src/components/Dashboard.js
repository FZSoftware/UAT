import React, { useState, useEffect } from 'react';
import { api, fmt } from '../App';

export default function Dashboard({ invoices, products, expenses }) {
  const [stats, setStats] = useState(null);

  useEffect(() => { api('/stats').then(setStats); }, [invoices, expenses]);

  const lowStock = products.filter(p => p.stock < 15);
  const topItems = {};
  invoices.forEach(inv => (inv.items || []).forEach(item => {
    topItems[item.name] = (topItems[item.name] || 0) + item.qty;
  }));
  const topSorted = Object.entries(topItems).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const revenue = stats?.revenue || 0;
  const expTotal = stats?.expTotal || 0;
  const profit = revenue - expTotal;

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-accent">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{fmt(revenue)}</div>
          <div className="stat-sub">All paid invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{fmt(expTotal)}</div>
          <div className="stat-sub">{expenses.length} entries</div>
        </div>
        <div className="stat-card" style={{ borderLeft: `3px solid ${profit >= 0 ? '#2d6a4f' : 'var(--danger)'}` }}>
          <div className="stat-label">Net Profit</div>
          <div className="stat-value" style={{ color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(Math.abs(profit))}
          </div>
          <div className="stat-sub">{profit >= 0 ? 'Profit' : 'Loss'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Products</div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-sub" style={{ color: lowStock.length ? 'var(--danger)' : '' }}>
            {lowStock.length} low stock
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Invoices</span></div>
          <table>
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.slice(0, 8).map(inv => (
                <tr key={inv.id}>
                  <td style={{ color: 'var(--gold)', fontWeight: 500 }}>{inv.id}</td>
                  <td>{inv.customer?.name}</td>
                  <td>{fmt(inv.total)}</td>
                  <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={4} className="empty-state">No invoices yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Top Selling Items</span></div>
            {topSorted.length === 0 && <div className="empty-state">No sales data yet</div>}
            {topSorted.map(([name, qty], i) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--surface2)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{i + 1}</span>
                  <span style={{ fontSize: 13 }}>{name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{qty} sold</span>
              </div>
            ))}
          </div>

          {lowStock.length > 0 && (
            <div className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
              <div className="card-header"><span className="card-title" style={{ color: 'var(--danger)' }}>⚠ Low Stock Alert</span></div>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--surface2)' }}>
                  <span>{p.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
