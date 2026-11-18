/**
 * EDUConnect - Authentication & Registration Handler (auth.js)
 * Created for CSE 242 University Project (Fall 2026)
 *
 * Manages authentic university login authentication, student registration,
 * club charter applications, client-side input validations, and active session routing.
 */

/* ==========================================================================
   1. Initialization & Event Binding
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Login Page Setup
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLoginSubmit();
    });
  }

  // 2. Student Registration Form Setup
  const studentRegForm = document.getElementById('student-reg-form');
  if (studentRegForm) {
    studentRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleStudentRegistration();
    });
  }

  // 3. Club Charter Application Form Setup
  const clubRegForm = document.getElementById('club-reg-form');
  if (clubRegForm) {
    clubRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleClubRegistration();
    });
  }

  // 4. Logout Action Triggers
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
});

/* ==========================================================================
   2. Authentication Handlers
   ========================================================================== */

/**
 * Validates login form inputs, authenticates against the MySQL-backed PHP API
 * (falling back to LocalStorage accounts when the API is unreachable),
 * verifies passwords, and redirects to the target portal or redirect parameter.
 */
async function handleLoginSubmit() {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const roleSelect = document.getElementById('login-role');
  const alertBox = document.getElementById('login-alert');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const selectedRole = roleSelect ? roleSelect.value : 'student';

  // 1. Validate presence
  if (!email || !password) {
    showAlert(alertBox, 'Please enter both your university email and password.', 'danger');
    return;
  }

  // 2. Validate email format
  if (!email.includes('@')) {
    showAlert(alertBox, 'Please enter a valid educational email address.', 'danger');
    return;
  }

  let authenticatedUser = null;

  // 3. Primary path: authenticate against the MySQL users table via the PHP API
  if (window.EDUApi) {
    const result = await EDUApi.request('auth.php', { action: 'login', email: email, password: password });

    if (result && result.ok && result.user) {
      authenticatedUser = result.user;
      completeLogin(authenticatedUser);
      return;
    }

    if (result && result.ok === false && result.status !== 503) {
      // The API responded authoritatively (invalid credentials etc.)
      showAlert(alertBox, 'Incorrect email or password. Please verify your university credentials.', 'danger');
      return;
    }
    // result === null: API unreachable -> continue with LocalStorage fallback below
  }

  // Case 1: Faculty / Administrator Authentication
  const adminEmails = ['saraf.anika@faculty.edu', 'admin@edu.ac.bd', 'admin.connect@edu.ac.bd'];
  if (adminEmails.includes(email) || selectedRole === 'admin') {
    if (adminEmails.includes(email)) {
      if (password !== (window.FACULTY_ADMIN ? window.FACULTY_ADMIN.password : 'admin123')) {
        showAlert(alertBox, 'Incorrect password for Faculty Administrator account.', 'danger');
        return;
      }
      authenticatedUser = window.FACULTY_ADMIN || {
        id: 'admin_01',
        studentId: 'FACULTY-CSE-242',
        name: 'Saraf Anika (Asst. Professor & Faculty Admin)',
        email: email,
        role: 'admin',
        department: 'CSE, SoSET, East Delta University',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        status: 'Verified',
        followingClubs: ['club_01', 'club_02', 'club_03', 'club_04', 'club_05', 'club_06'],
        connectedStudents: []
      };
    } else {
      showAlert(alertBox, 'Unrecognized administrator email address. Please verify your faculty credentials.', 'danger');
      return;
    }
  }
  // Case 2: Club Representative Authentication
  else if (email === 'robotics.lead@student.edu' || selectedRole === 'club_rep') {
    if (email === 'robotics.lead@student.edu') {
      if (password !== 'clubrep123') {
        showAlert(alertBox, 'Incorrect password for Club Representative account.', 'danger');
        return;
      }
      authenticatedUser = {
        id: 'club_rep_01',
        studentId: '243007712',
        name: 'Pritam Barua (EDURC President)',
        email: 'robotics.lead@student.edu',
        role: 'club_rep',
        clubId: 'club_02',
        department: 'Computer Science & Engineering',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        status: 'Verified',
        followingClubs: ['club_02'],
        connectedStudents: ['std_01', 'std_03']
      };
    } else {
      showAlert(alertBox, 'Unrecognized club representative email address.', 'danger');
      return;
    }
  }
  // Case 3: Registered Students in LocalStorage / Seed
  else {
    const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const foundStudent = students.find(s => s.email.toLowerCase() === email);

    if (foundStudent) {
      const validPassword = foundStudent.password || 'student123';
      if (password !== validPassword) {
        showAlert(alertBox, `Incorrect password for ${escapeHtml(foundStudent.name)}. Please try again.`, 'danger');
        return;
      }
      authenticatedUser = foundStudent;
    } else {
      showAlert(alertBox, `No registered student account found for "${escapeHtml(email)}". Please verify your university email or create an account.`, 'danger');
      return;
    }
  }

  // 3. Save session and route
  completeLogin(authenticatedUser);
}

/**
 * Persists the authenticated session, displays the welcome toast and routes
 * the user to their portal (admin dashboard, redirect target or main dashboard).
 *
 * @param {Object} authenticatedUser - Mapped user object stored in the session.
 */
function completeLogin(authenticatedUser) {
  setStorage(STORAGE_KEYS.CURRENT_USER, authenticatedUser);
  showToast(`Welcome back, ${escapeHtml(authenticatedUser.name)}!`, 'success');

  // Handle redirect target if redirected from a protected page
  const params = new URLSearchParams(window.location.search);
  const redirectTarget = params.get('redirect');

  setTimeout(() => {
    if (redirectTarget && !redirectTarget.includes('login.html')) {
      if (redirectTarget === 'admin.html' && authenticatedUser.role !== 'admin') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = redirectTarget;
      }
    } else if (authenticatedUser.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }, 600);
}

/* ==========================================================================
   3. Registration Handlers
   ========================================================================== */

/**
 * Validates and processes a new student account registration submission:
 * - Checks password length and confirmation match.
 * - Persists the account to MySQL via the PHP API (LocalStorage fallback when offline).
 * - Enqueues a verification request in the Admin dashboard queue.
 * - Sets the new user as active session.
 */
async function handleStudentRegistration() {
  const studentIdEl = document.getElementById('reg-student-id');
  const nameEl = document.getElementById('reg-name');
  const emailEl = document.getElementById('reg-email');
  const deptEl = document.getElementById('reg-department');
  const passwordEl = document.getElementById('reg-password');
  const confirmPasswordEl = document.getElementById('reg-confirm-password');
  const alertBox = document.getElementById('reg-alert');

  if (!studentIdEl || !nameEl || !emailEl || !deptEl || !passwordEl || !confirmPasswordEl) return;

  const studentId = studentIdEl.value.trim();
  const fullName = nameEl.value.trim();
  const email = emailEl.value.trim();
  const department = deptEl.value;
  const password = passwordEl.value;
  const confirmPassword = confirmPasswordEl.value;

  // 1. Required fields check
  if (!studentId || !fullName || !email || !department || !password) {
    showAlert(alertBox, 'Please complete all required fields.', 'danger');
    return;
  }

  // 2. Minimum password length check
  if (password.length < 6) {
    showAlert(alertBox, 'Password must be at least 6 characters long.', 'danger');
    return;
  }

  // 3. Password confirmation check
  if (password !== confirmPassword) {
    showAlert(alertBox, 'Passwords do not match. Please re-enter your password.', 'danger');
    return;
  }

  // 4. Primary path: register the account in MySQL via the PHP API
  if (window.EDUApi) {
    const result = await EDUApi.request('auth.php', {
      action: 'register_student',
      studentId: studentId,
      name: fullName,
      email: email,
      password: password,
      department: department
    });

    if (result && result.ok && result.user) {
      // Registration persisted in the database; establish the session
      setStorage(STORAGE_KEYS.CURRENT_USER, result.user);
      showToast('Registration successful! Profile submitted for admin verification.', 'success');
      showRegistrationSuccess();
      return;
    }

    if (result && result.ok === false && result.status !== 503) {
      // The API rejected the registration authoritatively (duplicate id/email etc.)
      showAlert(alertBox, result.error || 'Registration failed. Please review your details and try again.', 'danger');
      return;
    }
    // result === null: API unreachable -> continue with LocalStorage fallback below
  }

  // 5. Duplicate identity check (LocalStorage fallback)
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const isDuplicate = students.some(s => 
    s.email.toLowerCase() === email.toLowerCase() || s.studentId === studentId
  );

  if (isDuplicate) {
    showAlert(alertBox, 'A student with this Student ID or Email is already registered.', 'danger');
    return;
  }

  // 6. Construct new student model
  const newStudent = {
    id: 'std_' + Date.now(),
    studentId: studentId,
    name: fullName,
    email: email,
    password: password,
    role: 'student',
    department: department,
    semester: '1st Semester',
    cgpa: 'Pending',
    bio: `Undergraduate student at Department of ${department}. Interested in learning and expanding professional network.`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    skills: ['Communication', 'Teamwork', 'Problem Solving'],
    interests: ['Campus Clubs', 'Skill Development'],
    achievements: ['New Member of EDUConnect Community'],
    clubs: [],
    status: 'Pending Verification',
    connectionsCount: 0,
    followingClubs: [],
    connectedStudents: []
  };

  // 7. Save to Students collection
  students.push(newStudent);
  setStorage(STORAGE_KEYS.STUDENTS, students);

  // 8. Enqueue verification request for the Admin Moderation Dashboard
  const verifications = getStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
  verifications.push({
    id: 'verif_' + Date.now(),
    type: 'student',
    targetId: newStudent.id,
    name: newStudent.name,
    identifier: `Student ID: ${newStudent.studentId}`,
    department: newStudent.department,
    submittedAt: new Date().toLocaleString(),
    proofDocument: `Student_ID_Scan_${newStudent.studentId}.pdf`,
    status: 'Pending'
  });
  setStorage(STORAGE_KEYS.VERIFICATIONS, verifications);

  // 9. Establish active session
  setStorage(STORAGE_KEYS.CURRENT_USER, newStudent);

  // 10. Display success feedback & route
  showToast('Registration successful! Profile submitted for admin verification.', 'success');
  showRegistrationSuccess();
}

/**
 * Presents the registration success modal (or routes to the dashboard when
 * the modal component is unavailable).
 */
function showRegistrationSuccess() {
  const successModal = document.getElementById('regSuccessModal');
  if (successModal && window.bootstrap) {
    const modal = new bootstrap.Modal(successModal);
    modal.show();
  } else {
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  }
}

/**
 * Validates and processes a new student club charter application,
 * submitting the proposal to the Student Affairs Council review queue.
 */
async function handleClubRegistration() {
  const clubNameEl = document.getElementById('club-name');
  const categoryEl = document.getElementById('club-category');
  const leadNameEl = document.getElementById('club-lead-name');
  const leadEmailEl = document.getElementById('club-lead-email');
  const advisorEl = document.getElementById('club-advisor');
  const descriptionEl = document.getElementById('club-description');
  const alertBox = document.getElementById('club-reg-alert');

  if (!clubNameEl || !categoryEl || !leadNameEl || !leadEmailEl || !advisorEl) return;

  const clubName = clubNameEl.value.trim();
  const category = categoryEl.value;
  const leadName = leadNameEl.value.trim();
  const leadEmail = leadEmailEl.value.trim();
  const advisor = advisorEl.value.trim();
  const description = descriptionEl ? descriptionEl.value.trim() : '';

  // Required fields check
  if (!clubName || !category || !leadName || !leadEmail || !advisor) {
    showAlert(alertBox, 'Please complete all required fields for club charter registration.', 'danger');
    return;
  }

  // Primary path: record the charter application in MySQL via the PHP API
  if (window.EDUApi) {
    const result = await EDUApi.request('auth.php', {
      action: 'register_club_charter',
      clubName: clubName,
      category: category,
      leadName: leadName,
      leadEmail: leadEmail,
      advisor: advisor,
      description: description
    });

    if (result && result.ok) {
      const safeClubName = escapeHtml(clubName);
      showAlert(
        alertBox,
        `Success! Your club charter application for "${safeClubName}" has been submitted to the Student Affairs Council for verification.`,
        'success'
      );
      showToast('Club application submitted for review!', 'success');
      return;
    }
    // API unreachable -> fall through to LocalStorage persistence below
  }

  // Fallback: Enqueue new club charter verification in Admin dashboard
  const verifications = getStorage(STORAGE_KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS);
  verifications.push({
    id: 'verif_' + Date.now(),
    type: 'club',
    targetId: 'club_' + Date.now(),
    name: clubName,
    identifier: `Advisor: ${advisor} | Lead: ${leadName}`,
    department: category,
    submittedAt: new Date().toLocaleString(),
    proofDocument: `${clubName.replace(/\s+/g, '_')}_Charter_Document.pdf`,
    status: 'Pending'
  });
  setStorage(STORAGE_KEYS.VERIFICATIONS, verifications);

  const safeClubName = escapeHtml(clubName);
  showAlert(
    alertBox,
    `Success! Your club charter application for "${safeClubName}" has been submitted to the Student Affairs Council for verification.`,
    'success'
  );
  showToast('Club application submitted for review!', 'success');
}

/**
 * Clears current session from storage and navigates to the login screen.
 */
function handleLogout() {
  setStorage(STORAGE_KEYS.CURRENT_USER, null);
  showToast('You have been logged out.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

/* ==========================================================================
   4. UI Helpers
   ========================================================================== */

/**
 * Renders an accessible Bootstrap alert banner inside a form container.
 *
 * @param {HTMLElement|null} alertEl - Target alert container element.
 * @param {string} message - Message text to present.
 * @param {'danger'|'success'|'warning'|'info'} [type='danger'] - Bootstrap alert color style.
 */
function showAlert(alertEl, message, type = 'danger') {
  if (!alertEl) return;
  alertEl.className = `alert alert-${type} mt-3 mb-3 d-flex align-items-center gap-2`;
  alertEl.innerHTML = `
    <i class="bi ${type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} fs-5 flex-shrink-0"></i>
    <div>${message}</div>
  `;
  alertEl.classList.remove('d-none');
}
