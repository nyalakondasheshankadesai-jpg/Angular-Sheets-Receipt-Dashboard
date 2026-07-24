# Development Log — cloud.txt

## Project Timeline

| Time (UTC) | Event | Details |
|---|---|---|
| **2026-07-23T11:34:13Z** | Project Initiation | User requested information on Google Sheets Apps Script. |
| **2026-07-23T11:42:33Z** | Workspace Setup | Created directory structure `APP_SCRIPT_sheets/`. |
| **2026-07-23T11:53:19Z** | Architecture Selected | Chose serverless Apps Script backend to avoid local OAuth tokens. |
| **2026-07-23T12:01:31Z** | Specifications Set | Business name `cloud.txt`, currency `INR`, and `18% GST` configured. |
| **2026-07-24T07:52:28Z** | Angular Framework Setup | Bootstrapped Angular project in `angular-app/` with Glassmorphic design. |
| **2026-07-24T08:06:08Z** | Zone.js Bug Resolution | Debugged blank page caused by AngularZone runtime constraints. Fixed main.ts imports. |
| **2026-07-24T08:43:10Z** | UI polish | Fixed layout bugs to support responsive rendering on desktop and mobile screens. |
| **2026-07-24T08:50:15Z** | Deploy & Push | Configured web app URL and initialized git workflow for GitHub push. |

## Development Phases

### Phase 1: Apps Script Backend
- Built `SheetSetup.gs` for database construction.
- Created `Code.gs` and `PDF.gs` to automate row-insertion and Drive PDF compilation.

### Phase 2: Angular SPA Integration
- Designed custom dark UI with glassmorphic cards.
- Wired reactive state management with Angular Signals.
- Resolved build configurations for Zone.js.\n