/**
 * EDUConnect - Students Directory & Profile Script (students.js)
 * Created for CSE 242 University Project
 * Powers the Explore Students page (search, filter, connect) and Student Profile page (view & edit).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the Explore Students page
  if (document.getElementById('students-grid')) {
    initStudentsExplore();
  }

  // Check if we are on the Student Profile page
  if (document.getElementById('student-profile-container')) {
    initStudentProfile();
  }
});

/**
 * Explore Students Directory Logic
 */
function initStudentsExplore() {
  const searchInput = document.getElementById('student-search-input');
  const deptFilter = document.getElementById('student-dept-filter');
  const skillFilter = document.getElementById('student-skill-filter');
  const grid = document.getElementById('students-grid');
  const emptyState = document.getElementById('students-empty-state');
  const resultsCount = document.getElementById('students-count');

  function renderList() {
    const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const currentUser = getCurrentUser();
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : '';
    const selectedSkill = skillFilter ? skillFilter.value.toLowerCase() : '';

    const filtered = students.filter(student => {
      const matchesQuery = !query || 
        student.name.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query);

      const matchesDept = !selectedDept || student.department === selectedDept;

      const matchesSkill = !selectedSkill || 
        (student.skills && student.skills.some(s => s.toLowerCase().includes(selectedSkill))) ||
        (student.interests && student.interests.some(i => i.toLowerCase().includes(selectedSkill)));

      return matchesQuery && matchesDept && matchesSkill;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} student${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    grid.innerHTML = filtered.map(student => {
      const isSelf = currentUser && currentUser.id === student.id;
      const isConnected = currentUser && currentUser.connectedStudents && currentUser.connectedStudents.includes(student.id);

      const skillsHTML = (student.skills || []).slice(0, 3).map(skill => `
        <span class="skill-tag"><i class="bi bi-tag-fill" style="font-size: 0.65rem;"></i> ${skill}</span>
      `).join('');

      return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="edu-card edu-card-hover h-100 d-flex flex-column text-center p-3 position-relative">
            <!-- Verification Pill -->
            <div class="position-absolute top-0 end-0 m-3">
              <span class="status-pill ${student.status === 'Verified' ? 'status-verified' : 'status-pending'}">
                <i class="bi ${student.status === 'Verified' ? 'bi-patch-check-fill' : 'bi-hourglass-split'}"></i>
                ${student.status}
              </span>
            </div>

            <!-- Avatar -->
            <div class="mt-2 mb-3">
              <img src="${student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}" 
                   alt="${student.name}" class="avatar-img avatar-lg shadow-sm">
            </div>

            <h5 class="mb-1 text-truncate serif-heading" style="color: #3b0e17;">
              <a href="profile.html?id=${student.id}" class="text-decoration-none text-dark">${student.name}</a>
            </h5>
            <p class="text-muted small mb-2"><i class="bi bi-person-badge me-1"></i>${student.studentId}</p>
            <div class="mb-3">
              <span class="badge-dept">${student.department}</span>
            </div>

            <p class="small text-muted mb-3 flex-grow-1 text-start" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${student.bio || 'Undergraduate student at EDUConnect.'}
            </p>

            <div class="text-start mb-3">
              <div class="small fw-semibold text-muted mb-1">Key Skills:</div>
              <div>${skillsHTML || '<span class="text-muted small">No skills listed yet</span>'}</div>
            </div>

            <div class="border-top pt-3 d-flex gap-2">
              <a href="profile.html?id=${student.id}" class="btn btn-sm btn-edu-outline flex-grow-1">
                <i class="bi bi-person-fill"></i> View Profile
              </a>
              ${!isSelf ? `
                <button class="btn btn-sm ${isConnected ? 'btn-outline-danger' : 'btn-edu-primary'} flex-grow-1" 
                        onclick="toggleStudentConnection('${student.id}')">
                  <i class="bi ${isConnected ? 'bi-person-dash' : 'bi-person-plus'}"></i> 
                  ${isConnected ? 'Disconnect' : 'Connect'}
                </button>
              ` : `
                <a href="profile.html?id=${student.id}" class="btn btn-sm btn-light border flex-grow-1">
                  <i class="bi bi-pencil"></i> You
                </a>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Event Listeners for search & filters
  if (searchInput) searchInput.addEventListener('input', renderList);
  if (deptFilter) deptFilter.addEventListener('change', renderList);
  if (skillFilter) skillFilter.addEventListener('change', renderList);

  const clearBtn = document.getElementById('student-clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (deptFilter) deptFilter.value = '';
      if (skillFilter) skillFilter.value = '';
      renderList();
    });
  }

  // Initial render
  renderList();
}

/**
 * Connect or Disconnect with another student
 */
function toggleStudentConnection(targetStudentId) {
  let currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to connect with students.', 'warning');
    return;
  }

  let connected = currentUser.connectedStudents || [];
  const targetStudent = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS).find(s => s.id === targetStudentId);
  const targetName = targetStudent ? targetStudent.name : 'Student';

  if (connected.includes(targetStudentId)) {
    // Disconnect
    connected = connected.filter(id => id !== targetStudentId);
    currentUser.connectedStudents = connected;
    showToast(`Removed connection with ${targetName}.`, 'info');
  } else {
    // Connect
    connected.push(targetStudentId);
    currentUser.connectedStudents = connected;
    showToast(`Connected with ${targetName}!`, 'success');

    // Create a notification for demo simulation
    const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift({
      id: 'notif_' + Date.now(),
      type: 'connection',
      title: 'New Connection',
      message: `You connected with ${targetName}.`,
      timestamp: 'Just now',
      read: false,
      link: `profile.html?id=${targetStudentId}`
    });
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Save in LocalStorage
  setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);

  // Sync into students list
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const userIdx = students.findIndex(s => s.id === currentUser.id);
  if (userIdx !== -1) {
    students[userIdx].connectedStudents = connected;
    setStorage(STORAGE_KEYS.STUDENTS, students);
  }

  // Refresh view
  if (document.getElementById('students-grid')) {
    initStudentsExplore();
  }
}

/**
 * Student Profile Page Logic
 */
function initStudentProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');
  const currentUser = getCurrentUser();

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  let student = null;

  if (studentId) {
    student = students.find(s => s.id === studentId);
  }

  // Default to logged-in user if student not specified or not found
  if (!student) {
    student = currentUser || students[0];
  }

  const isSelf = currentUser && currentUser.id === student.id;

  // Render Cover & Header
  document.getElementById('profile-name').textContent = student.name;
  document.getElementById('profile-student-id').innerHTML = `<i class="bi bi-person-badge me-1"></i>${student.studentId || 'ID: 2023-1-60-045'}`;
  document.getElementById('profile-department').textContent = student.department;
  document.getElementById('profile-email').textContent = student.email;
  document.getElementById('profile-avatar').src = student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  document.getElementById('profile-bio').textContent = student.bio || 'Undergraduate student at EDUConnect.';

  // Academic Badges
  document.getElementById('profile-semester').textContent = student.semester || '6th Semester';
  document.getElementById('profile-cgpa').textContent = student.cgpa || '3.80';

  // Status Badge
  const statusBadge = document.getElementById('profile-status-badge');
  if (statusBadge) {
    statusBadge.className = `status-pill ${student.status === 'Verified' ? 'status-verified' : 'status-pending'}`;
    statusBadge.innerHTML = `<i class="bi ${student.status === 'Verified' ? 'bi-patch-check-fill' : 'bi-hourglass-split'}"></i> ${student.status || 'Verified'}`;
  }

  // Skills
  const skillsContainer = document.getElementById('profile-skills-container');
  if (skillsContainer) {
    if (student.skills && student.skills.length > 0) {
      skillsContainer.innerHTML = student.skills.map(s => `
        <span class="skill-tag"><i class="bi bi-check-circle-fill me-1" style="font-size: 0.7rem;"></i>${s}</span>
      `).join('');
    } else {
      skillsContainer.innerHTML = '<span class="text-muted small">No technical skills added yet.</span>';
    }
  }

  // Interests
  const interestsContainer = document.getElementById('profile-interests-container');
  if (interestsContainer) {
    if (student.interests && student.interests.length > 0) {
      interestsContainer.innerHTML = student.interests.map(i => `
        <span class="interest-tag"><i class="bi bi-stars me-1" style="font-size: 0.7rem;"></i>${i}</span>
      `).join('');
    } else {
      interestsContainer.innerHTML = '<span class="text-muted small">No specific interests added yet.</span>';
    }
  }

  // Achievements
  const achievementsContainer = document.getElementById('profile-achievements-container');
  if (achievementsContainer) {
    if (student.achievements && student.achievements.length > 0) {
      achievementsContainer.innerHTML = student.achievements.map(a => `
        <li class="list-group-item d-flex align-items-center gap-2 border-0 px-0">
          <i class="bi bi-trophy-fill text-warning"></i>
          <span>${a}</span>
        </li>
      `).join('');
    } else {
      achievementsContainer.innerHTML = '<span class="text-muted small">No achievements listed yet.</span>';
    }
  }

  // Clubs & Activities
  const clubsContainer = document.getElementById('profile-clubs-container');
  if (clubsContainer) {
    if (student.clubs && student.clubs.length > 0) {
      clubsContainer.innerHTML = student.clubs.map(c => `
        <div class="col-md-6 mb-2">
          <div class="p-2 border rounded d-flex align-items-center gap-2 bg-light">
            <i class="bi bi-award text-primary fs-4"></i>
            <div>
              <div class="fw-bold small text-dark">${c.name}</div>
              <div class="text-muted" style="font-size: 0.75rem;">${c.role}</div>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      clubsContainer.innerHTML = '<div class="col-12 text-muted small">Not affiliated with any clubs currently.</div>';
    }
  }

  // Show/Hide Edit Profile button vs Connect button
  const editProfileBtn = document.getElementById('btn-edit-profile-modal');
  const connectBtnContainer = document.getElementById('profile-connect-action-container');

  if (isSelf) {
    if (editProfileBtn) editProfileBtn.classList.remove('d-none');
    if (connectBtnContainer) connectBtnContainer.classList.add('d-none');
  } else {
    if (editProfileBtn) editProfileBtn.classList.add('d-none');
    if (connectBtnContainer) {
      connectBtnContainer.classList.remove('d-none');
      const isConnected = currentUser && currentUser.connectedStudents && currentUser.connectedStudents.includes(student.id);
      connectBtnContainer.innerHTML = `
        <button class="btn ${isConnected ? 'btn-outline-danger' : 'btn-edu-primary'} px-4" 
                onclick="toggleStudentConnection('${student.id}'); setTimeout(() => window.location.reload(), 300);">
          <i class="bi ${isConnected ? 'bi-person-dash' : 'bi-person-plus'} me-1"></i>
          ${isConnected ? 'Disconnect' : 'Connect with Student'}
        </button>
      `;
    }
  }

  // Setup Edit Profile Form Modal
  setupEditProfileForm(student);
}

/**
 * Pre-populates and handles Edit Profile submission
 */
function setupEditProfileForm(student) {
  const form = document.getElementById('edit-profile-form');
  if (!form) return;

  const nameInput = document.getElementById('edit-name');
  const deptInput = document.getElementById('edit-dept');
  const semesterInput = document.getElementById('edit-semester');
  const cgpaInput = document.getElementById('edit-cgpa');
  const bioInput = document.getElementById('edit-bio');
  const skillsInput = document.getElementById('edit-skills');
  const interestsInput = document.getElementById('edit-interests');
  const avatarInput = document.getElementById('edit-avatar');

  // Pre-fill
  if (nameInput) nameInput.value = student.name || '';
  if (deptInput) deptInput.value = student.department || '';
  if (semesterInput) semesterInput.value = student.semester || '';
  if (cgpaInput) cgpaInput.value = student.cgpa || '';
  if (bioInput) bioInput.value = student.bio || '';
  if (skillsInput) skillsInput.value = (student.skills || []).join(', ');
  if (interestsInput) interestsInput.value = (student.interests || []).join(', ');
  if (avatarInput) avatarInput.value = student.avatar || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    student.name = nameInput.value.trim();
    student.department = deptInput.value;
    student.semester = semesterInput.value.trim();
    student.cgpa = cgpaInput.value.trim();
    student.bio = bioInput.value.trim();
    student.avatar = avatarInput.value.trim() || student.avatar;
    student.skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    student.interests = interestsInput.value.split(',').map(i => i.trim()).filter(Boolean);

    // Save into LocalStorage students list
    const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const idx = students.findIndex(s => s.id === student.id);
    if (idx !== -1) {
      students[idx] = student;
      setStorage(STORAGE_KEYS.STUDENTS, students);
    }

    // If current logged-in user is editing themselves, update session
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === student.id) {
      setStorage(STORAGE_KEYS.CURRENT_USER, student);
    }

    showToast('Profile updated successfully!', 'success');

    // Close modal
    const modalEl = document.getElementById('editProfileModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    setTimeout(() => window.location.reload(), 400);
  });
}
