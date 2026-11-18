/**
 * EDUConnect - Authentication & Registration Handler (auth.js)
 * Created for CSE 242 University Project
 * Handles Demo Logins, Account Creation, Form Validation, and Session Management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. LOGIN PAGE LOGIC
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    // Quick Demo Preset Autofill Buttons
    document.querySelectorAll('[data-demo-login]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const role = btn.getAttribute('data-demo-login');
        fillDemoCredentials(role);
      });
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLoginSubmit();
    });
  }

  // 2. REGISTRATION PAGE LOGIC
  const studentRegForm = document.getElementById('student-reg-form');
  if (studentRegForm) {
    studentRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleStudentRegistration();
    });
  }

  const clubRegForm = document.getElementById('club-reg-form');
  if (clubRegForm) {
    clubRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleClubRegistration();
    });
  }

  // 3. LOGOUT BUTTONS
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
});

/**
 * Fills login form inputs with selected demo credentials
 */
function fillDemoCredentials(role) {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const roleSelect = document.getElementById('login-role');

  if (!emailInput || !passwordInput) return;

  if (role === 'student') {
    emailInput.value = 'farhan.ahmed@student.edu';
    passwordInput.value = 'student123';
    if (roleSelect) roleSelect.value = 'student';
    showToast('Autofilled Student Demo Credentials (Farhan Ahmed)', 'info');
  } else if (role === 'club_rep') {
    emailInput.value = 'robotics.lead@student.edu';
    passwordInput.value = 'clubrep123';
    if (roleSelect) roleSelect.value = 'club_rep';
    showToast('Autofilled Club Representative Demo Credentials', 'info');
  } else if (role === 'admin') {
    emailInput.value = 'admin.connect@edu.ac.bd';
    passwordInput.value = 'admin123';
    if (roleSelect) roleSelect.value = 'admin';
    showToast('Autofilled Administrator Demo Credentials', 'info');
  }
}

/**
 * Validates and logs in the user
 */
function handleLoginSubmit() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const role = document.getElementById('login-role')?.value || 'student';
  const alertBox = document.getElementById('login-alert');

  if (!email || !password) {
    showAlert(alertBox, 'Please enter both your university email and password.', 'danger');
    return;
  }

  // Basic university email format check
  if (!email.includes('@')) {
    showAlert(alertBox, 'Please enter a valid educational email address.', 'danger');
    return;
  }

  // Check demo credentials
  if (email === DEMO_ACCOUNTS.admin.email) {
    setStorage(STORAGE_KEYS.CURRENT_USER, DEMO_ACCOUNTS.admin);
    showToast('Logged in as Administrator!', 'success');
    setTimeout(() => window.location.href = 'admin.html', 700);
    return;
  }

  if (email === DEMO_ACCOUNTS.club_rep.email) {
    setStorage(STORAGE_KEYS.CURRENT_USER, DEMO_ACCOUNTS.club_rep);
    showToast('Logged in as Club Representative!', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 700);
    return;
  }

  // Search existing registered students in LocalStorage
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const foundStudent = students.find(s => s.email.toLowerCase() === email.toLowerCase());

  if (foundStudent) {
    setStorage(STORAGE_KEYS.CURRENT_USER, foundStudent);
    showToast(`Welcome back, ${foundStudent.name}!`, 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 700);
    return;
  }

  // Demo fallback for test users
  const demoUser = {
    id: 'std_demo_' + Date.now(),
    studentId: '2024-1-00-' + Math.floor(100 + Math.random() * 900),
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email: email,
    role: role,
    department: 'Computer Science & Engineering',
    semester: '1st Semester',
    cgpa: 'N/A',
    bio: 'Freshly registered university student on EDUConnect.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    skills: ['General Computing', 'Communication'],
    interests: ['Networking', 'Extracurricular Activities'],
    achievements: [],
    clubs: [],
    status: 'Pending Verification',
    connectionsCount: 0,
    followingClubs: [],
    connectedStudents: []
  };

  setStorage(STORAGE_KEYS.CURRENT_USER, demoUser);
  showToast(`Welcome to EDUConnect, ${demoUser.name}!`, 'success');
  setTimeout(() => window.location.href = 'dashboard.html', 700);
}

/**
 * Handles new student registration
 */
function handleStudentRegistration() {
  const studentId = document.getElementById('reg-student-id').value.trim();
  const fullName = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const department = document.getElementById('reg-department').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const alertBox = document.getElementById('reg-alert');

  // Validations
  if (!studentId || !fullName || !email || !department || !password) {
    showAlert(alertBox, 'Please complete all required fields.', 'danger');
    return;
  }

  if (password.length < 6) {
    showAlert(alertBox, 'Password must be at least 6 characters long.', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showAlert(alertBox, 'Passwords do not match.', 'danger');
    return;
  }

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  if (students.some(s => s.email.toLowerCase() === email.toLowerCase() || s.studentId === studentId)) {
    showAlert(alertBox, 'A student with this Student ID or Email is already registered.', 'danger');
    return;
  }

  const newStudent = {
    id: 'std_' + Date.now(),
    studentId: studentId,
    name: fullName,
    email: email,
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

  // Add to students list
  students.push(newStudent);
  setStorage(STORAGE_KEYS.STUDENTS, students);

  // Add pending verification record for Admin dashboard
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

  // Set logged in session
  setStorage(STORAGE_KEYS.CURRENT_USER, newStudent);

  // Show status modal or redirect
  showToast('Registration successful! Profile submitted for admin verification.', 'success');
  const successModal = document.getElementById('regSuccessModal');
  if (successModal && window.bootstrap) {
    const modal = new bootstrap.Modal(successModal);
    modal.show();
  } else {
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  }
}

/**
 * Handles Club charter / application submission
 */
function handleClubRegistration() {
  const clubName = document.getElementById('club-name').value.trim();
  const category = document.getElementById('club-category').value;
  const leadName = document.getElementById('club-lead-name').value.trim();
  const leadEmail = document.getElementById('club-lead-email').value.trim();
  const advisor = document.getElementById('club-advisor').value.trim();
  const description = document.getElementById('club-description').value.trim();
  const alertBox = document.getElementById('club-reg-alert');

  if (!clubName || !category || !leadName || !leadEmail || !advisor) {
    showAlert(alertBox, 'Please complete all required fields for club charter registration.', 'danger');
    return;
  }

  // Add to Admin Verifications queue
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

  showAlert(alertBox, `Success! Your club charter application for "${clubName}" has been submitted to the Student Affairs Council for verification.`, 'success');
  showToast('Club application submitted for review!', 'success');
}

/**
 * Logs out user and returns to login page
 */
function handleLogout() {
  setStorage(STORAGE_KEYS.CURRENT_USER, null);
  showToast('You have been logged out.', 'info');
  setTimeout(() => window.location.href = 'login.html', 500);
}

/**
 * Helper to display alert banners in forms
 */
function showAlert(alertEl, message, type = 'danger') {
  if (!alertEl) return;
  alertEl.className = `alert alert-${type} mt-3 mb-3 d-flex align-items-center gap-2`;
  alertEl.innerHTML = `
    <i class="bi ${type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} fs-5"></i>
    <div>${message}</div>
  `;
  alertEl.classList.remove('d-none');
}
