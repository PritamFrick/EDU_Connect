/**
 * EDUConnect - Global Application Script (app.js)
 * Created for CSE 242 University Project
 * Handles common UI features: Navbar state, Toast alerts, Demo switcher, and Global utilities.
 */

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('edu-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'edu-toast-container';
    container.className = 'edu-toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    info: 'bi-info-circle-fill text-primary',
    success: 'bi-check-circle-fill text-success',
    warning: 'bi-exclamation-triangle-fill text-warning',
    danger: 'bi-x-circle-fill text-danger'
  };

  const toast = document.createElement('div');
  toast.className = 'edu-toast';
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.info} fs-5"></i>
    <div class="flex-grow-1 font-sans" style="font-size: 0.9rem;">${message}</div>
    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close"></button>
  `;

  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

// Current User Helper
function getCurrentUser() {
  return getStorage(STORAGE_KEYS.CURRENT_USER, DEMO_ACCOUNTS.student);
}

// Update Top Navbar based on logged in user and notification count
function syncNavbarUI() {
  const currentUser = getCurrentUser();
  const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Update notification badge if present
  const notifBadge = document.getElementById('nav-notif-badge');
  if (notifBadge) {
    if (unreadCount > 0) {
      notifBadge.textContent = unreadCount;
      notifBadge.style.display = 'inline-block';
    } else {
      notifBadge.style.display = 'none';
    }
  }

  // Update User Profile Chip in Navbar
  const userChip = document.getElementById('nav-user-chip');
  if (userChip && currentUser) {
    userChip.innerHTML = `
      <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" 
           alt="${currentUser.name}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
      <span class="d-none d-lg-inline fw-semibold text-dark">${currentUser.name}</span>
      <span class="badge ${currentUser.role === 'admin' ? 'bg-danger' : currentUser.role === 'club_rep' ? 'bg-primary' : 'bg-secondary'} text-white text-capitalize" style="font-size: 0.7rem;">
        ${currentUser.role === 'club_rep' ? 'Club Rep' : currentUser.role}
      </span>
    `;
  }
}

// Fast Switch Demo Account (Great for presentation and viva)
function switchDemoAccount(role) {
  if (DEMO_ACCOUNTS[role]) {
    setStorage(STORAGE_KEYS.CURRENT_USER, DEMO_ACCOUNTS[role]);
    showToast(`Switched active account to: ${DEMO_ACCOUNTS[role].name} (${role})`, 'success');
    setTimeout(() => {
      if (role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.reload();
      }
    }, 600);
  }
}

// Global Logout Handler
function handleLogout(e) {
  if (e && e.preventDefault) e.preventDefault();
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  showToast('You have been logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 350);
}

// Global Demo Switcher Modal / Dropdown setup
function setupDemoSwitcherEvents() {
  document.querySelectorAll('[data-switch-role]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const role = el.getAttribute('data-switch-role');
      switchDemoAccount(role);
    });
  });

  document.querySelectorAll('[data-action="logout"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout(e);
    });
  });

  const resetBtn = document.getElementById('btn-reset-demo-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all demo data back to factory CSE 242 initial state?')) {
        resetDemoData();
        showToast('Demo data reset successfully!', 'info');
        setTimeout(() => window.location.reload(), 600);
      }
    });
  }
}

// Active Nav link highlighter
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Global delegated click listener for logout and role switches
document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('[data-action="logout"]');
  if (logoutBtn) {
    e.preventDefault();
    handleLogout(e);
  }
});

// Run common handlers on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  syncNavbarUI();
  setupDemoSwitcherEvents();
  highlightActiveNav();
});
