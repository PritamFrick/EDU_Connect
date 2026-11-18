/**
 * EDUConnect - Global Application Script (app.js)
 * Created for CSE 242 University Project (Fall 2026)
 *
 * Provides shared UI utilities, navigation synchronization, toast notifications,
 * route authorization guards, XSS sanitization, and session management across all pages.
 */

/* ==========================================================================
   1. Global Utility Functions
   ========================================================================== */

/**
 * Escapes potentially unsafe HTML characters to prevent Cross-Site Scripting (XSS).
 *
 * @param {string|null|undefined} str - Raw input string from user or data model.
 * @returns {string} Sanitized string safe for innerHTML insertion.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Displays a non-blocking toast notification banner at the top-right of the screen.
 * Automatically constructs the toast container if it does not yet exist.
 *
 * @param {string} message - Message text or markup to display inside the notification.
 * @param {'info'|'success'|'warning'|'danger'} [type='info'] - Notification style category.
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('edu-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'edu-toast-container';
    container.className = 'edu-toast-container';
    document.body.appendChild(container);
  }

  // Map notification types to corresponding Bootstrap icons
  const icons = {
    info: 'bi-info-circle-fill text-primary',
    success: 'bi-check-circle-fill text-success',
    warning: 'bi-exclamation-triangle-fill text-warning',
    danger: 'bi-x-circle-fill text-danger'
  };

  const toast = document.createElement('div');
  toast.className = 'edu-toast';
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.info} fs-5 flex-shrink-0"></i>
    <div class="flex-grow-1 font-sans" style="font-size: 0.9rem;">${message}</div>
    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close"></button>
  `;

  // Manual dismiss button handler
  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Auto-dismiss smoothly after 3.5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

/**
 * Retrieves the currently logged-in user profile from LocalStorage.
 * Returns null if no active user session exists.
 *
 * @returns {Object|null} Active user session object or null.
 */
function getCurrentUser() {
  return getStorage(STORAGE_KEYS.CURRENT_USER, null);
}

/**
 * Enforces route-level authentication and authorization policies:
 * 1. Public Pages (index.html, login.html, register.html):
 *    - Unrestricted public access.
 * 2. Protected Portal Pages (dashboard.html, students.html, profile.html, clubs.html,
 *    club-profile.html, events.html, notifications.html, admin.html):
 *    - Requires active user session (getCurrentUser() !== null).
 *    - If unauthenticated, safely redirects to login.html with redirect & auth_required flags.
 * 3. Role-Restricted Pages (admin.html):
 *    - Requires currentUser.role === 'admin'.
 *    - If user has another role (student, club_rep), redirects to dashboard.html with access_denied flag.
 *
 * @returns {boolean} True if authorized to view page, false if redirecting.
 */
function enforcePageAuthorization() {
  const currentPath = window.location.pathname.split('/').pop().split('?')[0] || 'index.html';
  const currentUser = getCurrentUser();

  const publicPages = ['index.html', 'login.html', 'register.html', ''];
  const isPublicPage = publicPages.includes(currentPath);

  // 1. Protected page guard: Block unauthenticated visitors immediately
  if (!isPublicPage && !currentUser) {
    sessionStorage.setItem('edu_auth_msg', 'Access Restricted: Please sign in with your university credentials to access student, club, and campus information.');
    window.location.replace(`login.html?redirect=${encodeURIComponent(currentPath)}`);
    return false;
  }

  // 2. Admin role guard: Block non-administrators
  if (currentPath === 'admin.html') {
    if (!currentUser || currentUser.role !== 'admin') {
      sessionStorage.setItem('edu_auth_msg', 'Access Denied: Administrator clearance is required to view the university moderation center.');
      window.location.replace('dashboard.html');
      return false;
    }
  }

  // 3. Display pending auth messages if redirected
  const authMsg = sessionStorage.getItem('edu_auth_msg');
  if (authMsg) {
    sessionStorage.removeItem('edu_auth_msg');
    const displayNotice = () => {
      showToast(authMsg, currentPath === 'login.html' ? 'warning' : 'danger');
      const loginAlert = document.getElementById('login-alert');
      if (loginAlert && currentPath === 'login.html') {
        loginAlert.className = 'alert alert-warning d-flex align-items-center gap-2 mb-3';
        loginAlert.innerHTML = `<i class="bi bi-shield-lock-fill fs-5 flex-shrink-0"></i><div>${escapeHtml(authMsg)}</div>`;
        loginAlert.classList.remove('d-none');
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', displayNotice);
    } else {
      displayNotice();
    }
  }

  return true;
}

/* ==========================================================================
   2. Navbar Synchronization & UI State
   ========================================================================== */

/**
 * Synchronizes top navigation elements with active user session data:
 * - Updates unread notification counters on both desktop and mobile badges.
 * - Populates user profile chips with avatar, name, and role badge.
 */
function syncNavbarUI() {
  const currentUser = getCurrentUser();
  const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const unreadCount = notifications.filter(n => !n.read).length;

  // 1. Update notification count badges across desktop and mobile
  document.querySelectorAll('#nav-notif-badge, .nav-notif-badge').forEach(notifBadge => {
    if (unreadCount > 0 && currentUser) {
      notifBadge.textContent = unreadCount;
      notifBadge.style.display = 'inline-block';
    } else {
      notifBadge.style.display = 'none';
    }
  });

  // 2. Update user profile chips (avatar, full name, role badge)
  document.querySelectorAll('#nav-user-chip, .nav-user-chip').forEach(userChip => {
    if (!currentUser) {
      userChip.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-edu-gold px-3 text-nowrap fw-semibold">
          <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
        </a>
      `;
      return;
    }

    const safeName = escapeHtml(currentUser.name);
    const safeAvatar = currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const roleBadgeClass = currentUser.role === 'admin' 
      ? 'bg-danger' 
      : (currentUser.role === 'club_rep' ? 'bg-primary' : 'bg-secondary');
    const roleLabel = currentUser.role === 'club_rep' ? 'Club Rep' : currentUser.role;

    userChip.innerHTML = `
      <img src="${safeAvatar}" 
           alt="${safeName}" class="rounded-circle" style="width: 30px; height: 30px; object-fit: cover;">
      <span class="d-none d-xl-inline fw-semibold text-light">${safeName}</span>
      <span class="badge ${roleBadgeClass} text-white text-capitalize" style="font-size: 0.68rem;">
        ${escapeHtml(roleLabel)}
      </span>
    `;
  });

  // 3. Update homepage auth button if present
  const homeAuthLink = document.getElementById('home-nav-auth-link');
  if (homeAuthLink) {
    if (currentUser) {
      homeAuthLink.textContent = 'Dashboard';
      homeAuthLink.href = 'dashboard.html';
    } else {
      homeAuthLink.textContent = 'Login';
      homeAuthLink.href = 'login.html';
    }
  }

  // 4. Role-based visibility for Admin Navigation link
  document.querySelectorAll('a[href="admin.html"]').forEach(adminLink => {
    const parentNavItem = adminLink.closest('.nav-item');
    if (parentNavItem) {
      if (currentUser && currentUser.role === 'admin') {
        parentNavItem.style.display = '';
      } else {
        parentNavItem.style.display = 'none';
      }
    }
  });
}

/**
 * Clears the user's active session and redirects back to the login page.
 *
 * @param {Event} [e] - Optional triggering event to cancel default action.
 */
function handleLogout(e) {
  if (e && e.preventDefault) e.preventDefault();
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  sessionStorage.removeItem('edu_auth_msg');
  showToast('You have been logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 350);
}

/* ==========================================================================
   3. Event Handlers & Lifecycle Hooks
   ========================================================================= */

/**
 * Automatically applies active CSS styling and gold brand accent to the current
 * page's corresponding navigation link in the top bar.
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop().split('?')[0] || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('?')[0];
    const isMatch = (
      href === currentPath || 
      (currentPath === '' && href === 'index.html') ||
      (currentPath === 'club-profile.html' && href === 'clubs.html')
    );
    if (isMatch) {
      link.classList.add('active', 'brand-gold');
    }
  });
}

// Global delegated click listener for dynamic logout triggers
document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('[data-action="logout"]');
  if (logoutBtn) {
    e.preventDefault();
    handleLogout(e);
  }
});

// Immediate authorization check upon script parse (prevents DOM flash)
const isPageAuthorized = enforcePageAuthorization();

// Run common page initializers once DOM is fully parsed
document.addEventListener('DOMContentLoaded', () => {
  if (isPageAuthorized) {
    syncNavbarUI();
    highlightActiveNav();
  }
});
