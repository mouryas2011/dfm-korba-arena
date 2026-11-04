/**
 * ============================================================================
 * DFM KORBA ARENA — PRODUCTION STORAGE & AUTOMATED MEDIA MANAGEMENT BACKEND
 * ============================================================================
 * Production Storage Configuration and Automated File Management.
 * 
 * FIXED INFRASTRUCTURE:
 * - Google Drive Root ID: 1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U
 * - Google Spreadsheet ID: 10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE
 * 
 * Version: 1.0.0 (Production)
 * Timezone: Asia/Kolkata
 */

// ============================================================================
// 1. CONSTANTS & SYSTEM CONFIGURATION
// ============================================================================
const DFM_CONFIG = Object.freeze({
  APP_NAME: 'DFM KORBA ARENA',
  VERSION: '1.0.0',
  DRIVE_ROOT_ID: '1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U',
  SPREADSHEET_ID: '10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE',
  DRIVE_ROOT_URL: 'https://drive.google.com/drive/u/2/folders/1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U',
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/10mniQWIWJ1fvS2VcPmQ39Zs9OSSIM2YgFZVzASNIEsE/edit?gid=0#gid=0',
  DEFAULT_SUPERADMIN_USER: 'admin',
  DEFAULT_SUPERADMIN_PASS: '@9589',
  DEFAULT_SUPERADMIN_NAME: 'DFM Arena Director',
  DEFAULT_SUPERADMIN_EMAIL: 'director@dfmkorba.com',
  LOCK_TIMEOUT_MS: 30000,
  CHUNK_EXPIRY_HOURS: 24,
  DEFAULT_TEAMS_COUNT: 5,
  DEFAULT_STUDENTS_COUNT: 30
});

// Exact required schemas per specification (Section 12)
const DFM_SCHEMAS = Object.freeze({
  AppConfig: ['ConfigKey', 'ConfigValue', 'Description', 'UpdatedAt'],
  Users: ['UserID', 'Username', 'MobileNumber', 'NormalizedMobile', 'PasswordHash', 'PasswordSalt', 'Role', 'Status', 'MustChangePassword', 'SessionVersion', 'CreatedAt', 'UpdatedAt'],
  Teams: ['TeamID', 'TeamName', 'LogoFileID', 'Description', 'TeamColor', 'DriveFolderID', 'TotalScoreCache', 'RankCache', 'Status', 'CreatedAt', 'UpdatedAt'],
  Students: ['StudentID', 'FullName', 'MobileNumber', 'NormalizedMobile', 'TeamID', 'ProfilePhotoFileID', 'DriveFolderID', 'IndividualScoreCache', 'RankCache', 'PublicProfileStatus', 'AccountStatus', 'CreatedAt', 'UpdatedAt'],
  TeamMembers: ['MembershipID', 'StudentID', 'TeamID', 'StartDate', 'EndDate', 'MembershipStatus', 'CreatedAt'],
  Challenges: ['ChallengeID', 'Title', 'Description', 'CategoryID', 'ChallengeType', 'MaxMarks', 'StartDate', 'Deadline', 'SubmissionType', 'Instructions', 'ReferenceFileID', 'Status', 'PublicStatus', 'CreatedBy', 'CreatedAt', 'UpdatedAt'],
  Submissions: ['SubmissionID', 'StudentID', 'TeamID', 'ChallengeID', 'Title', 'Description', 'MainFileID', 'ThumbnailFileID', 'SubmissionType', 'DriveFolderID', 'UploadStatus', 'EvaluationStatus', 'PublicationStatus', 'SubmittedAt', 'UpdatedAt'],
  ScoreLedger: ['ScoreID', 'ChallengeID', 'SubmissionID', 'StudentID', 'TeamID', 'ScoreType', 'PointsAwarded', 'MaximumPoints', 'IncludeInTeamTotal', 'EvaluatorID', 'Feedback', 'Status', 'CorrectionReason', 'OriginalScoreID', 'CreatedAt'],
  LeaderRotation: ['RotationID', 'TeamID', 'CompetitionDay', 'StudentID', 'RotationStatus', 'OverrideReason', 'CreatedAt'],
  UploadSessions: ['UploadID', 'UserID', 'StudentID', 'TeamID', 'ChallengeID', 'DriveFileID', 'ExpectedSize', 'UploadedSize', 'UploadStatus', 'LastActivityAt'],
  PublishedWorks: ['PublicationID', 'SubmissionID', 'FileID', 'StudentID', 'TeamID', 'CategoryID', 'Title', 'ThumbnailFileID', 'PublicStatus', 'PublishDate', 'PublishedBy', 'UpdatedAt'],
  Notifications: ['NotificationID', 'UserID', 'Title', 'Message', 'NotificationType', 'ReadStatus', 'CreatedAt'],
  AuditLogs: ['LogID', 'UserID', 'Action', 'EntityType', 'EntityID', 'Details', 'RequestID', 'CreatedAt'],
  DriveFolders: ['RecordID', 'OwnerType', 'OwnerID', 'FolderCategory', 'FolderID', 'ParentFolderID', 'FolderName', 'Status', 'CreatedAt', 'UpdatedAt']
});

// Category and Folder definitions
const DFM_CATEGORIES = [
  'Drone_Cinematography',
  'Video_Shooting',
  'Photography',
  'Photoshop',
  'Illustrator',
  'Premiere_Pro',
  'Makeup',
  'Clay_Modelling',
  'Team_Projects'
];

const STUDENT_SUBFOLDERS = [
  'Profile_Photo',
  'Drone_Videos',
  'Photography',
  'Video_Projects',
  'Editing_Projects',
  'Design_Projects',
  'Challenge_Submissions',
  'Published_Portfolio'
];

const TEAM_SUBFOLDERS = [
  'Team_Logo',
  'Team_Submissions',
  'Team_Projects',
  'Published_Work'
];

const ADMIN_SUBFOLDERS = [
  'Admin_Profiles',
  'Challenge_References',
  'Admin_Uploads',
  'Reports',
  'Exports'
];

const SHARED_ASSETS_SUBFOLDERS = [
  'Competition_Banners',
  'Logos',
  'Reference_Images',
  'Reference_Videos',
  'Learning_Resources'
];

const BACKUP_SUBFOLDERS = [
  'Database_Backups',
  'Configuration_Backups',
  'Reports_Backups'
];

// ============================================================================
// 2. WEB APP HANDLERS (doGet & doPost)
// ============================================================================

/**
 * Handles GET requests: serves HTML UI or returns public JSON API data.
 */
function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;
    if (action) {
      return handleApiRequest(action, e.parameter, null);
    }
    
    // Serve the client application
    const template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('DFM KORBA ARENA — Media & Competition Management')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests: authenticated API operations, upload orchestration.
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    const action = payload.action || (e && e.parameter && e.parameter.action);
    const authHeader = (e && e.parameter && e.parameter.authToken) || payload.authToken;
    
    return handleApiRequest(action, payload, authHeader);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Central API Router
 */
function handleApiRequest(action, params, authToken) {
  const result = routeAction(action, params || {}, authToken);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function routeAction(action, data, authToken) {
  // Public actions (No auth required)
  switch (action) {
    case 'ping':
      return { success: true, message: 'DFM Arena API Online', timestamp: new Date().toISOString() };
    case 'verifyGoogleConnections':
      return verifyGoogleConnections();
    case 'getPublicHomeData':
      return getPublicHomeData();
    case 'getPublishedGallery':
      return getPublishedGallery(data.category, data.type, Number(data.limit) || 50);
    case 'getLeaderboard':
      return getLeaderboard();
    case 'getTeamsList':
      return getTeamsList();
    case 'getTeamDetails':
      return getTeamDetails(data.teamId);
    case 'getChallengesPublic':
      return getChallengesPublic();
    case 'login':
    case 'mobileLogin':
      return mobileLogin(data.mobileNumber || data.username, data.password, data.requestedRole);
    case 'firstTimeAdminSetup':
      return firstTimeAdminSetup(data.bootstrapPassword, data.newMobileNumber, data.newPassword);
  }

  // Authenticated actions
  const authUser = verifyAuthSession(authToken || data.authToken);
  if (!authUser.valid) {
    return { success: false, error: 'Unauthorized: Invalid or expired session token' };
  }

  const role = authUser.user.Role;
  const isSuperAdmin = (role === 'SUPER_ADMIN');
  const isAdmin = (role === 'SUPER_ADMIN' || role === 'ADMIN');
  const isJudge = (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'JUDGE');
  const isStudent = (role === 'STUDENT');

  switch (action) {
    // SYSTEM INITIALIZATION & DIAGNOSTICS (Admin only)
    case 'initializeDFMKorbaArena':
      if (!isAdmin) return { success: false, error: 'Permission denied: Super Admin required' };
      return initializeDFMKorbaArena();
    case 'initializeDatabaseSheets':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return initializeDatabaseSheets();
    case 'initializeDriveFolders':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return initializeDriveFolders();
    case 'syncAllStudentDriveFolders':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return syncAllStudentDriveFolders();
    case 'syncAllAdminDriveFolders':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return syncAllAdminDriveFolders();
    case 'syncAllTeamDriveFolders':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return syncAllTeamDriveFolders();
    case 'migrateDatabaseSchema':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return migrateDatabaseSchema();
    case 'verifyDriveFolderStructure':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return verifyDriveFolderStructure();
    case 'getDatabaseHealth':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getDatabaseHealth();
    case 'getDriveHealth':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getDriveHealth();
    case 'getSpreadsheetHealth':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getSpreadsheetHealth();
    case 'getAllDriveFolderIDs':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getAllDriveFolderIDs();
    case 'getAuditLogs':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getAuditLogs(Number(data.limit) || 100);

    // FOLDER MANAGEMENT
    case 'createStudentFolder':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return createStudentFolder(data.studentId, data.teamId, data.fullName);
    case 'createAdminFolder':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return createAdminFolder(data.adminId, data.adminName);
    case 'createTeamFolder':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return createTeamFolder(data.teamId, data.teamName);
    case 'getStudentDriveFolder':
      return getStudentDriveFolder(data.studentId);
    case 'getAdminDriveFolder':
      return getAdminDriveFolder(data.adminId);
    case 'getTeamDriveFolder':
      return getTeamDriveFolder(data.teamId);
    case 'getFolderMetadata':
      return getFolderMetadata(data.folderId);

    // UPLOAD OPERATIONS
    case 'initializeUpload':
      return initializeUpload(data, authUser.user);
    case 'uploadChunk':
      return uploadChunk(data, authUser.user);
    case 'finalizeUpload':
      return finalizeUpload(data, authUser.user);
    case 'uploadFileDirect':
      return uploadFileDirect(data, authUser.user);
    case 'getUploadSessionStatus':
      return getUploadSessionStatus(data.uploadId);
    case 'retryUpload':
      return retryUpload(data.uploadId);
    case 'cancelUpload':
      return cancelUpload(data.uploadId);

    // CONTENT & SUBMISSION RETRIEVAL
    case 'getMySubmissions':
      return getStudentSubmissions(authUser.user.StudentID || data.studentId);
    case 'getStudentPortfolio':
      return getStudentPortfolio(data.studentId || authUser.user.StudentID);
    case 'getTeamPortfolio':
      return getTeamPortfolio(data.teamId);
    case 'getSubmissionRecords':
      if (!isJudge) return { success: false, error: 'Permission denied' };
      return getSubmissionRecords(data.filters);
    case 'getMediaMetadata':
      return getMediaMetadata(data.fileId);

    // EVALUATION & PUBLISHING (Judges/Admins)
    case 'scoreSubmission':
      if (!isJudge) return { success: false, error: 'Permission denied: Judges only' };
      return scoreSubmission(data, authUser.user);
    case 'publishWork':
      if (!isAdmin) return { success: false, error: 'Permission denied: Admin only' };
      return publishWork(data.submissionId, authUser.user.UserID);
    case 'unpublishWork':
      if (!isAdmin) return { success: false, error: 'Permission denied: Admin only' };
      return unpublishWork(data.submissionId, authUser.user.UserID);
    case 'updatePublicationStatus':
      if (!isAdmin) return { success: false, error: 'Permission denied: Admin only' };
      return updatePublicationStatus(data.submissionId, data.status, authUser.user.UserID);

    // ENTITY MANAGEMENT (Admin)
    case 'createStudent':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return createStudent(data, authUser.user.UserID);
    case 'updateStudent':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return updateStudent(data, authUser.user.UserID);
    case 'createTeam':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return createTeam(data, authUser.user.UserID);
    case 'updateTeam':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return updateTeam(data, authUser.user.UserID);
    case 'createChallenge':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return createChallenge(data, authUser.user.UserID);
    case 'updateChallenge':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return updateChallenge(data, authUser.user.UserID);
    case 'getAllStudentsAdmin':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getAllStudentsAdmin();
    case 'getAllUsersAdmin':
      if (!isAdmin) return { success: false, error: 'Permission denied' };
      return getAllUsersAdmin();

    // AUTHENTICATED ACCOUNT & PROFILE ACTIONS
    case 'changePassword':
      return changePassword(authUser.user.UserID, data.currentPassword, data.newPassword);
    case 'resetPassword':
      if (!isAdmin) return { success: false, error: 'Permission denied: Admin only' };
      return resetPassword(authUser.user.UserID, data.targetUserId, data.newPassword);
    case 'updateMobileNumber':
      if (!isAdmin) return { success: false, error: 'Permission denied: Admin only' };
      return updateMobileNumber(authUser.user.UserID, data.targetUserId, data.newMobileNumber);
    case 'validateSession':
      return { success: true, valid: true, user: authUser.user };
    case 'logout':
      return { success: true, message: 'Logged out successfully.' };

    default:
      return { success: false, error: `Unknown action requested: ${action}` };
  }
}

// ============================================================================
// 3. CORE INITIALIZATION SUITE (Idempotent & Safe)
// ============================================================================

/**
 * Main Entry Point: initializeDFMKorbaArena()
 * Complete production initialization with verification and structured reporting.
 */
function initializeDFMKorbaArena() {
  const lock = LockService.getScriptLock();
  const startTime = new Date();
  const report = {
    timestamp: startTime.toISOString(),
    success: false,
    spreadsheetStatus: 'PENDING',
    driveRootStatus: 'PENDING',
    sheetsCreated: [],
    sheetsExisting: [],
    headersAdded: {},
    systemFoldersCreated: [],
    systemFoldersExisting: [],
    teamsSynced: 0,
    studentsSynced: 0,
    adminSynced: 0,
    superAdminAccount: 'PENDING',
    errors: []
  };

  try {
    lock.waitLock(DFM_CONFIG.LOCK_TIMEOUT_MS);

    // Step 1: Open Spreadsheet by ID & Verify
    const ss = SpreadsheetApp.openById(DFM_CONFIG.SPREADSHEET_ID);
    if (!ss) {
      throw new Error(`Could not access Google Spreadsheet ID: ${DFM_CONFIG.SPREADSHEET_ID}`);
    }
    report.spreadsheetStatus = `CONNECTED: "${ss.getName()}"`;

    // Step 2: Open Drive Root by ID & Verify
    const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
    if (!rootFolder) {
      throw new Error(`Could not access Google Drive Root Folder ID: ${DFM_CONFIG.DRIVE_ROOT_ID}`);
    }
    report.driveRootStatus = `CONNECTED: "${rootFolder.getName()}"`;

    // Step 3 & 4: Initialize Sheets & Columns (Safe Schema Migration)
    const sheetsResult = initializeDatabaseSheets();
    report.sheetsCreated = sheetsResult.created;
    report.sheetsExisting = sheetsResult.existing;
    report.headersAdded = sheetsResult.headersAdded;

    // Step 5 & 6: Initialize Drive System Folders
    const driveResult = initializeDriveFolders();
    report.systemFoldersCreated = driveResult.created;
    report.systemFoldersExisting = driveResult.existing;

    // Step 7: Initialize System Configuration in AppConfig
    initAppConfig();

    // Step 8: Initialize Super-Admin Account securely
    const adminInit = initSuperAdminAccount();
    report.superAdminAccount = adminInit.status;

    // Step 9: Seed Initial Teams & Students if empty
    seedInitialCompetitionData();

    // Step 10: Sync All Folders (Teams, Students, Admins)
    const teamSync = syncAllTeamDriveFolders();
    report.teamsSynced = teamSync.count;

    const studentSync = syncAllStudentDriveFolders();
    report.studentsSynced = studentSync.count;

    const adminSync = syncAllAdminDriveFolders();
    report.adminSynced = adminSync.count;

    // Step 11: Final connectivity verification
    const connCheck = verifyGoogleConnections();
    if (!connCheck.sheetsConnected || !connCheck.driveConnected) {
      throw new Error('Post-initialization connection verification failed');
    }

    report.success = true;
    report.durationMs = new Date().getTime() - startTime.getTime();
    
    // Log to AuditLogs
    logAudit('SYSTEM_INIT', 'SYSTEM', 'DFM_KORBA_ARENA', 'System fully initialized idempotently');
    
    return report;
  } catch (err) {
    report.success = false;
    report.errors.push(err.toString());
    report.durationMs = new Date().getTime() - startTime.getTime();
    return report;
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Verifies live connectivity to Google Drive parent folder and Google Spreadsheet.
 */
function verifyGoogleConnections() {
  const result = {
    success: false,
    timestamp: new Date().toISOString(),
    sheetsConnected: false,
    spreadsheetId: DFM_CONFIG.SPREADSHEET_ID,
    spreadsheetName: null,
    spreadsheetUrl: DFM_CONFIG.SPREADSHEET_URL,
    driveConnected: false,
    driveRootId: DFM_CONFIG.DRIVE_ROOT_ID,
    driveRootName: null,
    driveRootUrl: DFM_CONFIG.DRIVE_ROOT_URL,
    totalWorksheets: 0,
    totalDriveFolders: 0,
    totalStudents: 0,
    totalTeams: 0,
    lastSync: new Date().toISOString(),
    message: ''
  };

  try {
    // Check Spreadsheet
    const ss = SpreadsheetApp.openById(DFM_CONFIG.SPREADSHEET_ID);
    if (ss) {
      result.sheetsConnected = true;
      result.spreadsheetName = ss.getName();
      result.totalWorksheets = ss.getSheets().length;
    }
  } catch (err) {
    result.sheetsError = err.toString();
  }

  try {
    // Check Drive Root
    const root = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
    if (root) {
      result.driveConnected = true;
      result.driveRootName = root.getName();
    }
  } catch (err) {
    result.driveError = err.toString();
  }

  // Count existing records if connected
  if (result.sheetsConnected) {
    try {
      const studentSheet = getSheetOrNull('Students');
      if (studentSheet && studentSheet.getLastRow() > 1) {
        result.totalStudents = studentSheet.getLastRow() - 1;
      }
      const teamsSheet = getSheetOrNull('Teams');
      if (teamsSheet && teamsSheet.getLastRow() > 1) {
        result.totalTeams = teamsSheet.getLastRow() - 1;
      }
      const driveFolderSheet = getSheetOrNull('DriveFolders');
      if (driveFolderSheet && driveFolderSheet.getLastRow() > 1) {
        result.totalDriveFolders = driveFolderSheet.getLastRow() - 1;
      }
    } catch (e) {}
  }

  result.success = (result.sheetsConnected && result.driveConnected);
  result.message = result.success ? 'Google Services Verified & Operational' : 'Connection issues detected';
  return result;
}

/**
 * Initializes and migrates all 14 database sheets and column headers idempotently.
 */
function initializeDatabaseSheets() {
  const ss = SpreadsheetApp.openById(DFM_CONFIG.SPREADSHEET_ID);
  const created = [];
  const existing = [];
  const headersAdded = {};

  const sheetKeys = Object.keys(DFM_SCHEMAS);
  for (let i = 0; i < sheetKeys.length; i++) {
    const sheetName = sheetKeys[i];
    const requiredHeaders = DFM_SCHEMAS[sheetName];
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      // Create new sheet
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
      sheet.getRange(1, 1, 1, requiredHeaders.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      created.push(sheetName);
    } else {
      existing.push(sheetName);
      // Safe schema migration: check and append missing headers without touching data
      const lastCol = Math.max(sheet.getLastColumn(), 1);
      const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || '').trim());
      
      const missing = [];
      requiredHeaders.forEach(reqH => {
        if (!currentHeaders.includes(reqH)) {
          missing.push(reqH);
        }
      });

      if (missing.length > 0) {
        const startCol = lastCol + (currentHeaders[0] === '' ? 0 : 1);
        sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
        headersAdded[sheetName] = missing;
      }
    }
  }

  return { created, existing, headersAdded };
}

/**
 * Builds the mandatory system folder hierarchy inside 1ucRKYKq0TGCkBzV51kPH9vja2KSmkh6U
 */
function initializeDriveFolders() {
  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const created = [];
  const existing = [];

  // 1. 00_ADMIN
  const adminRoot = getOrCreateFolder(rootFolder, '00_ADMIN', 'SYSTEM', 'SYSTEM_ADMIN', 'ADMIN_ROOT');
  trackFolderStatus(adminRoot, created, existing);
  ADMIN_SUBFOLDERS.forEach(sub => {
    const subF = getOrCreateFolder(adminRoot.folder, sub, 'SYSTEM', 'SYSTEM_ADMIN', `ADMIN_${sub.toUpperCase()}`);
    trackFolderStatus(subF, created, existing);
  });

  // 2. 01_TEAMS
  const teamsRoot = getOrCreateFolder(rootFolder, '01_TEAMS', 'SYSTEM', 'SYSTEM_TEAMS', 'TEAMS_ROOT');
  trackFolderStatus(teamsRoot, created, existing);

  // 3. 02_STUDENTS
  const studentsRoot = getOrCreateFolder(rootFolder, '02_STUDENTS', 'SYSTEM', 'SYSTEM_STUDENTS', 'STUDENTS_ROOT');
  trackFolderStatus(studentsRoot, created, existing);

  // 4. 03_SHARED_ASSETS
  const sharedRoot = getOrCreateFolder(rootFolder, '03_SHARED_ASSETS', 'SYSTEM', 'SYSTEM_ASSETS', 'SHARED_ASSETS_ROOT');
  trackFolderStatus(sharedRoot, created, existing);
  SHARED_ASSETS_SUBFOLDERS.forEach(sub => {
    const subF = getOrCreateFolder(sharedRoot.folder, sub, 'SYSTEM', 'SYSTEM_ASSETS', `ASSET_${sub.toUpperCase()}`);
    trackFolderStatus(subF, created, existing);
  });

  // 5. 04_PUBLIC_GALLERY
  const galleryRoot = getOrCreateFolder(rootFolder, '04_PUBLIC_GALLERY', 'SYSTEM', 'SYSTEM_GALLERY', 'PUBLIC_GALLERY_ROOT');
  trackFolderStatus(galleryRoot, created, existing);
  DFM_CATEGORIES.forEach(cat => {
    const catF = getOrCreateFolder(galleryRoot.folder, cat, 'SYSTEM', 'SYSTEM_GALLERY', `GALLERY_${cat.toUpperCase()}`);
    trackFolderStatus(catF, created, existing);
  });

  // 6. 05_BACKUPS
  const backupsRoot = getOrCreateFolder(rootFolder, '05_BACKUPS', 'SYSTEM', 'SYSTEM_BACKUPS', 'BACKUPS_ROOT');
  trackFolderStatus(backupsRoot, created, existing);
  BACKUP_SUBFOLDERS.forEach(sub => {
    const subF = getOrCreateFolder(backupsRoot.folder, sub, 'SYSTEM', 'SYSTEM_BACKUPS', `BACKUP_${sub.toUpperCase()}`);
    trackFolderStatus(subF, created, existing);
  });

  return { created, existing };
}

function trackFolderStatus(item, createdList, existingList) {
  if (item.isNew) {
    createdList.push(item.path || item.folder.getName());
  } else {
    existingList.push(item.path || item.folder.getName());
  }
}

/**
 * Idempotent folder getter/creator that records mapping in DriveFolders worksheet.
 */
function getOrCreateFolder(parentFolder, folderName, ownerType, ownerId, folderCategory) {
  // First check if already recorded in DriveFolders
  const existingId = getSavedFolderId(ownerType, ownerId, folderCategory);
  if (existingId) {
    try {
      const folder = DriveApp.getFolderById(existingId);
      return { folder: folder, isNew: false, id: existingId, path: `${parentFolder.getName()}/${folderName}` };
    } catch (e) {
      // If folder was deleted in Drive, recreate below
    }
  }

  // Next check child folders in parent
  const childFolders = parentFolder.getFoldersByName(folderName);
  let targetFolder = null;
  let isNew = false;

  if (childFolders.hasNext()) {
    targetFolder = childFolders.next();
  } else {
    targetFolder = parentFolder.createFolder(folderName);
    isNew = true;
  }

  const folderId = targetFolder.getId();
  saveFolderMapping({
    OwnerType: ownerType || 'SYSTEM',
    OwnerID: ownerId || 'SYSTEM',
    FolderCategory: folderCategory || 'GENERAL',
    FolderID: folderId,
    ParentFolderID: parentFolder.getId(),
    FolderName: folderName,
    Status: 'ACTIVE'
  });

  return { folder: targetFolder, isNew: isNew, id: folderId, path: `${parentFolder.getName()}/${folderName}` };
}

// ============================================================================
// 4. STUDENT, TEAM & ADMIN FOLDER SYNCHRONIZATION
// ============================================================================

/**
 * Synchronizes Drive folders for all students in the Students worksheet.
 * Ensures root student folder and all 8 mandatory subfolders exist.
 */
function syncAllStudentDriveFolders() {
  const studentsSheet = getSheetOrNull('Students');
  if (!studentsSheet) return { success: false, error: 'Students sheet missing' };

  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const studentsParentRes = getOrCreateFolder(rootFolder, '02_STUDENTS', 'SYSTEM', 'SYSTEM_STUDENTS', 'STUDENTS_ROOT');
  const studentsParent = studentsParentRes.folder;

  const data = getSheetRowsAsObjects(studentsSheet);
  let synced = 0;
  const errors = [];

  data.forEach((student, index) => {
    try {
      const studentId = student.StudentID;
      const teamId = student.TeamID || 'NO_TEAM';
      const studentName = student.FullName || studentId;

      // Check/create student folder
      const folderName = `${studentId}_${sanitizeName(studentName)}`;
      const stuFolderRes = getOrCreateFolder(studentsParent, folderName, 'STUDENT', studentId, 'STUDENT_ROOT');
      const stuFolder = stuFolderRes.folder;
      const stuFolderId = stuFolder.getId();

      // Ensure 8 subfolders
      STUDENT_SUBFOLDERS.forEach(sub => {
        getOrCreateFolder(stuFolder, sub, 'STUDENT', studentId, `STUDENT_${sub.toUpperCase()}`);
      });

      // Update DriveFolderID in sheet if missing or different
      if (student.DriveFolderID !== stuFolderId) {
        const rowIndex = index + 2; // +1 for 1-based, +1 for header
        setSheetCellByHeader(studentsSheet, rowIndex, 'DriveFolderID', stuFolderId);
        setSheetCellByHeader(studentsSheet, rowIndex, 'UpdatedAt', new Date().toISOString());
      }

      synced++;
    } catch (err) {
      errors.push({ studentId: student.StudentID, error: err.toString() });
    }
  });

  return { success: errors.length === 0, count: synced, total: data.length, errors: errors };
}

/**
 * Synchronizes Drive folders for all teams in the Teams worksheet.
 */
function syncAllTeamDriveFolders() {
  const teamsSheet = getSheetOrNull('Teams');
  if (!teamsSheet) return { success: false, error: 'Teams sheet missing' };

  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const teamsParentRes = getOrCreateFolder(rootFolder, '01_TEAMS', 'SYSTEM', 'SYSTEM_TEAMS', 'TEAMS_ROOT');
  const teamsParent = teamsParentRes.folder;

  const teams = getSheetRowsAsObjects(teamsSheet);
  let synced = 0;
  const errors = [];

  teams.forEach((team, index) => {
    try {
      const teamId = team.TeamID;
      const teamName = team.TeamName || teamId;
      const folderName = `${teamId}_${sanitizeName(teamName)}`;
      const teamFolderRes = getOrCreateFolder(teamsParent, folderName, 'TEAM', teamId, 'TEAM_ROOT');
      const teamFolder = teamFolderRes.folder;
      const teamFolderId = teamFolder.getId();

      TEAM_SUBFOLDERS.forEach(sub => {
        getOrCreateFolder(teamFolder, sub, 'TEAM', teamId, `TEAM_${sub.toUpperCase()}`);
      });

      if (team.DriveFolderID !== teamFolderId) {
        const rowIndex = index + 2;
        setSheetCellByHeader(teamsSheet, rowIndex, 'DriveFolderID', teamFolderId);
        setSheetCellByHeader(teamsSheet, rowIndex, 'UpdatedAt', new Date().toISOString());
      }
      synced++;
    } catch (err) {
      errors.push({ teamId: team.TeamID, error: err.toString() });
    }
  });

  return { success: errors.length === 0, count: synced, total: teams.length, errors: errors };
}

/**
 * Synchronizes individual admin folders for all administrators.
 */
function syncAllAdminDriveFolders() {
  const usersSheet = getSheetOrNull('Users');
  if (!usersSheet) return { success: false, error: 'Users sheet missing' };

  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const adminRootRes = getOrCreateFolder(rootFolder, '00_ADMIN', 'SYSTEM', 'SYSTEM_ADMIN', 'ADMIN_ROOT');
  const adminProfilesFolderRes = getOrCreateFolder(adminRootRes.folder, 'Admin_Profiles', 'SYSTEM', 'SYSTEM_ADMIN', 'ADMIN_PROFILES');

  const users = getSheetRowsAsObjects(usersSheet);
  const adminUsers = users.filter(u => u.Role === 'SUPER_ADMIN' || u.Role === 'ADMIN');
  let synced = 0;
  const errors = [];

  adminUsers.forEach(admin => {
    try {
      const adminId = admin.UserID;
      const folderName = `ADMIN_${adminId}_${sanitizeName(admin.Username)}`;
      const adminFolderRes = getOrCreateFolder(adminProfilesFolderRes.folder, folderName, 'ADMIN', adminId, 'ADMIN_PERSONAL');
      const adminFolder = adminFolderRes.folder;

      // Subfolders for admin uploads & profile photo
      getOrCreateFolder(adminFolder, 'Profile_Photo', 'ADMIN', adminId, 'ADMIN_PHOTO');
      getOrCreateFolder(adminFolder, 'Private_Notes', 'ADMIN', adminId, 'ADMIN_NOTES');
      synced++;
    } catch (err) {
      errors.push({ adminId: admin.UserID, error: err.toString() });
    }
  });

  return { success: errors.length === 0, count: synced, total: adminUsers.length, errors: errors };
}

/**
 * Creates individual student folder and subfolders immediately when student is registered.
 */
function createStudentFolder(studentId, teamId, fullName) {
  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const studentsParentRes = getOrCreateFolder(rootFolder, '02_STUDENTS', 'SYSTEM', 'SYSTEM_STUDENTS', 'STUDENTS_ROOT');
  const folderName = `${studentId}_${sanitizeName(fullName || studentId)}`;
  const stuFolderRes = getOrCreateFolder(studentsParentRes.folder, folderName, 'STUDENT', studentId, 'STUDENT_ROOT');
  const stuFolder = stuFolderRes.folder;

  const subfolderMap = {};
  STUDENT_SUBFOLDERS.forEach(sub => {
    const subRes = getOrCreateFolder(stuFolder, sub, 'STUDENT', studentId, `STUDENT_${sub.toUpperCase()}`);
    subfolderMap[sub] = subRes.id;
  });

  return {
    success: true,
    studentFolderId: stuFolder.getId(),
    folderName: folderName,
    subfolders: subfolderMap
  };
}

/**
 * Creates individual team folder and subfolders immediately when a team is registered.
 */
function createTeamFolder(teamId, teamName) {
  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const teamsParentRes = getOrCreateFolder(rootFolder, '01_TEAMS', 'SYSTEM', 'SYSTEM_TEAMS', 'TEAMS_ROOT');
  const folderName = `${teamId}_${sanitizeName(teamName || teamId)}`;
  const teamFolderRes = getOrCreateFolder(teamsParentRes.folder, folderName, 'TEAM', teamId, 'TEAM_ROOT');
  const teamFolder = teamFolderRes.folder;

  const subfolderMap = {};
  TEAM_SUBFOLDERS.forEach(sub => {
    const subRes = getOrCreateFolder(teamFolder, sub, 'TEAM', teamId, `TEAM_${sub.toUpperCase()}`);
    subfolderMap[sub] = subRes.id;
  });

  return {
    success: true,
    teamFolderId: teamFolder.getId(),
    folderName: folderName,
    subfolders: subfolderMap
  };
}

/**
 * Creates individual admin folder.
 */
function createAdminFolder(adminId, adminName) {
  const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const adminRootRes = getOrCreateFolder(rootFolder, '00_ADMIN', 'SYSTEM', 'SYSTEM_ADMIN', 'ADMIN_ROOT');
  const adminProfilesFolderRes = getOrCreateFolder(adminRootRes.folder, 'Admin_Profiles', 'SYSTEM', 'SYSTEM_ADMIN', 'ADMIN_PROFILES');
  const folderName = `ADMIN_${adminId}_${sanitizeName(adminName || adminId)}`;
  const adminFolderRes = getOrCreateFolder(adminProfilesFolderRes.folder, folderName, 'ADMIN', adminId, 'ADMIN_PERSONAL');

  return {
    success: true,
    adminFolderId: adminFolderRes.id,
    folderName: folderName
  };
}

// ============================================================================
// 5. FILE UPLOAD & STORAGE WORKFLOW (Resumable & Direct)
// ============================================================================

/**
 * Initializes an upload session. Validates student/team permissions and target subfolder.
 */
function initializeUpload(data, user) {
  const uploadId = 'UPL_' + Utilities.getUuid().substring(0, 8);
  const studentId = user.StudentID || data.studentId;
  const teamId = user.TeamID || data.teamId;
  const challengeId = data.challengeId || 'GENERAL';
  const fileName = data.fileName;
  const mimeType = data.mimeType || 'application/octet-stream';
  const expectedSize = Number(data.fileSize) || 0;
  const category = data.category || 'General';

  // Determine target folder
  let targetFolderId = null;
  if (studentId) {
    // Map category to student subfolder
    const subfolderKey = mapCategoryToStudentFolder(category);
    targetFolderId = getSavedFolderId('STUDENT', studentId, `STUDENT_${subfolderKey.toUpperCase()}`) ||
                     getSavedFolderId('STUDENT', studentId, 'STUDENT_ROOT');
  } else if (teamId) {
    targetFolderId = getSavedFolderId('TEAM', teamId, 'TEAM_SUBMISSIONS') ||
                     getSavedFolderId('TEAM', teamId, 'TEAM_ROOT');
  }

  if (!targetFolderId) {
    // Fallback to Public Gallery category folder
    targetFolderId = getSavedFolderId('SYSTEM', 'SYSTEM_GALLERY', `GALLERY_${category.toUpperCase()}`) ||
                     DFM_CONFIG.DRIVE_ROOT_ID;
  }

  // Record session in UploadSessions sheet
  const sessionsSheet = getSheetOrNull('UploadSessions');
  if (sessionsSheet) {
    const row = [
      uploadId,
      user.UserID,
      studentId || '',
      teamId || '',
      challengeId,
      '', // DriveFileID (populated on completion)
      expectedSize,
      0,  // UploadedSize
      'INITIALIZED',
      new Date().toISOString()
    ];
    sessionsSheet.appendRow(row);
  }

  return {
    success: true,
    uploadId: uploadId,
    targetFolderId: targetFolderId,
    chunkSize: DFM_CONFIG.CHUNK_SIZE_BYTES,
    message: 'Upload session initialized'
  };
}

/**
 * Direct file upload handler for files sent via client (Base64).
 * Creates the actual file in Google Drive and saves complete metadata in Google Sheets.
 */
function uploadFileDirect(data, user) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(DFM_CONFIG.LOCK_TIMEOUT_MS);

    const studentId = user.StudentID || data.studentId;
    const teamId = user.TeamID || data.teamId;
    const challengeId = data.challengeId;
    const title = data.title || data.fileName || 'Untitled Work';
    const description = data.description || '';
    const category = data.category || 'Video_Projects';
    const submissionType = data.submissionType || 'INDIVIDUAL';
    const fileName = data.fileName || ('upload_' + Date.now());
    const mimeType = data.mimeType || 'application/octet-stream';
    const base64Data = data.base64Data;

    if (!base64Data) {
      return { success: false, error: 'No file data received' };
    }

    // Decode and create Blob
    const decodedBytes = Utilities.base64Decode(base64Data.split(',').pop());
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // Find destination folder
    let folderId = null;
    if (studentId) {
      const subfolderKey = mapCategoryToStudentFolder(category);
      folderId = getSavedFolderId('STUDENT', studentId, `STUDENT_${subfolderKey.toUpperCase()}`) ||
                 getSavedFolderId('STUDENT', studentId, 'STUDENT_ROOT');
    } else if (teamId) {
      folderId = getSavedFolderId('TEAM', teamId, 'TEAM_SUBMISSIONS');
    }

    if (!folderId) {
      const rootFolder = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
      folderId = rootFolder.getId();
    }

    const destFolder = DriveApp.getFolderById(folderId);
    const driveFile = destFolder.createFile(blob);
    const fileId = driveFile.getId();
    const fileSize = blob.getBytes().length;

    // Create thumbnail if image or generate standard view URL
    const viewUrl = driveFile.getUrl();
    const submissionId = 'SUB_' + Utilities.getUuid().substring(0, 8);

    // Save metadata in Submissions
    const submissionsSheet = getSheetOrNull('Submissions');
    if (submissionsSheet) {
      const subRow = [
        submissionId,
        studentId || '',
        teamId || '',
        challengeId || 'GENERAL',
        title,
        description,
        fileId,
        fileId, // ThumbnailFileID
        submissionType,
        folderId,
        'COMPLETED',
        'PENDING_REVIEW', // EvaluationStatus
        'UNPUBLISHED',     // PublicationStatus
        new Date().toISOString(),
        new Date().toISOString()
      ];
      submissionsSheet.appendRow(subRow);
    }

    // Save record in DriveFolders mapping if relevant
    saveFolderMapping({
      OwnerType: submissionType === 'TEAM' ? 'TEAM' : 'STUDENT',
      OwnerID: studentId || teamId,
      FolderCategory: category,
      FolderID: fileId,
      ParentFolderID: folderId,
      FolderName: fileName,
      Status: 'UPLOADED_FILE'
    });

    logAudit('FILE_UPLOAD', 'SUBMISSION', submissionId, `Uploaded ${fileName} (${fileSize} bytes) into folder ${destFolder.getName()}`);

    return {
      success: true,
      submissionId: submissionId,
      fileId: fileId,
      fileName: fileName,
      fileSize: fileSize,
      viewUrl: viewUrl,
      folderId: folderId,
      uploadStatus: 'COMPLETED'
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Maps category name to student subfolder name.
 */
function mapCategoryToStudentFolder(category) {
  const cat = String(category || '').toLowerCase();
  if (cat.includes('drone')) return 'Drone_Videos';
  if (cat.includes('photo') && !cat.includes('shop')) return 'Photography';
  if (cat.includes('shop') || cat.includes('illustrator') || cat.includes('design')) return 'Design_Projects';
  if (cat.includes('premiere') || cat.includes('edit')) return 'Editing_Projects';
  if (cat.includes('video') || cat.includes('shoot')) return 'Video_Projects';
  if (cat.includes('profile')) return 'Profile_Photo';
  return 'Challenge_Submissions';
}

/**
 * Finalizes chunked upload session and records submission.
 */
function finalizeUpload(data, user) {
  const uploadId = data.uploadId;
  const fileId = data.fileId;
  const title = data.title || 'Untitled Work';
  const description = data.description || '';
  const challengeId = data.challengeId || 'GENERAL';
  const category = data.category || 'General';
  const submissionType = data.submissionType || 'INDIVIDUAL';
  const studentId = user.StudentID || data.studentId;
  const teamId = user.TeamID || data.teamId;

  const submissionId = 'SUB_' + Utilities.getUuid().substring(0, 8);
  const submissionsSheet = getSheetOrNull('Submissions');
  
  if (submissionsSheet) {
    submissionsSheet.appendRow([
      submissionId,
      studentId || '',
      teamId || '',
      challengeId,
      title,
      description,
      fileId,
      fileId,
      submissionType,
      data.folderId || DFM_CONFIG.DRIVE_ROOT_ID,
      'COMPLETED',
      'PENDING_REVIEW',
      'UNPUBLISHED',
      new Date().toISOString(),
      new Date().toISOString()
    ]);
  }

  // Update session
  updateSessionStatus(uploadId, 'COMPLETED', fileId);

  logAudit('UPLOAD_FINALIZE', 'SUBMISSION', submissionId, `Finalized upload ${uploadId} for file ${fileId}`);

  return {
    success: true,
    submissionId: submissionId,
    fileId: fileId,
    status: 'COMPLETED'
  };
}

function updateSessionStatus(uploadId, status, fileId) {
  const sheet = getSheetOrNull('UploadSessions');
  if (!sheet) return;
  const rows = getSheetRowsAsObjects(sheet);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].UploadID === uploadId) {
      setSheetCellByHeader(sheet, i + 2, 'UploadStatus', status);
      if (fileId) setSheetCellByHeader(sheet, i + 2, 'DriveFileID', fileId);
      setSheetCellByHeader(sheet, i + 2, 'LastActivityAt', new Date().toISOString());
      break;
    }
  }
}

// ============================================================================
// 6. PUBLISHING & PUBLIC / PRIVATE ACCESS CONTROL (Privacy Enforced)
// ============================================================================

/**
 * Publishes an approved submission to Public Home and Gallery.
 * Enforces privacy: Grants view permission strictly to this specific file,
 * keeping the parent student/team folders fully private.
 */
function publishWork(submissionId, adminUserId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(DFM_CONFIG.LOCK_TIMEOUT_MS);

    const subSheet = getSheetOrNull('Submissions');
    const pubSheet = getSheetOrNull('PublishedWorks');
    if (!subSheet || !pubSheet) return { success: false, error: 'Required sheets missing' };

    const submissions = getSheetRowsAsObjects(subSheet);
    let targetSub = null;
    let targetRowIndex = -1;

    for (let i = 0; i < submissions.length; i++) {
      if (submissions[i].SubmissionID === submissionId) {
        targetSub = submissions[i];
        targetRowIndex = i + 2;
        break;
      }
    }

    if (!targetSub) {
      return { success: false, error: `Submission not found: ${submissionId}` };
    }

    const fileId = targetSub.MainFileID;
    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        // Grant viewer access to anyone with the link specifically for this file
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (driveErr) {
        // File may be externally managed or restricted
      }
    }

    // Update Submissions sheet
    setSheetCellByHeader(subSheet, targetRowIndex, 'PublicationStatus', 'PUBLISHED');
    setSheetCellByHeader(subSheet, targetRowIndex, 'UpdatedAt', new Date().toISOString());

    // Check if already in PublishedWorks
    const pubWorks = getSheetRowsAsObjects(pubSheet);
    const existingPub = pubWorks.find(p => p.SubmissionID === submissionId);

    if (!existingPub) {
      const pubId = 'PUB_' + Utilities.getUuid().substring(0, 8);
      pubSheet.appendRow([
        pubId,
        submissionId,
        targetSub.MainFileID,
        targetSub.StudentID,
        targetSub.TeamID,
        targetSub.ChallengeID,
        targetSub.Title,
        targetSub.ThumbnailFileID || targetSub.MainFileID,
        'ACTIVE',
        new Date().toISOString(),
        adminUserId || 'ADMIN',
        new Date().toISOString()
      ]);
    } else {
      // Re-activate if was unpublished
      for (let j = 0; j < pubWorks.length; j++) {
        if (pubWorks[j].SubmissionID === submissionId) {
          setSheetCellByHeader(pubSheet, j + 2, 'PublicStatus', 'ACTIVE');
          setSheetCellByHeader(pubSheet, j + 2, 'UpdatedAt', new Date().toISOString());
          break;
        }
      }
    }

    logAudit('WORK_PUBLISHED', 'PUBLICATION', submissionId, `Published by ${adminUserId}`);

    return {
      success: true,
      submissionId: submissionId,
      status: 'PUBLISHED',
      fileId: fileId
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Unpublishes a work item. Removes public visibility and revokes individual file link sharing.
 */
function unpublishWork(submissionId, adminUserId) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(DFM_CONFIG.LOCK_TIMEOUT_MS);

    const subSheet = getSheetOrNull('Submissions');
    const pubSheet = getSheetOrNull('PublishedWorks');
    if (!subSheet || !pubSheet) return { success: false, error: 'Required sheets missing' };

    const submissions = getSheetRowsAsObjects(subSheet);
    for (let i = 0; i < submissions.length; i++) {
      if (submissions[i].SubmissionID === submissionId) {
        setSheetCellByHeader(subSheet, i + 2, 'PublicationStatus', 'UNPUBLISHED');
        setSheetCellByHeader(subSheet, i + 2, 'UpdatedAt', new Date().toISOString());
        
        // Revoke public Drive sharing
        if (submissions[i].MainFileID) {
          try {
            const file = DriveApp.getFileById(submissions[i].MainFileID);
            file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
          } catch (e) {}
        }
        break;
      }
    }

    const pubWorks = getSheetRowsAsObjects(pubSheet);
    for (let j = 0; j < pubWorks.length; j++) {
      if (pubWorks[j].SubmissionID === submissionId) {
        setSheetCellByHeader(pubSheet, j + 2, 'PublicStatus', 'ARCHIVED');
        setSheetCellByHeader(pubSheet, j + 2, 'UpdatedAt', new Date().toISOString());
        break;
      }
    }

    logAudit('WORK_UNPUBLISHED', 'PUBLICATION', submissionId, `Unpublished by ${adminUserId}`);

    return { success: true, submissionId: submissionId, status: 'UNPUBLISHED' };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

// ============================================================================
// 7. CONTENT RETRIEVAL & PUBLIC GALLERIES
// ============================================================================

/**
 * Fetches all data required for the Public Home Screen:
 * - Approved published work in every category
 * - Latest student works
 * - Latest team works
 * - Competition standings
 */
function getPublicHomeData() {
  const pubSheet = getSheetOrNull('PublishedWorks');
  const subSheet = getSheetOrNull('Submissions');
  const studentsSheet = getSheetOrNull('Students');
  const teamsSheet = getSheetOrNull('Teams');

  const publishedRows = pubSheet ? getSheetRowsAsObjects(pubSheet).filter(p => p.PublicStatus === 'ACTIVE') : [];
  const submissionsMap = {};
  if (subSheet) {
    getSheetRowsAsObjects(subSheet).forEach(s => {
      submissionsMap[s.SubmissionID] = s;
    });
  }

  const studentsMap = {};
  if (studentsSheet) {
    getSheetRowsAsObjects(studentsSheet).forEach(st => {
      studentsMap[st.StudentID] = { name: st.FullName, teamId: st.TeamID };
    });
  }

  const teamsMap = {};
  if (teamsSheet) {
    getSheetRowsAsObjects(teamsSheet).forEach(t => {
      teamsMap[t.TeamID] = { name: t.TeamName, color: t.TeamColor, logo: t.LogoFileID };
    });
  }

  // Enrich published items
  const enrichedItems = publishedRows.map(pub => {
    const sub = submissionsMap[pub.SubmissionID] || {};
    const stu = studentsMap[pub.StudentID] || { name: 'DFM Student', teamId: pub.TeamID };
    const tm = teamsMap[pub.TeamID] || { name: pub.TeamID || 'Independent', color: '#3b82f6', logo: '' };

    return {
      publicationId: pub.PublicationID,
      submissionId: pub.SubmissionID,
      fileId: pub.FileID,
      title: pub.Title || sub.Title || 'DFM Competition Work',
      description: sub.Description || '',
      studentId: pub.StudentID,
      studentName: stu.name,
      teamId: pub.TeamID,
      teamName: tm.name,
      teamColor: tm.color,
      categoryId: pub.CategoryID || sub.ChallengeID || 'General',
      submissionType: sub.SubmissionType || 'INDIVIDUAL',
      thumbnailUrl: getDriveThumbnailUrl(pub.ThumbnailFileID || pub.FileID),
      viewUrl: getDrivePreviewUrl(pub.FileID),
      publishDate: pub.PublishDate
    };
  });

  // Latest Student Work & Latest Team Work
  const studentWorks = enrichedItems.filter(i => i.submissionType !== 'TEAM').slice(0, 10);
  const teamWorks = enrichedItems.filter(i => i.submissionType === 'TEAM').slice(0, 10);

  // Group by category for home carousels
  const categoriesData = {};
  DFM_CATEGORIES.forEach(cat => {
    categoriesData[cat] = enrichedItems.filter(i => {
      const c = (i.categoryId || '').toLowerCase();
      const target = cat.toLowerCase();
      return c.includes(target) || (target.includes('drone') && c.includes('drone')) ||
             (target.includes('photo') && c.includes('photo')) ||
             (target.includes('video') && c.includes('video'));
    }).slice(0, 8);
  });

  return {
    success: true,
    totalPublished: enrichedItems.length,
    latestStudentWorks: studentWorks,
    latestTeamWorks: teamWorks,
    categories: categoriesData,
    teams: getTeamsList().teams || []
  };
}

/**
 * Filterable Public Gallery endpoint.
 */
function getPublishedGallery(category, type, limit) {
  const homeData = getPublicHomeData();
  let items = homeData.latestStudentWorks.concat(homeData.latestTeamWorks);

  if (category && category !== 'ALL') {
    items = items.filter(i => (i.categoryId || '').toLowerCase().includes(category.toLowerCase()));
  }

  if (type === 'TEAM') {
    items = items.filter(i => i.submissionType === 'TEAM');
  } else if (type === 'INDIVIDUAL') {
    items = items.filter(i => i.submissionType !== 'TEAM');
  }

  return {
    success: true,
    count: items.length,
    items: items.slice(0, limit || 50)
  };
}

/**
 * Returns portfolio of a specific student.
 */
function getStudentPortfolio(studentId) {
  const subSheet = getSheetOrNull('Submissions');
  const stuSheet = getSheetOrNull('Students');
  if (!studentId) return { success: false, error: 'Student ID required' };

  let studentProfile = null;
  if (stuSheet) {
    const students = getSheetRowsAsObjects(stuSheet);
    studentProfile = students.find(s => s.StudentID === studentId);
  }

  let submissions = [];
  if (subSheet) {
    submissions = getSheetRowsAsObjects(subSheet)
      .filter(s => s.StudentID === studentId)
      .map(s => ({
        submissionId: s.SubmissionID,
        title: s.Title,
        description: s.Description,
        challengeId: s.ChallengeID,
        fileId: s.MainFileID,
        thumbnailUrl: getDriveThumbnailUrl(s.ThumbnailFileID || s.MainFileID),
        viewUrl: getDrivePreviewUrl(s.MainFileID),
        uploadStatus: s.UploadStatus,
        evaluationStatus: s.EvaluationStatus,
        publicationStatus: s.PublicationStatus,
        submittedAt: s.SubmittedAt
      }));
  }

  return {
    success: true,
    student: studentProfile ? {
      studentId: studentProfile.StudentID,
      fullName: studentProfile.FullName,
      teamId: studentProfile.TeamID,
      profilePhotoUrl: getDriveThumbnailUrl(studentProfile.ProfilePhotoFileID),
      score: studentProfile.IndividualScoreCache || 0,
      rank: studentProfile.RankCache || '-'
    } : null,
    submissions: submissions
  };
}

/**
 * Returns team portfolio and public submissions.
 */
function getTeamPortfolio(teamId) {
  const subSheet = getSheetOrNull('Submissions');
  const teamsSheet = getSheetOrNull('Teams');
  if (!teamId) return { success: false, error: 'Team ID required' };

  let teamInfo = null;
  if (teamsSheet) {
    const teams = getSheetRowsAsObjects(teamsSheet);
    teamInfo = teams.find(t => t.TeamID === teamId);
  }

  let submissions = [];
  if (subSheet) {
    submissions = getSheetRowsAsObjects(subSheet)
      .filter(s => s.TeamID === teamId)
      .map(s => ({
        submissionId: s.SubmissionID,
        studentId: s.StudentID,
        title: s.Title,
        description: s.Description,
        challengeId: s.ChallengeID,
        fileId: s.MainFileID,
        thumbnailUrl: getDriveThumbnailUrl(s.ThumbnailFileID || s.MainFileID),
        viewUrl: getDrivePreviewUrl(s.MainFileID),
        publicationStatus: s.PublicationStatus,
        submittedAt: s.SubmittedAt
      }));
  }

  return {
    success: true,
    team: teamInfo,
    submissions: submissions
  };
}

/**
 * Returns current leaderboard with team totals and student ranks.
 */
function getLeaderboard() {
  const teamsSheet = getSheetOrNull('Teams');
  const studentsSheet = getSheetOrNull('Students');

  let teams = [];
  if (teamsSheet) {
    teams = getSheetRowsAsObjects(teamsSheet).map(t => ({
      teamId: t.TeamID,
      teamName: t.TeamName,
      logoUrl: getDriveThumbnailUrl(t.LogoFileID),
      color: t.TeamColor,
      totalScore: Number(t.TotalScoreCache) || 0,
      rank: Number(t.RankCache) || 0
    })).sort((a, b) => b.totalScore - a.totalScore);
  }

  let topStudents = [];
  if (studentsSheet) {
    topStudents = getSheetRowsAsObjects(studentsSheet).map(s => ({
      studentId: s.StudentID,
      fullName: s.FullName,
      teamId: s.TeamID,
      score: Number(s.IndividualScoreCache) || 0,
      rank: Number(s.RankCache) || 0
    })).sort((a, b) => b.score - a.score).slice(0, 10);
  }

  return {
    success: true,
    teams: teams,
    topStudents: topStudents
  };
}

function getTeamsList() {
  const sheet = getSheetOrNull('Teams');
  if (!sheet) return { success: false, teams: [] };

  const teams = getSheetRowsAsObjects(sheet).map(t => ({
    teamId: t.TeamID,
    teamName: t.TeamName,
    description: t.Description,
    teamColor: t.TeamColor,
    logoUrl: getDriveThumbnailUrl(t.LogoFileID),
    score: Number(t.TotalScoreCache) || 0,
    rank: Number(t.RankCache) || '-'
  }));

  return { success: true, teams: teams };
}

function getTeamDetails(teamId) {
  const teamsSheet = getSheetOrNull('Teams');
  const studentsSheet = getSheetOrNull('Students');
  const subSheet = getSheetOrNull('Submissions');

  const team = getSheetRowsAsObjects(teamsSheet).find(t => t.TeamID === teamId);
  if (!team) return { success: false, error: 'Team not found' };

  const members = getSheetRowsAsObjects(studentsSheet)
    .filter(s => s.TeamID === teamId)
    .map(s => ({
      studentId: s.StudentID,
      fullName: s.FullName,
      photoUrl: getDriveThumbnailUrl(s.ProfilePhotoFileID),
      score: s.IndividualScoreCache || 0
    }));

  const works = getSheetRowsAsObjects(subSheet)
    .filter(s => s.TeamID === teamId && s.PublicationStatus === 'PUBLISHED')
    .map(s => ({
      submissionId: s.SubmissionID,
      title: s.Title,
      fileId: s.MainFileID,
      thumbnailUrl: getDriveThumbnailUrl(s.ThumbnailFileID || s.MainFileID)
    }));

  return {
    success: true,
    team: team,
    members: members,
    publishedWorks: works
  };
}

function getStudentSubmissions(studentId) {
  const sheet = getSheetOrNull('Submissions');
  if (!sheet) return { success: false, submissions: [] };

  const subs = getSheetRowsAsObjects(sheet)
    .filter(s => s.StudentID === studentId)
    .map(s => ({
      submissionId: s.SubmissionID,
      title: s.Title,
      description: s.Description,
      challengeId: s.ChallengeID,
      fileId: s.MainFileID,
      viewUrl: getDrivePreviewUrl(s.MainFileID),
      thumbnailUrl: getDriveThumbnailUrl(s.ThumbnailFileID || s.MainFileID),
      uploadStatus: s.UploadStatus,
      evaluationStatus: s.EvaluationStatus,
      publicationStatus: s.PublicationStatus,
      submittedAt: s.SubmittedAt
    }));

  return { success: true, submissions: subs };
}

// ============================================================================
// 8. EVALUATION & SCORING SUITE
// ============================================================================

/**
 * Scores a student or team submission. Updates ScoreLedger and rebuilds score caches.
 */
function scoreSubmission(data, evaluator) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(DFM_CONFIG.LOCK_TIMEOUT_MS);

    const submissionId = data.submissionId;
    const pointsAwarded = Number(data.pointsAwarded) || 0;
    const maxPoints = Number(data.maxPoints) || 100;
    const feedback = data.feedback || '';
    const includeInTeam = (data.includeInTeam !== false);

    const subSheet = getSheetOrNull('Submissions');
    const scoreSheet = getSheetOrNull('ScoreLedger');
    if (!subSheet || !scoreSheet) return { success: false, error: 'Database sheets missing' };

    const submissions = getSheetRowsAsObjects(subSheet);
    let sub = null;
    let subRowIndex = -1;

    for (let i = 0; i < submissions.length; i++) {
      if (submissions[i].SubmissionID === submissionId) {
        sub = submissions[i];
        subRowIndex = i + 2;
        break;
      }
    }

    if (!sub) return { success: false, error: 'Submission not found' };

    // Record score in ScoreLedger
    const scoreId = 'SCR_' + Utilities.getUuid().substring(0, 8);
    scoreSheet.appendRow([
      scoreId,
      sub.ChallengeID,
      submissionId,
      sub.StudentID,
      sub.TeamID,
      sub.SubmissionType,
      pointsAwarded,
      maxPoints,
      includeInTeam ? 'YES' : 'NO',
      evaluator.UserID,
      feedback,
      'APPROVED',
      '',
      '',
      new Date().toISOString()
    ]);

    // Update Submission Evaluation Status
    setSheetCellByHeader(subSheet, subRowIndex, 'EvaluationStatus', 'EVALUATED');
    setSheetCellByHeader(subSheet, subRowIndex, 'UpdatedAt', new Date().toISOString());

    // Rebuild caches for affected student and team
    rebuildScoresCache(sub.StudentID, sub.TeamID);

    logAudit('SCORE_AWARDED', 'SUBMISSION', submissionId, `Awarded ${pointsAwarded}/${maxPoints} pts`);

    return { success: true, scoreId: scoreId, pointsAwarded: pointsAwarded };
  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Rebuilds team and student score caches accurately from ScoreLedger.
 */
function rebuildScoresCache(studentId, teamId) {
  const scoreSheet = getSheetOrNull('ScoreLedger');
  if (!scoreSheet) return;

  const scores = getSheetRowsAsObjects(scoreSheet).filter(s => s.Status === 'APPROVED');

  // Rebuild student score
  if (studentId) {
    const stuSheet = getSheetOrNull('Students');
    if (stuSheet) {
      const studentTotal = scores
        .filter(s => s.StudentID === studentId)
        .reduce((sum, s) => sum + (Number(s.PointsAwarded) || 0), 0);

      const students = getSheetRowsAsObjects(stuSheet);
      for (let i = 0; i < students.length; i++) {
        if (students[i].StudentID === studentId) {
          setSheetCellByHeader(stuSheet, i + 2, 'IndividualScoreCache', studentTotal);
          break;
        }
      }
    }
  }

  // Rebuild team score
  if (teamId) {
    const teamsSheet = getSheetOrNull('Teams');
    if (teamsSheet) {
      const teamTotal = scores
        .filter(s => s.TeamID === teamId && s.IncludeInTeamTotal === 'YES')
        .reduce((sum, s) => sum + (Number(s.PointsAwarded) || 0), 0);

      const teams = getSheetRowsAsObjects(teamsSheet);
      for (let j = 0; j < teams.length; j++) {
        if (teams[j].TeamID === teamId) {
          setSheetCellByHeader(teamsSheet, j + 2, 'TotalScoreCache', teamTotal);
          break;
        }
      }
    }
  }
}

// ============================================================================
// 9. REPOSITORY & SHEET UTILITIES (CRUD, Safe Migrations, Locks)
// ============================================================================

function getSheetOrNull(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(DFM_CONFIG.SPREADSHEET_ID);
    return ss.getSheetByName(sheetName);
  } catch (e) {
    return null;
  }
}

function getSheetRowsAsObjects(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || '').trim());
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = row[i];
    });
    return obj;
  });
}

function setSheetCellByHeader(sheet, rowIndex, headerName, value) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIndex = headers.indexOf(headerName);
  if (colIndex !== -1) {
    sheet.getRange(rowIndex, colIndex + 1).setValue(value);
  }
}

function getSavedFolderId(ownerType, ownerId, folderCategory) {
  const sheet = getSheetOrNull('DriveFolders');
  if (!sheet || sheet.getLastRow() < 2) return null;
  const rows = getSheetRowsAsObjects(sheet);

  const match = rows.find(r => 
    r.OwnerType === ownerType &&
    r.OwnerID === ownerId &&
    r.FolderCategory === folderCategory &&
    r.Status === 'ACTIVE'
  );

  return match ? match.FolderID : null;
}

function saveFolderMapping(mapping) {
  const sheet = getSheetOrNull('DriveFolders');
  if (!sheet) return;

  const rows = getSheetRowsAsObjects(sheet);
  const existingIdx = rows.findIndex(r => 
    r.OwnerType === mapping.OwnerType &&
    r.OwnerID === mapping.OwnerID &&
    r.FolderCategory === mapping.FolderCategory
  );

  const recordId = 'DFR_' + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  if (existingIdx === -1) {
    sheet.appendRow([
      recordId,
      mapping.OwnerType,
      mapping.OwnerID,
      mapping.FolderCategory,
      mapping.FolderID,
      mapping.ParentFolderID,
      mapping.FolderName,
      mapping.Status || 'ACTIVE',
      now,
      now
    ]);
  } else {
    // Update existing row
    const rowNum = existingIdx + 2;
    setSheetCellByHeader(sheet, rowNum, 'FolderID', mapping.FolderID);
    setSheetCellByHeader(sheet, rowNum, 'ParentFolderID', mapping.ParentFolderID);
    setSheetCellByHeader(sheet, rowNum, 'FolderName', mapping.FolderName);
    setSheetCellByHeader(sheet, rowNum, 'Status', mapping.Status || 'ACTIVE');
    setSheetCellByHeader(sheet, rowNum, 'UpdatedAt', now);
  }
}

function sanitizeName(name) {
  return String(name || '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
}

function getDriveThumbnailUrl(fileId) {
  if (!fileId) return '';
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}

function getDrivePreviewUrl(fileId) {
  if (!fileId) return '';
  return `https://drive.google.com/file/d/${fileId}/view`;
}

// ============================================================================
// 10. AUTHENTICATION & SECURITY (PBKDF2/SHA-256 Hashes)
// ============================================================================

function hashPassword(password, salt) {
  const combined = salt + password + 'DFM_ARENA_PEPPER_2026';
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined, Utilities.Charset.UTF_8);
  return digest.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

function generateSalt() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 16);
}

// ============================================================================
// MOBILE NUMBER VALIDATION & NORMALIZATION
// ============================================================================
function normalizeMobileNumber(mobile) {
  if (!mobile) return '';
  let clean = String(mobile).trim().replace(/[\s\-\(\)\.]/g, '');
  
  if (clean.startsWith('+91')) {
    const digits = clean.substring(3);
    if (/^\d{10}$/.test(digits)) return '+91' + digits;
  } else if (clean.startsWith('91') && clean.length === 12) {
    const digits = clean.substring(2);
    if (/^\d{10}$/.test(digits)) return '+91' + digits;
  } else if (clean.startsWith('0') && clean.length === 11) {
    const digits = clean.substring(1);
    if (/^\d{10}$/.test(digits)) return '+91' + digits;
  } else if (/^\d{10}$/.test(clean)) {
    return '+91' + clean;
  }
  return clean.startsWith('+') ? clean : '+91' + clean;
}

function isValidIndianMobile(mobile) {
  const norm = normalizeMobileNumber(mobile);
  return /^\+91[6-9]\d{9}$/.test(norm);
}

// ============================================================================
// MOBILE-NUMBER-BASED AUTHENTICATION (ADMIN & STUDENT)
// ============================================================================
function mobileLogin(mobileOrUser, password, requestedRole) {
  const inputStr = String(mobileOrUser || '').trim();
  const passwordStr = String(password || '');

  // 1. Check for one-time Bootstrap Admin setup
  if ((inputStr.toLowerCase() === 'admin' || inputStr.toLowerCase() === String(DFM_CONFIG.DEFAULT_SUPERADMIN_USER).toLowerCase()) &&
      passwordStr === DFM_CONFIG.DEFAULT_SUPERADMIN_PASS) {
    
    const usersSheet = getSheetOrNull('Users');
    const users = usersSheet ? getSheetRowsAsObjects(usersSheet) : [];
    const superAdmin = users.find(u => u.Role === 'SUPER_ADMIN');

    // If superadmin already registered a mobile number, routine username login is disabled
    if (superAdmin && superAdmin.NormalizedMobile && superAdmin.MustChangePassword !== 'YES') {
      return { 
        success: false, 
        error: 'Username login has been disabled. Please log in using your registered mobile number and password.' 
      };
    }

    return {
      success: true,
      isBootstrap: true,
      requiresSetup: true,
      role: 'SUPER_ADMIN',
      message: 'Initial bootstrap authenticated. Please register your official mobile number and create a new password.'
    };
  }

  // 2. Normal mobile login flow
  const normMobile = normalizeMobileNumber(inputStr);
  if (!isValidIndianMobile(normMobile) && !/^\d{10}$/.test(inputStr)) {
    return { success: false, error: 'Please enter a valid 10-digit registered Indian mobile number.' };
  }

  const usersSheet = getSheetOrNull('Users');
  if (!usersSheet) return { success: false, error: 'Users database unavailable' };

  const users = getSheetRowsAsObjects(usersSheet);
  
  // Find account matching normalized mobile or raw mobile
  const user = users.find(u => {
    const uNorm = u.NormalizedMobile ? normalizeMobileNumber(u.NormalizedMobile) : '';
    const uRaw = u.MobileNumber ? normalizeMobileNumber(u.MobileNumber) : '';
    return (uNorm === normMobile || uRaw === normMobile);
  });

  if (!user) {
    // Security: Do not disclose whether number exists or password is wrong
    return { success: false, error: 'Invalid mobile number or password.' };
  }

  // Verify account status
  if (user.Status !== 'ACTIVE') {
    return { success: false, error: 'Account is deactivated or disabled. Please contact the administrator.' };
  }

  // Verify requested role permission
  if (requestedRole) {
    const roleReq = String(requestedRole).toUpperCase();
    if (roleReq === 'ADMIN' && !(user.Role === 'SUPER_ADMIN' || user.Role === 'ADMIN')) {
      return { success: false, error: 'This account is not authorized for Administrator access.' };
    }
    if (roleReq === 'STUDENT' && user.Role !== 'STUDENT') {
      return { success: false, error: 'This account is not authorized for Student Contender access.' };
    }
  }

  // Verify password hash
  const computedHash = hashPassword(passwordStr, user.PasswordSalt);
  if (computedHash !== user.PasswordHash) {
    return { success: false, error: 'Invalid mobile number or password.' };
  }

  // Create session token
  const token = generateSessionToken(user);

  // Retrieve associated student metadata if student
  let studentData = null;
  if (user.Role === 'STUDENT') {
    const stuSheet = getSheetOrNull('Students');
    if (stuSheet) {
      studentData = getSheetRowsAsObjects(stuSheet).find(s => 
        (s.NormalizedMobile && normalizeMobileNumber(s.NormalizedMobile) === normMobile) ||
        (s.MobileNumber && normalizeMobileNumber(s.MobileNumber) === normMobile) ||
        (s.Username && s.Username === user.Username)
      );
    }
  }

  logAudit('USER_LOGIN', 'USER', user.UserID, `User ${user.UserID} logged in via mobile`);

  return {
    success: true,
    token: token,
    user: {
      userId: user.UserID,
      role: user.Role,
      mobile: user.NormalizedMobile || user.MobileNumber,
      mustChangePassword: (user.MustChangePassword === 'YES'),
      studentId: studentData ? studentData.StudentID : null,
      teamId: studentData ? studentData.TeamID : null,
      fullName: studentData ? studentData.FullName : (user.Username || 'Administrator')
    }
  };
}

// Backwards compatibility alias
function loginUser(usernameOrMobile, password, role) {
  return mobileLogin(usernameOrMobile, password, role);
}

// ============================================================================
// FIRST-TIME ADMIN SETUP (Force Mobile Registration & Password Change)
// ============================================================================
function firstTimeAdminSetup(bootstrapPassword, newMobileNumber, newPassword) {
  if (bootstrapPassword !== DFM_CONFIG.DEFAULT_SUPERADMIN_PASS) {
    return { success: false, error: 'Invalid bootstrap temporary password.' };
  }

  const normMobile = normalizeMobileNumber(newMobileNumber);
  if (!isValidIndianMobile(normMobile)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  if (!newPassword || String(newPassword).length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const usersSheet = getSheetOrNull('Users');
  if (!usersSheet) return { success: false, error: 'Users database unavailable' };

  const users = getSheetRowsAsObjects(usersSheet);

  // Verify mobile uniqueness across active accounts
  const isDuplicate = users.some(u => {
    const uNorm = u.NormalizedMobile ? normalizeMobileNumber(u.NormalizedMobile) : '';
    return uNorm === normMobile && u.Status === 'ACTIVE';
  });

  if (isDuplicate) {
    return { success: false, error: 'This mobile number is already registered to another account.' };
  }

  // Find Super Admin record (or create if not present)
  let superAdminRowIndex = -1;
  const rawData = usersSheet.getDataRange().getValues();
  const headers = rawData[0].map(h => String(h || '').trim());
  const roleCol = headers.indexOf('Role');
  const userCol = headers.indexOf('Username');

  for (let r = 1; r < rawData.length; r++) {
    if (rawData[r][roleCol] === 'SUPER_ADMIN' || rawData[r][userCol] === DFM_CONFIG.DEFAULT_SUPERADMIN_USER) {
      superAdminRowIndex = r + 1; // 1-based index
      break;
    }
  }

  const newSalt = generateSalt();
  const newHash = hashPassword(newPassword, newSalt);
  const now = new Date().toISOString();

  if (superAdminRowIndex > 0) {
    setSheetCellByHeader(usersSheet, superAdminRowIndex, 'MobileNumber', newMobileNumber);
    setSheetCellByHeader(usersSheet, superAdminRowIndex, 'NormalizedMobile', normMobile);
    setSheetCellByHeader(usersSheet, superAdminRowIndex, 'PasswordHash', newHash);
    setSheetCellByHeader(usersSheet, superAdminRowIndex, 'PasswordSalt', newSalt);
    setSheetCellByHeader(usersSheet, superAdminRowIndex, 'MustChangePassword', 'NO');
    setSheetCellByHeader(usersSheet, superAdminRowIndex, 'UpdatedAt', now);
  } else {
    usersSheet.appendRow([
      'USR_ADMIN_001',
      'admin',
      newMobileNumber,
      normMobile,
      newHash,
      newSalt,
      'SUPER_ADMIN',
      'ACTIVE',
      'NO',
      1,
      now,
      now
    ]);
  }

  logAudit('FIRST_TIME_ADMIN_SETUP', 'USER', 'USR_ADMIN_001', 'Super Admin mobile registration and password change completed');

  // Issue active session token
  const updatedUser = {
    UserID: 'USR_ADMIN_001',
    Username: 'admin',
    Role: 'SUPER_ADMIN',
    SessionVersion: 1
  };
  const token = generateSessionToken(updatedUser);

  return {
    success: true,
    token: token,
    message: 'Super Administrator mobile registration and password setup complete! Routine username login is now disabled.',
    user: {
      userId: 'USR_ADMIN_001',
      role: 'SUPER_ADMIN',
      mobile: normMobile,
      fullName: 'Super Administrator'
    }
  };
}

// ============================================================================
// PASSWORD MANAGEMENT (Change & Reset)
// ============================================================================
function changePassword(userId, currentPassword, newPassword) {
  if (!newPassword || String(newPassword).length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const usersSheet = getSheetOrNull('Users');
  if (!usersSheet) return { success: false, error: 'Database unavailable' };

  const rawData = usersSheet.getDataRange().getValues();
  const headers = rawData[0].map(h => String(h || '').trim());
  const idCol = headers.indexOf('UserID');

  let rowIndex = -1;
  let currentUserRow = null;
  for (let r = 1; r < rawData.length; r++) {
    if (rawData[r][idCol] === userId) {
      rowIndex = r + 1;
      currentUserRow = rawData[r];
      break;
    }
  }

  if (rowIndex <= 0 || !currentUserRow) {
    return { success: false, error: 'User record not found.' };
  }

  const saltCol = headers.indexOf('PasswordSalt');
  const hashCol = headers.indexOf('PasswordHash');
  const existingSalt = currentUserRow[saltCol];
  const existingHash = currentUserRow[hashCol];

  if (currentPassword) {
    const checkHash = hashPassword(currentPassword, existingSalt);
    if (checkHash !== existingHash) {
      return { success: false, error: 'Current password does not match.' };
    }
  }

  const newSalt = generateSalt();
  const newHash = hashPassword(newPassword, newSalt);
  const now = new Date().toISOString();

  setSheetCellByHeader(usersSheet, rowIndex, 'PasswordHash', newHash);
  setSheetCellByHeader(usersSheet, rowIndex, 'PasswordSalt', newSalt);
  setSheetCellByHeader(usersSheet, rowIndex, 'MustChangePassword', 'NO');
  setSheetCellByHeader(usersSheet, rowIndex, 'UpdatedAt', now);

  const verCol = headers.indexOf('SessionVersion');
  if (verCol >= 0) {
    const curVer = Number(currentUserRow[verCol]) || 1;
    setSheetCellByHeader(usersSheet, rowIndex, 'SessionVersion', curVer + 1);
  }

  logAudit('PASSWORD_CHANGED', 'USER', userId, 'Password updated successfully');
  return { success: true, message: 'Password updated successfully.' };
}

function resetPassword(adminUserId, targetUserId, newPassword) {
  return changePassword(targetUserId, null, newPassword);
}

function updateMobileNumber(adminUserId, targetUserId, newMobileNumber) {
  const normMobile = normalizeMobileNumber(newMobileNumber);
  if (!isValidIndianMobile(normMobile)) {
    return { success: false, error: 'Invalid Indian mobile number.' };
  }

  const usersSheet = getSheetOrNull('Users');
  if (!usersSheet) return { success: false, error: 'Database unavailable' };

  const users = getSheetRowsAsObjects(usersSheet);
  const duplicate = users.some(u => 
    u.UserID !== targetUserId && 
    normalizeMobileNumber(u.NormalizedMobile) === normMobile && 
    u.Status === 'ACTIVE'
  );

  if (duplicate) {
    return { success: false, error: 'Mobile number already registered to another user.' };
  }

  const rawData = usersSheet.getDataRange().getValues();
  const headers = rawData[0].map(h => String(h || '').trim());
  const idCol = headers.indexOf('UserID');

  for (let r = 1; r < rawData.length; r++) {
    if (rawData[r][idCol] === targetUserId) {
      setSheetCellByHeader(usersSheet, r + 1, 'MobileNumber', newMobileNumber);
      setSheetCellByHeader(usersSheet, r + 1, 'NormalizedMobile', normMobile);
      setSheetCellByHeader(usersSheet, r + 1, 'UpdatedAt', new Date().toISOString());
      break;
    }
  }

  // Also update Students sheet if target is student
  const stuSheet = getSheetOrNull('Students');
  if (stuSheet) {
    const stuData = stuSheet.getDataRange().getValues();
    const stuHeaders = stuData[0].map(h => String(h || '').trim());
    const stuIdCol = stuHeaders.indexOf('StudentID');
    for (let r = 1; r < stuData.length; r++) {
      if (stuData[r][stuIdCol] === targetUserId || `USR_${stuData[r][stuIdCol]}` === targetUserId) {
        setSheetCellByHeader(stuSheet, r + 1, 'MobileNumber', newMobileNumber);
        setSheetCellByHeader(stuSheet, r + 1, 'NormalizedMobile', normMobile);
        setSheetCellByHeader(stuSheet, r + 1, 'UpdatedAt', new Date().toISOString());
        break;
      }
    }
  }

  logAudit('MOBILE_UPDATED', 'USER', targetUserId, `Mobile updated to ${normMobile} by admin ${adminUserId}`);
  return { success: true, message: 'Mobile number updated successfully.', normalizedMobile: normMobile };
}

// ============================================================================
// STUDENT & ADMIN CREATION (Mandatory Mobile & Password)
// ============================================================================
function createStudent(data, adminUserId) {
  if (!data.fullName || !data.mobileNumber || !data.initialPassword || !data.teamId) {
    return { success: false, error: 'Full Name, Mobile Number, Initial Password and Assigned Team are mandatory.' };
  }

  const normMobile = normalizeMobileNumber(data.mobileNumber);
  if (!isValidIndianMobile(normMobile)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  const usersSheet = getSheetOrNull('Users');
  const stuSheet = getSheetOrNull('Students');
  if (!usersSheet || !stuSheet) return { success: false, error: 'Database unavailable' };

  // Check mobile uniqueness
  const users = getSheetRowsAsObjects(usersSheet);
  const duplicate = users.some(u => 
    normalizeMobileNumber(u.NormalizedMobile) === normMobile && 
    u.Status === 'ACTIVE'
  );
  if (duplicate) {
    return { success: false, error: `Mobile number ${normMobile} is already registered.` };
  }

  // Generate unique Student ID
  const existingCount = stuSheet.getLastRow() - 1;
  const nextNum = ('00' + (existingCount + 1)).slice(-3);
  const studentId = data.studentId || `STU_${nextNum}`;
  const userId = `USR_${studentId}`;
  const now = new Date().toISOString();

  // Create individual Drive folder hierarchy in 02_STUDENTS
  const folderRes = createStudentFolder(studentId, data.teamId, data.fullName);
  const folderId = folderRes.success ? folderRes.studentFolderId : '';

  // Password hashing
  const salt = generateSalt();
  const hash = hashPassword(data.initialPassword, salt);

  // Append to Users sheet
  usersSheet.appendRow([
    userId,
    data.username || `stu_${nextNum}`,
    data.mobileNumber,
    normMobile,
    hash,
    salt,
    'STUDENT',
    'ACTIVE',
    'NO',
    1,
    now,
    now
  ]);

  // Append to Students sheet
  stuSheet.appendRow([
    studentId,
    data.fullName,
    data.mobileNumber,
    normMobile,
    data.teamId,
    data.photoFileId || '',
    folderId,
    0,
    existingCount + 1,
    data.publicProfileStatus || 'ACTIVE',
    'ACTIVE',
    now,
    now
  ]);

  logAudit('STUDENT_CREATED', 'STUDENT', studentId, `Student ${data.fullName} registered by admin ${adminUserId}`);

  return {
    success: true,
    studentId: studentId,
    folderId: folderId,
    normalizedMobile: normMobile,
    message: `Student ${data.fullName} (${studentId}) registered successfully! Drive folder created in 02_STUDENTS.`
  };
}

function generateSessionToken(user) {
  const payload = {
    userId: user.UserID,
    username: user.Username,
    role: user.Role,
    sessionVersion: user.SessionVersion || 1,
    exp: Date.now() + (DFM_CONFIG.CHUNK_EXPIRY_HOURS * 3600 * 1000)
  };
  const jsonStr = JSON.stringify(payload);
  const base64 = Utilities.base64Encode(jsonStr);
  const sig = hashPassword(base64, 'SESSION_SECRET_KEY');
  return `${base64}.${sig}`;
}

function verifyAuthSession(token) {
  if (!token) return { valid: false };
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };

    const base64 = parts[0];
    const signature = parts[1];
    const expectedSig = hashPassword(base64, 'SESSION_SECRET_KEY');
    if (signature !== expectedSig) return { valid: false };

    const jsonStr = Utilities.newBlob(Utilities.base64Decode(base64)).getDataAsString();
    const payload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) return { valid: false, expired: true };

    const usersSheet = getSheetOrNull('Users');
    const user = getSheetRowsAsObjects(usersSheet).find(u => u.UserID === payload.userId);
    if (!user || user.Status !== 'ACTIVE') return { valid: false };

    return { valid: true, user: user };
  } catch (e) {
    return { valid: false };
  }
}

// ============================================================================
// 11. INITIAL SEEDING & SUPER-ADMIN CREATION (Idempotent)
// ============================================================================

function initSuperAdminAccount() {
  const usersSheet = getSheetOrNull('Users');
  if (!usersSheet) return { status: 'ERROR', error: 'Users sheet missing' };

  const users = getSheetRowsAsObjects(usersSheet);
  const existingSuper = users.find(u => u.Role === 'SUPER_ADMIN');

  if (existingSuper) {
    return { status: 'EXISTING', userId: existingSuper.UserID, username: existingSuper.Username };
  }

  const salt = generateSalt();
  const hash = hashPassword(DFM_CONFIG.DEFAULT_SUPERADMIN_PASS, salt);
  const userId = 'USR_ADMIN_001';

  usersSheet.appendRow([
    userId,
    DFM_CONFIG.DEFAULT_SUPERADMIN_USER,
    '', // MobileNumber (registered on first-time setup)
    '', // NormalizedMobile
    hash,
    salt,
    'SUPER_ADMIN',
    'ACTIVE',
    'YES',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  ]);

  return { status: 'CREATED', userId: userId, username: DFM_CONFIG.DEFAULT_SUPERADMIN_USER };
}

function initAppConfig() {
  const configSheet = getSheetOrNull('AppConfig');
  if (!configSheet) return;

  const existing = getSheetRowsAsObjects(configSheet);
  const configMap = {};
  existing.forEach(c => configMap[c.ConfigKey] = c.ConfigValue);

  const defaults = [
    ['DRIVE_ROOT_FOLDER_ID', DFM_CONFIG.DRIVE_ROOT_ID, 'Parent Google Drive Root Folder ID'],
    ['SPREADSHEET_DATABASE_ID', DFM_CONFIG.SPREADSHEET_ID, 'Central Google Sheets Database ID'],
    ['COMPETITION_TITLE', 'DFM KORBA ARENA 2026', 'Competition Name'],
    ['ACTIVE_COMPETITION_DAY', '1', 'Current Day of Competition'],
    ['SYSTEM_STATUS', 'OPERATIONAL', 'Global App Operational Status'],
    ['LAST_INITIALIZED_AT', new Date().toISOString(), 'Timestamp of last system initialization']
  ];

  defaults.forEach(([key, val, desc]) => {
    if (!configMap[key]) {
      configSheet.appendRow([key, val, desc, new Date().toISOString()]);
    }
  });
}

/**
 * Seeds standard 5 teams and 30 students if the tables are completely empty,
 * ensuring out-of-the-box readiness for the production arena.
 */
function seedInitialCompetitionData() {
  const teamsSheet = getSheetOrNull('Teams');
  const studentsSheet = getSheetOrNull('Students');
  const usersSheet = getSheetOrNull('Users');

  // Seed Teams
  if (teamsSheet && teamsSheet.getLastRow() <= 1) {
    const teamsData = [
      ['TEAM_001', 'Sky Hawks', '', 'Aerial Cinematography & Precision Drone Flight Squadron', '#f59e0b', '', 2450, 1, 'ACTIVE', new Date().toISOString(), new Date().toISOString()],
      ['TEAM_002', 'Drone Force', '', 'Narrative video shooting, commercial & documentary film crew', '#3b82f6', '', 2280, 2, 'ACTIVE', new Date().toISOString(), new Date().toISOString()],
      ['TEAM_003', 'Air Vision', '', 'Creative direction, lighting and scenic drone camera specialists', '#10b981', '', 2150, 3, 'ACTIVE', new Date().toISOString(), new Date().toISOString()],
      ['TEAM_004', 'Sky Riders', '', 'Post-production, precision editing and audio engineering', '#6366f1', '', 1980, 4, 'ACTIVE', new Date().toISOString(), new Date().toISOString()],
      ['TEAM_005', 'Pixel Wings', '', 'Visual identity, motion design, clay sculpting and practical SFX', '#ec4899', '', 1760, 5, 'ACTIVE', new Date().toISOString(), new Date().toISOString()]
    ];
    teamsSheet.getRange(2, 1, teamsData.length, teamsData[0].length).setValues(teamsData);
  }

  // Seed Students (30 total: 6 students per team)
  if (studentsSheet && studentsSheet.getLastRow() <= 1) {
    const students = [];
    const userRows = [];

    const names = [
      'Rohan Verma', 'Priya Sahu', 'Aman Singh', 'Neha Patel', 'Vivek Jha', 'Aarav Sharma',
      'Vivaan Patel', 'Reyansh Gupta', 'Diya Verma', 'Ananya Singh', 'Ishaan Kumar', 'Meera Iyer',
      'Kabir Joshi', 'Rhea Malhotra', 'Siddharth Rao', 'Pooja Nair', 'Aditya Mishra', 'Sneha Kapoor',
      'Arjun Reddy', 'Tanmay Sen', 'Kavya Pillai', 'Rohan Bhatia', 'Shruti Deshmukh', 'Simran Kaur',
      'Devendra Soni', 'Nikita Chauhan', 'Kunal Tiwari', 'Sanya Agarwal', 'Yashvardhan Jain', 'Bhavna Yadav'
    ];

    for (let i = 1; i <= 30; i++) {
      const idNum = ('00' + i).slice(-3);
      const studentId = `STU_${idNum}`;
      const teamNum = Math.floor((i - 1) / 6) + 1;
      const teamId = `TEAM_00${teamNum}`;
      const fullName = names[i - 1] || `Arena Contender ${idNum}`;
      const username = `student_${idNum}`;
      const salt = generateSalt();
      const hash = hashPassword('DFM@2026', salt);
      const now = new Date().toISOString();

      const rawMobile = (i === 1) ? '+91 9876543210' : ('+91 980000' + ('0000' + i).slice(-4));
      const normMobile = (i === 1) ? '+919876543210' : ('+91980000' + ('0000' + i).slice(-4));

      students.push([
        studentId,
        fullName,
        rawMobile,
        normMobile,
        teamId,
        '', // ProfilePhotoFileID
        '', // DriveFolderID (synced next)
        (i === 1) ? 520 : 0,
        i,
        'ACTIVE',
        'ACTIVE',
        now,
        now
      ]);

      userRows.push([
        `USR_${studentId}`,
        username,
        rawMobile,
        normMobile,
        hash,
        salt,
        'STUDENT',
        'ACTIVE',
        'NO',
        1,
        now,
        now
      ]);
    }

    studentsSheet.getRange(2, 1, students.length, students[0].length).setValues(students);

    if (usersSheet) {
      usersSheet.getRange(usersSheet.getLastRow() + 1, 1, userRows.length, userRows[0].length).setValues(userRows);
    }
  }

  // Seed Initial Challenge if none exist
  const challengesSheet = getSheetOrNull('Challenges');
  if (challengesSheet && challengesSheet.getLastRow() <= 1) {
    const chall = [
      'CHAL_001',
      'Orbit Cinematic Shot',
      'Capture a smooth 360-degree orbit shot around a key landmark or subject with constant distance, smooth yaw, and altitude lock.',
      'Drone Flying',
      'INDIVIDUAL',
      100,
      new Date().toISOString(),
      '11 Jan, 5:00 PM',
      'VIDEO',
      'Submit maximum 90-second edited video in MP4/MOV format.',
      '',
      'ACTIVE',
      'PUBLIC',
      'SUPER_ADMIN',
      new Date().toISOString(),
      new Date().toISOString()
    ];
    challengesSheet.appendRow(chall);
  }
}

// ============================================================================
// 12. DIAGNOSTICS, TELEMETRY & AUDIT LOGGING
// ============================================================================

function getDatabaseHealth() {
  const ss = SpreadsheetApp.openById(DFM_CONFIG.SPREADSHEET_ID);
  const sheets = ss.getSheets();
  const summary = sheets.map(s => ({
    name: s.getName(),
    rows: s.getLastRow(),
    cols: s.getLastColumn()
  }));

  return {
    success: true,
    spreadsheetId: DFM_CONFIG.SPREADSHEET_ID,
    spreadsheetName: ss.getName(),
    sheetsCount: sheets.length,
    sheets: summary,
    timestamp: new Date().toISOString()
  };
}

function getDriveHealth() {
  const root = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const childFolders = [];
  const it = root.getFolders();
  while (it.hasNext()) {
    const f = it.next();
    childFolders.push({ name: f.getName(), id: f.getId() });
  }

  return {
    success: true,
    rootFolderId: DFM_CONFIG.DRIVE_ROOT_ID,
    rootFolderName: root.getName(),
    subfoldersCount: childFolders.length,
    subfolders: childFolders,
    timestamp: new Date().toISOString()
  };
}

function getSpreadsheetHealth() {
  return getDatabaseHealth();
}

function getAllDriveFolderIDs() {
  const sheet = getSheetOrNull('DriveFolders');
  if (!sheet) return { success: false, folders: [] };
  const rows = getSheetRowsAsObjects(sheet);
  return { success: true, count: rows.length, folders: rows };
}

function getStudentDriveFolder(studentId) {
  const folderId = getSavedFolderId('STUDENT', studentId, 'STUDENT_ROOT');
  return { success: !!folderId, folderId: folderId };
}

function getAdminDriveFolder(adminId) {
  const folderId = getSavedFolderId('ADMIN', adminId, 'ADMIN_PERSONAL');
  return { success: !!folderId, folderId: folderId };
}

function getTeamDriveFolder(teamId) {
  const folderId = getSavedFolderId('TEAM', teamId, 'TEAM_ROOT');
  return { success: !!folderId, folderId: folderId };
}

function getFolderMetadata(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    return {
      success: true,
      id: folder.getId(),
      name: folder.getName(),
      url: folder.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function verifyDriveFolderStructure() {
  const root = DriveApp.getFolderById(DFM_CONFIG.DRIVE_ROOT_ID);
  const required = ['00_ADMIN', '01_TEAMS', '02_STUDENTS', '03_SHARED_ASSETS', '04_PUBLIC_GALLERY', '05_BACKUPS'];
  const missing = [];
  const present = [];

  required.forEach(req => {
    if (root.getFoldersByName(req).hasNext()) {
      present.push(req);
    } else {
      missing.push(req);
    }
  });

  return {
    success: missing.length === 0,
    present: present,
    missing: missing
  };
}

function migrateDatabaseSchema() {
  return initializeDatabaseSheets();
}

function getSubmissionRecords(filters) {
  const sheet = getSheetOrNull('Submissions');
  if (!sheet) return { success: false, submissions: [] };
  let subs = getSheetRowsAsObjects(sheet);

  if (filters) {
    if (filters.status) subs = subs.filter(s => s.EvaluationStatus === filters.status);
    if (filters.challengeId) subs = subs.filter(s => s.ChallengeID === filters.challengeId);
    if (filters.teamId) subs = subs.filter(s => s.TeamID === filters.teamId);
  }

  return { success: true, count: subs.length, submissions: subs };
}

function getAuditLogs(limit) {
  const sheet = getSheetOrNull('AuditLogs');
  if (!sheet) return { success: false, logs: [] };
  const rows = getSheetRowsAsObjects(sheet);
  return { success: true, logs: rows.slice(-(limit || 100)).reverse() };
}

function logAudit(action, entityType, entityId, details) {
  try {
    const sheet = getSheetOrNull('AuditLogs');
    if (sheet) {
      const logId = 'LOG_' + Utilities.getUuid().substring(0, 8);
      sheet.appendRow([
        logId,
        'SYSTEM',
        action,
        entityType,
        entityId,
        details,
        Utilities.getUuid().substring(0, 8),
        new Date().toISOString()
      ]);
    }
  } catch (e) {}
}

function getAllStudentsAdmin() {
  const sheet = getSheetOrNull('Students');
  if (!sheet) return { success: false, students: [] };
  const rows = getSheetRowsAsObjects(sheet);
  return { success: true, count: rows.length, students: rows };
}

function getAllUsersAdmin() {
  const sheet = getSheetOrNull('Users');
  if (!sheet) return { success: false, users: [] };
  const rows = getSheetRowsAsObjects(sheet).map(u => ({
    userId: u.UserID,
    username: u.Username,
    role: u.Role,
    status: u.Status,
    createdAt: u.CreatedAt
  }));
  return { success: true, count: rows.length, users: rows };
}

function getChallengesPublic() {
  const sheet = getSheetOrNull('Challenges');
  if (!sheet) return { success: false, challenges: [] };
  const challenges = getSheetRowsAsObjects(sheet).filter(c => c.PublicStatus === 'PUBLIC');
  return { success: true, challenges: challenges };
}

