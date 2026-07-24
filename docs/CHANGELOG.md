# Changelog — cloud.txt Receipt Generator

All notable changes to this project will be documented in this file.

## [1.0.0] — 2026-07-24

### Added
- **Apps Script Backend**: Created `Code.gs`, `WebApp.gs`, `PDF.gs`, `Dashboard.gs`, `SheetSetup.gs`, `FormUI.gs`, and `Sidebar.html`.
- **Angular Frontend**: Built responsive dashboard, reactive receipt form, and history components.
- **Demo Mode**: Enabled client-side mock data fallback in the Angular app if the Apps Script URL is blank.
- **Dynamic Items**: Added support for adding/removing multiple receipt items in the reactive form.

### Fixed
- **Zone.js Bootstrap Issue**: Resolved blank page issue by properly importing and configuring `zone.js` in the Angular application build.
- **Responsive Layout**: Realigned monthly sales charts and summary cards to fit smaller mobile displays properly.\n