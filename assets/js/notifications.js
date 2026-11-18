/**
 * EDUConnect - Notifications Center Script (notifications.js)
 * Created for CSE 242 University Project
 *
 * Powers the Notification Center page:
 * - Real-time filtering by category (All, Unread, Events, Clubs, Connections)
 * - Dynamic unread counter badges
 * - Single notification "Mark as read" and batch "Mark all as read"
 * - Automatic synchronization with global navbar notification badge
 */

/* ==========================================================================
   1. Lifecycle & Page Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('notifications-list')) {
    initNotificationsPage();
  }
});

/* ==========================================================================
   2. Notifications Center Logic
   ========================================================================== */

/**
 * Initializes the Notifications Center:
 * - Sets up category filtering pills.
 * - Binds the "Mark all as read" button.
 * - Renders notifications list with custom icon styles per notification type.
 */
function initNotificationsPage() {
  const listContainer = document.getElementById('notifications-list');
  const emptyState = document.getElementById('notifications-empty-state');
  const markAllBtn = document.getElementById('btn-mark-all-read');
  const filterPills = document.querySelectorAll('[data-notif-filter]');
  let currentFilter = 'all';

  if (!listContainer) return;

  /**
   * Filters and renders notifications based on selected category.
   */
  function renderList() {
    const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

    let filtered = notifs;
    if (currentFilter === 'unread') {
      filtered = notifs.filter(n => !n.read);
    } else if (currentFilter !== 'all') {
      filtered = notifs.filter(n => n.type === currentFilter);
    }

    // Update unread count badge
    const unreadCount = notifs.filter(n => !n.read).length;
    const countEl = document.getElementById('unread-notifs-count');
    if (countEl) {
      countEl.textContent = `${unreadCount} Unread`;
      countEl.className = unreadCount > 0 ? 'badge bg-danger' : 'badge bg-secondary';
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    // Visual styles for notification categories
    const icons = {
      event: { icon: 'bi-calendar-check-fill', bg: 'bg-primary bg-opacity-10 text-primary' },
      club: { icon: 'bi-flag-fill', bg: 'bg-info bg-opacity-10 text-info' },
      connection: { icon: 'bi-person-check-fill', bg: 'bg-success bg-opacity-10 text-success' }
    };

    listContainer.innerHTML = filtered.map(item => {
      const iconMeta = icons[item.type] || icons.event;
      const safeTitle = escapeHtml(item.title);
      const safeMessage = escapeHtml(item.message);
      const safeTimestamp = escapeHtml(item.timestamp);

      return `
        <div class="notification-item ${item.read ? '' : 'unread'}" id="notif-item-${item.id}">
          <div class="notification-icon-wrap ${iconMeta.bg}">
            <i class="bi ${iconMeta.icon}"></i>
          </div>

          <div class="flex-grow-1">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="fw-bold mb-0 text-dark small">${safeTitle}</h6>
              <span class="text-muted" style="font-size: 0.72rem;">${safeTimestamp}</span>
            </div>
            <p class="small text-secondary mb-2">${safeMessage}</p>
            <div class="d-flex align-items-center gap-2">
              ${item.link ? `<a href="${item.link}" class="btn btn-sm btn-link p-0 text-decoration-none small text-primary fw-semibold">View Details &rarr;</a>` : ''}
              ${!item.read ? `
                <button class="btn btn-sm btn-link p-0 text-decoration-none small text-muted ms-3" onclick="markSingleNotifRead('${item.id}')">
                  <i class="bi bi-check2"></i> Mark as read
                </button>
              ` : '<span class="small text-muted" style="font-size: 0.75rem;"><i class="bi bi-check-all text-muted"></i> Read</span>'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter pills click handling
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-notif-filter') || 'all';
      renderList();
    });
  });

  // Mark all notifications as read
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      notifs.forEach(n => { n.read = true; });
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

      // Write-through: mark all as read in MySQL
      const sessionUser = getCurrentUser();
      if (window.EDUApi && sessionUser) {
        EDUApi.action('read_all', { userId: sessionUser.id });
      }

      showToast('All notifications marked as read.', 'success');
      syncNavbarUI();
      renderList();
    });
  }

  // Initial render
  renderList();
}

/* ==========================================================================
   3. Single Notification Read Handler
   ========================================================================== */

/**
 * Marks an individual notification item as read in LocalStorage
 * and updates both the active view and top navigation badge.
 *
 * @param {string} notifId - Unique ID of the notification.
 */
function markSingleNotifRead(notifId) {
  const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const target = notifs.find(n => n.id === notifId);
  if (target) {
    target.read = true;
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);

    // Write-through: mark the notification as read in MySQL
    if (window.EDUApi) {
      EDUApi.action('notification_read', { notificationId: notifId });
    }

    syncNavbarUI();
    initNotificationsPage();
  }
}
