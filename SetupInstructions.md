# cloud.txt — Receipt Generator Setup Guide

## Architecture

```
┌─────────────────────────┐     HTTP (JSON)     ┌────────────────────────┐
│   Angular Frontend      │ ◄──────────────────► │  Google Apps Script    │
│   (Beautiful UI)        │                      │  (Web App API)         │
│                         │                      │                        │
│  • Receipt Form         │    doGet / doPost    │  • processReceipt()    │
│  • Dashboard + Charts   │ ◄──────────────────► │  • generatePDF()       │
│  • Receipt History      │                      │  • getDashboardData()  │
│  • PDF Preview          │                      │  • getAllReceipts()     │
└─────────────────────────┘                      └────────┬───────────────┘
                                                          │
                                                          ▼
                                                 ┌────────────────────┐
                                                 │  Google Sheets     │
                                                 │  (Data Storage)    │
                                                 │  + Google Drive    │
                                                 │  (PDF Storage)     │
                                                 └────────────────────┘
```

---

## Step 1: Set Up Google Apps Script

1. Open your Google Sheet: [Your Sheet](https://docs.google.com/spreadsheets/d/1T0WyoIGe9Lr_ZPE4UhBrRLayLVwGpaZuMJPxZdvIgdY/edit)

2. Go to **Extensions → Apps Script**

3. **Delete** any existing `Code.gs` content

4. Create these files in the Apps Script editor (click `+` → Script):

   | File to Create | Copy From |
   |---|---|
   | `Code.gs` | [Code.gs](./Code.gs) |
   | `PDF.gs` | [PDF.gs](./PDF.gs) |
   | `Dashboard.gs` | [Dashboard.gs](./Dashboard.gs) |
   | `FormUI.gs` | [FormUI.gs](./FormUI.gs) |
   | `SheetSetup.gs` | [SheetSetup.gs](./SheetSetup.gs) |
   | `WebApp.gs` | [WebApp.gs](./WebApp.gs) |

5. Create an HTML file (click `+` → HTML):

   | File to Create | Copy From |
   |---|---|
   | `Sidebar.html` | [Sidebar.html](./Sidebar.html) |

6. Click **💾 Save** (Ctrl+S)

---

## Step 2: Run Initial Setup

1. In the Apps Script editor, select `setupAllSheets` from the function dropdown
2. Click **▶ Run**
3. **Authorize** when prompted (review permissions, click Allow)
4. Your sheets (Receipts, Receipt Template, Dashboard) will be created

---

## Step 3: Deploy as Web App (for Angular)

1. In Apps Script editor → **Deploy → New deployment**
2. Click ⚙️ gear → Select **Web app**
3. Settings:
   - **Description**: `cloud.txt Receipt API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. **Copy the Web App URL** — you'll need it for Angular

---

## Step 4: Connect Angular

1. Open `angular-app/src/environments/environment.ts`
2. Paste your Web App URL:
   ```typescript
   export const environment = {
     production: false,
     appsScriptUrl: 'YOUR_WEB_APP_URL_HERE'
   };
   ```

3. Run the Angular app:
   ```bash
   cd APP_SCRIPT_sheets/angular-app
   npm run dev
   ```

---

## Step 5: Update CONFIG (Optional)

In `Code.gs`, update the CONFIG object with your actual business details:
```javascript
const CONFIG = {
  BUSINESS_NAME: "cloud.txt",
  BUSINESS_ADDRESS: "Your actual address",
  BUSINESS_PHONE: "+91 your-number",
  BUSINESS_EMAIL: "your@email.com",
  // ...
};
```

---

## Usage

### Option A: Apps Script Sidebar (Simple)
- Open Sheet → **Receipt System → New Receipt**
- Fill form → Generate Receipt
- Works entirely inside Google Sheets

### Option B: Angular App (Premium UI)
- Run `npm run dev` in `angular-app/`
- Open `http://localhost:4200`
- Full dashboard, receipt form, history, charts

Both options write to the **same Google Sheet** and **same Drive folder**.
