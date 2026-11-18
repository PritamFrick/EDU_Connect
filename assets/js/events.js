/**
 * EDUConnect - Events & Activities Management Script (events.js)
 * Created for CSE 242 University Project
 * Handles Event Discovery, Category Filters, Registration/Cancellation, and Details Modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('events-grid')) {
    initEventsPage();
  }
});

function initEventsPage() {
  const searchInput = document.getElementById('event-search-input');
  const categoryFilter = document.getElementById('event-category-filter');
  const grid = document.getElementById('events-grid');
  const emptyState = document.getElementById('events-empty-state');
  const countBadge = document.getElementById('events-count');

  function renderList() {
    const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const currentUser = getCurrentUser();
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    const filtered = events.filter(evt => {
      const matchesQuery = !query ||
        evt.title.toLowerCase().includes(query) ||
        evt.clubName.toLowerCase().includes(query) ||
        evt.location.toLowerCase().includes(query);

      const matchesCategory = !selectedCategory || evt.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesQuery && matchesCategory;
    });

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} event${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    grid.innerHTML = filtered.map(evt => {
      // Parse date
      const dateObj = new Date(evt.date);
      const monthStr = dateObj.toLocaleString('en-US', { month: 'short' });
      const dayStr = dateObj.getDate();

      const isRegistered = currentUser && evt.registeredUserIds && evt.registeredUserIds.includes(currentUser.id);
      const isFull = evt.seatsRegistered >= evt.seatsTotal;
      const percentFilled = Math.min(100, Math.round((evt.seatsRegistered / evt.seatsTotal) * 100));

      return `
        <div class="col-lg-6 mb-4">
          <div class="edu-card edu-card-hover h-100 d-flex flex-column">
            <!-- Event Banner -->
            <div style="height: 140px; position: relative; overflow: hidden; background-color: #0f172a;">
              <img src="${evt.banner}" alt="${evt.title}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
              <span class="badge position-absolute top-0 end-0 m-3 shadow-sm" style="background-color: #d89b27; color: #1c080e;">${evt.category}</span>
              <div class="position-absolute bottom-0 start-0 m-3">
                <span class="badge ${isRegistered ? 'bg-success' : 'bg-dark bg-opacity-75'}">
                  <i class="bi ${isRegistered ? 'bi-check-circle-fill' : 'bi-people'} me-1"></i>
                  ${isRegistered ? 'You are Registered' : `${evt.seatsTotal - evt.seatsRegistered} seats left`}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-3 d-flex flex-column flex-grow-1">
              <div class="d-flex align-items-start gap-3 mb-2">
                <!-- Date block -->
                <div class="event-date-badge shadow-sm flex-shrink-0">
                  <div class="event-date-month">${monthStr}</div>
                  <div class="event-date-day">${dayStr}</div>
                </div>

                <div class="flex-grow-1">
                  <h5 class="fw-bold mb-1 serif-heading text-dark">${evt.title}</h5>
                  <div class="small fw-semibold mb-1" style="color: #58101e;">
                    <i class="bi bi-flag-fill text-warning me-1"></i>${evt.clubName}
                  </div>
                </div>
              </div>

              <div class="small text-muted mb-2">
                <i class="bi bi-clock me-1 text-secondary"></i> ${evt.time}
              </div>
              <div class="small text-muted mb-3">
                <i class="bi bi-geo-alt-fill me-1 text-danger"></i> ${evt.location}
              </div>

              <p class="small text-muted mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${evt.description}
              </p>

              <!-- Progress bar of capacity -->
              <div class="mb-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Capacity</span>
                  <span>${evt.seatsRegistered} / ${evt.seatsTotal} enrolled (${percentFilled}%)</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar ${percentFilled > 85 ? 'bg-danger' : 'bg-primary'}" role="progressbar" style="width: ${percentFilled}%"></div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="border-top pt-3 d-flex gap-2">
                <button class="btn btn-sm btn-edu-outline flex-grow-1" onclick="openEventDetailsModal('${evt.id}')">
                  <i class="bi bi-info-circle"></i> View Details
                </button>
                <button class="btn btn-sm ${isRegistered ? 'btn-outline-danger' : 'btn-edu-primary'} flex-grow-1" 
                        onclick="toggleEventRegistration('${evt.id}')" ${!isRegistered && isFull ? 'disabled' : ''}>
                  <i class="bi ${isRegistered ? 'bi-x-circle' : 'bi-calendar-check'}"></i> 
                  ${isRegistered ? 'Cancel Registration' : (isFull ? 'Seats Full' : 'Register Now')}
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

  const clearBtn = document.getElementById('event-clear-filters');
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
 * Register or Cancel Registration for an Event
 */
function toggleEventRegistration(eventId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to register for university events.', 'warning');
    return;
  }

  const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  if (!evt.registeredUserIds) evt.registeredUserIds = [];

  const isRegistered = evt.registeredUserIds.includes(currentUser.id);

  if (isRegistered) {
    // Cancel registration
    evt.registeredUserIds = evt.registeredUserIds.filter(id => id !== currentUser.id);
    evt.seatsRegistered = Math.max(0, evt.seatsRegistered - 1);
    setStorage(STORAGE_KEYS.EVENTS, events);
    showToast(`Registration cancelled for "${evt.title}".`, 'info');
  } else {
    // Check capacity
    if (evt.seatsRegistered >= evt.seatsTotal) {
      showToast('Sorry, this event is already fully booked!', 'danger');
      return;
    }
    evt.registeredUserIds.push(currentUser.id);
    evt.seatsRegistered++;
    setStorage(STORAGE_KEYS.EVENTS, events);
    showToast(`Successfully registered for "${evt.title}"!`, 'success');

    // Add a notification
    const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift({
      id: 'notif_' + Date.now(),
      type: 'event',
      title: 'Registration Confirmed',
      message: `You are confirmed for ${evt.title} on ${evt.date}.`,
      timestamp: 'Just now',
      read: false,
      link: 'events.html'
    });
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Refresh page list
  if (document.getElementById('events-grid')) {
    initEventsPage();
  }

  // Update modal state if open
  const modalBtn = document.getElementById('modal-register-btn');
  if (modalBtn) {
    const updatedStatus = evt.registeredUserIds.includes(currentUser.id);
    modalBtn.className = `btn ${updatedStatus ? 'btn-outline-danger' : 'btn-edu-primary'} px-4`;
    modalBtn.innerHTML = `<i class="bi ${updatedStatus ? 'bi-x-circle' : 'bi-check-circle'} me-1"></i> ${updatedStatus ? 'Cancel Registration' : 'Confirm Registration'}`;
  }
}

/**
 * Open Event Details in Bootstrap Modal
 */
function openEventDetailsModal(eventId) {
  const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const currentUser = getCurrentUser();
  const isRegistered = currentUser && evt.registeredUserIds && evt.registeredUserIds.includes(currentUser.id);

  document.getElementById('modal-event-title').textContent = evt.title;
  document.getElementById('modal-event-banner').src = evt.banner;
  document.getElementById('modal-event-club').textContent = evt.clubName;
  document.getElementById('modal-event-category').textContent = evt.category;
  document.getElementById('modal-event-date').textContent = evt.date;
  document.getElementById('modal-event-time').textContent = evt.time;
  document.getElementById('modal-event-location').textContent = evt.location;
  document.getElementById('modal-event-desc').textContent = evt.description;
  document.getElementById('modal-event-seats').textContent = `${evt.seatsRegistered} / ${evt.seatsTotal} seats booked`;

  const statusBadge = document.getElementById('modal-event-status-badge');
  if (statusBadge) {
    statusBadge.className = `badge ${isRegistered ? 'bg-success' : 'bg-primary'}`;
    statusBadge.textContent = isRegistered ? 'You are Registered' : 'Open for Registration';
  }

  const registerBtn = document.getElementById('modal-register-btn');
  if (registerBtn) {
    registerBtn.className = `btn ${isRegistered ? 'btn-outline-danger' : 'btn-edu-primary'} px-4`;
    registerBtn.innerHTML = `<i class="bi ${isRegistered ? 'bi-x-circle' : 'bi-check-circle'} me-1"></i> ${isRegistered ? 'Cancel Registration' : 'Register for Event'}`;
    registerBtn.onclick = () => {
      toggleEventRegistration(evt.id);
    };
  }

  const modalEl = document.getElementById('eventDetailsModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}
