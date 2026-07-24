/**
 * ============================================
 *  WEB APP API — WebApp.gs
 *  REST-like endpoints for Angular frontend
 *  Deploy as: Web App → Anyone can access
 * ============================================
 */

/**
 * Handles GET requests from the Angular app.
 * Routes: ?action=getReceipts, ?action=getDashboard, ?action=getConfig
 */
function doGet(e) {
  const action = e.parameter.action || "ping";
  let result;

  try {
    switch (action) {
      case "ping":
        result = { success: true, message: "cloud.txt Receipt API is running!" };
        break;

      case "getReceipts":
        result = getAllReceipts();
        break;

      case "getDashboard":
        result = getDashboardData();
        break;

      case "getConfig":
        result = {
          success: true,
          config: {
            businessName: CONFIG.BUSINESS_NAME,
            currency: CONFIG.CURRENCY,
            gstEnabled: CONFIG.GST_ENABLED,
            gstRate: CONFIG.GST_RATE * 100
          }
        };
        break;

      case "getReceipt":
        const receiptId = e.parameter.id;
        result = getReceiptById(receiptId);
        break;

      default:
        result = { success: false, message: "Unknown action: " + action };
    }
  } catch (error) {
    result = { success: false, message: error.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles POST requests from the Angular app.
 * Used for creating receipts.
 */
function doPost(e) {
  let result;

  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || "createReceipt";

    switch (action) {
      case "createReceipt":
        result = processReceipt(body.formData);
        break;

      case "refreshDashboard":
        refreshDashboard();
        result = { success: true, message: "Dashboard refreshed" };
        break;

      default:
        result = { success: false, message: "Unknown action: " + action };
    }
  } catch (error) {
    result = { success: false, message: error.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── API Helper Functions ───────────────────

/**
 * Returns all receipts as JSON.
 */
function getAllReceipts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, receipts: [] };
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  const receipts = data.map(function(row) {
    return {
      receiptNumber: row[0],
      date: row[1] instanceof Date ? row[1].toISOString() : row[1],
      customerName: row[2],
      mobile: row[3],
      email: row[4],
      items: row[5],
      itemCosts: row[6],
      subtotal: row[7],
      gst: row[8],
      total: row[9],
      paymentMethod: row[10],
      pdfLink: row[11]
    };
  });

  return { success: true, receipts: receipts };
}

/**
 * Returns a single receipt by receipt number.
 */
function getReceiptById(receiptNumber) {
  const all = getAllReceipts();
  if (!all.success) return all;

  const receipt = all.receipts.find(function(r) {
    return r.receiptNumber === receiptNumber;
  });

  if (!receipt) {
    return { success: false, message: "Receipt not found: " + receiptNumber };
  }

  return { success: true, receipt: receipt };
}

/**
 * Returns dashboard statistics as JSON.
 */
function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_RECEIPTS);

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      success: true,
      dashboard: {
        totalRevenue: 0, monthRevenue: 0, todayRevenue: 0,
        totalCount: 0, monthCount: 0, todayCount: 0,
        cashCount: 0, onlineCount: 0,
        cashAmount: 0, onlineAmount: 0,
        topItems: [],
        recentReceipts: []
      }
    };
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalRevenue = 0, monthRevenue = 0, todayRevenue = 0;
  let totalCount = data.length, monthCount = 0, todayCount = 0;
  let cashCount = 0, onlineCount = 0, cashAmount = 0, onlineAmount = 0;
  const itemFrequency = {};

  // Monthly revenue data for chart (last 6 months)
  const monthlyData = {};

  data.forEach(function(row) {
    const date = new Date(row[1]);
    const total = parseFloat(row[9]) || 0;
    const method = (row[10] || "").toString().toLowerCase();
    const items = (row[5] || "").toString();

    totalRevenue += total;

    if (date >= monthStart) { monthRevenue += total; monthCount++; }
    if (date >= today) { todayRevenue += total; todayCount++; }

    if (method === "cash") { cashCount++; cashAmount += total; }
    else { onlineCount++; onlineAmount += total; }

    items.split(",").forEach(function(item) {
      const trimmed = item.trim();
      if (trimmed) itemFrequency[trimmed] = (itemFrequency[trimmed] || 0) + 1;
    });

    // Monthly aggregation
    const monthKey = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM");
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + total;
  });

  // Top items
  const topItems = Object.keys(itemFrequency)
    .sort(function(a, b) { return itemFrequency[b] - itemFrequency[a]; })
    .slice(0, 10)
    .map(function(name) { return { name: name, count: itemFrequency[name] }; });

  // Recent receipts
  const recentReceipts = data.slice(-10).reverse().map(function(row) {
    return {
      receiptNumber: row[0],
      date: row[1] instanceof Date ? row[1].toISOString() : row[1],
      customerName: row[2],
      total: row[9],
      paymentMethod: row[10],
      pdfLink: row[11]
    };
  });

  // Monthly chart data (last 6 months)
  const monthlyChart = Object.keys(monthlyData).sort().slice(-6).map(function(key) {
    return { month: key, revenue: monthlyData[key] };
  });

  return {
    success: true,
    dashboard: {
      totalRevenue: totalRevenue,
      monthRevenue: monthRevenue,
      todayRevenue: todayRevenue,
      totalCount: totalCount,
      monthCount: monthCount,
      todayCount: todayCount,
      cashCount: cashCount,
      onlineCount: onlineCount,
      cashAmount: cashAmount,
      onlineAmount: onlineAmount,
      topItems: topItems,
      recentReceipts: recentReceipts,
      monthlyChart: monthlyChart
    }
  };
}
