import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptService } from '../services/receipt.service';
import { Receipt } from '../models/receipt.model';

@Component({
  selector: 'app-receipt-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receipt-history.component.html',
  styleUrls: ['./receipt-history.component.scss']
})
export class ReceiptHistoryComponent implements OnInit {
  private receiptService = inject(ReceiptService);

  receipts = signal<Receipt[]>([]);
  searchTerm = signal<string>('');
  paymentFilter = signal<'All' | 'Cash' | 'Online'>('All');

  filteredReceipts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.paymentFilter();

    return this.receipts().filter(r => {
      const matchesSearch = 
        r.customerName.toLowerCase().includes(term) || 
        r.receiptNumber.toLowerCase().includes(term);
      const matchesFilter = filter === 'All' || r.paymentMethod === filter;
      return matchesSearch && matchesFilter;
    });
  });

  totalReceipts = computed(() => this.filteredReceipts().length);

  totalRevenue = computed(() =>
    this.filteredReceipts().reduce((sum, r) => sum + (r.total || 0), 0)
  );

  ngOnInit() {
    this.receiptService.getReceipts().subscribe(response => {
      this.receipts.set(response.receipts || []);
    });
  }

  setFilter(filter: 'All' | 'Cash' | 'Online') {
    this.paymentFilter.set(filter);
  }

  parseItems(itemsStr: string, costsStr: string): { name: string, cost: number }[] {
    if (!itemsStr) return [];
    const names = itemsStr.split(',').map(s => s.trim());
    const costs = (costsStr || '').split(',').map(s => parseFloat(s.trim()) || 0);
    return names.map((name, i) => ({
      name,
      cost: costs[i] || 0
    }));
  }

  viewPdf(receipt: Receipt) {
    if (receipt.pdfLink && receipt.pdfLink !== '#') {
      window.open(receipt.pdfLink, '_blank');
    } else {
      alert('PDF receipt is not available in demo mode.');
    }
  }
}
