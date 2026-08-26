# FIFA ALL STARS — Grassroots Footy Match Hub

**FIFA ALL STARS** is a premium, high-performance, frontend-only React web application for organizing grassroots football matches, court slot bookings, tournament knockout brackets, and club/league administration. Built with **React 18**, **Vite**, **TailwindCSS**, **Zustand**, **Three.js / React Three Fiber**, **Framer Motion**, and **Lucide Icons**.

> **Note**: This application is 100% frontend-only. All data is managed in-memory using Zustand stores with local image assets, allowing full offline operation without any backend server or API dependencies.

---

## 🚀 Quick Start Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔑 Quick Demo Login Credentials

The login screen (`/login`) includes **1-Click Quick Demo Login** buttons for all three roles:

| Role | Email | Password | Redirect Target |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@fifaallstars.com` | `SuperAdmin@123` | `/admin/dashboard` |
| **Club Manager** | `manager@fifaallstars.com` | `Manager@123` | `/manager/dashboard` |
| **Player Demo** | `player@fifaallstars.com` | `Player@123` | `/player/home` |

---

## ✨ Features by Role

### ⚽ 1. Player Features
- **3D Cinematic Football Hero**: Procedural 32-panel PBR 3D football model with zero-gravity float physics, mouse parallax, and light/dark theme responsiveness.
- **Pick-Up Game Hub**: Filter games by city (Raipur, Bangalore, Mumbai, Delhi, Pune), format (5v5, 7v7), date, and skill level.
- **Automated Waitlist Promotion**: Automatic queue placement when a game is full (`Waitlist #1`, `Waitlist #2`). Leaving a confirmed game automatically promotes the top waitlist player.
- **Elo Rating Engine (K=32)**: Submitting match scores recalculates player Elo ratings using standard Elo probability formulas.
- **Tournament Knockout Brackets**: Interactive quarter-finals, semi-finals, and finals bracket progression with champion declaration.
- **Turf & Pitch Booking**: Reserve 3G synthetic grass courts with INR (`₹`) wallet deduction.
- **Community Feed & Polls**: City-wise match discussion posts, likes, comments, and pitch surface polls.

### 🏟️ 2. Club Manager Features
- **Scoped Data Ownership**: Enforced via `permissions.js` so managers only see and manage courts/bookings for their owned venue(s).
- **Venue & Pitch Management**: Edit operating hours, amenities checkboxes (*Floodlights, Pro Shop, Washrooms, Parking*), and cover photos.
- **Court Status Control**: Toggle pitches between `AVAILABLE`, `BLOCKED`, and `MAINTENANCE` (blocked courts are automatically hidden from player booking views).
- **Peak & Dynamic Pricing Rules**: Set evening peak windows (e.g. 17:00–21:00), peak multipliers (1.5x), and weekend multipliers (1.75x) with a **Live Pricing Calculator Preview**.
- **Booking Roster**: View court reservations and player cancellation requests.

### 🛡️ 3. Super Admin Features
- **Master Back-Office Dashboard**: Summary cards for total users, venue status, gross revenue, pending refunds, and open tickets.
- **User Roster Management**: Search users, switch roles (*PLAYER, CLUB_MANAGER, OPS_ADMIN, FINANCE_ADMIN, SUPER_ADMIN*), and toggle account suspensions (`SUSPENDED`).
- **Platform Owner Protection Rule**: The founder account (`isOwner: true`) can NEVER be demoted or suspended. Rendered with a protected badge and tooltip explanation.
- **Club Approvals**: Review new venue registrations, approve/reject pitches, and assign general manager accounts.
- **Refund Approvals**: Review cancellation requests and execute simulated wallet reversals.
- **Match Dispute Resolution**: Override disputed match scores and adjust player Elo ratings (`RATING_ADJUSTED`).
- **Support Ticket Desk**: Assign tickets to operations (`OPS_ADMIN`) or finance (`FINANCE_ADMIN`) staff and track resolution.
- **Live Session Audit Logs**: Read-only, timestamped, reverse-chronological session activity log (`auditLogs`).

---

## 🎨 Theme & Accessibility
- **100% System Responsive Light & Dark Mode**: Automatically detects OS color scheme preferences (`prefers-color-scheme`) and persists user overrides in `localStorage`.
- **Mobile Responsive Shell**: Includes a desktop top navbar and a mobile bottom touch tab bar (`<768px`) for seamless mobile navigation.
