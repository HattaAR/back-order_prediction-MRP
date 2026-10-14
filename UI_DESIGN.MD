# UI/UX Design Specification — Backorder Prediction

## 1. Product

Backorder Prediction adalah aplikasi inventory/supply-chain analytics.

Frontend: Next.js 16
Backend: Express.js
Database: MySQL
ML Service: Flask
Model: Random Forest Classifier

UI harus terasa seperti enterprise inventory control software,
bukan generic SaaS dashboard.

---

## 2. Visual Direction

Gunakan screenshot/reference yang diberikan user sebagai inspirasi visual,
BUKAN untuk disalin 1:1.

Target visual:

- Premium enterprise dashboard
- Supply-chain / inventory control center
- Clean tetapi information-dense
- Compact sidebar
- Functional topbar
- Compact KPI cards
- Analytics-first layout
- Strong information hierarchy
- Efficient use of screen space
- Subtle borders
- Minimal shadows
- Controlled whitespace
- Consistent iconography

Hindari:

- Generic AI dashboard appearance
- Excessive cards
- Excessive rounded corners
- Gradients dekoratif
- Glow
- Glassmorphism
- Decorative badges
- Unnecessary animation
- Oversized headings
- Excessive empty space

---

## 3. Color Direction

Pertahankan identitas teal/slate yang sudah digunakan.

Semantic colors:

- Teal = primary/navigation
- Green = healthy/safe
- Orange = warning
- Red = high risk
- Blue = informational

Jangan membuat rainbow dashboard.

---

## 4. Main Navigation

Navigation:

1. Ringkasan
2. Inventaris
3. Prediksi Item
4. Prediksi Batch
5. Analisis Model

Sidebar harus compact.

Active navigation harus jelas tetapi subtle.

---

## 5. Dashboard

Dashboard harus menjawab pertanyaan utama:

"Barang mana yang membutuhkan perhatian sekarang?"

### KPI

Tampilkan:

- Total SKU
- SKU sudah diprediksi
- Risiko Backorder
- Stok di bawah minimum

KPI harus compact dan angka menjadi fokus utama.

Jangan menggunakan card besar dengan ruang kosong berlebihan.

### Analytics

Gunakan data nyata untuk:

#### Inventory Overview
Distribusi inventory berdasarkan kategori.

#### Backorder Risk Overview
Distribusi:
- Risk
- Safe

#### Risk by Category
Jumlah atau proporsi SKU berisiko berdasarkan kategori.

#### Inventory Health
Ringkasan:
- Healthy stock
- Below minimum stock
- Backorder risk

### Priority Attention

Ini adalah bagian operasional TERPENTING dashboard.

Gunakan tabel compact:

| SKU | Barang | Stock | Min Stock | Probability | Risk | Action |

Prioritaskan item dengan:

- prediction = backorder
- probability tinggi
- national_inv < min_bank

Priority Attention harus memiliki visual weight lebih tinggi
daripada informasi teknis seperti service status.

---

## 6. Data Integrity

Gunakan HANYA data nyata dari API:

- /api/barang
- /api/predict/log
- /api/model/info
- /api/health

DILARANG membuat fake operational data hanya agar dashboard terlihat penuh.

Jangan membuat:

- fake historical trends
- fake forecasts
- fake supplier data
- fake logistics data
- fake revenue
- fake costs
- fake inventory numbers

Jika data tidak tersedia, tampilkan proper empty state.

Jika API tidak memiliki time-series,
jangan membuat historical line chart.

---

## 7. Existing Features

Semua fitur berikut WAJIB dipertahankan:

- Individual prediction
- 21 prediction inputs
- Prediction threshold
- Batch CSV prediction
- CSV upload
- CSV export
- Inventory search
- Inventory sorting
- Pagination
- Refresh
- Predict All
- Prediction log
- Model information
- Health/service status

---

## 8. Technical Boundaries

UI redesign hanya boleh mengubah frontend.

JANGAN mengubah:

- Express backend
- MySQL database/schema
- Flask service
- Random Forest model
- rf_model.pkl
- API contract

Gunakan dependency frontend yang sudah tersedia jika memungkinkan.

Recharts sudah tersedia untuk visualisasi.

Jangan menambah dependency tanpa alasan yang jelas.

---

## 9. Components

Prefer reusable components seperti:

- MetricCard
- ChartPanel
- RiskBadge
- StatusIndicator
- PriorityTable

Tetapi jangan melakukan over-engineering.

---

## 10. Responsive

UI harus diperiksa pada:

- 375px
- 768px
- 1024px
- 1440px

Desktop adalah primary workspace,
tetapi mobile/tablet tetap harus usable.

---

## 11. Accessibility

Pastikan:

- Keyboard navigation
- Visible focus state
- Proper form labels
- Semantic buttons
- Accessible charts
- Sufficient contrast
- Reduced motion support
- Proper loading/error/empty states

---

## 12. Quality Gate

Sebelum task dianggap selesai:

1. npm run lint harus berhasil
2. npm run build harus berhasil
3. Tidak boleh ada TypeScript error
4. Semua route harus diperiksa
5. API integration harus tetap bekerja
6. Tidak boleh ada fake operational data
7. Responsive layout harus diperiksa
8. Existing functionality tidak boleh hilang