/**
 * EDUConnect - Administrator Dashboard Script (admin.js)
 * Created for CSE 242 University Project
 * Handles System Metrics, Student/Club Verifications (Approve/Reject), User Management, and Moderation Reports.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-metrics-container')) {
    initAdminDashboard();
  }
});

function initAdminDashboard() {
  renderAdminStats();
  renderVerificationsTable();
  renderUsersTable();
  renderClubsTable();
  renderReportsTable();
}

/**
 * 1. Render Statistic Metrics Cards
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

/**
 * 2. Render Verifications Table
 */
function renderVerificationsTable() {
  const tableBody = document.getElementById('verifications-table-body');
  if (!tableBody) return;

  const verifications = getStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);

  if (verifications.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No verification requests found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = verifications.map(item => {
    let statusClass = 'status-pending';
    if (item.status === 'Approved') statusClass = 'status-verified';
    if (item.status === 'Rejected') statusClass = 'status-rejected';

    return `
      <tr>
        <td>
          <span class="badge ${item.type === 'student' ? 'bg-primary' : 'bg-info'} text-capitalize">
            ${item.type}
          </span>
        </td>
        <td>
          <div class="fw-bold text-dark">${item.name}</div>
          <div class="small text-muted">${item.identifier}</div>
        </td>
        <td><span class="badge-dept">${item.department}</span></td>
        <td>
          <span class="small text-primary cursor-pointer" onclick="viewProofDoc('${item.proofDocument}')">
            <i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i>${item.proofDocument}
          </span>
          <div class="small text-muted" style="font-size: 0.72rem;">${item.submittedAt}</div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">
            ${item.status}
          </span>
        </td>
        <td>
          ${item.status === 'Pending' ? `
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success" onclick="handleVerificationAction('${item.id}', 'Approved')">
                <i class="bi bi-check-lg"></i> Approve
              </button>
              <button class="btn btn-outline-danger" onclick="handleVerificationAction('${item.id}', 'Rejected')">
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
 * Handle Approve or Reject of a verification request
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

/**
 * 3. Render Users Directory Table
 */
function renderUsersTable() {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

  tbody.innerHTML = students.map(student => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${student.avatar}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
          <div>
            <div class="fw-bold text-dark">${student.name}</div>
            <div class="small text-muted">${student.email}</div>
          </div>
        </div>
      </td>
      <td><span class="small font-monospace">${student.studentId}</span></td>
      <td><span class="badge-dept">${student.department}</span></td>
      <td>
        <span class="status-pill ${student.status === 'Verified' ? 'status-verified' : 'status-pending'}">
          ${student.status}
        </span>
      </td>
      <td>
        <div class="btn-group btn-group-sm">
          <a href="profile.html?id=${student.id}" class="btn btn-outline-secondary" title="View Profile">
            <i class="bi bi-eye"></i>
          </a>
          <button class="btn btn-outline-primary" onclick="toggleStudentVerifiedState('${student.id}')" title="Toggle Verification">
            <i class="bi bi-patch-check"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Toggle student verified status directly from user table
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

/**
 * 4. Render Clubs Directory Table
 */
function renderClubsTable() {
  const tbody = document.getElementById('admin-clubs-table-body');
  if (!tbody) return;

  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);

  tbody.innerHTML = clubs.map(club => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${club.logo}" class="rounded" style="width: 32px; height: 32px; object-fit: cover;">
          <div class="fw-bold text-dark">${club.name}</div>
        </div>
      </td>
      <td><span class="badge-dept">${club.category}</span></td>
      <td><span class="small text-muted">${club.advisor.split(',')[0]}</span></td>
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
  `).join('');
}

/**
 * 5. Render Moderation Reports Table
 */
function renderReportsTable() {
  const tbody = document.getElementById('admin-reports-table-body');
  if (!tbody) return;

  const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">All reports resolved! No pending flags.</td></tr>`;
    return;
  }

  tbody.innerHTML = reports.map(rep => `
    <tr>
      <td>
        <div class="fw-bold text-dark">${rep.targetTitle}</div>
        <div class="small text-muted"><span class="badge bg-light text-dark border">${rep.type.toUpperCase()}</span> ${rep.timestamp}</div>
      </td>
      <td><span class="small text-muted">${rep.reportedBy}</span></td>
      <td><span class="small text-danger">${rep.reason}</span></td>
      <td>
        <span class="badge ${rep.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}">
          ${rep.status}
        </span>
      </td>
      <td>
        ${rep.status !== 'Resolved' ? `
          <div class="btn-group btn-group-sm">
            <button class="btn btn-sm btn-outline-success" onclick="resolveReportAction('${rep.id}', 'Resolved')">
              <i class="bi bi-check2"></i> Dismiss
            </button>
            <button class="btn btn-sm btn-danger text-white" onclick="resolveReportAction('${rep.id}', 'Content Removed')">
              <i class="bi bi-trash"></i> Take Down
            </button>
          </div>
        ` : `
          <span class="small text-muted"><i class="bi bi-check-all me-1"></i>Handled</span>
        `}
      </td>
    </tr>
  `).join('');
}

/**
 * Resolve a moderation report
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
 * Simulated PDF Proof Document Preview
 */
function viewProofDoc(filename) {
  alert(`[SIMULATED DOCUMENT VIEWER]\nViewing Academic Verification Document:\n${filename}\n\nIn the full PHP/MySQL version, this will download or stream the verified document from /uploads/documents.`);
}
