/**
 * ============================================
 *  DASHBOARD — Dashboard.gs
 *  Real-time stats, revenue breakdowns, top items
 * ============================================
 */

/**
 * Refreshes the Dashboard sheet with up-to-date stats.
 * Called from the menu or automatically after receipt creation.
 */
function refreshDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const receiptsSheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);
  let dashSheet = ss.getSheetByName(CONFIG.SHEET_DASHBOARD);
  
  if (!receiptsSheet) {
    SpreadsheetApp.getUi().alert("Receipts sheet not found. Run Initial Setup first.");
    return;
  }
  
  if (!dashSheet) {
    dashSheet = ss.insertSheet(CONFIG.SHEET_DASHBOARD);
  }
  
  // Clear dashboard
  dashSheet.clear();
  
  // Get all receipt data (skip header)
  const lastRow = receiptsSheet.getLastRow();
  if (lastRow <= 1) {
    dashSheet.getRange(1, 1).setValue("No receipts yet. Create your first receipt!")
      .setFontSize(14).setFontColor("#5f6368");
    return;
  }
  
  const data = receiptsSheet.getRange(2, 1, lastRow - 1, 12).getValues();
  
  // ─── Calculate stats ──────────────────────
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  let totalRevenue = 0;
  let monthRevenue = 0;
  let todayRevenue = 0;
  let totalCount = data.length;
  let monthCount = 0;
  let todayCount = 0;
  let cashCount = 0;
  let onlineCount = 0;
  let cashAmount = 0;
  let onlineAmount = 0;
  const itemFrequency = {};
  
  data.forEach(function(row) {
    const date = new Date(row[1]);
    const total = parseFloat(row[9]) || 0;  // Total Cost column (J = index 9)
    const method = (row[10] || "").toString().toLowerCase();
    const items = (row[5] || "").toString();
    
    // Revenue totals
    totalRevenue += total;
    
    if (date >= monthStart) {
      monthRevenue += total;
      monthCount++;
    }
    
    if (date >= today) {
      todayRevenue += total;
      todayCount++;
    }
    
    // Payment method
    if (method === "cash") {
      cashCount++;
      cashAmount += total;
    } else {
      onlineCount++;
      onlineAmount += total;
    }
    
    // Item frequency
    items.split(",").forEach(function(item) {
      const trimmed = item.trim();
      if (trimmed) {
        itemFrequency[trimmed] = (itemFrequency[trimmed] || 0) + 1;
      }
    });
  });
  
  // Sort items by frequency
  const sortedItems = Object.keys(itemFrequency).sort(function(a, b) {
    return itemFrequency[b] - itemFrequency[a];
  });
  
  const C = CONFIG.CURRENCY;
  let row = 1;
  
  // ─── Dashboard Title ──────────────────────
  dashSheet.getRange(row, 1, 1, 8).merge()
    .setValue("📊 RECEIPT DASHBOARD")
    .setFontSize(22).setFontWeight("bold")
    .setHorizontalAlignment("center").setFontColor("#1a73e8")
    .setBackground("#e8f0fe");
  row++;
  
  dashSheet.getRange(row, 1, 1, 8).merge()
    .setValue("Last updated: " + Utilities.formatDate(now, Session.getScriptTimeZone(), "dd-MMM-yyyy hh:mm a"))
    .setFontSize(9).setHorizontalAlignment("center").setFontColor("#9aa0a6");
  row += 2;
  
  // ─── Revenue Cards ────────────────────────
  // Card: All Time
  buildStatCard(dashSheet, row, 1, "ALL TIME", totalCount + " receipts", C + " " + totalRevenue.toFixed(2), "#1a73e8", "#e8f0fe");
  // Card: This Month
  buildStatCard(dashSheet, row, 4, "THIS MONTH", monthCount + " receipts", C + " " + monthRevenue.toFixed(2), "#137333", "#e6f4ea");
  // Card: Today
  buildStatCard(dashSheet, row, 7, "TODAY", todayCount + " receipts", C + " " + todayRevenue.toFixed(2), "#e37400", "#fef7e0");
  row += 4;
  
  // ─── Payment Method Breakdown ─────────────
  dashSheet.getRange(row, 1, 1, 4).merge()
    .setValue("💰 PAYMENT BREAKDOWN")
    .setFontSize(14).setFontWeight("bold").setFontColor("#202124");
  row++;
  
  // Headers
  dashSheet.getRange(row, 1).setValue("Method").setFontWeight("bold").setBackground("#f1f3f4");
  dashSheet.getRange(row, 2).setValue("Count").setFontWeight("bold").setBackground("#f1f3f4");
  dashSheet.getRange(row, 3).setValue("Amount").setFontWeight("bold").setBackground("#f1f3f4");
  dashSheet.getRange(row, 4).setValue("% Share").setFontWeight("bold").setBackground("#f1f3f4");
  row++;
  
  // Cash row
  dashSheet.getRange(row, 1).setValue("💵 Cash").setBackground("#e6f4ea");
  dashSheet.getRange(row, 2).setValue(cashCount).setBackground("#e6f4ea");
  dashSheet.getRange(row, 3).setValue(C + " " + cashAmount.toFixed(2)).setBackground("#e6f4ea");
  dashSheet.getRange(row, 4).setValue(totalCount > 0 ? (cashCount / totalCount * 100).toFixed(1) + "%" : "0%").setBackground("#e6f4ea");
  row++;
  
  // Online row
  dashSheet.getRange(row, 1).setValue("📱 Online").setBackground("#e8f0fe");
  dashSheet.getRange(row, 2).setValue(onlineCount).setBackground("#e8f0fe");
  dashSheet.getRange(row, 3).setValue(C + " " + onlineAmount.toFixed(2)).setBackground("#e8f0fe");
  dashSheet.getRange(row, 4).setValue(totalCount > 0 ? (onlineCount / totalCount * 100).toFixed(1) + "%" : "0%").setBackground("#e8f0fe");
  row += 2;
  
  // ─── Top 5 Items ──────────────────────────
  dashSheet.getRange(row, 1, 1, 4).merge()
    .setValue("🏆 TOP 5 ITEMS")
    .setFontSize(14).setFontWeight("bold").setFontColor("#202124");
  row++;
  
  dashSheet.getRange(row, 1).setValue("Rank").setFontWeight("bold").setBackground("#f1f3f4");
  dashSheet.getRange(row, 2, 1, 2).merge().setValue("Item Name").setFontWeight("bold").setBackground("#f1f3f4");
  dashSheet.getRange(row, 4).setValue("Sold").setFontWeight("bold").setBackground("#f1f3f4");
  row++;
  
  const top5 = sortedItems.slice(0, 5);
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  
  for (let i = 0; i < top5.length; i++) {
    const bgColor = i % 2 === 0 ? "#ffffff" : "#f8f9fa";
    dashSheet.getRange(row, 1).setValue(medals[i]).setBackground(bgColor);
    dashSheet.getRange(row, 2, 1, 2).merge().setValue(top5[i]).setBackground(bgColor);
    dashSheet.getRange(row, 4).setValue(itemFrequency[top5[i]]).setBackground(bgColor).setHorizontalAlignment("center");
    row++;
  }
  
  if (top5.length === 0) {
    dashSheet.getRange(row, 1, 1, 4).merge().setValue("No items yet").setFontColor("#9aa0a6");
    row++;
  }
  
  row++;
  
  // ─── Recent 10 Receipts ───────────────────
  dashSheet.getRange(row, 1, 1, 8).merge()
    .setValue("📋 RECENT RECEIPTS")
    .setFontSize(14).setFontWeight("bold").setFontColor("#202124");
  row++;
  
  // Headers
  const recentHeaders = ["Receipt #", "Date", "Customer", "Mobile", "Items", "Total", "Payment", "PDF"];
  for (let i = 0; i < recentHeaders.length; i++) {
    dashSheet.getRange(row, i + 1).setValue(recentHeaders[i])
      .setFontWeight("bold").setBackground("#1a73e8").setFontColor("#ffffff");
  }
  row++;
  
  // Last 10 receipts (most recent first)
  const recent = data.slice(-10).reverse();
  recent.forEach(function(r, idx) {
    const bgColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
    dashSheet.getRange(row, 1).setValue(r[0]).setBackground(bgColor);  // Receipt #
    dashSheet.getRange(row, 2).setValue(
      r[1] instanceof Date ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), "dd-MMM-yy") : r[1]
    ).setBackground(bgColor);
    dashSheet.getRange(row, 3).setValue(r[2]).setBackground(bgColor);  // Customer
    dashSheet.getRange(row, 4).setValue(r[3]).setBackground(bgColor);  // Mobile
    dashSheet.getRange(row, 5).setValue(r[5]).setBackground(bgColor);  // Items
    dashSheet.getRange(row, 6).setValue(C + " " + (parseFloat(r[9]) || 0).toFixed(2)).setBackground(bgColor);
    dashSheet.getRange(row, 7).setValue(r[10]).setBackground(bgColor); // Payment
    if (r[11]) {
      dashSheet.getRange(row, 8).setValue("📄 View")
        .setFontColor("#1a73e8").setBackground(bgColor);
      // Note: hyperlinks via setFormula
      dashSheet.getRange(row, 8).setFormula('=HYPERLINK("' + r[11] + '","📄 View")');
    }
    row++;
  });
  
  // ─── Auto-fit columns ─────────────────────
  for (let c = 1; c <= 8; c++) {
    dashSheet.autoResizeColumn(c);
  }
  
  // Protect dashboard from manual edits
  dashSheet.getRange(row + 1, 1, 1, 8).merge()
    .setValue("⚠️ This dashboard is auto-generated. Use 'Receipt System → Refresh Dashboard' to update.")
    .setFontSize(8).setFontColor("#9aa0a6").setHorizontalAlignment("center");
}

/**
 * Builds a stat card on the dashboard.
 * @param {Sheet} sheet
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {string} title
 * @param {string} subtitle
 * @param {string} value
 * @param {string} color - Text color
 * @param {string} bgColor - Background color
 */
function buildStatCard(sheet, row, col, title, subtitle, value, color, bgColor) {
  // Title
  sheet.getRange(row, col, 1, 2).merge()
    .setValue(title).setFontSize(10).setFontWeight("bold")
    .setFontColor(color).setBackground(bgColor)
    .setHorizontalAlignment("center");
  
  // Value
  sheet.getRange(row + 1, col, 1, 2).merge()
    .setValue(value).setFontSize(18).setFontWeight("bold")
    .setFontColor(color).setBackground(bgColor)
    .setHorizontalAlignment("center");
  
  // Subtitle
  sheet.getRange(row + 2, col, 1, 2).merge()
    .setValue(subtitle).setFontSize(9)
    .setFontColor("#5f6368").setBackground(bgColor)
    .setHorizontalAlignment("center");
}
