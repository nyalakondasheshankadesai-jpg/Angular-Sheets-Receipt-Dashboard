import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — cloud.txt'
  },
  {
    path: 'new-receipt',
    loadComponent: () =>
      import('./receipt-form/receipt-form.component').then(m => m.ReceiptFormComponent),
    title: 'New Receipt — cloud.txt'
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./receipt-history/receipt-history.component').then(m => m.ReceiptHistoryComponent),
    title: 'Receipt History — cloud.txt'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
