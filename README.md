# Friedszone Men's Wear — Billing Software v2

A complete billing, inventory & accounting system for a men's wear retail shop.
Built with **Node.js + Express** (backend) and **React** (frontend).

---

## What's Included

| Feature | Details |
|---|---|
| 🧾 Billing | Product picker, cart, discounts, GST, print invoice |
| 📷 Barcode Scanner | Scan barcodes to add items to cart instantly |
| 📊 GST Reports | Slab-wise GST breakdown, GSTR-3B summary, CSV export |
| 💸 Expense Tracker | Log expenses by category, P&L per month |
| 🗂 Invoices | View, filter, print, mark paid |
| 📦 Products | Add/edit/delete with barcode & stock tracking |
| 👥 Customers | Customer database with purchase history |
| 📈 Dashboard | Revenue, profit, top sellers, low stock alerts |

---

## Quick Start

### Requirements
- Node.js v16 or above — https://nodejs.org
- npm (comes with Node.js)

### Step 1 — Install dependencies

Open a terminal in the project folder and run:

```bash
# Install server packages
cd server
npm install

# Install client packages
cd ../client
npm install
```

### Step 2 — Start the backend server

```bash
cd server
node index.js
```

You should see:
```
✅  Friendszone Men's Wear Billing Server
🚀  Running at http://localhost:5000
```

### Step 3 — Start the React frontend

Open a **new terminal tab**, then:

```bash
cd client
npm start
```

The app will open automatically at **http://localhost:3000**

---

## Customise Shop Details

Edit `client/src/App.js` — update the `SHOP` object at the top:

```js
export const SHOP = {
  name: "YOUR SHOP NAME",
  address: "Your Full Address",
  phone: "+91 XXXXX XXXXX",
  gstin: "YOUR_GSTIN_HERE",
  email: "shop@email.com",
};
```

---

## Barcode Scanner Usage

1. Click the **📷 Scanner** tab
2. If you have a USB/Bluetooth barcode scanner, plug it in — it types like a keyboard
3. Click inside the barcode input box and scan a product
4. Adjust quantity and click **Add to Cart**
5. Click **Proceed to Billing →** to generate the bill

To assign barcodes to products, use the **Manage Barcodes** table on the Scanner page,
or add them directly when creating/editing a product on the Products page.

---

## GST Reports

- Go to **GST Reports** tab
- Select the month from the dropdown
- View slab-wise breakdown (5%, 12%, 18%) with CGST and SGST split
- Click **Export GSTR-3B CSV** to download a CSV file for your accountant

---

## Expense Tracker

- Go to **Expenses** tab
- Click **+ Add** to log a new expense (Rent, Salary, Utilities, etc.)
- Filter by month and category
- The P&L card shows Revenue vs Expenses and Net Profit for the selected month

---

## Data Storage

All data is stored in `server/db.json` — created automatically on first run.
No separate database installation needed.

To reset all data, delete `server/db.json` and restart the server.

---

## Project Structure

```
mens-billing-v2/
├── server/
│   ├── index.js              # Express API server
│   ├── db.json               # Auto-created data file
│   └── package.json
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js            # Root app + API helper + SHOP config
│   │   ├── index.js          # React entry point
│   │   ├── index.css         # All styles
│   │   └── components/
│   │       ├── Dashboard.js
│   │       ├── BillingPage.js
│   │       ├── ScannerPage.js     ← NEW
│   │       ├── GSTPage.js         ← NEW
│   │       ├── ExpensePage.js     ← NEW
│   │       ├── InvoicesPage.js
│   │       ├── ProductsPage.js
│   │       ├── CustomersPage.js
│   │       └── PrintBill.js
│   └── package.json
├── package.json
└── README.md
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List all products |
| POST | /api/products | Add product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/barcode/:code | Look up by barcode |
| GET | /api/customers | List customers |
| POST | /api/customers | Add customer |
| GET | /api/invoices | List invoices |
| POST | /api/invoices | Create invoice (auto-deducts stock) |
| PUT | /api/invoices/:id/status | Update invoice status |
| GET | /api/expenses | List expenses (filter: ?month=&category=) |
| POST | /api/expenses | Add expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/gst-report | GST report (?month=YYYY-MM) |
| GET | /api/stats | Dashboard statistics |

---

Made for small retail shops. No internet required after setup.
"# UAT" 
