import React, { useState, useEffect, useRef } from 'react';
import { api, fmt } from '../App';

export default function ScannerPage({ products, onAddToCart, onGoToBilling }) {
  const [barcode, setBarcode]     = useState('');
  const [found, setFound]         = useState(null);
  const [notFound, setNotFound]   = useState(false);
  const [qty, setQty]             = useState(1);
  const [history, setHistory]     = useState([]);
  const [editBarcode, setEditBarcode] = useState(null); // product being assigned a barcode
  const [newBarcode, setNewBarcode]   = useState('');
  const [localProds, setLocalProds]   = useState(products);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setLocalProds(products); }, [products]);

  function handleInput(e) {
    const val = e.target.value;
    setBarcode(val);
    setNotFound(false);
    const prod = localProds.find(p => p.barcode === val.trim());
    if (prod) { setFound(prod); setNotFound(false); }
    else if (val.length >= 8) { setFound(null); setNotFound(true); }
    else { setFound(null); }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && found) addFound();
  }

  function addFound() {
    if (!found) return;
    const entry = { ...found, qty: Number(qty), scannedAt: new Date().toLocaleTimeString() };
    setHistory(h => [entry, ...h.slice(0, 14)]);
    onAddToCart(found, Number(qty));
    setBarcode(''); setFound(null); setQty(1); setNotFound(false);
    inputRef.current?.focus();
  }

  function demoScan(prod) {
    setBarcode(prod.barcode);
    setFound(prod);
    setNotFound(false);
  }

  async function saveBarcode(prodId) {
    if (!newBarcode.trim()) return;
    await api(`/products/${prodId}`, { method: 'PUT', body: { barcode: newBarcode.trim() } });
    setLocalProds(prev => prev.map(p => p.id === prodId ? { ...p, barcode: newBarcode.trim() } : p));
    setEditBarcode(null);
    setNewBarcode('');
  }

  const totalScanned = history.reduce((s, h) => s + h.price * h.qty, 0);

  return (
    <div>
      <h2 className="section-title">Barcode / QR Scanner</h2>

      <div className="grid-2">
        {/* Scanner input */}
        <div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Scan Product</span>
              {history.length > 0 && (
                <button className="btn btn-gold btn-sm" onClick={onGoToBilling}>
                  Go to Billing ({history.length} items) →
                </button>
              )}
            </div>

            <div className="scanner-box">
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, letterSpacing: 1 }}>
                POINT SCANNER AT BARCODE — OR TYPE BELOW
              </div>
              <span className="scan-line" />
              <input
                ref={inputRef}
                className="form-input scanner-input"
                value={barcode}
                onChange={handleInput}
                onKeyDown={handleKey}
                placeholder="Scan or type barcode…"
                autoFocus
              />
              <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: 3, color: 'var(--text3)', marginTop: 6 }}>
                {barcode || '▐ ▌▐ ▌ ▐▌ ▐▌▐ ▌▐▌▐ ▌'}
              </div>
            </div>

            {/* Demo quick-scan buttons */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>Demo — click to scan:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {localProds.slice(0, 8).map(p => (
                  <button key={p.id} className="btn btn-outline btn-sm" onClick={() => demoScan(p)} title={p.barcode}>
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Result card */}
            {found && (
              <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--gold)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{found.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{found.category} · GST {found.gst}%</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', marginTop: 4 }}>{fmt(found.price)}</div>
                    <div style={{ fontSize: 11, color: found.stock < 5 ? 'var(--danger)' : 'var(--text3)' }}>
                      Stock: {found.stock} units
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="form-label" style={{ marginBottom: 4 }}>Qty</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{qty}</span>
                      <button className="btn btn-outline btn-sm" onClick={() => setQty(q => q + 1)}>+</button>
                    </div>
                    <button className="btn btn-gold" style={{ marginTop: 10, width: '100%' }} onClick={addFound}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
            {notFound && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--danger)' }}>
                ⚠ No product found for barcode: <strong>{barcode}</strong>
              </div>
            )}
          </div>

          {/* Assign barcodes */}
          <div className="card">
            <div className="card-header"><span className="card-title">Manage Barcodes</span></div>
            <table>
              <thead><tr><th>Product</th><th>Barcode</th><th>Action</th></tr></thead>
              <tbody>
                {localProds.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.category}</div>
                    </td>
                    <td>
                      {editBarcode === p.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input className="form-input" value={newBarcode} onChange={e => setNewBarcode(e.target.value)}
                            placeholder="Enter barcode" style={{ fontSize: 12 }} />
                          <button className="btn btn-gold btn-sm" onClick={() => saveBarcode(p.id)}>✓</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditBarcode(null)}>✕</button>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: 1, color: 'var(--text2)' }}>
                          {p.barcode || <em style={{ color: 'var(--text3)' }}>not set</em>}
                        </span>
                      )}
                    </td>
                    <td>
                      {editBarcode !== p.id && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditBarcode(p.id); setNewBarcode(p.barcode || ''); }}>
                          {p.barcode ? 'Edit' : 'Assign'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scan history */}
        <div className="card" style={{ position: 'sticky', top: 20 }}>
          <div className="card-header">
            <span className="card-title">Scan Session</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{history.length} scans</span>
          </div>
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div>No scans yet. Use the input above or click a demo button.</div>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: 440, overflowY: 'auto' }}>
                {history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface2)' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.barcode} · {h.scannedAt}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{fmt(h.price * h.qty)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>× {h.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 15 }}>
                <span>Session Total</span>
                <span style={{ color: 'var(--gold)' }}>{fmt(totalScanned)}</span>
              </div>
              <button className="btn btn-gold" style={{ width: '100%', marginTop: 12 }} onClick={onGoToBilling}>
                Proceed to Billing →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
