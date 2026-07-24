/**
 * ============================================
 *  FORM UI — FormUI.gs
 *  Opens the HTML sidebar for receipt entry
 * ============================================
 */

/**
 * Opens the receipt entry sidebar.
 * Called from the custom menu.
 */
function showReceiptForm() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("🧾 New Receipt")
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}
