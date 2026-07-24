import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptService } from '../services/receipt.service';
import { DashboardData, ApiResponse } from '../models/receipt.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboard = signal<DashboardData | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  maxMonthlyRevenue = computed(() => {
    const data = this.dashboard();
    if (!data?.monthlyChart || data.monthlyChart.length === 0) return 0;
    return Math.max(...data.monthlyChart.map(m => m.revenue));
  });

  cashPercentage = computed(() => {
    const data = this.dashboard();
    if (!data) return 0;
    const total = (data.cashAmount || 0) + (data.onlineAmount || 0);
    return total === 0 ? 0 : ((data.cashAmount || 0) / total) * 100;
  });

  onlinePercentage = computed(() => {
    const data = this.dashboard();
    if (!data) return 0;
    const total = (data.cashAmount || 0) + (data.onlineAmount || 0);
    return total === 0 ? 0 : ((data.onlineAmount || 0) / total) * 100;
  });

  constructor(private receiptService: ReceiptService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.receiptService.getDashboard().subscribe({
      next: (response: ApiResponse<DashboardData>) => {
        this.dashboard.set(response.dashboard || null);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
        console.error('Error loading dashboard:', err);
      }
    });
  }
}
