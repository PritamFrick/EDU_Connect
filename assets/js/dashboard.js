/**
 * EDUConnect - Campus Community Feed & Recommendation Engine (dashboard.js)
 * Created for CSE 242: Web Development - East Delta University (Fall 26)
 *
 * Implements:
 * 1. Algorithmic News Feed with 2 Sections:
 *    - Section 1: Club Events & Announcements Feed (Ranked by followed clubs, urgency, engagement)
 *    - Section 2: Recommended Peer Profiles (Ranked by multi-factor compatibility algorithm)
 * 2. Recommendation Algorithm:
 *    - Computes compatibility score based on shared skills, mutual interests, and academic department
 * 3. Interactive features: Likes, Comments, Moderation reporting, Post creation
 * 4. User profile overview and live side widgets (Followed Clubs, Upcoming Events)
 */

/* ==========================================================================
   1. Dashboard Lifecycle & Initialization
   ========================================================================== */

let activeFeedFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-feed-container')) {
    initDashboard();
  }
});

/**
 * Initializes all dashboard modules, sidebars, feeds, and interactive modal dialogs.
 */
function initDashboard() {
  renderSidebarProfile();
  renderFollowedClubsWidget();
  renderUpcomingEventsWidget();
  setupFeedTabs();
  setupFeedFilterButtons();
  renderClubAnnouncementsFeed();
  renderRecommendedStudentsFeed();
  setupCreatePostModal();
}

/* ==========================================================================
   2. Left Rail: User Profile Summary Widget
   ========================================================================== */

/**
 * Renders the active user's avatar, academic department, verification badge,
 * and connection statistics into the left-hand rail card.
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

  if (avatar) {
    avatar.src = currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
    avatar.alt = currentUser.name || 'User Avatar';
  }

  if (name) name.textContent = currentUser.name;
  if (studentId) {
    studentId.textContent = currentUser.studentId || (currentUser.role === 'admin' ? 'Faculty Admin' : 'Club Lead');
  }
  if (dept) dept.textContent = currentUser.department;

  if (connectionsCount) {
    connectionsCount.textContent = (currentUser.connectedStudents || []).length;
  }
  if (clubsCount) {
    clubsCount.textContent = (currentUser.followingClubs || []).length;
  }

  if (statusBadge) {
    const isVerified = currentUser.status === 'Verified';
    statusBadge.className = `status-pill ${isVerified ? 'status-verified' : 'status-pending'}`;
    statusBadge.innerHTML = `
      <i class="bi ${isVerified ? 'bi-patch-check-fill' : 'bi-hourglass-split'}"></i>
      ${escapeHtml(currentUser.status || 'Verified')}
    `;
  }
}

/* ==========================================================================
   3. Feed Navigation & Tab Switching
   ========================================================================== */

/**
 * Configures tab toggle buttons between the Club Announcements Feed
 * and the Recommended Peer Connections Feed.
 */
function setupFeedTabs() {
  const tabClubs = document.getElementById('feed-tab-clubs');
  const tabStudents = document.getElementById('feed-tab-students');
  const feedClubs = document.getElementById('feed-section-clubs');
  const feedStudents = document.getElementById('feed-section-students');

  if (!tabClubs || !tabStudents || !feedClubs || !feedStudents) return;

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
    renderRecommendedStudentsFeed();
  });
}

/**
 * Configures feed filter buttons (All Feed, Followed Clubs, Official Events).
 */
function setupFeedFilterButtons() {
  const filterContainer = document.getElementById('club-feed-filters');
  if (!filterContainer) return;

  filterContainer.querySelectorAll('.feed-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterContainer.querySelectorAll('.feed-filter-btn').forEach(b => {
        b.classList.remove('btn-edu-primary', 'active');
        b.classList.add('btn-outline-secondary');
      });
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-edu-primary', 'active');
      activeFeedFilter = btn.getAttribute('data-filter') || 'all';
      renderClubAnnouncementsFeed();
    });
  });
}

/* ==========================================================================
   4. Algorithmic News Feed: Club Events & Announcements
   ========================================================================== */

/**
 * Computes an algorithmic ranking score for a post:
 * - Followed Club Boost (+45 pts)
 * - Official Event Status (+30 pts)
 * - Community Engagement (likes * 2 + comments * 3)
 *
 * @param {Object} post - Feed post item
 * @param {Object|null} currentUser - Active user session
 * @returns {number} Algorithmic priority score
 */
function scorePostForFeed(post, currentUser) {
  let score = 0;
  if (currentUser && currentUser.followingClubs && currentUser.followingClubs.includes(post.authorId)) {
    score += 45;
  }
  if (post.isEvent) {
    score += 30;
  }
  score += (post.likesCount || 0) * 2 + (post.commentsCount || 0) * 3;
  return score;
}

/**
 * Renders community posts and club announcements ordered by the ranking algorithm.
 */
function renderClubAnnouncementsFeed() {
  const container = document.getElementById('club-feed-list');
  if (!container) return;

  let posts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const currentUser = getCurrentUser();

  // Apply category filtering
  if (activeFeedFilter === 'followed') {
    const followedClubs = currentUser ? (currentUser.followingClubs || []) : [];
    posts = posts.filter(p => followedClubs.includes(p.authorId));
  } else if (activeFeedFilter === 'events') {
    posts = posts.filter(p => p.isEvent || (p.title && p.title.toLowerCase().includes('event') || p.title.toLowerCase().includes('workshop') || p.title.toLowerCase().includes('showcase')));
  }

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="edu-card p-4 text-center text-muted">
        <i class="bi bi-chat-square-dots fs-1 mb-2"></i>
        <p class="mb-0">No posts matching this filter. Select "Top Algorithmic Feed" to view all campus updates!</p>
      </div>
    `;
    return;
  }

  // Sort posts descending by algorithmic priority score
  const rankedPosts = [...posts].sort((a, b) => {
    return scorePostForFeed(b, currentUser) - scorePostForFeed(a, currentUser);
  });

  container.innerHTML = rankedPosts.map(post => {
    const safeTitle = escapeHtml(post.title);
    const safeContent = escapeHtml(post.content);
    const safeAuthor = escapeHtml(post.authorName);
    const safeTimestamp = escapeHtml(post.timestamp);
    const safeAvatar = post.authorAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
    const isFollowed = currentUser && currentUser.followingClubs && currentUser.followingClubs.includes(post.authorId);

    return `
      <div class="edu-card mb-4" id="post-${post.id}">
        <div class="edu-card-body">
          <!-- Post Author Header -->
          <div class="post-header">
            <div class="post-author-info">
              <img src="${safeAvatar}" alt="${safeAuthor}" class="avatar-sm rounded-circle border">
              <div>
                <div class="fw-bold text-dark d-flex align-items-center gap-1">
                  ${safeAuthor}
                  ${post.authorType === 'club' ? '<i class="bi bi-patch-check-fill text-primary" style="font-size: 0.85rem;" title="Official Club"></i>' : ''}
                  ${isFollowed ? '<span class="badge bg-warning text-dark ms-1" style="font-size: 0.65rem;"><i class="bi bi-heart-fill text-danger me-1"></i>Followed</span>' : ''}
                  ${post.isEvent ? '<span class="badge bg-danger text-white ms-1" style="font-size: 0.65rem;"><i class="bi bi-calendar-check me-1"></i>Official Event</span>' : ''}
                </div>
                <div class="text-muted small">${safeTimestamp}</div>
              </div>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-light border-0 text-muted" type="button" data-bs-toggle="dropdown" aria-label="Post Options">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <a class="dropdown-item small text-danger" href="#" onclick="reportPostSim('${post.id}'); return false;">
                    <i class="bi bi-flag text-danger me-2"></i>Report Post
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Post Content -->
          <h6 class="fw-bold text-dark mb-2">${safeTitle}</h6>
          <p class="text-secondary mb-2" style="font-size: 0.94rem; line-height: 1.55;">
            ${safeContent}
          </p>

          <!-- Optional Media Attachment -->
          ${post.image ? `
            <div class="post-media mb-3">
              <img src="${post.image}" alt="Post attachment" class="img-fluid rounded border" loading="lazy">
            </div>
          ` : ''}

          <!-- Post Interaction Bar -->
          <div class="post-actions">
            <button class="post-action-btn ${post.likedByCurrentUser ? 'active text-primary' : ''}" onclick="togglePostLike('${post.id}')" aria-label="Like Post">
              <i class="bi ${post.likedByCurrentUser ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i>
              <span>${post.likesCount} Likes</span>
            </button>
            <button class="post-action-btn" onclick="openCommentPrompt('${post.id}')" aria-label="Comment on Post">
              <i class="bi bi-chat-text"></i>
              <span>${post.commentsCount} Comments</span>
            </button>
            <button class="post-action-btn" onclick="sharePostSim('${post.id}')" aria-label="Share Post">
              <i class="bi bi-share"></i>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   5. Recommendation Algorithm & Section 2 Peer Discovery
   ========================================================================== */

/**
 * Calculates a quantitative compatibility score between two students based on:
 * - Overlapping technical skills (25 points per match, up to 50 max)
 * - Shared extracurricular & research interests (20 points per match, up to 40 max)
 * - Academic department alignment (+15 points if same department)
 *
 * @param {Object} currentStudent - Active user student profile
 * @param {Object} candidate - Candidate student profile
 * @returns {Object} Compatibility report with percentage, sharedSkills, sharedInterests, and summary
 */
function calculateStudentRecommendation(currentStudent, candidate) {
  if (!currentStudent || !candidate) {
    return { percentage: 70, sharedSkills: [], sharedInterests: [], summary: 'Suggested Peer' };
  }

  const currentSkills = (currentStudent.skills || []).map(s => s.toLowerCase().trim());
  const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase().trim());
  const sharedSkills = candidateSkills.filter(s => currentSkills.includes(s));

  const currentInterests = (currentStudent.interests || []).map(i => i.toLowerCase().trim());
  const candidateInterests = (candidate.interests || []).map(i => i.toLowerCase().trim());
  const sharedInterests = candidateInterests.filter(i => currentInterests.includes(i));

  let score = 25; // Base baseline score
  score += Math.min(sharedSkills.length * 25, 45);
  score += Math.min(sharedInterests.length * 20, 30);

  if (currentStudent.department && candidate.department && currentStudent.department === candidate.department) {
    score += 15;
  }

  // Cap normalized match percentage between 65% and 98%
  const percentage = Math.min(Math.max(score, 65), 98);

  const reasons = [];
  if (sharedSkills.length > 0) reasons.push(`${sharedSkills.length} Shared Skill${sharedSkills.length > 1 ? 's' : ''}`);
  if (sharedInterests.length > 0) reasons.push(`${sharedInterests.length} Mutual Interest${sharedInterests.length > 1 ? 's' : ''}`);
  if (currentStudent.department === candidate.department) reasons.push('Same Department');

  const summary = reasons.length > 0 ? reasons.join(' • ') : 'East Delta University Student';

  return {
    percentage,
    sharedSkills,
    sharedInterests,
    summary
  };
}

/**
 * Renders Section 2: Student Profiles Feed ranked strictly by the recommendation engine.
 */
function renderRecommendedStudentsFeed() {
  const container = document.getElementById('students-feed-list');
  if (!container) return;

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const currentUser = getCurrentUser();

  // Exclude current user from recommendation list
  const candidates = students.filter(s => !currentUser || s.id !== currentUser.id);

  if (candidates.length === 0) {
    container.innerHTML = `
      <div class="edu-card p-4 text-center text-muted">
        <i class="bi bi-people fs-1 mb-2"></i>
        <p class="mb-0">No student profiles to recommend right now.</p>
      </div>
    `;
    return;
  }

  // Compute recommendation match score and sort descending
  const rankedCandidates = candidates.map(student => {
    const match = calculateStudentRecommendation(currentUser, student);
    return { ...student, match };
  }).sort((a, b) => b.match.percentage - a.match.percentage);

  container.innerHTML = `
    <div class="row g-3">
      ${rankedCandidates.map(student => {
        const isConnected = currentUser && currentUser.connectedStudents && currentUser.connectedStudents.includes(student.id);

        const skillsHTML = (student.skills || []).slice(0, 3).map(skill => `
          <span class="skill-tag">${escapeHtml(skill)}</span>
        `).join('');

        const safeName = escapeHtml(student.name);
        const safeDept = escapeHtml(student.department);
        const safeBio = escapeHtml(student.bio || 'East Delta University student.');
        const safeAvatar = student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

        return `
          <div class="col-md-6 mb-3">
            <div class="edu-card edu-card-hover h-100 p-3 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center gap-3 overflow-hidden">
                  <img src="${safeAvatar}" alt="${safeName}" class="avatar-img avatar-sm flex-shrink-0" style="width: 52px; height: 52px;">
                  <div class="overflow-hidden">
                    <h6 class="fw-bold mb-0 text-truncate">
                      <a href="profile.html?id=${student.id}" class="text-decoration-none text-dark">${safeName}</a>
                    </h6>
                    <div class="small text-muted text-truncate">${safeDept}</div>
                    <span class="status-pill status-verified mt-1" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">
                      <i class="bi bi-patch-check-fill"></i> ${escapeHtml(student.status || 'Verified')}
                    </span>
                  </div>
                </div>
                <span class="badge bg-success text-white" style="font-size: 0.75rem; font-weight: 700;">
                  <i class="bi bi-stars me-1"></i>${student.match.percentage}% Match
                </span>
              </div>

              <!-- Recommendation Breakdown -->
              <div class="small text-success fw-semibold mb-2" style="font-size: 0.75rem;">
                <i class="bi bi-check2-circle me-1"></i>${escapeHtml(student.match.summary)}
              </div>

              <p class="small text-muted mb-2 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${safeBio}
              </p>

              <div class="mb-3">
                <div class="text-muted small fw-semibold mb-1" style="font-size: 0.7rem;">TOP SKILLS:</div>
                <div>${skillsHTML || '<span class="text-muted small">None listed</span>'}</div>
              </div>

              <div class="d-flex gap-2 border-top pt-2 mt-auto">
                <a href="profile.html?id=${student.id}" class="btn btn-sm btn-edu-outline flex-grow-1">
                  View Profile
                </a>
                <button class="btn btn-sm ${isConnected ? 'btn-outline-danger' : 'btn-edu-primary'} flex-grow-1"
                        onclick="toggleConnectionFromFeed('${student.id}')">
                  <i class="bi ${isConnected ? 'bi-person-dash' : 'bi-person-plus'}"></i>
                  ${isConnected ? 'Connected' : 'Connect'}
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
 * Toggles a student connection directly from the dashboard recommendation cards.
 *
 * @param {string} studentId - Target student ID
 */
function toggleConnectionFromFeed(studentId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  currentUser.connectedStudents = currentUser.connectedStudents || [];

  const index = currentUser.connectedStudents.indexOf(studentId);
  if (index > -1) {
    currentUser.connectedStudents.splice(index, 1);
    showToast('Connection removed.', 'info');
  } else {
    currentUser.connectedStudents.push(studentId);
    showToast('Connection established successfully!', 'success');
  }

  // Update in user list
  const userIdx = students.findIndex(s => s.id === currentUser.id);
  if (userIdx > -1) {
    students[userIdx] = currentUser;
    setStorage(STORAGE_KEYS.STUDENTS, students);
  }
  setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);

  renderSidebarProfile();
  renderRecommendedStudentsFeed();
}

/* ==========================================================================
   6. Right Rail Widgets (Followed Clubs & Upcoming Events)
   ========================================================================== */

/**
 * Populates the "Followed Clubs" right-hand widget with current subscriptions.
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
        <img src="${c.logo}" alt="${escapeHtml(c.name)}" class="rounded" style="width: 34px; height: 34px; object-fit: cover;">
        <div class="overflow-hidden">
          <div class="fw-semibold text-truncate small text-dark">${escapeHtml(c.name)}</div>
          <div class="text-muted" style="font-size: 0.72rem;">${c.followersCount} followers</div>
        </div>
      </div>
      <a href="club-profile.html?id=${c.id}" class="btn btn-sm btn-light border px-2 py-1" style="font-size: 0.75rem;">View</a>
    </div>
  `).join('');
}

/**
 * Populates the "Upcoming Events" right-hand widget with scheduled events.
 */
function renderUpcomingEventsWidget() {
  const container = document.getElementById('widget-upcoming-events');
  if (!container) return;

  const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS).slice(0, 3);

  if (events.length === 0) {
    container.innerHTML = '<div class="text-muted small p-2">No upcoming events scheduled.</div>';
    return;
  }

  container.innerHTML = events.map(e => `
    <div class="py-2 border-bottom">
      <span class="badge bg-primary-subtle text-primary mb-1" style="font-size: 0.68rem;">${escapeHtml(e.category)}</span>
      <h6 class="fw-bold mb-1" style="font-size: 0.88rem;">
        <a href="events.html" class="text-decoration-none text-dark">${escapeHtml(e.title)}</a>
      </h6>
      <div class="text-muted small" style="font-size: 0.75rem;">
        <i class="bi bi-calendar3 me-1"></i>${escapeHtml(e.date)} &bull; ${escapeHtml(e.clubName)}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   7. Post Creation Modal & Submission
   ========================================================================== */

/**
 * Sets up the event listener for the Create Post form inside the modal dialog.
 */
function setupCreatePostModal() {
  const form = document.getElementById('create-post-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('post-title-input');
    const contentInput = document.getElementById('post-content-input');
    const imageInput = document.getElementById('post-image-input');

    if (!titleInput || !contentInput) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const image = imageInput ? imageInput.value.trim() : '';
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
      authorName: currentUser ? currentUser.name : 'Verified Student',
      authorAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      timestamp: 'Just now',
      title: title,
      content: content,
      image: image || null,
      likesCount: 0,
      commentsCount: 0,
      likedByCurrentUser: false,
      isEvent: false
    };

    posts.unshift(newPost);
    setStorage(STORAGE_KEYS.POSTS, posts);

    showToast('Post published to campus feed!', 'success');

    // Reset form and dismiss modal dialog
    form.reset();
    const modalEl = document.getElementById('createPostModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    renderClubAnnouncementsFeed();
  });
}

/* ==========================================================================
   8. Post Interactions (Like, Comment, Share, Report)
   ========================================================================== */

/**
 * Toggles like status on a post for the active user session.
 *
 * @param {string} postId - ID of target post.
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

/**
 * Prompts user for a comment and increments the post's comment counter.
 *
 * @param {string} postId - ID of target post.
 */
function openCommentPrompt(postId) {
  const comment = prompt('Write a comment on this campus post:');
  if (comment && comment.trim()) {
    const posts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      setStorage(STORAGE_KEYS.POSTS, posts);
      showToast('Comment posted successfully!', 'success');
      renderClubAnnouncementsFeed();
    }
  }
}

/**
 * Simulates copying the permalink of a post to the user's clipboard.
 *
 * @param {string} postId - ID of target post.
 */
function sharePostSim(postId) {
  showToast('Link to post copied to clipboard!', 'info');
}

/**
 * Submits a moderation report against a specific post to the Admin Moderation Queue.
 *
 * @param {string} postId - ID of target post.
 */
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
