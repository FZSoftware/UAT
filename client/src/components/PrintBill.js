import React from 'react';
import { SHOP, fmt } from '../App';

export default function PrintBill({ bill, onNew }) {
  return (
    <div>
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button className="btn btn-gold" onClick={() => window.print()}>🖨 Print Bill</button>
        <button className="btn btn-outline" onClick={onNew}>+ New Bill</button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text2)' }}>
          Bill <strong>{bill.id}</strong> saved successfully ✓
        </span>
      </div>

      <div className="bill-preview" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="bill-header">
          <div className="bill-shop-name">{SHOP.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{SHOP.address}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Ph: {SHOP.phone} | GSTIN: {SHOP.gstin}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
          <div>
            <div style={{ color: 'var(--text2)', fontSize: 11 }}>INVOICE</div>
            <div style={{ fontWeight: 600 }}>{bill.id}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text2)', fontSize: 11 }}>DATE</div>
            <div>{bill.date}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 10px', marginBottom: 12, fontSize: 12 }}>
          <div style={{ fontWeight: 500 }}>{bill.customer?.name}</div>
          {bill.customer?.phone && <div style={{ color: 'var(--text2)' }}>📞 {bill.customer.phone}</div>}
          {bill.customer?.email && <div style={{ color: 'var(--text2)' }}>✉ {bill.customer.email}</div>}
        </div>

        <hr className="bill-divider" />

        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '4px 0', color: 'var(--text2)', fontWeight: 500 }}>Item</th>
              <th style={{ textAlign: 'center', padding: '4px 0', color: 'var(--text2)', fontWeight: 500 }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--text2)', fontWeight: 500 }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--text2)', fontWeight: 500 }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {(bill.items || []).map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px dashed var(--border)' }}>
                <td style={{ padding: '5px 0' }}>
                  {item.name}
                  <br /><span style={{ fontSize: 10, color: 'var(--text3)' }}>GST {item.gst}%</span>
                </td>
                <td style={{ textAlign: 'center', padding: '5px 0' }}>{item.qty}</td>
                <td style={{ textAlign: 'right', padding: '5px 0' }}>{fmt(item.price)}</td>
                <td style={{ textAlign: 'right', padding: '5px 0', fontWeight: 500 }}>{fmt(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bill-row"><span style={{ color: 'var(--text2)' }}>Subtotal</span><span>{fmt(bill.subtotal)}</span></div>
        <div className="bill-row"><span style={{ color: 'var(--text2)' }}>GST</span><span>{fmt(bill.tax)}</span></div>
        {bill.discount > 0 && (
          <div className="bill-row">
            <span style={{ color: 'var(--text2)' }}>Discount</span>
            <span style={{ color: 'var(--danger)' }}>- {fmt(bill.discount)}</span>
          </div>
        )}
        <div className="bill-total-row">
          <span>TOTAL</span>
          <span style={{ color: 'var(--gold)', fontFamily: 'Playfair Display, serif', fontSize: 18 }}>{fmt(bill.total)}</span>
        </div>

        <hr className="bill-divider" />
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
          <div>Payment: <strong>{(bill.payMode || 'cash').toUpperCase()}</strong></div>
          <div style={{ marginTop: 4 }}>Thank you for shopping with us!</div>
          <div style={{ letterSpacing: 2, marginTop: 4 }}>★ ★ ★</div>
        </div>
      </div>
    </div>
  );
}
