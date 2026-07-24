# Technical Report — cloud.txt Architecture

## 1. Executive Summary
This report analyzes the design, architecture, and engineering metrics of **cloud.txt**, a serverless invoicing utility. The system employs Google Apps Script Web App endpoints as a REST API backend, coupled with an Angular SPA frontend, eliminating database hosting overhead.

## 2. Requirements
- **Functional**: Dynamic billing rows addition, 18% GST computation, automated invoice generation as PDF in Drive, and sales analytics charts.
- **Non-Functional**: Dark responsive UI (below 3s load time), zero-server backend cost, secure data containment in Google Workspace.

## 3. Algorithms & Logic
- **Receipt ID Generation**: Scans Column A of the Sheets log, extracts integer suffixes using regex `(\d+)$`, retrieves the maximum value, and increments it (e.g., `REC-0005`).
- **GST Calculations**: Total GST is calculated via `Subtotal * 0.18`.

## 4. Performance & Security
- **Hosting**: Direct deployment from Google Workspace servers ensures 99.9% uptime.
- **Security**: Web App runs as "Me" so users do not require personal write permissions to the master sheet or Drive folder. All payloads are processed over HTTPS.\n