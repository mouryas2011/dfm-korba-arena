 *my submissions* routes. The existing account convention is USR_<StudentID>.
    if (user.Role === 'STUDENT') {
      var studentsSheet = getSheetOrNull('Students');
      var students = studentsSheet ? getSheetRowsAsObjects(studentsSheet) : [];
      var student = students.find(function (row) {
        return 'USR_' + String(row.StudentID) === String(user.UserID);
      });
      // A non-empty sentinel prevents the legacy router's data.studentId fallback.
      user.StudentID = student ? student.StudentID : '__NO_LINKED_STUDENT__';
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
    if (adminIndex < 0) {
      return { success: false, error: 'Pending super-admin account was not found.' };
    }

    var admin = users[adminIndex];
    // This operation is strictly one-time: only the unconfigured seeded account
    // may use bootstrap credentials. Do not let the known default reset admin.
    if (admin.Status !== 'ACTIVE' || admin.MustChangePassword !== 'YES' ||
        admin.NormalizedMobile || !admin.PasswordSalt ||
        hashPassword(bootstrapPassword, admin.PasswordSalt) !== admin.PasswordHash) {
      return { success: false, error: 'Initial administrator setup has already been completed.' };
    }
    if (users.some(function (row) {
      return row.UserID !== admin.UserID && row.Status === 'ACTIVE' &&
        normalizeMobileNumber(row.NormalizedMobile || row.MobileNumber) === normalizedMobile;
    })) {
      return { success: false, error: 'This mobile number is already registered to another account.' };
    }

    var rowNumber = adminIndex + 2;
    var salt = generateSalt();
    var now = new Date().toISOString();
    var version = (Number(admin.SessionVersion) || 1) + 1;
    setSheetCellByHeader(usersSheet, rowNumber, 'MobileNumber', String(newMobileNumber));
    setSheetCellByHeader(usersSheet, rowNumber, 'NormalizedMobile', normalizedMobile);
    setSheetCellByHeader(usersSheet, rowNumber, 'PasswordSalt', salt);
    setSheetCellByHeader(usersSheet, rowNumber, 'PasswordHash', hashPassword(newPassword, salt));
    setSheetCellByHeader(usersSheet, rowNumber, 'MustChangePassword', 'NO');
    setSheetCellByHeader(usersSheet, rowNumber, 'SessionVersion', version);
    setSheetCellByHeader(usersSheet, rowNumber, 'UpdatedAt', now);

    var updatedAdmin = Object.assign({}, admin, {
      MobileNumber: String(newMobileNumber),
      NormalizedMobile: normalizedMobile,
      PasswordSalt: salt,
      PasswordHash: hashPassword(newPassword, salt),
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

// Portfolios exposed through the authenticated endpoints must not leak pending,
// rejected, or unpublished media. Public gallery behavior remains unchanged.
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

  return {
    success: true,
    student: {
      studentId: student.StudentID,
      fullName: student.FullName,
      teamId: student.TeamID,
      profilePhotoUrl: student.PublicProfileStatus === 'ACTIVE'
        ? getDriveThumbnailUrl(student.ProfilePhotoFileID) : '',
      score: student.PublicProfileStatus === 'ACTIVE'
        ? (Number(student.IndividualScoreCache) || 0) : 0,
      rank: student.PublicProfileStatus === 'ACTIVE' ? (student.RankCache || '-') : '-'
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
