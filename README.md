# TransitOps — Smart Transport Operations Platform

A next-generation, enterprise-grade B2B transport operations management system featuring an advanced Olive Green & Warm Beige design system, Digital Twin asset tracking, Driver Compliance Intelligence, Smart Dispatch Engine, Maintenance Tracking, Fuel Auditing, Financial ROI Analytics, Mission-Control Alert Center, and an AI Operations Assistant.

---

## 🌟 Key Features

1. **Operations Mission Control Dashboard**
   - 7 Core Telemetry KPIs: Active Vehicles, Available Vehicles, In Maintenance, Active Trips, Pending Trips, Drivers On Duty, and Fleet Utilization %.
   - ROI & Margin Trend charts, weekly fuel consumption bars, and interactive filters for Vehicle Type, Status, and Region.

2. **Vehicle Registry & Digital Twin**
   - Physical asset specifications, payload capacity, odometer tracking, acquisition cost, and lifecycle state pipeline (*Purchased → Available → Assigned → On Trip → In Shop → Retired*).
   - Mini-ERP deep dive tabs: Asset Overview, Dispatched Trips, Fuel Telemetry, Maintenance History, Unit P&L / ROI Yield, and Document Management with upload support.

3. **Driver Intelligence & Compliance**
   - CDL commercial credential tracking, safety scores, violation records, and trips completed.
   - Automatic `<30 days` license expiry warnings and dispatch lockout for expired licenses.
   - Disciplinary Suspension & Reinstatement workflows for authorized Safety Officers.

4. **Smart Dispatch Engine**
   - Real-time pre-dispatch safety matrix.
   - Enforces legal capacity checks (`cargo weight <= max load capacity`).
   - Automatically rejects unavailable, suspended, or expired assets/drivers with explicit reasons.
   - Atomic multi-entity state transitions (`Draft → Dispatched → In Progress → Completed / Cancelled`).

5. **Maintenance & Shop Intelligence**
   - Preventive service interval tracking with odometer progress bars.
   - Active work orders that automatically place vehicles `In Shop` and lock them out of the dispatch pool until completed.

6. **Fuel & Operating Expense Auditing**
   - Fuel dispenser logs and automatic consumption anomaly detection (`>15% deviation alert`).
   - Operating expense ledger for tolls, permits, and allowances.

7. **Financial Analytics & Asset ROI**
   - Authoritative ROI formula: `(Gross Transport Revenue - (Maintenance Cost + Fuel Outlay)) / Capital Acquisition Cost`.
   - Asset yield leaderboard, date filtering, print view, and CSV export.

8. **Mission Control Alert Center**
   - Centralized severity-tiered feed (*Critical, Warning, Info*) for license expiry, maintenance milestones, abnormal fuel consumption, and unauthorized assignment attempts.

9. **AI Operations Copilot**
   - Parameterized, allowlisted intent architecture (`highest_roi_vehicle`, `expiring_licenses`, `vehicles_in_maintenance`) prevents arbitrary client SQL injection and returns structured response cards with action links.

10. **Role-Based Access Control (RBAC)**
    - Built-in support for 4 corporate personas:
      - **Fleet Manager**
      - **Dispatcher**
      - **Safety Officer**
      - **Financial Analyst**
    - Instant preview role switcher in top header.

11. **Production Deployment Resilience**
    - Built-in autonomous in-memory store prevents connection crashes or white-screens during backend microservice cold-starts or deployments.
    - Seamlessly bridges to live production REST endpoints when configured.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript + Vite 6
- **Routing**: React Router v6 (Protected Routes & RBAC Action Guards)
- **Styling**: Vanilla CSS Design Tokens (Olive Green `#2F422A`, Warm Beige `#E7DFD4`, Charcoal `#121612`, Soft Alabaster `#F7F5F0`)
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans & Space Grotesk

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
git clone https://github.com/shrey-1802/transit_opt.git
cd transit_opt
npm install
```

### Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your backend API route or leave default `/api/v1` for reverse-proxy deployments.

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
```
Compiled production files will be in `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 📄 License
MIT
