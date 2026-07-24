# User Guide — cloud.txt

Welcome to cloud.txt! This guide covers the operational workflows of the receipt generation and dashboard application.

## Core Workflows

### 1. Using the Angular Web Interface
1. **Dashboard Overview**: Check all-time total revenue, monthly trends, cash vs. online ratio, and top items.
2. **Generating a Receipt**:
   - Navigate to **New Receipt**.
   - Input the **Customer Name** and **Mobile Number**.
   - Select the **Payment Method** (Cash or Online).
   - Add items by clicking **Add Item**. Fill in Name, Price, and Quantity. The system automatically adds 18% GST.
   - Click **Generate Receipt** to save the data and compile the PDF in Google Drive.
3. **Receipt Ledger**: View the list of all transactions and filter them instantaneously by receipt ID, payment method, or name.

### 2. Native Sheets Fallback
If you are working inside Google Sheets:
1. Click the custom **🧾 Receipt System** menu on the top toolbar.
2. Select **📝 New Receipt**.
3. Fill out the sidebar form and submit. It performs the exact same operations.\n