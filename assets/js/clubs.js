/**
 * EDUConnect - Clubs Directory & Profile Script (clubs.js)
 * Created for CSE 242 University Project
 *
 * Powers the Explore Clubs directory page (search query, category filter, follow/unfollow)
 * and the dedicated Club Profile detail page (charter info, achievements, recruitment application).
 */

/* ==========================================================================
   1. Initialization & Router Hooks
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the Explore Clubs directory page
  if (document.getElementById('clubs-grid')) {
    initClubsExplore();
  }

  // Check if we are on the Club Profile detail page
  if (document.getElementById('club-profile-container')) {
    initClubProfile();
  }
});

/* ==========================================================================
   2. Explore Clubs Directory Page Logic
   ========================================================================== */

/**
 * Initializes the Explore Clubs page:
 * - Binds real-time search input and category dropdown filter.
 * - Renders club cards with recruitment badges, follower counts, and follow actions.
 * - Displays an empty state banner when no clubs match search criteria.
 */
function initClubsExplore() {
  const searchInput = document.getElementById('club-search-input');
  const categoryFilter = document.getElementById('club-category-filter');
  const grid = document.getElementById('clubs-grid');
  const emptyState = document.getElementById('clubs-empty-state');
  const resultsCount = document.getElementById('clubs-count');

  if (!grid) return;

  /**
   * Filters and renders the list of clubs based on active search queries and filters.
   */
  function renderList() {
    const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    const currentUser = getCurrentUser();
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    const filtered = clubs.filter(club => {
      const matchesQuery = !query ||
        club.name.toLowerCase().includes(query) ||
        club.tagline.toLowerCase().includes(query) ||
        club.about.toLowerCase().includes(query);

      const matchesCat = !selectedCategory || club.category === selectedCategory;

      return matchesQuery && matchesCat;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} club${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    grid.innerHTML = filtered.map(club => {
      const isFollowing = currentUser && currentUser.followingClubs && currentUser.followingClubs.includes(club.id);
      const safeName = escapeHtml(club.name);
      const safeCategory = escapeHtml(club.category);
      const safeTagline = escapeHtml(club.tagline);
      const safeAdvisor = escapeHtml(club.advisor ? club.advisor.split(',')[0] : 'Faculty Advisor');

      const safeCover = club.coverImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';
      const safeLogo = club.logo || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80';

      return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="edu-card edu-card-hover h-100 d-flex flex-column p-0">
            <!-- Cover Header with Photo Banner & Gradient Overlay -->
            <div class="club-card-cover position-relative">
              <img src="${safeCover}" alt="${safeName} Cover" class="club-card-cover-img">
              <div class="club-card-cover-overlay"></div>
              <span class="badge position-absolute top-0 end-0 m-2 shadow-sm" style="background-color: ${club.isRecruiting ? 'var(--edu-gold)' : 'rgba(27, 54, 93, 0.88)'}; color: ${club.isRecruiting ? 'var(--edu-charcoal)' : '#ffffff'}; font-weight: 700; z-index: 3;">
                ${club.isRecruiting ? 'Recruiting Active' : 'Off-Season'}
              </span>
            </div>

            <!-- Card Body with Elevated Logo -->
            <div class="club-card-body flex-grow-1 d-flex flex-column">
              <!-- Logo & Follower Metrics (Elevated above Cover) -->
              <div class="club-logo-wrap d-flex align-items-end justify-content-between mb-2">
                <img src="${safeLogo}" alt="${safeName}" class="club-logo-img">
                <span class="badge bg-light text-muted border px-2 py-1" style="font-weight: 500;">
                  <i class="bi bi-people-fill me-1 text-warning"></i>${club.followersCount || club.membersCount || 100} followers
                </span>
              </div>

              <h5 class="fw-bold mb-1 serif-heading mt-1">
                <a href="club-profile.html?id=${club.id}" class="text-decoration-none text-dark">${safeName}</a>
              </h5>
              <div class="badge-dept mb-2 align-self-start">${safeCategory}</div>
              
              <p class="small text-muted mb-3 flex-grow-1" style="min-height: 2.5rem;">
                ${safeTagline}
              </p>

              <div class="small text-muted mb-3 d-flex align-items-center justify-content-between">
                <span><i class="bi bi-person-workspace me-1 text-primary"></i>${safeAdvisor}</span>
                <span class="fw-semibold text-dark"><i class="bi bi-person-check me-1"></i>${club.membersCount || 0} members</span>
              </div>

              <div class="border-top pt-3 d-flex gap-2 mt-auto">
                <a href="club-profile.html?id=${club.id}" class="btn btn-sm btn-edu-outline flex-grow-1">
                  <i class="bi bi-info-circle"></i> View Club
                </a>
                <button class="btn btn-sm ${isFollowing ? 'btn-outline-danger' : 'btn-edu-primary'} flex-grow-1"
                        onclick="toggleClubFollow('${club.id}')">
                  <i class="bi ${isFollowing ? 'bi-bell-slash' : 'bi-bell'}"></i> 
                  ${isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Register filtering event listeners
  if (searchInput) searchInput.addEventListener('input', renderList);
  if (categoryFilter) categoryFilter.addEventListener('change', renderList);

  const clearBtn = document.getElementById('club-clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = '';
      renderList();
    });
  }

  // Initial render on mount
  renderList();
}

/* ==========================================================================
   3. Follow / Unfollow Action Handlers
   ========================================================================== */

/**
 * Toggles follow subscription for a specified club:
 * - Updates user's following list in LocalStorage.
 * - Increments/decrements club follower counts.
 * - Dispatches a confirmation notification on new follow.
 *
 * @param {string} clubId - ID of target club.
 */
function toggleClubFollow(clubId) {
  let currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to follow clubs.', 'warning');
    return;
  }

  let following = currentUser.followingClubs || [];
  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  const targetClub = clubs.find(c => c.id === clubId);
  const clubName = targetClub ? targetClub.name : 'Club';

  if (following.includes(clubId)) {
    // Unfollow action
    following = following.filter(id => id !== clubId);
    if (targetClub && targetClub.followersCount > 0) targetClub.followersCount--;
    showToast(`Unfollowed ${clubName}.`, 'info');
  } else {
    // Follow action
    following.push(clubId);
    if (targetClub) targetClub.followersCount++;
    showToast(`You are now following ${clubName}!`, 'success');

    // Create in-app notification
    const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift({
      id: 'notif_' + Date.now(),
      type: 'club',
      title: 'Club Followed',
      message: `You started following ${clubName}. You will receive their latest announcements.`,
      timestamp: 'Just now',
      read: false,
      link: `club-profile.html?id=${clubId}`
    });
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Persist updated user and club state
  currentUser.followingClubs = following;
  setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  setStorage(STORAGE_KEYS.CLUBS, clubs);

  // Write-through: sync the follow state with MySQL
  if (window.EDUApi) {
    EDUApi.action('club_follow_toggle', {
      clubId: clubId,
      userId: currentUser.id,
      following: following.includes(clubId)
    });
  }

  // Synchronize student directory records
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const userIdx = students.findIndex(s => s.id === currentUser.id);
  if (userIdx !== -1) {
    students[userIdx].followingClubs = following;
    setStorage(STORAGE_KEYS.STUDENTS, students);
  }

  // Refresh explore or profile UI if active on screen
  if (document.getElementById('clubs-grid')) {
    initClubsExplore();
  }
}

/* ==========================================================================
   4. Club Profile Detail Page Logic
   ========================================================================== */

/**
 * Initializes the detailed Club Profile view based on the '?id=' URL query parameter.
 * Populates header banner, charter metadata, achievements list, upcoming events,
 * and handles membership recruitment applications.
 */
function initClubProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id') || 'club_01';
  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  const club = clubs.find(c => c.id === clubId) || clubs[0];
  const currentUser = getCurrentUser();

  const isFollowing = currentUser && currentUser.followingClubs && currentUser.followingClubs.includes(club.id);

  // Safely set profile details
  const elName = document.getElementById('club-profile-name') || document.getElementById('club-hero-name');
  if (elName && club.id !== 'club_01') elName.textContent = club.name;

  const elTagline = document.getElementById('club-profile-tagline');
  if (elTagline) elTagline.textContent = club.tagline;

  const elCategory = document.getElementById('club-profile-category');
  if (elCategory) elCategory.textContent = club.category;

  const elLogo = document.getElementById('club-profile-logo');
  if (elLogo) elLogo.src = club.logo;

  const elAbout = document.getElementById('club-profile-about');
  if (elAbout) elAbout.textContent = club.about;

  const elAdvisor = document.getElementById('club-profile-advisor');
  if (elAdvisor) elAdvisor.textContent = club.advisor;

  const elMembers = document.getElementById('club-profile-members');
  if (elMembers) elMembers.textContent = `${club.membersCount} Active Members`;

  const elFollowers = document.getElementById('club-profile-followers');
  if (elFollowers) elFollowers.textContent = `${club.followersCount} Followers`;

  const elEst = document.getElementById('club-profile-est');
  if (elEst) elEst.textContent = `Established ${club.established}`;

  // Follow Button UI
  const followBtnContainer = document.getElementById('club-profile-follow-container');
  if (followBtnContainer) {
    followBtnContainer.innerHTML = `
      <button class="btn ${isFollowing ? 'btn-outline-danger' : 'btn-edu-primary'} px-4"
              onclick="toggleClubFollow('${club.id}'); setTimeout(() => window.location.reload(), 300);">
        <i class="bi ${isFollowing ? 'bi-bell-slash' : 'bi-bell'} me-1"></i>
        ${isFollowing ? 'Following Club' : 'Follow Club'}
      </button>
    `;
  }

  // Recruitment Banner
  const recruitContainer = document.getElementById('club-recruitment-banner');
  if (recruitContainer) {
    if (club.isRecruiting) {
      recruitContainer.innerHTML = `
        <div class="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm border-0">
          <div class="d-flex align-items-center gap-3">
            <i class="bi bi-megaphone-fill fs-2 text-success"></i>
            <div>
              <h6 class="fw-bold mb-1">Recruitment is Open!</h6>
              <p class="mb-0 small text-dark">${escapeHtml(club.recruitmentDetails)}</p>
            </div>
          </div>
          <button class="btn btn-sm btn-success fw-bold text-nowrap" data-bs-toggle="modal" data-bs-target="#applyClubModal">
            Apply Now
          </button>
        </div>
      `;
    } else {
      recruitContainer.innerHTML = `
        <div class="alert alert-light border d-flex align-items-center gap-2 p-3 text-muted small">
          <i class="bi bi-clock-history fs-5"></i>
          <div>Recruitment is currently closed for this term. Stay tuned for future announcements.</div>
        </div>
      `;
    }
  }

  // Achievements List
  const achievementsContainer = document.getElementById('club-achievements-list');
  if (achievementsContainer) {
    if (club.achievements && club.achievements.length > 0) {
      achievementsContainer.innerHTML = club.achievements.map(a => `
        <li class="list-group-item d-flex align-items-center gap-2 border-0 px-0">
          <i class="bi bi-award-fill text-primary fs-5"></i>
          <span>${escapeHtml(a)}</span>
        </li>
      `).join('');
    } else {
      achievementsContainer.innerHTML = '<span class="text-muted small">No achievements listed yet.</span>';
    }
  }

  // Upcoming Events organized by this club
  const clubEventsContainer = document.getElementById('club-events-container');
  if (clubEventsContainer) {
    const allEvents = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const clubEvents = allEvents.filter(e => e.clubId === club.id);

    if (clubEvents.length > 0) {
      clubEventsContainer.innerHTML = clubEvents.map(evt => `
        <div class="col-md-6 mb-3">
          <div class="card h-100 border p-3">
            <span class="badge bg-primary align-self-start mb-2">${escapeHtml(evt.category)}</span>
            <h6 class="fw-bold mb-1">${escapeHtml(evt.title)}</h6>
            <div class="small text-muted mb-2"><i class="bi bi-calendar3 me-1"></i>${escapeHtml(evt.date)} | ${escapeHtml(evt.time)}</div>
            <div class="small text-muted mb-3"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(evt.location)}</div>
            <a href="events.html" class="btn btn-sm btn-outline-primary mt-auto">View Event Details</a>
          </div>
        </div>
      `).join('');
    } else {
      clubEventsContainer.innerHTML = '<div class="col-12 text-muted small p-2">No upcoming scheduled events for this club at present.</div>';
    }
  }

  // Announcements & Posts Feed for this Club
  const postsContainer = document.getElementById('club-posts-container');
  if (postsContainer) {
    const allPosts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const clubPosts = allPosts.filter(p => p.authorId === club.id);

    if (clubPosts.length > 0) {
      postsContainer.innerHTML = clubPosts.map(post => `
        <div class="edu-card mb-3 p-3">
          <div class="d-flex align-items-center gap-2 mb-2">
            <img src="${post.authorAvatar}" alt="${escapeHtml(post.authorName)}" class="avatar-sm rounded-circle border">
            <div>
              <div class="fw-bold text-dark">${escapeHtml(post.authorName)}</div>
              <div class="text-muted small">${escapeHtml(post.timestamp)}</div>
            </div>
          </div>
          <h6 class="fw-bold mb-2">${escapeHtml(post.title)}</h6>
          <p class="text-muted small mb-2">${escapeHtml(post.content)}</p>
          ${post.image ? `<img src="${post.image}" alt="Post image" class="img-fluid rounded mb-2" style="max-height: 250px; width: 100%; object-fit: cover;">` : ''}
          <div class="d-flex align-items-center gap-3 pt-2 border-top text-muted small">
            <span><i class="bi bi-heart-fill text-danger me-1"></i>${post.likesCount} Likes</span>
            <span><i class="bi bi-chat-left-text me-1"></i>${post.commentsCount} Comments</span>
          </div>
        </div>
      `).join('');
    } else {
      postsContainer.innerHTML = '<div class="text-muted small p-3">No recent public posts from this club.</div>';
    }
  }

  // Setup Apply for Club Recruitment Modal
  const applyForm = document.getElementById('apply-club-form');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast(`Application submitted to ${club.name}! Club executives will contact you.`, 'success');

      // Add to notifications
      const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
      notifs.unshift({
        id: 'notif_' + Date.now(),
        type: 'club',
        title: 'Recruitment Application Received',
        message: `Your membership application to ${club.name} was successfully submitted.`,
        timestamp: 'Just now',
        read: false,
        link: `club-profile.html?id=${club.id}`
      });
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

      const modalEl = document.getElementById('applyClubModal');
      if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
    });
  }
}
