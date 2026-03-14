import React, { useState } from 'react';
import { api, fmt } from '../App';
import PrintBill from './PrintBill';

export default function BillingPage({ products, customers, cartItems, setCartItems, onSave }) {
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('All');
  const [custMode, setCustMode]     = useState('walkin');
  const [custName, setCustName]     = useState('Walk-in Customer');
  const [custPhone, setCustPhone]   = useState('');
  const [custEmail, setCustEmail]   = useState('');
  const [discount, setDiscount]     = useState(0);
  const [discType, setDiscType]     = useState('flat');
  const [payMode, setPayMode]       = useState('cash');
  const [savedBill, setSavedBill]   = useState(null);
  const [selectedCust, setSelectedCust] = useState(null);
  const [saving, setSaving]         = useState(false);

  const cats = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const catOk = catFilter === 'All' || p.category === catFilter;
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  function addItem(prod) {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === prod.id);
      if (ex) return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: prod.id, name: prod.name, price: prod.price, gst: prod.gst, qty: 1 }];
    });
  }

  function updateQty(id, qty) {
    if (qty < 1) { setCartItems(p => p.filter(i => i.id !== id)); return; }
    setCartItems(p => p.map(i => i.id === id ? { ...i, qty } : i));
  }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = cartItems.reduce((s, i) => s + i.price * i.qty * i.gst / 100, 0);
  const discAmt  = discType === 'percent' ? subtotal * discount / 100 : Number(discount);
  const total    = subtotal + tax - discAmt;

  function selectCustomer(c) {
    setSelectedCust(c);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustEmail(c.email || '');
  }

  async function handleSave() {
    if (!cartItems.length) return;
    setSaving(true);
    try {
      const inv = await api('/invoices', {
        method: 'POST',
        body: {
          customer: { name: custName, phone: custPhone, email: custEmail },
          items: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price, gst: i.gst })),
          subtotal, tax, discount: discAmt, total, status: 'paid', payMode,
        },
      });
      setSavedBill(inv);
      onSave();
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setCartItems([]); setDiscount(0); setSavedBill(null);
    setCustName('Walk-in Customer'); setCustPhone(''); setCustEmail('');
    setCustMode('walkin'); setSelectedCust(null);
  }

  if (savedBill) return <PrintBill bill={savedBill} onNew={reset} />;

  return (
    <div>
      <h2 className="section-title">
        New Bill
        {cartItems.length > 0 && (
          <span style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'DM Sans,sans-serif', fontWeight: 400, marginLeft: 10 }}>
            {cartItems.length} item(s) loaded from scanner
          </span>
        )}
      </h2>

      <div className="billing-layout">
        {/* Left — product picker + cart */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {cats.map(c => (
                <button key={c} className={`btn btn-sm ${catFilter === c ? 'btn-gold' : 'btn-outline'}`} onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
            <input className="form-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 10 }} />
            <div className="product-grid scroll-area">
              {filtered.map(p => (
                <div key={p.id} className="product-card" onClick={() => addItem(p)}>
                  <div className="product-cat">{p.category}</div>
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">{fmt(p.price)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Stock: {p.stock}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Cart ({cartItems.length} items)</span>
              {cartItems.length > 0 && <button className="btn btn-danger btn-sm" onClick={() => setCartItems([])}>Clear All</button>}
            </div>
            {cartItems.length === 0 ? (
              <div className="empty-state">Click products above or use the 📷 Scanner tab</div>
            ) : (
              <table>
                <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>GST</th><th>Amount</th><th></th></tr></thead>
                <tbody>
                  {cartItems.map(i => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => updateQty(i.id, i.qty - 1)}>−</button>
                          <span style={{ minWidth: 24, textAlign: 'center' }}>{i.qty}</span>
                          <button className="btn btn-outline btn-sm" onClick={() => updateQty(i.id, i.qty + 1)}>+</button>
                        </div>
                      </td>
                      <td>{fmt(i.price)}</td>
                      <td>{i.gst}%</td>
                      <td style={{ fontWeight: 500 }}>{fmt(i.price * i.qty)}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => updateQty(i.id, 0)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right — customer + summary */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Customer</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['walkin', 'select', 'new'].map(m => (
                  <button key={m} className={`btn btn-sm ${custMode === m ? 'btn-gold' : 'btn-outline'}`} onClick={() => setCustMode(m)}>
                    {m === 'walkin' ? 'Walk-in' : m === 'select' ? 'Existing' : 'New'}
                  </button>
                ))}
              </div>
            </div>
            {custMode === 'select' && (
              <div style={{ marginBottom: 12 }}>
                {customers.map(c => (
                  <div key={c.id} onClick={() => selectCustomer(c)}
                    style={{ padding: '8px 10px', border: '1px solid', borderRadius: 6, cursor: 'pointer', marginBottom: 6, background: selectedCust?.id === c.id ? 'var(--accent-bg)' : '', borderColor: selectedCust?.id === c.id ? 'var(--gold)' : 'var(--border)' }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.phone}</div>
                  </div>
                ))}
              </div>
            )}
            {custMode !== 'walkin' && (
              <>
                <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={custName} onChange={e => setCustName(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={custPhone} onChange={e => setCustPhone(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={custEmail} onChange={e => setCustEmail(e.target.value)} /></div>
              </>
            )}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Bill Summary</span></div>
            <div className="bill-row"><span style={{ color: 'var(--text2)' }}>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="bill-row"><span style={{ color: 'var(--text2)' }}>GST</span><span>{fmt(tax)}</span></div>

            <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
              <input className="form-input" type="number" min="0" placeholder="Discount" value={discount} onChange={e => setDiscount(e.target.value)} style={{ flex: 1 }} />
              <select className="form-input" value={discType} onChange={e => setDiscType(e.target.value)} style={{ width: 72 }}>
                <option value="flat">₹</option>
                <option value="percent">%</option>
              </select>
            </div>
            <div className="bill-row"><span style={{ color: 'var(--text2)' }}>Discount</span><span style={{ color: 'var(--danger)' }}>− {fmt(discAmt)}</span></div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
            <div className="bill-row" style={{ fontSize: 17, fontWeight: 600 }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>{fmt(total)}</span>
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Payment Mode</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['cash', 'card', 'upi'].map(m => (
                  <button key={m} className={`btn btn-sm ${payMode === m ? 'btn-gold' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setPayMode(m)}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-gold" style={{ width: '100%', padding: 11, fontSize: 14, marginTop: 4 }}
              onClick={handleSave} disabled={!cartItems.length || saving}>
              {saving ? 'Saving…' : 'Generate Bill →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
