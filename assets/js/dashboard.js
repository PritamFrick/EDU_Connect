/**
 * EDUConnect - Home Dashboard Script (dashboard.js)
 * Created for CSE 242 University Project
 * Handles Feed Switching (Club Events vs Student Profiles), Post Creation, Sidebar State, and Widget Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-feed-container')) {
    initDashboard();
  }
});

function initDashboard() {
  renderSidebarProfile();
  renderFollowedClubsWidget();
  renderUpcomingEventsWidget();
  setupFeedTabs();
  renderClubAnnouncementsFeed();
  renderRecommendedStudentsFeed();
  setupCreatePostModal();
}

/**
 * 1. Render Left Rail Sidebar Profile Summary
 */
function renderSidebarProfile() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const avatar = document.getElementById('sidebar-user-avatar');
  const name = document.getElementById('sidebar-user-name');
  const studentId = document.getElementById('sidebar-user-id');
  const dept = document.getElementById('sidebar-user-dept');
  const connectionsCount = document.getElementById('sidebar-connections-count');
  const clubsCount = document.getElementById('sidebar-clubs-count');
  const statusBadge = document.getElementById('sidebar-status-badge');

  if (avatar) avatar.src = currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  if (name) name.textContent = currentUser.name;
  if (studentId) studentId.textContent = currentUser.studentId || (currentUser.role === 'admin' ? 'Faculty Admin' : 'Club Lead');
  if (dept) dept.textContent = currentUser.department;

  if (connectionsCount) connectionsCount.textContent = (currentUser.connectedStudents || []).length;
  if (clubsCount) clubsCount.textContent = (currentUser.followingClubs || []).length;

  if (statusBadge) {
    statusBadge.className = `status-pill ${currentUser.status === 'Verified' ? 'status-verified' : 'status-pending'}`;
    statusBadge.innerHTML = `<i class="bi ${currentUser.status === 'Verified' ? 'bi-patch-check-fill' : 'bi-hourglass-split'}"></i> ${currentUser.status || 'Verified'}`;
  }
}

/**
 * 2. Setup Feed Switching Tabs (Club Events vs Recommended Students)
 */
function setupFeedTabs() {
  const tabClubs = document.getElementById('feed-tab-clubs');
  const tabStudents = document.getElementById('feed-tab-students');
  const feedClubs = document.getElementById('feed-section-clubs');
  const feedStudents = document.getElementById('feed-section-students');

  if (!tabClubs || !tabStudents) return;

  tabClubs.addEventListener('click', () => {
    tabClubs.classList.add('active');
    tabStudents.classList.remove('active');
    feedClubs.classList.remove('d-none');
    feedStudents.classList.add('d-none');
  });

  tabStudents.addEventListener('click', () => {
    tabStudents.classList.add('active');
    tabClubs.classList.remove('active');
    feedStudents.classList.remove('d-none');
    feedClubs.classList.add('d-none');
  });
}

/**
 * 3. Render Club Events & Announcements Feed
 */
function renderClubAnnouncementsFeed() {
  const container = document.getElementById('club-feed-list');
  if (!container) return;

  const posts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);

  container.innerHTML = posts.map(post => `
    <div class="edu-card mb-4" id="post-${post.id}">
      <div class="edu-card-body">
        <!-- Post Author Header -->
        <div class="post-header">
          <div class="post-author-info">
            <img src="${post.authorAvatar}" alt="${post.authorName}" class="avatar-sm rounded-circle border">
            <div>
              <div class="fw-bold text-dark d-flex align-items-center gap-1">
                ${post.authorName}
                ${post.authorType === 'club' ? '<i class="bi bi-patch-check-fill text-primary" style="font-size: 0.85rem;" title="Official Club"></i>' : ''}
              </div>
              <div class="text-muted small">${post.timestamp}</div>
            </div>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-light border-0 text-muted" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li><a class="dropdown-item small" href="#" onclick="reportPostSim('${post.id}'); return false;"><i class="bi bi-flag text-danger me-2"></i>Report Post</a></li>
            </ul>
          </div>
        </div>

        <!-- Post Body -->
        <h6 class="fw-bold text-dark mb-2">${post.title}</h6>
        <p class="text-secondary mb-2" style="font-size: 0.94rem; line-height: 1.55;">
          ${post.content}
        </p>

        <!-- Media Image if present -->
        ${post.image ? `
          <div class="post-media mb-3">
            <img src="${post.image}" alt="Post image" class="img-fluid rounded border">
          </div>
        ` : ''}

        <!-- Post Action Buttons -->
        <div class="post-actions">
          <button class="post-action-btn ${post.likedByCurrentUser ? 'active text-primary' : ''}" onclick="togglePostLike('${post.id}')">
            <i class="bi ${post.likedByCurrentUser ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i>
            <span>${post.likesCount} Likes</span>
          </button>
          <button class="post-action-btn" onclick="openCommentPrompt('${post.id}')">
            <i class="bi bi-chat-text"></i>
            <span>${post.commentsCount} Comments</span>
          </button>
          <button class="post-action-btn" onclick="sharePostSim('${post.id}')">
            <i class="bi bi-share"></i>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 4. Render Recommended Students Feed Section
 */
function renderRecommendedStudentsFeed() {
  const container = document.getElementById('students-feed-list');
  if (!container) return;

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const currentUser = getCurrentUser();

  // Exclude current user from recommendation list
  const recommended = students.filter(s => !currentUser || s.id !== currentUser.id);

  container.innerHTML = `
    <div class="row g-3">
      ${recommended.map(student => {
        const isConnected = currentUser && currentUser.connectedStudents && currentUser.connectedStudents.includes(student.id);

        const skillsHTML = (student.skills || []).slice(0, 3).map(skill => `
          <span class="skill-tag">${skill}</span>
        `).join('');

        const interestsHTML = (student.interests || []).slice(0, 2).map(interest => `
          <span class="interest-tag">${interest}</span>
        `).join('');

        return `
          <div class="col-md-6 mb-3">
            <div class="edu-card edu-card-hover h-100 p-3 d-flex flex-column">
              <div class="d-flex align-items-center gap-3 mb-3">
                <img src="${student.avatar}" alt="${student.name}" class="avatar-img avatar-sm flex-shrink-0" style="width: 55px; height: 55px;">
                <div class="overflow-hidden">
                  <h6 class="fw-bold mb-0 text-truncate">
                    <a href="profile.html?id=${student.id}" class="text-decoration-none text-dark">${student.name}</a>
                  </h6>
                  <div class="small text-muted text-truncate">${student.department}</div>
                  <span class="status-pill ${student.status === 'Verified' ? 'status-verified' : 'status-pending'} mt-1" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">
                    ${student.status}
                  </span>
                </div>
              </div>

              <p class="small text-muted mb-2 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${student.bio}
              </p>

              <div class="mb-2">
                <div class="text-muted" style="font-size: 0.72rem; font-weight: 600;">SKILLS:</div>
                <div>${skillsHTML || '<span class="text-muted small">None listed</span>'}</div>
              </div>

              <div class="mb-3">
                <div class="text-muted" style="font-size: 0.72rem; font-weight: 600;">INTERESTS:</div>
                <div>${interestsHTML || '<span class="text-muted small">None listed</span>'}</div>
              </div>

              <div class="d-flex gap-2 border-top pt-2 mt-auto">
                <a href="profile.html?id=${student.id}" class="btn btn-sm btn-edu-outline flex-grow-1">
                  View Profile
                </a>
                <button class="btn btn-sm ${isConnected ? 'btn-outline-danger' : 'btn-edu-primary'} flex-grow-1"
                        onclick="toggleStudentConnection('${student.id}'); setTimeout(() => renderRecommendedStudentsFeed(), 200);">
                  <i class="bi ${isConnected ? 'bi-person-dash' : 'bi-person-plus'}"></i>
                  ${isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * 5. Right Rail: Followed Clubs Widget
 */
function renderFollowedClubsWidget() {
  const container = document.getElementById('widget-followed-clubs');
  if (!container) return;

  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  const currentUser = getCurrentUser();
  const followedIds = (currentUser && currentUser.followingClubs) ? currentUser.followingClubs : ['club_01', 'club_02'];

  const followedClubs = clubs.filter(c => followedIds.includes(c.id));

  if (followedClubs.length === 0) {
    container.innerHTML = '<div class="text-muted small p-2">You have not followed any clubs yet.</div>';
    return;
  }

  container.innerHTML = followedClubs.map(c => `
    <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
      <div class="d-flex align-items-center gap-2 overflow-hidden">
        <img src="${c.logo}" class="rounded" style="width: 34px; height: 34px; object-fit: cover;">
        <div class="overflow-hidden">
          <div class="fw-semibold text-truncate small text-dark">${c.name}</div>
          <div class="text-muted" style="font-size: 0.72rem;">${c.followersCount} followers</div>
        </div>
      </div>
      <a href="club-profile.html?id=${c.id}" class="btn btn-sm btn-light border px-2 py-1" style="font-size: 0.75rem;">View</a>
    </div>
  `).join('');
}

/**
 * 6. Right Rail: Upcoming Events Widget
 */
function renderUpcomingEventsWidget() {
  const container = document.getElementById('widget-upcoming-events');
  if (!container) return;

  const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS).slice(0, 3);

  container.innerHTML = events.map(e => `
    <div class="py-2 border-bottom">
      <span class="badge bg-primary-subtle text-primary mb-1" style="font-size: 0.68rem;">${e.category}</span>
      <h6 class="fw-bold mb-1" style="font-size: 0.88rem;">
        <a href="events.html" class="text-decoration-none text-dark">${e.title}</a>
      </h6>
      <div class="text-muted small" style="font-size: 0.75rem;">
        <i class="bi bi-calendar3 me-1"></i>${e.date} &bull; ${e.clubName}
      </div>
    </div>
  `).join('');
}

/**
 * 7. Setup Create Post Modal
 */
function setupCreatePostModal() {
  const form = document.getElementById('create-post-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('post-title-input').value.trim();
    const content = document.getElementById('post-content-input').value.trim();
    const image = document.getElementById('post-image-input').value.trim();
    const currentUser = getCurrentUser();

    if (!title || !content) {
      alert('Please provide both a title and post content.');
      return;
    }

    const posts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const newPost = {
      id: 'post_' + Date.now(),
      authorType: currentUser ? currentUser.role : 'student',
      authorId: currentUser ? currentUser.id : 'std_01',
      authorName: currentUser ? currentUser.name : 'Farhan Ahmed',
      authorAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      timestamp: 'Just now',
      title: title,
      content: content,
      image: image || null,
      likesCount: 0,
      commentsCount: 0,
      likedByCurrentUser: false
    };

    posts.unshift(newPost);
    setStorage(STORAGE_KEYS.POSTS, posts);

    showToast('Post published to campus feed!', 'success');

    // Close modal & reset form
    form.reset();
    const modalEl = document.getElementById('createPostModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    renderClubAnnouncementsFeed();
  });
}

/**
 * Post interactions
 */
function togglePostLike(postId) {
  const posts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  post.likedByCurrentUser = !post.likedByCurrentUser;
  post.likesCount += post.likedByCurrentUser ? 1 : -1;
  setStorage(STORAGE_KEYS.POSTS, posts);

  renderClubAnnouncementsFeed();
}

function openCommentPrompt(postId) {
  const comment = prompt('Write a comment on this post:');
  if (comment && comment.trim()) {
    const posts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      setStorage(STORAGE_KEYS.POSTS, posts);
      showToast('Comment posted!', 'success');
      renderClubAnnouncementsFeed();
    }
  }
}

function sharePostSim(postId) {
  showToast('Link to post copied to clipboard!', 'info');
}

function reportPostSim(postId) {
  const reason = prompt('Please specify the reason for reporting this post:');
  if (reason && reason.trim()) {
    const reports = getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const currentUser = getCurrentUser();
    reports.unshift({
      id: 'rep_' + Date.now(),
      type: 'post',
      targetTitle: 'User Flagged Post #' + postId,
      reportedBy: currentUser ? `${currentUser.name} (${currentUser.id})` : 'Anonymous Student',
      reason: reason.trim(),
      status: 'Pending Review',
      timestamp: new Date().toLocaleString()
    });
    setStorage(STORAGE_KEYS.REPORTS, reports);
    showToast('Report submitted to Admin Moderation queue.', 'warning');
  }
}
