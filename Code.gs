/**
 * ============================================
 *  CUSTOMER RECEIPT GENERATOR — Code.gs
 *  Core logic: menu, receipt processing, utils
 * ============================================
 */

// ─── CONFIGURATION ──────────────────────────
const CONFIG = {
  BUSINESS_NAME: "cloud.txt",
  BUSINESS_ADDRESS: "Your Address Line 1",   // ← Change this
  BUSINESS_PHONE: "+91 XXXXXXXXXX",          // ← Change this
  BUSINESS_EMAIL: "your@email.com",          // ← Change this
  CURRENCY: "₹",
  GST_ENABLED: true,                         // Set false to disable GST
  GST_RATE: 0.18,                            // 18% GST
  PDF_FOLDER_NAME: "Receipts_PDF",
  RECEIPT_PREFIX: "REC",
  SHEET_RECEIPTS: "Receipts",
  SHEET_TEMPLATE: "Receipt Template",
  SHEET_DASHBOARD: "Dashboard",
};

// ─── MENU SETUP ─────────────────────────────
/**
 * Creates custom menu when the spreadsheet is opened.
 * Runs automatically on open.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🧾 Receipt System")
    .addItem("📝 New Receipt", "showReceiptForm")
    .addSeparator()
    .addItem("📊 Refresh Dashboard", "refreshDashboard")
    .addSeparator()
    .addItem("⚙️ Initial Setup (Run Once)", "setupAllSheets")
    .addToUi();
}

// ─── RECEIPT NUMBER GENERATOR ───────────────
/**
 * Generates the next receipt number by scanning existing receipts.
 * Format: REC-0001, REC-0002, ...
 * @returns {string} Next receipt number
 */
function generateReceiptNumber() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);
  
  if (!sheet) {
    return CONFIG.RECEIPT_PREFIX + "-0001";
  }
  
  const lastRow = sheet.getLastRow();
  
  // If only header row or empty
  if (lastRow <= 1) {
    return CONFIG.RECEIPT_PREFIX + "-0001";
  }
  
  // Get all receipt numbers in column A
  const receiptNumbers = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let maxNumber = 0;
  
  receiptNumbers.forEach(function(row) {
    const num = row[0].toString();
    const match = num.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNumber) {
        maxNumber = n;
      }
    }
  });
  
  const nextNumber = maxNumber + 1;
  return CONFIG.RECEIPT_PREFIX + "-" + String(nextNumber).padStart(4, "0");
}

// ─── PROCESS RECEIPT ────────────────────────
/**
 * Main function called from the sidebar form.
 * Validates input, calculates totals, saves receipt, generates PDF.
 * @param {Object} formData - Data from the sidebar form
 * @returns {Object} Result with success status and message
 */
function processReceipt(formData) {
  try {
    // Validate required fields
    if (!formData.customerName || formData.customerName.trim() === "") {
      return { success: false, message: "Customer name is required." };
    }
    if (!formData.mobile || formData.mobile.trim() === "") {
      return { success: false, message: "Mobile number is required." };
    }
    if (!formData.items || formData.items.length === 0) {
      return { success: false, message: "At least one item is required." };
    }
    
    // Parse items and costs
    const itemNames = [];
    const itemCosts = [];
    let subtotal = 0;
    
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.name || item.name.trim() === "") {
        return { success: false, message: "Item " + (i + 1) + " name is empty." };
      }
      const cost = parseFloat(item.cost);
      if (isNaN(cost) || cost < 0) {
        return { success: false, message: "Item " + (i + 1) + " has invalid cost." };
      }
      itemNames.push(item.name.trim());
      itemCosts.push(cost);
      subtotal += cost;
    }
    
    // Calculate totals
    const gstAmount = CONFIG.GST_ENABLED ? subtotal * CONFIG.GST_RATE : 0;
    const totalCost = subtotal + gstAmount;
    
    // Generate receipt number
    const receiptNumber = generateReceiptNumber();
    const dateNow = new Date();
    
    // Build receipt data object
    const receiptData = {
      receiptNumber: receiptNumber,
      date: dateNow,
      customerName: formData.customerName.trim(),
      mobile: formData.mobile.trim(),
      email: (formData.email || "").trim(),
      itemNames: itemNames,
      itemCosts: itemCosts,
      subtotal: subtotal,
      gstRate: CONFIG.GST_ENABLED ? CONFIG.GST_RATE * 100 : 0,
      gstAmount: gstAmount,
      totalCost: totalCost,
      paymentMethod: formData.paymentMethod || "Cash",
    };
    
    // Generate PDF
    const pdfLink = generatePDF(receiptData);
    
    // Append to Receipts sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);
    
    sheet.appendRow([
      receiptData.receiptNumber,
      receiptData.date,
      receiptData.customerName,
      receiptData.mobile,
      receiptData.email,
      receiptData.itemNames.join(", "),
      receiptData.itemCosts.join(", "),
      receiptData.subtotal,
      receiptData.gstAmount,
      receiptData.totalCost,
      receiptData.paymentMethod,
      pdfLink
    ]);
    
    // Format the new row
    const newRow = sheet.getLastRow();
    sheet.getRange(newRow, 2).setNumberFormat("dd-MMM-yyyy hh:mm a");
    sheet.getRange(newRow, 8, 1, 3).setNumberFormat(CONFIG.CURRENCY + "#,##0.00");
    
    // Auto-refresh dashboard
    try {
      refreshDashboard();
    } catch (e) {
      // Dashboard refresh is non-critical
      Logger.log("Dashboard refresh skipped: " + e.message);
    }
    
    return {
      success: true,
      message: "Receipt " + receiptNumber + " created successfully!",
      receiptNumber: receiptNumber,
      pdfLink: pdfLink,
      total: totalCost
    };
    
  } catch (error) {
    Logger.log("Error in processReceipt: " + error.message);
    return { success: false, message: "Error: " + error.message };
  }
}

// ─── UTILITY FUNCTIONS ──────────────────────
/**
 * Formats a number as currency string.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return CONFIG.CURRENCY + parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Returns the CONFIG object for use in HTML sidebar.
 * @returns {Object}
 */
function getConfig() {
  return CONFIG;
}
