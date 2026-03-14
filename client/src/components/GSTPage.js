import React, { useState, useEffect } from 'react';
import { api, fmt } from '../App';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function curMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function GSTPage() {
  const [period, setPeriod] = useState(curMonth());
  const [report, setReport] = useState(null);
  const [trend, setTrend]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api(`/gst-report?month=${period}`),
      // fetch last 6 months for trend
      ...Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return api(`/gst-report?month=${m}`).then(r => ({ month: m, ...r }));
      })
    ]).then(([rep, ...trendData]) => {
      setReport(rep);
      setTrend(trendData.reverse());
      setLoading(false);
    });
  }, [period]);

  const availableMonths = Array.from({ length: 12 }, (_, i) => {
    return `2025-${String(i + 1).padStart(2, '0')}`;
  });

  const maxTax = Math.max(...trend.map(t => t.totalTax || 0), 1);

  const slabColors = { 5: '#2d6a4f', 12: '#B8860B', 18: '#c1121f' };

  function exportGSTR() {
    if (!report) return;
    const lines = [
      `GSTR-3B SUMMARY — ${period}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Shop: RAJA MEN'S WEAR | GSTIN: 33AABCU9603R1ZX`,
      '',
      'GST SLAB BREAKDOWN',
      'Rate,Taxable Value,CGST,SGST,Total GST',
      ...(report.slabs || []).map(s =>
        `${s.rate}%,${s.taxable.toFixed(2)},${s.cgst.toFixed(2)},${s.sgst.toFixed(2)},${s.total.toFixed(2)}`
      ),
      '',
      `Total Taxable,${(report.totalTaxable || 0).toFixed(2)}`,
      `Total CGST,${(report.totalCGST || 0).toFixed(2)}`,
      `Total SGST,${(report.totalSGST || 0).toFixed(2)}`,
      `Net GST Payable,${(report.totalTax || 0).toFixed(2)}`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `GSTR3B_${period}.csv`;
    a.click();
  }

  return (
    <div>
      <h2 className="section-title">GST Reports</h2>

      {/* Controls */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Period:</div>
          <select className="form-input" value={period} onChange={e => setPeriod(e.target.value)} style={{ width: 160 }}>
            {availableMonths.map(m => {
              const [y, mo] = m.split('-');
              return <option key={m} value={m}>{MONTHS[parseInt(mo) - 1]} {y}</option>;
            })}
          </select>
          <button className="btn btn-gold btn-sm" style={{ marginLeft: 'auto' }} onClick={exportGSTR}>
            ⬇ Export GSTR-3B CSV
          </button>
        </div>
      </div>

      {loading ? <div className="loading">Loading report…</div> : report && (
        <>
          {/* Summary cards */}
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="stat-card stat-accent">
              <div className="stat-label">Taxable Value</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{fmt(report.totalTaxable || 0)}</div>
              <div className="stat-sub">{report.invoiceCount} invoices</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total GST</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{fmt(report.totalTax || 0)}</div>
              <div className="stat-sub">CGST + SGST</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">CGST</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{fmt(report.totalCGST || 0)}</div>
              <div className="stat-sub">Central tax</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">SGST</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{fmt(report.totalSGST || 0)}</div>
              <div className="stat-sub">State tax</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Slab breakdown */}
            <div className="card">
              <div className="card-header"><span className="card-title">GST Slab Breakdown</span></div>
              {(!report.slabs || report.slabs.length === 0) ? (
                <div className="empty-state">No taxable transactions for this period</div>
              ) : (
                <>
                  {report.slabs.map(s => (
                    <div key={s.rate} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'var(--surface2)', marginBottom: 8, borderLeft: `4px solid ${slabColors[s.rate] || 'var(--gold)'}` }}>
                      <div style={{ fontSize: 22, fontFamily: 'Playfair Display, serif', fontWeight: 600, color: slabColors[s.rate] || 'var(--gold)', minWidth: 46 }}>{s.rate}%</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>GST @ {s.rate}% slab</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Taxable: {fmt(s.taxable)} · CGST: {fmt(s.cgst)} · SGST: {fmt(s.sgst)}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{fmt(s.total)}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: '10px 0', borderTop: '2px solid var(--border)', marginTop: 8, fontSize: 15 }}>
                    <span>Total GST Liability</span>
                    <span style={{ color: 'var(--gold)' }}>{fmt(report.totalTax)}</span>
                  </div>
                </>
              )}

              {/* GSTR-3B table */}
              <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 10, letterSpacing: .5, textTransform: 'uppercase' }}>GSTR-3B Summary</div>
                <table>
                  <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                  <tbody>
                    <tr><td>3.1(a) Outward taxable supplies</td><td style={{ fontWeight: 500 }}>{fmt(report.totalTaxable || 0)}</td></tr>
                    <tr><td>3.1 Total Tax (GST)</td><td style={{ fontWeight: 500 }}>{fmt(report.totalTax || 0)}</td></tr>
                    <tr><td>4 ITC Available</td><td style={{ color: 'var(--text3)' }}>—</td></tr>
                    <tr><td style={{ fontWeight: 600 }}>Net Tax Payable</td><td style={{ fontWeight: 600, color: 'var(--gold)' }}>{fmt(report.totalTax || 0)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly trend */}
            <div className="card">
              <div className="card-header"><span className="card-title">6-Month GST Trend</span></div>
              {trend.map(t => {
                const [y, mo] = t.month.split('-');
                return (
                  <div key={t.month} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--text2)' }}>{MONTHS[parseInt(mo) - 1]} {y}</span>
                      <span style={{ fontWeight: 500 }}>{fmt(t.totalTax || 0)}</span>
                    </div>
                    <div style={{ background: 'var(--surface2)', borderRadius: 3, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: 'var(--gold)', width: `${((t.totalTax || 0) / maxTax) * 100}%`, transition: 'width .4s' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Taxable: {fmt(t.totalTaxable || 0)} · {t.invoiceCount || 0} invoices</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
