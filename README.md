# DFM KORBA ARENA
## Production Media & Competition Management System
### Integrated with Fixed Google Drive & Google Sheets Infrastructure

DFM KORBA ARENA is an enterprise-grade digital competition and media submission management platform tailored for the 30 contenders and 5 competitive units of Korba.

---

### Core Highlights

1. **Fixed Google Drive Media Lake**:
   - Drive Root Folder: `1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U`
   - URL: `https://drive.google.com/drive/u/2/folders/1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U`
   - Automated subfolder structure for Admins (`00_ADMIN`), Teams (`01_TEAMS`), Contenders (`02_STUDENTS`), Shared Assets (`03_SHARED_ASSETS`), Public Gallery (`04_PUBLIC_GALLERY`), and System Backups (`05_BACKUPS`).
   - Every contender receives an isolated directory with 8 subfolders (`Profile_Photo`, `Drone_Videos`, `Photography`, `Video_Projects`, `Editing_Projects`, `Design_Projects`, `Challenge_Submissions`, `Published_Portfolio`).

2. **Fixed Central Google Sheets Database**:
   - Spreadsheet ID: `10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE`
   - URL: `https://docs.google.com/spreadsheets/d/10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE/edit?gid=0#gid=0`
   - 14 relational worksheets maintaining immutable audit logs, score ledgers, student profiles, and folder ID mappings.

3. **Privacy & Access Control**:
   - Private student folders and submissions remain restricted from public viewing.
   - When an administrator approves and publishes a submission, viewer permission is granted exclusively to that specific media file, protecting all other contender data.

4. **Multi-Role Frontend**:
   - **Public Home & Gallery**: Filterable showcase across Drone Cinematography, Photography, Photoshop, Illustrator, Premiere Pro, and Makeup/SFX.
   - **Leaderboard**: Real-time team championship standings with automatic score recalculation.
   - **Student Dashboard**: Contender submission portal with direct Drive upload and instant status reflection.
   - **Admin Command & Cloud Hub**: Direct links to Drive and Sheets, live connectivity tests, one-click folder synchronization, and submission grading/publishing workflows.

---

### File Structure

```text
dfm app/
├── Code.gs                # Google Apps Script Production Backend (API, Drive & Sheets services)
├── Index.html             # Mobile-first Single Page Application Frontend
├── appsscript.json        # Apps Script OAuth Manifest & Scopes
├── server-listener.ps1    # Local HTTP server listener for development & testing
├── DEPLOYMENT_GUIDE.md    # Step-by-step production deployment manual
└── README.md              # Project overview
```

### Quick Verification & Local Testing

To run the local preview listener on Windows:
```powershell
powershell -ExecutionPolicy Bypass -File server-listener.ps1
```
Open `http://127.0.0.1:18765/` in your browser.

