/**
 * EDUConnect - Clubs Directory & Profile Script (clubs.js)
 * Created for CSE 242 University Project
 * Powers the Explore Clubs page (search, filter, follow) and Club Profile page (details, events, recruitment).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the Explore Clubs page
  if (document.getElementById('clubs-grid')) {
    initClubsExplore();
  }

  // Check if we are on the Club Profile page
  if (document.getElementById('club-profile-container')) {
    initClubProfile();
  }
});

/**
 * Explore Clubs Directory Logic
 */
function initClubsExplore() {
  const searchInput = document.getElementById('club-search-input');
  const categoryFilter = document.getElementById('club-category-filter');
  const grid = document.getElementById('clubs-grid');
  const emptyState = document.getElementById('clubs-empty-state');
  const resultsCount = document.getElementById('clubs-count');

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

      return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="edu-card edu-card-hover h-100 d-flex flex-column p-0">
            <!-- Cover Header -->
            <div style="height: 90px; background: linear-gradient(135deg, #3d0d16, #58101e, #d89b27); position: relative;">
              <span class="badge position-absolute top-0 end-0 m-2" style="background-color: ${club.isRecruiting ? '#d89b27' : '#58101e'}; color: ${club.isRecruiting ? '#1c080e' : '#ffffff'}; font-weight: 700;">
                ${club.isRecruiting ? 'Recruiting Active' : 'Off-Season'}
              </span>
            </div>

            <div class="p-3 pt-0 flex-grow-1 d-flex flex-column">
              <!-- Logo & Club Info -->
              <div class="d-flex align-items-end justify-content-between mb-2" style="margin-top: -30px;">
                <img src="${club.logo}" alt="${club.name}" class="club-logo-img">
                <span class="small text-muted"><i class="bi bi-people-fill me-1 text-warning"></i>${club.followersCount} followers</span>
              </div>

              <h5 class="fw-bold mb-1 serif-heading">
                <a href="club-profile.html?id=${club.id}" class="text-decoration-none text-dark">${club.name}</a>
              </h5>
              <div class="badge-dept mb-2 align-self-start">${club.category}</div>
              
              <p class="small text-muted mb-3 flex-grow-1">
                ${club.tagline}
              </p>

              <div class="small text-muted mb-3">
                <i class="bi bi-person-workspace me-1"></i> Advisor: <span class="fw-semibold text-dark">${club.advisor.split(',')[0]}</span>
              </div>

              <div class="border-top pt-3 d-flex gap-2">
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

  renderList();
}

/**
 * Follow or Unfollow a Club
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
    // Unfollow
    following = following.filter(id => id !== clubId);
    if (targetClub && targetClub.followersCount > 0) targetClub.followersCount--;
    showToast(`Unfollowed ${clubName}.`, 'info');
  } else {
    // Follow
    following.push(clubId);
    if (targetClub) targetClub.followersCount++;
    showToast(`You are now following ${clubName}!`, 'success');

    // Notify user
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

  currentUser.followingClubs = following;
  setStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  setStorage(STORAGE_KEYS.CLUBS, clubs);

  // Sync to student list
  const students = getStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const userIdx = students.findIndex(s => s.id === currentUser.id);
  if (userIdx !== -1) {
    students[userIdx].followingClubs = following;
    setStorage(STORAGE_KEYS.STUDENTS, students);
  }

  // Refresh explore or profile UI
  if (document.getElementById('clubs-grid')) {
    initClubsExplore();
  }
}

/**
 * Club Profile Page Logic
 */
function initClubProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id') || 'club_01';
  const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  const club = clubs.find(c => c.id === clubId) || clubs[0];
  const currentUser = getCurrentUser();

  const isFollowing = currentUser && currentUser.followingClubs && currentUser.followingClubs.includes(club.id);

  // Set Profile Elements safely
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
              <p class="mb-0 small text-dark">${club.recruitmentDetails}</p>
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

  // Achievements
  const achievementsContainer = document.getElementById('club-achievements-list');
  if (achievementsContainer) {
    if (club.achievements && club.achievements.length > 0) {
      achievementsContainer.innerHTML = club.achievements.map(a => `
        <li class="list-group-item d-flex align-items-center gap-2 border-0 px-0">
          <i class="bi bi-award-fill text-primary fs-5"></i>
          <span>${a}</span>
        </li>
      `).join('');
    } else {
      achievementsContainer.innerHTML = '<span class="text-muted small">No achievements listed yet.</span>';
    }
  }

  // Upcoming Events by this club
  const clubEventsContainer = document.getElementById('club-events-container');
  if (clubEventsContainer) {
    const allEvents = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const clubEvents = allEvents.filter(e => e.clubId === club.id);

    if (clubEvents.length > 0) {
      clubEventsContainer.innerHTML = clubEvents.map(evt => `
        <div class="col-md-6 mb-3">
          <div class="card h-100 border p-3">
            <span class="badge bg-primary align-self-start mb-2">${evt.category}</span>
            <h6 class="fw-bold mb-1">${evt.title}</h6>
            <div class="small text-muted mb-2"><i class="bi bi-calendar3 me-1"></i>${evt.date} | ${evt.time}</div>
            <div class="small text-muted mb-3"><i class="bi bi-geo-alt me-1"></i>${evt.location}</div>
            <a href="events.html" class="btn btn-sm btn-outline-primary mt-auto">View Event Details</a>
          </div>
        </div>
      `).join('');
    } else {
      clubEventsContainer.innerHTML = '<div class="col-12 text-muted small p-2">No upcoming scheduled events for this club at present.</div>';
    }
  }

  // Announcements / Posts Feed for this Club
  const postsContainer = document.getElementById('club-posts-container');
  if (postsContainer) {
    const allPosts = getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    const clubPosts = allPosts.filter(p => p.authorId === club.id);

    if (clubPosts.length > 0) {
      postsContainer.innerHTML = clubPosts.map(post => `
        <div class="edu-card mb-3 p-3">
          <div class="d-flex align-items-center gap-2 mb-2">
            <img src="${post.authorAvatar}" class="avatar-sm rounded-circle border">
            <div>
              <div class="fw-bold text-dark">${post.authorName}</div>
              <div class="text-muted small">${post.timestamp}</div>
            </div>
          </div>
          <h6 class="fw-bold mb-2">${post.title}</h6>
          <p class="text-muted small mb-2">${post.content}</p>
          ${post.image ? `<img src="${post.image}" class="img-fluid rounded mb-2" style="max-height: 250px; width: 100%; object-fit: cover;">` : ''}
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

  // Setup Apply for Club Modal
  const applyForm = document.getElementById('apply-club-form');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const department = document.getElementById('apply-department')?.value;
      const statement = document.getElementById('apply-statement')?.value;

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
