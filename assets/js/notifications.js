/**
 * EDUConnect - Notifications Center Script (notifications.js)
 * Created for CSE 242 University Project
 * Handles Notification rendering, category filters, and mark-as-read updates in LocalStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('notifications-list')) {
    initNotificationsPage();
  }
});

function initNotificationsPage() {
  const listContainer = document.getElementById('notifications-list');
  const emptyState = document.getElementById('notifications-empty-state');
  const markAllBtn = document.getElementById('btn-mark-all-read');
  const filterPills = document.querySelectorAll('[data-notif-filter]');
  let currentFilter = 'all';

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
      emptyState.classList.remove('d-none');
      return;
    }

    emptyState.classList.add('d-none');

    const icons = {
      event: { icon: 'bi-calendar-check-fill', bg: 'bg-primary bg-opacity-10 text-primary' },
      club: { icon: 'bi-flag-fill', bg: 'bg-info bg-opacity-10 text-info' },
      connection: { icon: 'bi-person-check-fill', bg: 'bg-success bg-opacity-10 text-success' }
    };

    listContainer.innerHTML = filtered.map(item => {
      const iconMeta = icons[item.type] || icons.event;

      return `
        <div class="notification-item ${item.read ? '' : 'unread'}" id="notif-item-${item.id}">
          <div class="notification-icon-wrap ${iconMeta.bg}">
            <i class="bi ${iconMeta.icon}"></i>
          </div>

          <div class="flex-grow-1">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="fw-bold mb-0 text-dark small">${item.title}</h6>
              <span class="text-muted" style="font-size: 0.72rem;">${item.timestamp}</span>
            </div>
            <p class="small text-secondary mb-2">${item.message}</p>
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

  // Filter click handlers
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-notif-filter');
      renderList();
    });
  });

  // Mark all as read handler
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      notifs.forEach(n => n.read = true);
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
      showToast('All notifications marked as read.', 'success');
      syncNavbarUI();
      renderList();
    });
  }

  renderList();
}

/**
 * Mark a single notification as read
 */
function markSingleNotifRead(notifId) {
  const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const target = notifs.find(n => n.id === notifId);
  if (target) {
    target.read = true;
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    syncNavbarUI();
    initNotificationsPage();
  }
}
