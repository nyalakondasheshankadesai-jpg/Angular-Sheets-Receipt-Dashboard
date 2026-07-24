# Project Report — cloud.txt Receipt Generator

## Overview
The **cloud.txt Receipt Generator & Dashboard** is a software system that automates client invoicing and sales analytics. By integrating Google Workspace tools (Sheets and Drive) with a frontend Single Page Application (Angular), it offers a highly secure, low-latency, and zero-maintenance billing portal.

## Objective
Provide small businesses with a professional, cost-free receipt generation utility featuring automated PDF archives, central spreadsheet logging, and a responsive statistics dashboard.

## Folder Structure
- **Root (Apps Script)**: Contains `.gs` and `.html` script modules that act as the Sheets API backend.
- **angular-app/**: Contains components (`dashboard/`, `receipt-form/`, `receipt-history/`), services (`receipt.service.ts`), environment configurations, and stylesheets.

## Key Subsystems
1. **Google Sheets Database**: Saves raw receipt metadata (date, total, items, payments).
2. **Drive PDF Archiver**: Generates formatted PDFs from template tabs and files them in a shared directory.
3. **Angular Cockpit**: Shows all-time metrics, cash/online splits, item-wise sales, and interactive forms.\n