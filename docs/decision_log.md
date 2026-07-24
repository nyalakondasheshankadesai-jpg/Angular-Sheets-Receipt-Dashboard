# Decision Log — cloud.txt

## Architectural Choices

### 1. Serverless Apps Script API over Node/Python Backend
- **Context**: Setting up a full backend (Express, Django) requires hosting, SSL certificates, and database management.
- **Decision**: Used Google Apps Script Web App endpoints.
- **Chosen Because**: Zero hosting cost, direct access to Sheets and Drive APIs, and rapid deployment.

### 2. Client-Side Demo Mode fallback
- **Context**: When the frontend is launched locally, a blank Web App URL causes connectivity errors.
- **Decision**: Built a mockup detector in `receipt.service.ts` that activates when `'YOUR_WEB_APP_URL_HERE'` is detected.
- **Chosen Because**: Ensures the application starts instantly and showcases its interface cleanly.\n