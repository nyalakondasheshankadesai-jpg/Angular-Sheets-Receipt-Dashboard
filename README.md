# cloud.txt — Receipt Generator & Dashboard

cloud.txt is a client-serverless customer receipt generator and sales analytics dashboard. It combines a **Google Sheets & Google Drive Backend** (accessible via Apps Script REST APIs) with a **Modern Dark-Themed Glassmorphic Angular SPA** frontend.

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│        Angular Frontend         │
│  (Modern Dark UI / Glassmorphic) │
└───────────────┬─────────────────┘
                │
                │ HTTP POST / GET (JSON)
                ▼
┌─────────────────────────────────┐
│     Google Apps Script API      │
│     (deployed as Web App)       │
└───────────────┬─────────────────┘
                ├──────────────────────────────────┐
                ▼                                  ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│       Google Sheets           │  │         Google Drive          │
│       (Data Storage)          │  │       (PDF File Vault)        │
│                               │  │                               │
│  • Receipts sheet             │  │  • Receipts_PDF/ folder       │
│  • Auto-recalculated stats    │  │  • Formatted PDF Receipts     │
└───────────────────────────────┘  └───────────────────────────────┘
```

## ✨ Key Features

- **Google Sheets Database**: Completely serverless, auto-updating, zero-cost database.
- **Drive PDF Archival**: Generates professionally styled PDF invoices and saves them in Google Drive.
- **Modern Angular Frontend**: Glassmorphic UI with charts, responsive stats, and dynamic receipt forms.
- **Reactive Calculation**: Dynamic item rows addition/removal with live subtotal, GST (18%), and Grand Total updates.
- **Demo Mode**: Works instantly with rich mock data if no Google Apps Script Web App is connected.
- **Double Entry Points**: Native Google Sheets HTML sidebar fallback for backend invoicing.

## 📂 Documentation Directory

Full details of the design, timeline, and API specs are available in the `docs/` folder:

- [Project Report](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/PROJECT_REPORT.md)
- [API Documentation](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/API_DOCUMENTATION.md)
- [User Guide](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/USER_GUIDE.md)
- [Deployment Guide](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/DEPLOYMENT_GUIDE.md)
- [Technical Report](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/technical_report.md)
- [Visual Documentation](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/visual_documentation.md)
- [Development Log & Timeline](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/development_log.md)
- [Decision Log](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/decision_log.md)
- [Project Metrics](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/project_metrics.md)
- [Presentation Outline](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/presentation_outline.md)
- [Retrospective Reflection](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/reflection.md)
- [Changelog](file:///c:/Users/shash/OneDrive/Desktop/Anti_gravity_files/APP_SCRIPT_sheets/docs/CHANGELOG.md)

## 🚀 Quick Start

### 1. Setup Apps Script
Copy all files from `APP_SCRIPT_sheets/` (excluding `angular-app/`) into your Google Sheet's Apps Script editor, run `setupAllSheets`, and deploy as a Web App to Anyone.

### 2. Configure Angular
Paste the Web App URL into `angular-app/src/environments/environment.ts`.

### 3. Run Angular
```bash
cd angular-app
npm install
npm run start
```
Open `http://localhost:4200` to interact with your dashboard.\n