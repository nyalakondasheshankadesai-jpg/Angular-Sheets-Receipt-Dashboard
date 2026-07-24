import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, ReceiptFormData, DashboardData, Receipt } from '../models/receipt.model';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = environment.appsScriptUrl;

  constructor(private http: HttpClient) {}

  /**
   * Check if the API is configured (not placeholder URL).
   */
  isConfigured(): boolean {
    return this.apiUrl !== 'YOUR_WEB_APP_URL_HERE' && this.apiUrl.length > 10;
  }

  /**
   * Ping the API to check connectivity.
   */
  ping(): Observable<ApiResponse> {
    if (!this.isConfigured()) {
      return of({ success: true, message: 'Demo mode — no API connected' });
    }
    const params = new HttpParams().set('action', 'ping');
    return this.http.get<ApiResponse>(this.apiUrl, { params });
  }

  /**
   * Get all receipts from the sheet.
   */
  getReceipts(): Observable<ApiResponse> {
    if (!this.isConfigured()) {
      return of({ success: true, receipts: this.getDemoReceipts() });
    }
    const params = new HttpParams().set('action', 'getReceipts');
    return this.http.get<ApiResponse>(this.apiUrl, { params });
  }

  /**
   * Get dashboard statistics.
   */
  getDashboard(): Observable<ApiResponse<DashboardData>> {
    if (!this.isConfigured()) {
      return of({ success: true, dashboard: this.getDemoDashboard() });
    }
    const params = new HttpParams().set('action', 'getDashboard');
    return this.http.get<ApiResponse<DashboardData>>(this.apiUrl, { params });
  }

  /**
   * Create a new receipt.
   */
  createReceipt(formData: ReceiptFormData): Observable<ApiResponse> {
    if (!this.isConfigured()) {
      return of({
        success: true,
        message: 'Demo receipt created!',
        receiptNumber: 'REC-' + String(Math.floor(Math.random() * 9999)).padStart(4, '0'),
        pdfLink: '#',
        total: formData.items.reduce((sum, item) => sum + item.cost, 0) * 1.18
      }).pipe(delay(1500));
    }
    return this.http.post<ApiResponse>(this.apiUrl, {
      action: 'createReceipt',
      formData: formData
    });
  }

  /**
   * Get a single receipt by ID.
   */
  getReceipt(id: string): Observable<ApiResponse> {
    if (!this.isConfigured()) {
      return of({ success: false, message: 'Demo mode' });
    }
    const params = new HttpParams()
      .set('action', 'getReceipt')
      .set('id', id);
    return this.http.get<ApiResponse>(this.apiUrl, { params });
  }

  // ─── Demo Data (when no API is connected) ────────
  private getDemoReceipts(): Receipt[] {
    return [
      {
        receiptNumber: 'REC-0001', date: new Date().toISOString(),
        customerName: 'Rahul Sharma', mobile: '+91 9876543210', email: 'rahul@email.com',
        items: 'Web Design, Logo Design', itemCosts: '15000, 5000',
        subtotal: 20000, gst: 3600, total: 23600,
        paymentMethod: 'Online', pdfLink: '#'
      },
      {
        receiptNumber: 'REC-0002', date: new Date(Date.now() - 86400000).toISOString(),
        customerName: 'Priya Patel', mobile: '+91 8765432109', email: 'priya@email.com',
        items: 'SEO Package, Content Writing', itemCosts: '10000, 3000',
        subtotal: 13000, gst: 2340, total: 15340,
        paymentMethod: 'Cash', pdfLink: '#'
      },
      {
        receiptNumber: 'REC-0003', date: new Date(Date.now() - 172800000).toISOString(),
        customerName: 'Amit Kumar', mobile: '+91 7654321098', email: '',
        items: 'App Development', itemCosts: '50000',
        subtotal: 50000, gst: 9000, total: 59000,
        paymentMethod: 'Online', pdfLink: '#'
      }
    ];
  }

  private getDemoDashboard(): DashboardData {
    const receipts = this.getDemoReceipts();
    return {
      totalRevenue: 97940, monthRevenue: 97940, todayRevenue: 23600,
      totalCount: 3, monthCount: 3, todayCount: 1,
      cashCount: 1, onlineCount: 2, cashAmount: 15340, onlineAmount: 82600,
      topItems: [
        { name: 'Web Design', count: 1 },
        { name: 'App Development', count: 1 },
        { name: 'SEO Package', count: 1 },
        { name: 'Logo Design', count: 1 },
        { name: 'Content Writing', count: 1 }
      ],
      recentReceipts: receipts,
      monthlyChart: [
        { month: '2026-05', revenue: 32000 },
        { month: '2026-06', revenue: 45000 },
        { month: '2026-07', revenue: 97940 }
      ]
    };
  }
}
