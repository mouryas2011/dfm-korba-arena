# DFM KORBA ARENA — PRODUCTION DEPLOYMENT & STORAGE GUIDE
## Fixed Google Drive & Google Sheets Integration Architecture

This document outlines the mandatory production deployment steps for the **DFM KORBA ARENA** media management and competition system.

---

### 1. FIXED INFRASTRUCTURE IDENTIFIERS

| Service | Target Identifier | URL |
| :--- | :--- | :--- |
| **Primary Database** | `10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE` | [Google Sheets Database](https://docs.google.com/spreadsheets/d/10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE/edit?gid=0#gid=0) |
| **Root Media Storage** | `1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U` | [Google Drive Root Folder](https://drive.google.com/drive/u/2/folders/1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U) |

> **IMPORTANT:** Never replace, migrate, or fabricate new folder or spreadsheet IDs. All team, student, admin, media, and report folders are created automatically inside this exact parent root.

---

### 2. CORE APPS SCRIPT FUNCTIONS

| Function Name | Purpose | Idempotency |
| :--- | :--- | :--- |
| `initializeDFMKorbaArena()` | Main entry point for full system setup, schema migration, folder tree build, seed data, and initial superadmin creation. | Safe to run repeatedly; preserves existing data. |
| `verifyGoogleConnections()` | Performs live ping and metadata verification for both the Google Sheet and Drive Root folder. | Read-only. |
| `initializeDatabaseSheets()` | Checks for all 14 required worksheets; adds missing columns without deleting existing data. | Non-destructive. |
| `initializeDriveFolders()` | Builds `00_ADMIN`, `01_TEAMS`, `02_STUDENTS`, `03_SHARED_ASSETS`, `04_PUBLIC_GALLERY`, `05_BACKUPS`. | Reuses existing folder IDs. |
| `syncAllStudentDriveFolders()` | Scans the `Students` sheet, checks or creates individual folders for all 30 students and 8 subfolders each. | Idempotent. |
| `syncAllTeamDriveFolders()` | Scans `Teams`, verifies `TEAM_001` through `TEAM_005` and their 4 subfolders in `01_TEAMS`. | Idempotent. |
| `syncAllAdminDriveFolders()` | Creates individual administrator profile folders inside `00_ADMIN`. | Idempotent. |
| `verifyDriveFolderStructure()` | Audits root directory for all mandatory system folders. | Audit only. |

---

### 3. DATABASE SCHEMAS (14 WORKSHEETS)

1. **`AppConfig`**: `ConfigKey`, `ConfigValue`, `Description`, `UpdatedAt`
2. **`Users`**: `UserID`, `Username`, `PasswordHash`, `PasswordSalt`, `Role`, `Status`, `MustChangePassword`, `SessionVersion`, `CreatedAt`, `UpdatedAt`
3. **`Teams`**: `TeamID`, `TeamName`, `LogoFileID`, `Description`, `TeamColor`, `DriveFolderID`, `TotalScoreCache`, `RankCache`, `Status`, `CreatedAt`, `UpdatedAt`
4. **`Students`**: `StudentID`, `FullName`, `ProfilePhotoFileID`, `Username`, `TeamID`, `MobilePrivate`, `EmailPrivate`, `DriveFolderID`, `IndividualScoreCache`, `RankCache`, `PublicProfileStatus`, `AccountStatus`, `CreatedAt`, `UpdatedAt`
5. **`TeamMembers`**: `MembershipID`, `StudentID`, `TeamID`, `StartDate`, `EndDate`, `MembershipStatus`, `CreatedAt`
6. **`Challenges`**: `ChallengeID`, `Title`, `Description`, `CategoryID`, `ChallengeType`, `MaxMarks`, `StartDate`, `Deadline`, `SubmissionType`, `Instructions`, `ReferenceFileID`, `Status`, `PublicStatus`, `CreatedBy`, `CreatedAt`, `UpdatedAt`
7. **`Submissions`**: `SubmissionID`, `StudentID`, `TeamID`, `ChallengeID`, `Title`, `Description`, `MainFileID`, `ThumbnailFileID`, `SubmissionType`, `DriveFolderID`, `UploadStatus`, `EvaluationStatus`, `PublicationStatus`, `SubmittedAt`, `UpdatedAt`
8. **`ScoreLedger`**: `ScoreID`, `ChallengeID`, `SubmissionID`, `StudentID`, `TeamID`, `ScoreType`, `PointsAwarded`, `MaximumPoints`, `IncludeInTeamTotal`, `EvaluatorID`, `Feedback`, `Status`, `CorrectionReason`, `OriginalScoreID`, `CreatedAt`
9. **`LeaderRotation`**: `RotationID`, `TeamID`, `CompetitionDay`, `StudentID`, `RotationStatus`, `OverrideReason`, `CreatedAt`
10. **`UploadSessions`**: `UploadID`, `UserID`, `StudentID`, `TeamID`, `ChallengeID`, `DriveFileID`, `ExpectedSize`, `UploadedSize`, `UploadStatus`, `LastActivityAt`
11. **`PublishedWorks`**: `PublicationID`, `SubmissionID`, `FileID`, `StudentID`, `TeamID`, `CategoryID`, `Title`, `ThumbnailFileID`, `PublicStatus`, `PublishDate`, `PublishedBy`, `UpdatedAt`
12. **`Notifications`**: `NotificationID`, `UserID`, `Title`, `Message`, `NotificationType`, `ReadStatus`, `CreatedAt`
13. **`AuditLogs`**: `LogID`, `UserID`, `Action`, `EntityType`, `EntityID`, `Details`, `RequestID`, `CreatedAt`
14. **`DriveFolders`**: `RecordID`, `OwnerType`, `OwnerID`, `FolderCategory`, `FolderID`, `ParentFolderID`, `FolderName`, `Status`, `CreatedAt`, `UpdatedAt`

---

### 4. GOOGLE DRIVE AUTOMATED FOLDER HIERARCHY

```text
DFM KORBA ARENA (Root ID: 1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U)
├── 00_ADMIN/
│   ├── Admin_Profiles/
│   ├── Challenge_References/
│   ├── Admin_Uploads/
│   ├── Reports/
│   └── Exports/
├── 01_TEAMS/
│   ├── TEAM_001_Sky_Hawks/
│   │   ├── Team_Logo/
│   │   ├── Team_Submissions/
│   │   ├── Team_Projects/
│   │   └── Published_Work/
│   ├── TEAM_002_Drone_Force/
│   ├── TEAM_003_Air_Vision/
│   ├── TEAM_004_Sky_Riders/
│   └── TEAM_005_Pixel_Wings/
├── 02_STUDENTS/
│   ├── STU_001_Rohan_Verma/
│   │   ├── Profile_Photo/
│   │   ├── Drone_Videos/
│   │   ├── Photography/
│   │   ├── Video_Projects/
│   │   ├── Editing_Projects/
│   │   ├── Design_Projects/
│   │   ├── Challenge_Submissions/
│   │   └── Published_Portfolio/
│   ├── STU_002_Priya_Sahu/
│   └── ... (All 30 Contenders across 5 Teams)
├── 03_SHARED_ASSETS/
│   ├── Competition_Banners/
│   ├── Logos/
│   ├── Reference_Images/
│   ├── Reference_Videos/
│   └── Learning_Resources/
├── 04_PUBLIC_GALLERY/
│   ├── Drone_Cinematography/
│   ├── Video_Shooting/
│   ├── Photography/
│   ├── Photoshop/
│   ├── Illustrator/
│   ├── Premiere_Pro/
│   ├── Makeup/
│   ├── Clay_Modelling/
│   └── Team_Projects/
└── 05_BACKUPS/
    ├── Database_Backups/
    ├── Configuration_Backups/
    └── Reports_Backups/
```

---

### 5. INITIAL DEPLOYMENT STEP-BY-STEP

1. **Open Google Apps Script Editor**:
   - Go to [script.google.com](https://script.google.com) or from the target Spreadsheet: **Extensions > Apps Script**.
2. **Paste Code**:
   - Copy contents of `Code.gs` into `Code.gs`.
   - Copy contents of `Index.html` into `Index.html`.
   - Copy contents of `appsscript.json` (view Manifest file in settings).
3. **Run Initializer**:
   - Select function `initializeDFMKorbaArena` in the Apps Script function dropdown.
   - Click **Run**.
   - Review and accept Google Workspace authorization permissions (Spreadsheets, Drive).
   - Execution log will display the complete deployment summary.
4. **Deploy as Web App**:
   - Click **Deploy > New deployment**.
   - Select type: **Web app**.
   - Description: `DFM Korba Arena Production v1.0.0`.
   - Execute as: **Me** (`USER_DEPLOYING`).
   - Who has access: **Anyone** (allows public contenders and judges to interact).
   - Click **Deploy** and save your Web App URL.

---

### 6. LOCAL PREVIEW / TESTING

To test the application interface and mock workflows locally on Windows:
```powershell
powershell -ExecutionPolicy Bypass -File server-listener.ps1
```
Open your browser at `http://127.0.0.1:18765/`.

---

### 7. ADMIN PANEL SUITE (13 DEDICATED SCREENS)

The application includes the comprehensive Admin Panel matching the official production design mockups:
1. **Admin Menu (Drawer)**: Full side drawer with admin profile badge, quick navigation across all sections, and active route indicators.
2. **Admin Dashboard**: Overview stats (5 Teams, 30 Students, 12 Challenges, 118 Submissions), live competition area chart, pending reviews tracker, storage consumption (14.8 GB), and quick action buttons.
3. **Teams Management**: Roster overview for all 5 teams (`Sky Hawks`, `Drone Force`, `Air Vision`, `Sky Riders`, `Pixel Wings`), score caches, rank, active status pills, and "+ Add Team" action.
4. **Add / Edit Team**: Team emblem upload/preview, team color picker, team description, and 6 member assignments with student roles.
5. **Students Management**: Searchable directory of all 30 students with student ID, team badge, status pills, and "+ Add Student" modal.
6. **Add / Edit Student**: Contender photo upload, Student ID, Login username, Team assignment, private contact details, and Public Profile toggle.
7. **Challenges Management**: List of all competition challenges with banner image, category, max marks, status, and edit triggers.
8. **Add / Edit Challenge**: Challenge banner upload, title, category dropdown, detailed description, max marks, individual/team challenge type, start & deadline datepickers, and evaluation criteria.
9. **Submissions Review**: Filter tabs for `All (118)`, `Pending (18)`, and `Evaluated (100)` with live search and submission cards.
10. **Evaluate Submission**: Media video player with duration timestamp, student/team/challenge metadata, 4-tier rubric scoring (`Creativity`, `Technical Skill`, `Composition`, `Overall` totaling 100 points), feedback textarea, and save/revision actions.
11. **Score Management**: Individual, Team, and Ledger audit tabs, ranking list, and quick buttons for "Add Score", "Correct Score", and "Score History".
12. **Leader Rotation**: Daily captain rotation automation toggle, competition day progress tracker (Day X/6 for all 5 teams), pause rotation, and manual override modal.
13. **Public Content**: Works, Students, and Teams tabs with live toggle switches to publish or unpublish student works to the public gallery and Google Drive.
14. **Reports & Analytics**: Team performance bar comparison chart, 4 export tiles (Team Report, Student Report, Challenge Report, Submission Report), and "Download as PDF" print action.
15. **Database & Storage Settings**: Direct links, real-time connectivity check, and synchronization tools for the fixed Google Spreadsheet and Google Drive root folder.

---

### 8. STUDENT PANEL SUITE (14 DEDICATED SCREENS)

The student experience matches the official mobile design mockups with dedicated tab navigation:
1. **Student Dashboard**: Contender hero profile card (Rohan Verma, DFM001, Team Leader badge 👑, Sky Hawks), 3 stats (Score 520, Rank #2, Team Rank #1), Today's Challenge launcher card, and 4 quick actions (Submit Work, My Work, Scorecard, Team).
2. **Challenges List**: All competition challenges with filter tabs (`All`, `Active`, `Upcoming`, `Completed`), category badges, max marks, and countdown dates.
3. **Challenge Detail**: High-res banner, title, category, format (Individual/Team), max marks (100), full description, instructions, submission deadline (`11 Jan 2025, 5:00 PM`), and "Submit Your Work" button.
4. **Submit Work**: Challenge header card, title and description form, file upload box with file size and media removal (`Temple_Orbit.mp4`, 248 MB), thumbnail upload, chunked upload progress bar, and submit trigger saving directly into Google Drive (`02_STUDENTS/STU_001_Rohan_Verma/Challenge_Submissions/`).
5. **My Submissions**: Filter tabs (`All`, `Under Review`, `Evaluated`), submission cards with video thumbnail, category tag, review status pills, and marks breakdown (e.g., 92/100, 45/50).
6. **Scorecard / My Scores**: Metric cards (520 Pts, Rank #2, Team Rank #1), Challenge-wise & Category-wise switchers, score ledger breakdown table with max marks and scores, and "View Feedback" modal.
7. **My Team**: Team banner for Sky Hawks 🦅 (Rank #1, 2,450 Pts), team squad photo, members count (6), team leader, progress indicator (82%), and action buttons (View Members, Team Work Gallery, Team Scorecard).
8. **Team Members**: 6 contender cards grid with avatars, names, roles, and leader crowns (`Rohan Verma`, `Priya Sahu`, `Aman Singh`, `Neha Patel`, `Vivek Jha`, `Anjali Roy`).
9. **Leaderboards**: Team and Student switcher tabs, top 5 ranked teams with icons and medals, and individual student standings.
10. **Portfolio / My Work Gallery**: Filterable 2-column media grid (`All`, `Video`, `Photo`, `Design`, `Other`) with video play icons, duration timestamps (`00:52`, `01:14`), Photoshop badges, and lightbox preview.
11. **Achievements**: Trophy celebration banner, 6 earned achievement medals (`Top Performer`, `Team Leader`, `Best Edit`, `Creative Work`, `On-Time Submission`, `Team Player`).
12. **Notifications**: Filterable alerts (`All`, `Challenge`, `Score`, `Team`) with timestamped announcements for new challenges, released scores, leader rotation, and review confirmations.
13. **My Profile**: Contender profile card with photo, ID, team, joined date, edit profile trigger, and quick navigation menu.
14. **Settings**: Language switcher (`English` / `Hindi`), App Theme (`Light`), notification preferences, Help & Support contacts, About info, and red "Logout" button.

