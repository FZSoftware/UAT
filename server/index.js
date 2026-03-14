const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// ── JSON file database ────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const seed = {
      products: [
        { id: 1,  name: "Cotton Formal Shirt",  category: "Shirts",      price: 899,  gst: 5,  stock: 45, barcode: "8901234560001" },
        { id: 2,  name: "Slim Fit Chinos",       category: "Trousers",    price: 1299, gst: 5,  stock: 30, barcode: "8901234560002" },
        { id: 3,  name: "Linen Kurta",           category: "Ethnic",      price: 1499, gst: 5,  stock: 22, barcode: "8901234560003" },
        { id: 4,  name: "Crew Neck T-Shirt",     category: "Casual",      price: 449,  gst: 5,  stock: 60, barcode: "8901234560004" },
        { id: 5,  name: "Denim Jeans (Straight)",category: "Trousers",    price: 1799, gst: 12, stock: 18, barcode: "8901234560005" },
        { id: 6,  name: "Polo T-Shirt",          category: "Casual",      price: 649,  gst: 5,  stock: 40, barcode: "8901234560006" },
        { id: 7,  name: "Formal Blazer",         category: "Formals",     price: 4999, gst: 12, stock: 10, barcode: "8901234560007" },
        { id: 8,  name: "Dhoti (White)",         category: "Ethnic",      price: 399,  gst: 5,  stock: 35, barcode: "8901234560008" },
        { id: 9,  name: "Veshti Set",            category: "Ethnic",      price: 1199, gst: 5,  stock: 15, barcode: "8901234560009" },
        { id: 10, name: "Leather Belt",          category: "Accessories", price: 699,  gst: 18, stock: 25, barcode: "8901234560010" },
        { id: 11, name: "Formal Trousers",       category: "Formals",     price: 1599, gst: 5,  stock: 20, barcode: "8901234560011" },
        { id: 12, name: "Sports Track Pant",     category: "Casual",      price: 799,  gst: 12, stock: 28, barcode: "8901234560012" },
      ],
      customers: [
        { id: 1, name: "Ramesh Kumar", phone: "9876543210", email: "ramesh@example.com", address: "15 Anna Nagar, Chennai" },
        { id: 2, name: "Suresh Babu",  phone: "9865432109", email: "suresh@example.com", address: "7 Adyar, Chennai" },
        { id: 3, name: "Vijay Mohan",  phone: "9854321098", email: "vijay@example.com",  address: "22 Velachery, Chennai" },
      ],
      invoices: [
        { id: "INV-001", date: "2025-03-01", customer: { name: "Ramesh Kumar", phone: "9876543210" }, items: [{ name: "Cotton Formal Shirt", qty: 2, price: 899, gst: 5 }, { name: "Formal Trousers", qty: 1, price: 1599, gst: 5 }], subtotal: 3397, tax: 169.85, discount: 0, total: 3566.85, status: "paid", payMode: "cash" },
        { id: "INV-002", date: "2025-03-05", customer: { name: "Suresh Babu",  phone: "9865432109" }, items: [{ name: "Slim Fit Chinos",  qty: 1, price: 1299, gst: 5 }, { name: "Polo T-Shirt", qty: 3, price: 649, gst: 5 }], subtotal: 3246, tax: 162.3, discount: 100, total: 3308.3, status: "paid", payMode: "upi" },
        { id: "INV-003", date: "2025-03-10", customer: { name: "Walk-in Customer", phone: "" },       items: [{ name: "Linen Kurta", qty: 2, price: 1499, gst: 5 }], subtotal: 2998, tax: 149.9, discount: 0, total: 3147.9, status: "pending", payMode: "cash" },
      ],
      expenses: [
        { id: 1, date: "2025-03-01", category: "Rent",           description: "March shop rent",      amount: 25000 },
        { id: 2, date: "2025-03-05", category: "Salary",         description: "Staff salary - March", amount: 18000 },
        { id: 3, date: "2025-03-08", category: "Utilities",      description: "Electricity bill",     amount: 3200  },
        { id: 4, date: "2025-03-12", category: "Stock Purchase", description: "Bulk shirt restock",   amount: 45000 },
      ],
      nextIds: { product: 13, customer: 4, invoice: 4, expense: 5 }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── Products ──────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  res.json(readDB().products);
});

app.get('/api/products/barcode/:barcode', (req, res) => {
  const db = readDB();
  const prod = db.products.find(p => p.barcode === req.params.barcode);
  if (prod) res.json(prod);
  else res.status(404).json({ error: 'Product not found' });
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const prod = { ...req.body, id: db.nextIds.product++ };
  db.products.push(prod);
  writeDB(db);
  res.json(prod);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.map(p => p.id === parseInt(req.params.id) ? { ...p, ...req.body } : p);
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// ── Customers ─────────────────────────────────────────────────
app.get('/api/customers', (req, res) => {
  res.json(readDB().customers);
});

app.post('/api/customers', (req, res) => {
  const db = readDB();
  const cust = { ...req.body, id: db.nextIds.customer++ };
  db.customers.push(cust);
  writeDB(db);
  res.json(cust);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDB();
  db.customers = db.customers.map(c => c.id === parseInt(req.params.id) ? { ...c, ...req.body } : c);
  writeDB(db);
  res.json({ success: true });
});

// ── Invoices ──────────────────────────────────────────────────
app.get('/api/invoices', (req, res) => {
  const db = readDB();
  res.json([...db.invoices].reverse());
});

app.post('/api/invoices', (req, res) => {
  const db = readDB();
  const invId = `INV-${String(db.nextIds.invoice++).padStart(3, '0')}`;
  const invoice = {
    ...req.body,
    id: invId,
    date: new Date().toISOString().split('T')[0]
  };
  db.invoices.push(invoice);

  // Deduct stock
  invoice.items.forEach(item => {
    const prod = db.products.find(p => p.name === item.name);
    if (prod) prod.stock = Math.max(0, prod.stock - item.qty);
  });

  writeDB(db);
  res.json(invoice);
});

app.put('/api/invoices/:id/status', (req, res) => {
  const db = readDB();
  const inv = db.invoices.find(i => i.id === req.params.id);
  if (inv) inv.status = req.body.status;
  writeDB(db);
  res.json({ success: true });
});

// ── Expenses ──────────────────────────────────────────────────
app.get('/api/expenses', (req, res) => {
  const db = readDB();
  const { month, category } = req.query;
  let list = [...db.expenses].reverse();
  if (month) list = list.filter(e => e.date.startsWith(month));
  if (category && category !== 'All') list = list.filter(e => e.category === category);
  res.json(list);
});

app.post('/api/expenses', (req, res) => {
  const db = readDB();
  const exp = { ...req.body, id: db.nextIds.expense++, amount: Number(req.body.amount) };
  db.expenses.push(exp);
  writeDB(db);
  res.json(exp);
});

app.delete('/api/expenses/:id', (req, res) => {
  const db = readDB();
  db.expenses = db.expenses.filter(e => e.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// ── GST Report ────────────────────────────────────────────────
app.get('/api/gst-report', (req, res) => {
  const db = readDB();
  const { month } = req.query;
  const invoices = db.invoices.filter(i => i.status === 'paid' && (!month || i.date.startsWith(month)));

  const slabs = {};
  invoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const k = item.gst;
      if (!slabs[k]) slabs[k] = { rate: k, taxable: 0, cgst: 0, sgst: 0, total: 0 };
      const taxable = item.price * item.qty;
      const tax = taxable * item.gst / 100;
      slabs[k].taxable += taxable;
      slabs[k].cgst += tax / 2;
      slabs[k].sgst += tax / 2;
      slabs[k].total += tax;
    });
  });

  const totalTaxable = Object.values(slabs).reduce((s, r) => s + r.taxable, 0);
  const totalTax = Object.values(slabs).reduce((s, r) => s + r.total, 0);

  res.json({
    slabs: Object.values(slabs).sort((a, b) => a.rate - b.rate),
    totalTaxable,
    totalTax,
    totalCGST: totalTax / 2,
    totalSGST: totalTax / 2,
    invoiceCount: invoices.length
  });
});

// ── Dashboard Stats ───────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const paid = db.invoices.filter(i => i.status === 'paid');
  const revenue = paid.reduce((s, i) => s + i.total, 0);
  const expTotal = db.expenses.reduce((s, e) => s + e.amount, 0);
  const today = new Date().toISOString().split('T')[0];
  res.json({
    revenue,
    expTotal,
    profit: revenue - expTotal,
    totalInvoices: db.invoices.length,
    todayCount: db.invoices.filter(i => i.date === today).length,
    lowStockCount: db.products.filter(p => p.stock < 15).length,
    productCount: db.products.length,
    avgOrder: paid.length ? revenue / paid.length : 0
  });
});

app.listen(PORT, () => {
  console.log(`\n✅  Friendszone Men's Wear Billing Server`);
  console.log(`🚀  Running at http://localhost:${PORT}\n`);
});
