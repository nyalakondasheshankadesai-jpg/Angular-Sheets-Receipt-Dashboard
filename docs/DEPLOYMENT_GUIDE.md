# Deployment Guide — cloud.txt

Follow these steps to deploy the backend sheet API and run the frontend Angular dashboard.

## Prerequisites
- A Google Account (Drive and Sheets access).
- Node.js (v18 or higher) and npm installed.

## Step 1: Initialize Google Sheet
1. Create a blank Google Sheet.
2. Navigate to **Extensions → Apps Script**.
3. Copy all files from `APP_SCRIPT_sheets/` (except the `angular-app` directory) into the script editor.
4. Select `setupAllSheets` in the toolbar dropdown and click **▶ Run**. Authorize permissions when prompted.

## Step 2: Deploy Web App API
1. Inside the Apps Script editor, click **Deploy → New deployment**.
2. Select type **Web app**.
3. Set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy** and copy the **Web App URL**.

## Step 3: Launch Angular Frontend
1. Open `angular-app/src/environments/environment.ts`.
2. Paste the Web App URL into the `appsScriptUrl` field.
3. In your terminal, run:
   ```bash
   cd angular-app
   npm install
   npm run start
   ```
4. Access `http://localhost:4200` in your web browser.\n