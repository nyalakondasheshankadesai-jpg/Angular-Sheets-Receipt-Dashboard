# Retrospective Reflection — cloud.txt

## What Went Well
- **Speed of Prototyping**: Setting up Google Sheets as a database allowed us to build the backend in under an hour.
- **UI Aesthetics**: The dark-themed, glassmorphic design looks premium and modern.
- **Type Safety**: Angular's reactive form controls and TypeScript interfaces minimized state bugs.

## What Could Be Improved
- **Apps Script Rate Limits**: Google Workspace imposes rate limits (e.g. 20,000 requests/day). For high-scale operations, a PostgreSQL database would be preferred.
- **PDF Generation Speed**: Headless PDF creation via Sheets print-endpoints can take 4-5 seconds. We could optimize this by compiling HTML to PDF on the client-side.\n