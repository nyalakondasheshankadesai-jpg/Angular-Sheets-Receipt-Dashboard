/**
 * ============================================
 *  PDF GENERATION — PDF.gs
 *  Populates template sheet, exports PDF to Drive
 * ============================================
 */

/**
 * Generates a PDF receipt from the template sheet.
 * Populates the Receipt Template, exports it as PDF,
 * saves to a Google Drive folder, and returns the link.
 * 
 * @param {Object} receiptData - Receipt data object from processReceipt
 * @returns {string} Shareable link to the PDF in Google Drive
 */
function generatePDF(receiptData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let templateSheet = ss.getSheetByName(CONFIG.SHEET_TEMPLATE);
  
  if (!templateSheet) {
    throw new Error("Receipt Template sheet not found. Run Initial Setup first.");
  }
  
  // ─── Populate the template ────────────────
  populateTemplate(templateSheet, receiptData);
  
  // Force recalculation
  SpreadsheetApp.flush();
  
  // ─── Export as PDF ────────────────────────
  const sheetId = templateSheet.getSheetId();
  const ssId = ss.getId();
  
  const pdfUrl = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?" +
    "exportFormat=pdf" +
    "&format=pdf" +
    "&size=A4" +
    "&portrait=true" +
    "&fitw=true" +            // Fit to width
    "&gridlines=false" +       // No gridlines
    "&printtitle=false" +
    "&sheetnames=false" +
    "&pagenum=false" +
    "&fzr=false" +             // No frozen rows
    "&gid=" + sheetId +
    "&top_margin=0.25" +
    "&bottom_margin=0.25" +
    "&left_margin=0.40" +
    "&right_margin=0.40";
  
  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch(pdfUrl, {
    headers: { "Authorization": "Bearer " + token },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    throw new Error("PDF export failed: " + response.getContentText());
  }
  
  const pdfBlob = response.getBlob().setName(
    receiptData.receiptNumber + "_" + 
    receiptData.customerName.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf"
  );
  
  // ─── Save to Drive folder ────────────────
  const folder = getOrCreateFolder(CONFIG.PDF_FOLDER_NAME);
  const file = folder.createFile(pdfBlob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // ─── Clear the template after export ─────
  clearTemplate(templateSheet);
  
  return file.getUrl();
}

/**
 * Populates the Receipt Template sheet with receipt data.
 * @param {Sheet} sheet - The template sheet
 * @param {Object} data - Receipt data
 */
function populateTemplate(sheet, data) {
  // Clear previous content (keep formatting)
  const lastRow = Math.max(sheet.getLastRow(), 30);
  sheet.getRange(1, 1, lastRow, 6).clearContent();
  
  const C = CONFIG.CURRENCY;
  let row = 1;
  
  // ─── Header ───────────────────────────────
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue(CONFIG.BUSINESS_NAME)
    .setFontSize(20).setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setFontColor("#1a73e8");
  row++;
  
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue(CONFIG.BUSINESS_ADDRESS)
    .setFontSize(10).setHorizontalAlignment("center")
    .setFontColor("#5f6368");
  row++;
  
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("Phone: " + CONFIG.BUSINESS_PHONE + "  |  Email: " + CONFIG.BUSINESS_EMAIL)
    .setFontSize(10).setHorizontalAlignment("center")
    .setFontColor("#5f6368");
  row++;
  
  // Divider
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    .setHorizontalAlignment("center").setFontColor("#dadce0");
  row++;
  
  // ─── Receipt Info ─────────────────────────
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("RECEIPT")
    .setFontSize(16).setFontWeight("bold").setFontColor("#202124");
  sheet.getRange(row, 4, 1, 3).merge()
    .setValue(data.receiptNumber)
    .setFontSize(16).setFontWeight("bold")
    .setHorizontalAlignment("right").setFontColor("#1a73e8");
  row++;
  
  // Date
  const dateStr = Utilities.formatDate(data.date, Session.getScriptTimeZone(), "dd-MMM-yyyy hh:mm a");
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("Date:").setFontWeight("bold");
  sheet.getRange(row, 4, 1, 3).merge()
    .setValue(dateStr).setHorizontalAlignment("right");
  row++;
  row++; // spacer
  
  // ─── Customer Info ────────────────────────
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("BILL TO")
    .setFontSize(11).setFontWeight("bold")
    .setFontColor("#1a73e8").setBackground("#e8f0fe");
  row++;
  
  sheet.getRange(row, 1, 1, 2).merge().setValue("Name:").setFontWeight("bold");
  sheet.getRange(row, 3, 1, 4).merge().setValue(data.customerName);
  row++;
  
  sheet.getRange(row, 1, 1, 2).merge().setValue("Mobile:").setFontWeight("bold");
  sheet.getRange(row, 3, 1, 4).merge().setValue(data.mobile);
  row++;
  
  if (data.email) {
    sheet.getRange(row, 1, 1, 2).merge().setValue("Email:").setFontWeight("bold");
    sheet.getRange(row, 3, 1, 4).merge().setValue(data.email);
    row++;
  }
  
  row++; // spacer
  
  // ─── Items Table Header ───────────────────
  const headerRange = sheet.getRange(row, 1, 1, 6);
  sheet.getRange(row, 1, 1, 1).setValue("#");
  sheet.getRange(row, 2, 1, 3).merge().setValue("Item Description");
  sheet.getRange(row, 5, 1, 2).merge().setValue("Amount (" + C + ")").setHorizontalAlignment("right");
  headerRange.setFontWeight("bold").setBackground("#1a73e8")
    .setFontColor("#ffffff").setFontSize(10);
  row++;
  
  // ─── Item Rows ────────────────────────────
  for (let i = 0; i < data.itemNames.length; i++) {
    const bgColor = i % 2 === 0 ? "#ffffff" : "#f8f9fa";
    sheet.getRange(row, 1).setValue(i + 1).setBackground(bgColor);
    sheet.getRange(row, 2, 1, 3).merge()
      .setValue(data.itemNames[i]).setBackground(bgColor);
    sheet.getRange(row, 5, 1, 2).merge()
      .setValue(C + " " + data.itemCosts[i].toFixed(2))
      .setHorizontalAlignment("right").setBackground(bgColor);
    row++;
  }
  
  // Divider line
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("").setBackground("#dadce0");
  sheet.getRange(row, 1, 1, 6).setBorder(false, false, true, false, false, false,
    "#dadce0", SpreadsheetApp.BorderStyle.SOLID);
  row++;
  
  // ─── Totals ───────────────────────────────
  // Subtotal
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("Subtotal").setHorizontalAlignment("right").setFontWeight("bold");
  sheet.getRange(row, 5, 1, 2).merge()
    .setValue(C + " " + data.subtotal.toFixed(2))
    .setHorizontalAlignment("right");
  row++;
  
  // GST (if enabled)
  if (CONFIG.GST_ENABLED && data.gstAmount > 0) {
    sheet.getRange(row, 1, 1, 4).merge()
      .setValue("GST (" + data.gstRate + "%)").setHorizontalAlignment("right").setFontWeight("bold");
    sheet.getRange(row, 5, 1, 2).merge()
      .setValue(C + " " + data.gstAmount.toFixed(2))
      .setHorizontalAlignment("right");
    row++;
  }
  
  // Total
  const totalRange1 = sheet.getRange(row, 1, 1, 4);
  totalRange1.merge().setValue("TOTAL").setHorizontalAlignment("right")
    .setFontWeight("bold").setFontSize(13).setFontColor("#1a73e8");
  const totalRange2 = sheet.getRange(row, 5, 1, 2);
  totalRange2.merge()
    .setValue(C + " " + data.totalCost.toFixed(2))
    .setHorizontalAlignment("right").setFontWeight("bold")
    .setFontSize(13).setFontColor("#1a73e8");
  row++;
  
  row++; // spacer
  
  // ─── Payment Method ───────────────────────
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("Payment Method: " + data.paymentMethod.toUpperCase())
    .setHorizontalAlignment("center").setFontWeight("bold")
    .setBackground(data.paymentMethod === "Cash" ? "#e6f4ea" : "#e8f0fe")
    .setFontColor(data.paymentMethod === "Cash" ? "#137333" : "#1a73e8")
    .setFontSize(11);
  row++;
  
  row++; // spacer
  
  // ─── Footer ───────────────────────────────
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    .setHorizontalAlignment("center").setFontColor("#dadce0");
  row++;
  
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("Thank you for your business!")
    .setHorizontalAlignment("center").setFontSize(12)
    .setFontWeight("bold").setFontColor("#5f6368");
  row++;
  
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("This is a computer-generated receipt and does not require a signature.")
    .setHorizontalAlignment("center").setFontSize(8)
    .setFontColor("#9aa0a6");
  
  // Set column widths
  sheet.setColumnWidth(1, 40);   // #
  sheet.setColumnWidth(2, 120);  // Item part 1
  sheet.setColumnWidth(3, 100);  // Item part 2
  sheet.setColumnWidth(4, 100);  // Item part 3
  sheet.setColumnWidth(5, 80);   // Amount part 1
  sheet.setColumnWidth(6, 80);   // Amount part 2
}

/**
 * Clears the template sheet content after PDF export.
 * @param {Sheet} sheet
 */
function clearTemplate(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 30);
  sheet.getRange(1, 1, lastRow, 6).clear();
}

/**
 * Gets or creates a folder in Google Drive.
 * @param {string} folderName
 * @returns {Folder}
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}
