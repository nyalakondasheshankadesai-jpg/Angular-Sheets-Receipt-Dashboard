/**
 * ============================================
 *  SHEET SETUP — SheetSetup.gs
 *  Creates all required sheets with headers and formatting.
 *  Run once via: Receipt System → Initial Setup
 * ============================================
 */

/**
 * Creates all 4 sheets with proper headers and formatting.
 * Safe to run multiple times — skips sheets that already exist.
 */
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  // Confirm before running
  const response = ui.alert(
    "⚙️ Initial Setup",
    "This will create the following sheets:\n" +
    "• Receipts (main data)\n" +
    "• Receipt Template (PDF layout)\n" +
    "• Dashboard (stats)\n\n" +
    "Existing sheets will NOT be overwritten.\nContinue?",
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  setupReceiptsSheet(ss);
  setupTemplateSheet(ss);
  setupDashboardSheet(ss);
  
  // Make Receipts the active sheet
  const receiptsSheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);
  if (receiptsSheet) ss.setActiveSheet(receiptsSheet);
  
  ui.alert(
    "✅ Setup Complete!",
    "All sheets have been created.\n\n" +
    "Next steps:\n" +
    "1. Click 'Receipt System → New Receipt' to create your first receipt.\n" +
    "2. The dashboard will auto-update after each receipt.",
    ui.ButtonSet.OK
  );
}

/**
 * Creates the Receipts sheet with headers.
 */
function setupReceiptsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_RECEIPTS);
  }
  
  // Check if headers already exist
  if (sheet.getRange("A1").getValue() === "Receipt #") {
    return; // Already set up
  }
  
  // Headers
  const headers = [
    "Receipt #", "Date", "Customer Name", "Mobile", "Email",
    "Items", "Item Costs", "Subtotal", "GST", "Total",
    "Payment", "PDF Link"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setFontWeight("bold")
    .setBackground("#1a73e8")
    .setFontColor("#ffffff")
    .setFontSize(11)
    .setHorizontalAlignment("center");
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 100);   // Receipt #
  sheet.setColumnWidth(2, 160);   // Date
  sheet.setColumnWidth(3, 150);   // Customer Name
  sheet.setColumnWidth(4, 120);   // Mobile
  sheet.setColumnWidth(5, 180);   // Email
  sheet.setColumnWidth(6, 200);   // Items
  sheet.setColumnWidth(7, 150);   // Item Costs
  sheet.setColumnWidth(8, 100);   // Subtotal
  sheet.setColumnWidth(9, 100);   // GST
  sheet.setColumnWidth(10, 100);  // Total
  sheet.setColumnWidth(11, 80);   // Payment
  sheet.setColumnWidth(12, 200);  // PDF Link
  
  // Format currency columns
  sheet.getRange("H:J").setNumberFormat("₹#,##0.00");
  
  // Add data validation for Payment column
  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Cash", "Online"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("K2:K1000").setDataValidation(paymentRule);
  
  // Add alternating row colors (conditional formatting)
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=ISEVEN(ROW())")
    .setBackground("#f8f9fa")
    .setRanges([sheet.getRange("A2:L1000")])
    .build();
  sheet.setConditionalFormatRules([rule]);
}

/**
 * Creates the Receipt Template sheet.
 */
function setupTemplateSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_TEMPLATE);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_TEMPLATE);
  }
  
  // Clear and set up — this sheet gets populated dynamically
  sheet.clear();
  sheet.getRange(1, 1, 1, 6).merge()
    .setValue("This sheet is used as a template for PDF generation.\nDo not edit manually — it is populated automatically.")
    .setFontSize(10)
    .setFontColor("#9aa0a6")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  
  // Hide gridlines for cleaner PDF
  sheet.setHiddenGridlines(true);
}

/**
 * Creates the Dashboard sheet.
 */
function setupDashboardSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_DASHBOARD);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_DASHBOARD);
  }
  
  sheet.clear();
  sheet.getRange(1, 1).setValue("Dashboard will populate after your first receipt.")
    .setFontSize(12).setFontColor("#5f6368");
}
