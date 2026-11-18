/**
 * EDUConnect - Administrator Dashboard Script (admin.js)
 * Created for CSE 242 University Project
 *
 * Powers the administrative management portal:
 * - Real-time statistics (total students, verified clubs, pending verifications, active moderation reports)
 * - Academic verification workflow (Approve/Reject student IDs & club charters)
 * - User directory & fast verification toggles
 * - Registered clubs directory overview
 * - Moderation reports resolution queue (Dismiss vs Take Down content)
 */

/* ==========================================================================
   1. Lifecycle & Page Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-metrics-container')) {
    initAdminDashboard();
  }
});

/**
 * Initializes all administrative tables, metrics counters, and moderation queues.
 */
function initAdminDashboard() {
  renderAdminStats();
  renderVerificationsTable();
  renderUsersTable();
  renderClubsTable();
  renderReportsTable();
}

/* ==========================================================================
   2. System Metrics & Statistics Overview
   ========================================================================== */

/**
 * Calculates and updates aggregate metric summary cards:
 * total students, active clubs, pending academic verifications, and active reports.
 */
function renderAdminStats() {
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  const verifications = getStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
  const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);

  const pendingVerifs = verifications.filter(v => v.status === 'Pending').length;
  const pendingReports = reports.filter(r => r.status === 'Pending Review').length;

  const statStudents = document.getElementById('stat-total-students');
  const statClubs = document.getElementById('stat-total-clubs');
  const statVerifs = document.getElementById('stat-pending-verifs');
  const statReports = document.getElementById('stat-active-reports');

  if (statStudents) statStudents.textContent = students.length;
  if (statClubs) statClubs.textContent = clubs.length;
  if (statVerifs) statVerifs.textContent = pendingVerifs;
  if (statReports) statReports.textContent = pendingReports;
}

/* ==========================================================================
   3. Academic Verifications Queue (Students & Clubs)
   ========================================================================== */

/**
 * Renders the verification requests table with identity details, academic documents,
 * and inline Approve / Reject action buttons.
 */
function renderVerificationsTable() {
  const tableBody = document.getElementById('verifications-table-body');
  if (!tableBody) return;

  const verifications = getStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);

  if (verifications.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">No verification requests found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = verifications.map(item => {
    let statusClass = 'status-pending';
    if (item.status === 'Approved') statusClass = 'status-verified';
    if (item.status === 'Rejected') statusClass = 'status-rejected';

    const safeName = escapeHtml(item.name);
    const safeIdentifier = escapeHtml(item.identifier);
    const safeDept = escapeHtml(item.department);
    const safeDoc = escapeHtml(item.proofDocument);
    const safeDate = escapeHtml(item.submittedAt);
    const safeStatus = escapeHtml(item.status);

    return `
      <tr>
        <td>
          <span class="badge ${item.type === 'student' ? 'bg-primary' : 'bg-info'} text-capitalize">
            ${escapeHtml(item.type)}
          </span>
        </td>
        <td>
          <div class="fw-bold text-dark">${safeName}</div>
          <div class="small text-muted">${safeIdentifier}</div>
        </td>
        <td><span class="badge-dept">${safeDept}</span></td>
        <td>
          <span class="small text-primary cursor-pointer" onclick="viewProofDoc('${safeDoc}')">
            <i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i>${safeDoc}
          </span>
          <div class="small text-muted" style="font-size: 0.72rem;">${safeDate}</div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">
            ${safeStatus}
          </span>
        </td>
        <td>
          ${item.status === 'Pending' ? `
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success" onclick="handleVerificationAction('${item.id}', 'Approved')" title="Approve Request">
                <i class="bi bi-check-lg"></i> Approve
              </button>
              <button class="btn btn-outline-danger" onclick="handleVerificationAction('${item.id}', 'Rejected')" title="Reject Request">
                <i class="bi bi-x-lg"></i> Reject
              </button>
            </div>
          ` : `
            <span class="small text-muted"><i class="bi bi-shield-check me-1"></i>Action Completed</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Processes an administrative decision (Approved / Rejected) on a verification item:
 * - Updates the record status in the verification queue.
 * - If approving/rejecting a student, automatically updates their profile status in the Students dataset.
 * - Refreshes the dashboard metrics and tables.
 *
 * @param {string} verifId - Verification record identifier.
 * @param {'Approved'|'Rejected'} newStatus - New status to apply.
 */
function handleVerificationAction(verifId, newStatus) {
  const verifications = getStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
  const item = verifications.find(v => v.id === verifId);
  if (!item) return;

  item.status = newStatus;
  setStorage(STORAGE_KEYS.VERIFICATIONS, verifications);

  // If this was a student, update the student record in LocalStorage
  if (item.type === 'student') {
    const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const std = students.find(s => s.id === item.targetId || s.name === item.name);
    if (std) {
      std.status = newStatus === 'Approved' ? 'Verified' : 'Verification Rejected';
      setStorage(STORAGE_KEYS.STUDENTS, students);
    }
  }

  showToast(`Verification for ${item.name} marked as ${newStatus}!`, newStatus === 'Approved' ? 'success' : 'warning');
  initAdminDashboard();
}

/* ==========================================================================
   4. User Accounts Directory Table
   ========================================================================== */

/**
 * Renders all registered student users with quick profile preview and status toggle links.
 */
function renderUsersTable() {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

  tbody.innerHTML = students.map(student => {
    const safeName = escapeHtml(student.name);
    const safeEmail = escapeHtml(student.email);
    const safeId = escapeHtml(student.studentId);
    const safeDept = escapeHtml(student.department);
    const safeStatus = escapeHtml(student.status);
    const safeAvatar = student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${safeAvatar}" alt="${safeName}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
            <div>
              <div class="fw-bold text-dark">${safeName}</div>
              <div class="small text-muted">${safeEmail}</div>
            </div>
          </div>
        </td>
        <td><span class="small font-monospace">${safeId}</span></td>
        <td><span class="badge-dept">${safeDept}</span></td>
        <td>
          <span class="status-pill ${student.status === 'Verified' ? 'status-verified' : 'status-pending'}">
            ${safeStatus}
          </span>
        </td>
        <td>
          <div class="btn-group btn-group-sm">
            <a href="profile.html?id=${student.id}" class="btn btn-outline-secondary" title="View Profile">
              <i class="bi bi-eye"></i>
            </a>
            <button class="btn btn-outline-primary" onclick="toggleStudentVerifiedState('${student.id}')" title="Toggle Verification Status">
              <i class="bi bi-patch-check"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Toggles a student's verification status directly from the user administration table.
 *
 * @param {string} studentId - Unique ID of the student.
 */
function toggleStudentVerifiedState(studentId) {
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  student.status = student.status === 'Verified' ? 'Pending Verification' : 'Verified';
  setStorage(STORAGE_KEYS.STUDENTS, students);
  showToast(`Updated ${student.name}'s status to ${student.status}.`, 'info');
  initAdminDashboard();
}

/* ==========================================================================
   5. Registered Clubs Directory Table
   ========================================================================== */

/**
 * Renders all university clubs, their faculty advisors, membership count, and recruitment status.
 */
function renderClubsTable() {
  const tbody = document.getElementById('admin-clubs-table-body');
  if (!tbody) return;

  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);

  tbody.innerHTML = clubs.map(club => {
    const safeName = escapeHtml(club.name);
    const safeCategory = escapeHtml(club.category);
    const safeAdvisor = escapeHtml(club.advisor ? club.advisor.split(',')[0] : 'Faculty Advisor');

    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${club.logo}" alt="${safeName}" class="rounded" style="width: 32px; height: 32px; object-fit: cover;">
            <div class="fw-bold text-dark">${safeName}</div>
          </div>
        </td>
        <td><span class="badge-dept">${safeCategory}</span></td>
        <td><span class="small text-muted">${safeAdvisor}</span></td>
        <td><span class="fw-semibold">${club.membersCount}</span> members</td>
        <td>
          <span class="badge ${club.isRecruiting ? 'bg-success' : 'bg-secondary'}">
            ${club.isRecruiting ? 'Active' : 'Closed'}
          </span>
        </td>
        <td>
          <a href="club-profile.html?id=${club.id}" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-eye"></i> View
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

/* ==========================================================================
   6. Moderation Reports & Community Safety
   ========================================================================== */

/**
 * Renders the moderation reports queue with flagged content titles, reporters,
 * reported reasons, and resolution action buttons.
 */
function renderReportsTable() {
  const tbody = document.getElementById('admin-reports-table-body');
  if (!tbody) return;

  const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);

  if (reports.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">All reports resolved! No pending flags.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reports.map(rep => {
    const safeTitle = escapeHtml(rep.targetTitle);
    const safeReporter = escapeHtml(rep.reportedBy);
    const safeReason = escapeHtml(rep.reason);
    const safeTimestamp = escapeHtml(rep.timestamp);
    const safeStatus = escapeHtml(rep.status);

    return `
      <tr>
        <td>
          <div class="fw-bold text-dark">${safeTitle}</div>
          <div class="small text-muted"><span class="badge bg-light text-dark border">${escapeHtml(rep.type.toUpperCase())}</span> ${safeTimestamp}</div>
        </td>
        <td><span class="small text-muted">${safeReporter}</span></td>
        <td><span class="small text-danger">${safeReason}</span></td>
        <td>
          <span class="badge ${rep.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}">
            ${safeStatus}
          </span>
        </td>
        <td>
          ${rep.status !== 'Resolved' ? `
            <div class="btn-group btn-group-sm">
              <button class="btn btn-sm btn-outline-success" onclick="resolveReportAction('${rep.id}', 'Resolved')" title="Dismiss Report">
                <i class="bi bi-check2"></i> Dismiss
              </button>
              <button class="btn btn-sm btn-danger text-white" onclick="resolveReportAction('${rep.id}', 'Content Removed')" title="Remove Flagged Content">
                <i class="bi bi-trash"></i> Take Down
              </button>
            </div>
          ` : `
            <span class="small text-muted"><i class="bi bi-check-all me-1"></i>Handled</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Resolves an active moderation report item:
 *
 * @param {string} reportId - ID of the report.
 * @param {string} actionTaken - Action description ('Resolved' vs 'Content Removed').
 */
function resolveReportAction(reportId, actionTaken) {
  const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  const rep = reports.find(r => r.id === reportId);
  if (!rep) return;

  rep.status = 'Resolved';
  setStorage(STORAGE_KEYS.REPORTS, reports);

  showToast(`Report on "${rep.targetTitle}" processed: ${actionTaken}`, 'success');
  initAdminDashboard();
}

/**
 * Simulates previewing an uploaded academic verification PDF document.
 *
 * @param {string} filename - The name of the proof document.
 */
function viewProofDoc(filename) {
  alert(
    `[SIMULATED DOCUMENT VIEWER]\nViewing Academic Verification Document:\n${filename}\n\nIn the full production environment, this downloads or securely streams the verified credential from /uploads/documents.`
  );
}
