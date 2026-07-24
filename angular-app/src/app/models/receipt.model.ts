/**
 * Receipt data model interfaces
 */

export interface ReceiptItem {
  name: string;
  cost: number;
}

export interface ReceiptFormData {
  customerName: string;
  mobile: string;
  email: string;
  items: ReceiptItem[];
  paymentMethod: 'Cash' | 'Online';
}

export interface Receipt {
  receiptNumber: string;
  date: string;
  customerName: string;
  mobile: string;
  email: string;
  items: string;
  itemCosts: string;
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod: string;
  pdfLink: string;
}

export interface DashboardData {
  totalRevenue: number;
  monthRevenue: number;
  todayRevenue: number;
  totalCount: number;
  monthCount: number;
  todayCount: number;
  cashCount: number;
  onlineCount: number;
  cashAmount: number;
  onlineAmount: number;
  topItems: { name: string; count: number }[];
  recentReceipts: Receipt[];
  monthlyChart: { month: string; revenue: number }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  receipts?: Receipt[];
  receipt?: Receipt;
  dashboard?: DashboardData;
  config?: any;
  receiptNumber?: string;
  pdfLink?: string;
  total?: number;
}
