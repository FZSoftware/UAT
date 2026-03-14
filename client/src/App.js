import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BillingPage from './components/BillingPage';
import InvoicesPage from './components/InvoicesPage';
import ProductsPage from './components/ProductsPage';
import CustomersPage from './components/CustomersPage';
import ScannerPage from './components/ScannerPage';
import GSTPage from './components/GSTPage';
import ExpensePage from './components/ExpensePage';

export const SHOP = {
  name: "FRIENDS ZONE MEN'S WEAR",
  address: "Alavukaran Street, Arjune complex, Ammapet - 614401",
  phone: "+91 90428 30102",
  gstin: "33AABCU9603R1ZX",
  email: "friendszone537@gmail.com",
};

// Central API helper
export async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

export function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [products, setProducts]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [cartItems, setCartItems] = useState([]); // shared scanner ↔ billing
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api('/products'),
      api('/customers'),
      api('/invoices'),
      api('/expenses'),
    ]).then(([p, c, i, e]) => {
      setProducts(p);
      setCustomers(c);
      setInvoices(i);
      setExpenses(e);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function refresh(keys = ['products', 'customers', 'invoices', 'expenses']) {
    const map = {
      products:  () => api('/products').then(setProducts),
      customers: () => api('/customers').then(setCustomers),
      invoices:  () => api('/invoices').then(setInvoices),
      expenses:  () => api('/expenses').then(setExpenses),
    };
    keys.forEach(k => map[k] && map[k]());
  }

  function addToCart(prod, qty = 1) {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === prod.id);
      if (ex) return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: prod.id, name: prod.name, price: prod.price, gst: prod.gst, qty }];
    });
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'billing',   label: cartItems.length ? `New Bill (${cartItems.length})` : 'New Bill' },
    { id: 'scanner',   label: '📷 Scanner' },
    { id: 'invoices',  label: 'Invoices' },
    { id: 'products',  label: 'Products' },
    { id: 'customers', label: 'Customers' },
    { id: 'gst',       label: 'GST Reports' },
    { id: 'expenses',  label: 'Expenses' },
  ];

  return (
    <div className="app">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo-icon"><span>R</span></div>
          <div>
            <h1>{SHOP.name}</h1>
            <div className="header-sub">Billing &amp; Inventory v2</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>
          <div>{SHOP.address}</div>
          <div style={{ color: 'var(--gold)' }}>GSTIN: {SHOP.gstin}</div>
        </div>
      </div>

      <nav className="nav no-print">
        {navItems.map(n => (
          <button
            key={n.id}
            className={`nav-btn ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div className="main">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard invoices={invoices} products={products} expenses={expenses} />}
            {page === 'billing'   && <BillingPage products={products} customers={customers} cartItems={cartItems} setCartItems={setCartItems} onSave={() => refresh(['invoices', 'products'])} />}
            {page === 'scanner'   && <ScannerPage products={products} onAddToCart={addToCart} onGoToBilling={() => setPage('billing')} />}
            {page === 'invoices'  && <InvoicesPage invoices={invoices} onUpdate={() => refresh(['invoices'])} />}
            {page === 'products'  && <ProductsPage products={products} onUpdate={() => refresh(['products'])} />}
            {page === 'customers' && <CustomersPage customers={customers} invoices={invoices} onUpdate={() => refresh(['customers'])} />}
            {page === 'gst'       && <GSTPage />}
            {page === 'expenses'  && <ExpensePage expenses={expenses} invoices={invoices} onUpdate={() => refresh(['expenses'])} />}
          </>
        )}
      </div>
    </div>
  );
}
