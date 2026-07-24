import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReceiptService } from '../services/receipt.service';
import { ReceiptFormData } from '../models/receipt.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-receipt-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './receipt-form.component.html',
  styleUrls: ['./receipt-form.component.scss']
})
export class ReceiptFormComponent implements OnInit {
  receiptForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  successMessage = signal<{ receiptNumber: string, pdfUrl: string } | null>(null);
  errorMessage = signal<string | null>(null);

  subtotal = signal<number>(0);
  gst = signal<number>(0);
  grandTotal = signal<number>(0);

  constructor(
    private fb: FormBuilder,
    private receiptService: ReceiptService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.calculateTotals();
    
    // Subscribe to items value changes to recalculate totals
    this.receiptForm.get('items')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  initForm(): void {
    this.receiptForm = this.fb.group({
      customerName: ['', Validators.required],
      customerMobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      customerEmail: ['', Validators.email],
      items: this.fb.array([this.createItem()]),
      paymentMethod: ['Cash', Validators.required]
    });
  }

  get items(): FormArray {
    return this.receiptForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      cost: [null, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  setPaymentMethod(method: string): void {
    this.receiptForm.patchValue({ paymentMethod: method });
  }

  calculateTotals(): void {
    const itemsValue = this.items.value as any[];
    const calculatedSubtotal = itemsValue.reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
    const calculatedGst = calculatedSubtotal * 0.18;
    const calculatedTotal = calculatedSubtotal + calculatedGst;

    this.subtotal.set(calculatedSubtotal);
    this.gst.set(calculatedGst);
    this.grandTotal.set(calculatedTotal);
  }

  onSubmit(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    
    if (this.receiptForm.invalid) {
      this.receiptForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.receiptForm.value;
    const formData: ReceiptFormData = {
      customerName: formVal.customerName,
      mobile: formVal.customerMobile,
      email: formVal.customerEmail,
      items: formVal.items,
      paymentMethod: formVal.paymentMethod
    };

    this.receiptService.createReceipt(formData)
      .pipe(
        catchError(error => {
          this.errorMessage.set('Failed to generate receipt. Please try again.');
          return of(null);
        }),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe((response: any) => {
        if (response) {
          this.successMessage.set({
            receiptNumber: response.receiptNumber || 'NEW',
            pdfUrl: response.pdfUrl || '#'
          });
          this.resetForm();
        }
      });
  }

  resetForm(): void {
    this.receiptForm.reset({
      paymentMethod: 'Cash'
    });
    this.items.clear();
    this.addItem();
    this.calculateTotals();
  }
}
