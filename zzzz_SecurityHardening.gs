// Security hardening overrides for the legacy Code.gs implementation.
// Keep this file after Code.gs in Apps Script's global project.

function getSessionSigningKey_() {
  var properties = PropertiesService.getScriptProperties();
  var key = properties.getProperty('DFM_SESSION_SIGNING_KEY');
  if (!key) {
    key = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    properties.setProperty('DFM_SESSION_SIGNING_KEY', key);
  }
  return key;
}

function signSessionPayload_(payloadB64) {
  var signature = Utilities.computeHmacSha256Signature(
    payloadB64,
    getSessionSigningKey_(),
    Utilities.Charset.UTF_8
  );
  return signature.map(function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function generateSessionToken(user) {
  var payload = {
    userId: String(user.UserID),
    sessionVersion: Number(user.SessionVersion) || 1,
    exp: Date.now() + (DFM_CONFIG.CHUNK_EXPIRY_HOURS * 60 * 60 * 1000)
  };
  var encoded = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  return encoded + '.' + signSessionPayload_(encoded);
}

function verifyAuthSession(token) {
  if (typeof token !== 'string' || !token) return { valid: false };
  try {
    var parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return { valid: false };

    var expected = signSessionPayload_(parts[0]);
    if (parts[1].length !== expected.length) return { valid: false };
    var difference = 0;
    for (var i = 0; i < expected.length; i++) {
      difference |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i);
    }
    if (difference !== 0) return { valid: false };

    var payload = JSON.parse(
      Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString()
    );
    if (!payload || typeof payload.userId !== 'string' ||
        !isFinite(Number(payload.exp)) || Date.now() >= Number(payload.exp)) {
      return { valid: false, expired: true };
    }

    var usersSheet = getSheetOrNull('Users');
    if (!usersSheet) return { valid: false };
    var user = getSheetRowsAsObjects(usersSheet).find(function (row) {
      return String(row.UserID) === payload.userId;
    });
    if (!user || user.Status !== 'ACTIVE') return { valid: false };
    if (Number(payload.sessionVersion) !== (Number(user.SessionVersion) || 1)) {
      return { valid: false };
    }

    // Student identity/team are resolved server-side, not from request data.
    if (user.Role === 'STUDENT') {
      var studentsSheet = getSheetOrNull('Students');
      var students = studentsSheet ? getSheetRowsAsObjects(studentsSheet) : [];
      var student = students.find(function (row) {
        return 'USR_' + String(row.StudentID) === String(user.UserID);
      });
      user.StudentID = student ? student.StudentID : '';
      user.TeamID = student ? student.TeamID : '';
    }
    return { valid: true, user: user };
  } catch (error) {
    return { valid: false };
  }
}

function firstTimeAdminSetup(bootstrapPassword, newMobileNumber, newPassword) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(DFM_CONFIG.LOCK_TIMEOUT_MS);
    if (bootstrapPassword !== DFM_CONFIG.DEFAULT_SUPERADMIN_PASS) {
      return { success: false, error: 'Invalid bootstrap temporary password.' };
    }
    var normalizedMobile = normalizeMobileNumber(newMobileNumber);
    if (!isValidIndianMobile(normalizedMobile)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }
    if (typeof newPassword !== 'string' || newPassword.length < 10) {
      return { success: false, error: 'Password must be at least 10 characters long.' };
    }

    var usersSheet = getSheetOrNull('Users');
    if (!usersSheet) return { success: false, error: 'Users database unavailable.' };
    var users = getSheetRowsAsObjects(usersSheet);
    var adminIndex = users.findIndex(function (row) {
      return row.Role === 'SUPER_ADMIN' || row.Username === DFM_CONFIG.DEFAULT_SUPERADMIN_USER;
    });
    if (adminIndex < 0) return { success: false, error: 'Pending super-admin account was not found.' };

    var admin = users[adminIndex];
    if (admin.Status !== 'ACTIVE' || admin.MustChangePassword !== 'YES' ||
        admin.NormalizedMobile || !admin.PasswordSalt ||
        hashPassword(bootstrapPassword, admin.PasswordSalt) !== admin.PasswordHash) {
      return { success: false, error: 'Initial administrator setup has already been completed.' };
    }
    var duplicate = users.some(function (row) {
      return row.UserID !== admin.UserID && row.Status === 'ACTIVE' &&
        normalizeMobileNumber(row.NormalizedMobile || row.MobileNumber) === normalizedMobile;
    });
    if (duplicate) {
      return { success: false, error: 'This mobile number is already registered to another account.' };
    }

    var rowNumber = adminIndex + 2;
    var salt = generateSalt();
    var passwordHash = hashPassword(newPassword, salt);
    var now = new Date().toISOString();
    var version = (Number(admin.SessionVersion) || 1) + 1;
    setSheetCellByHeader(usersSheet, rowNumber, 'MobileNumber', String(newMobileNumber));
    setSheetCellByHeader(usersSheet, rowNumber, 'NormalizedMobile', normalizedMobile);
    setSheetCellByHeader(usersSheet, rowNumber, 'PasswordSalt', salt);
    setSheetCellByHeader(usersSheet, rowNumber, 'PasswordHash', passwordHash);
    setSheetCellByHeader(usersSheet, rowNumber, 'MustChangePassword', 'NO');
    setSheetCellByHeader(usersSheet, rowNumber, 'SessionVersion', version);
    setSheetCellByHeader(usersSheet, rowNumber, 'UpdatedAt', now);

    var updatedAdmin = Object.assign({}, admin, {
      MobileNumber: String(newMobileNumber),
      NormalizedMobile: normalizedMobile,
      PasswordSalt: salt,
      PasswordHash: passwordHash,
      MustChangePassword: 'NO',
      SessionVersion: version,
      UpdatedAt: now
    });
    logAudit('FIRST_TIME_ADMIN_SETUP', 'USER', admin.UserID, 'One-time administrator setup completed');
    return {
      success: true,
      token: generateSessionToken(updatedAdmin),
      message: 'Administrator setup completed. Sign in with the registered mobile number and new password.',
      user: {
        userId: admin.UserID,
        role: 'SUPER_ADMIN',
        mobile: normalizedMobile,
        fullName: admin.Username || 'Super Administrator'
      }
    };
  } catch (error) {
    return { success: false, error: 'Administrator setup could not be completed.' };
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function getStudentPortfolio(studentId) {
  if (!studentId) return { success: false, error: 'Student ID required.' };
  var studentSheet = getSheetOrNull('Students');
  var submissionsSheet = getSheetOrNull('Submissions');
  var students = studentSheet ? getSheetRowsAsObjects(studentSheet) : [];
  var student = students.find(function (row) {
    return String(row.StudentID) === String(studentId);
  });
  if (!student) return { success: false, error: 'Student not found.' };

  var submissions = submissionsSheet ? getSheetRowsAsObjects(submissionsSheet)
    .filter(function (row) {
      return String(row.StudentID) === String(studentId) &&
        row.UploadStatus === 'COMPLETED' && row.PublicationStatus === 'PUBLISHED';
    })
    .map(function (row) {
      return {
        submissionId: row.SubmissionID,
        title: row.Title,
        description: row.Description,
        challengeId: row.ChallengeID,
        thumbnailUrl: getDriveThumbnailUrl(row.ThumbnailFileID || row.MainFileID),
        viewUrl: getDrivePreviewUrl(row.MainFileID),
        submittedAt: row.SubmittedAt
      };
    }) : [];

  var publicProfile = student.PublicProfileStatus === 'ACTIVE';
  return {
    success: true,
    student: {
      studentId: student.StudentID,
      fullName: student.FullName,
      teamId: student.TeamID,
      profilePhotoUrl: publicProfile ? getDriveThumbnailUrl(student.ProfilePhotoFileID) : '',
      score: publicProfile ? (Number(student.IndividualScoreCache) || 0) : 0,
      rank: publicProfile ? (student.RankCache || '-') : '-'
    },
    submissions: submissions
  };
}

function getTeamPortfolio(teamId) {
  if (!teamId) return { success: false, error: 'Team ID required.' };
  var teamsSheet = getSheetOrNull('Teams');
  var submissionsSheet = getSheetOrNull('Submissions');
  var team = teamsSheet ? getSheetRowsAsObjects(teamsSheet).find(function (row) {
    return String(row.TeamID) === String(teamId);
  }) : null;
  if (!team) return { success: false, error: 'Team not found.' };

  var submissions = submissionsSheet ? getSheetRowsAsObjects(submissionsSheet)
    .filter(function (row) {
      return String(row.TeamID) === String(teamId) &&
        row.UploadStatus === 'COMPLETED' && row.PublicationStatus === 'PUBLISHED';
    })
    .map(function (row) {
      return {
        submissionId: row.SubmissionID,
        title: row.Title,
        description: row.Description,
        challengeId: row.ChallengeID,
        thumbnailUrl: getDriveThumbnailUrl(row.ThumbnailFileID || row.MainFileID),
        viewUrl: getDrivePreviewUrl(row.MainFileID),
        submittedAt: row.SubmittedAt
      };
    }) : [];

  return {
    success: true,
    team: {
      teamId: team.TeamID,
      teamName: team.TeamName,
      description: team.Description,
      teamColor: team.TeamColor,
      score: Number(team.TotalScoreCache) || 0,
      rank: Number(team.RankCache) || '-'
    },
    submissions: submissions
  };
}

// Enforce student ownership on private portfolio routes before delegating to the
// existing router. Public actions and admin/judge access retain legacy behavior.
var DFM_BASE_ROUTE_ACTION = routeAction;
routeAction = function (action, data, authToken) {
  data = data || {};
  if (action === 'getMySubmissions' || action === 'getStudentPortfolio' || action === 'getTeamPortfolio') {
    var session = verifyAuthSession(authToken || data.authToken);
    if (!session.valid) return DFM_BASE_ROUTE_ACTION(action, data, authToken);

    var role = session.user.Role;
    var privileged = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'JUDGE';
    if (role === 'STUDENT') {
      if (!session.user.StudentID) {
        return { success: false, error: 'Student account is not linked to a student profile.' };
      }
      if (action === 'getStudentPortfolio' && data.studentId &&
          String(data.studentId) !== String(session.user.StudentID)) {
        return { success: false, error: 'Permission denied.' };
      }
      if (action === 'getTeamPortfolio' && data.teamId &&
          String(data.teamId) !== String(session.user.TeamID || '')) {
        return { success: false, error: 'Permission denied.' };
      }
      if (action === 'getStudentPortfolio') {
        data = Object.assign({}, data, { studentId: session.user.StudentID });
      } else if (action === 'getTeamPortfolio') {
        data = Object.assign({}, data, { teamId: session.user.TeamID });
      } else {
        data = Object.assign({}, data, { studentId: session.user.StudentID });
      }
    } else if (!privileged && action !== 'getMySubmissions') {
      return { success: false, error: 'Permission denied.' };
    }
  }
  return DFM_BASE_ROUTE_ACTION(action, data, authToken);
};
