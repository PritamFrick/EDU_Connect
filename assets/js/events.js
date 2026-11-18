/**
 * EDUConnect - Events & Activities Management Script (events.js)
 * Created for CSE 242 University Project
 *
 * Powers university events discovery, real-time search, category filtering,
 * interactive RSVP registration/cancellation with seat capacity tracking,
 * and comprehensive event detail modals.
 */

/* ==========================================================================
   1. Lifecycle & Page Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('events-grid')) {
    initEventsPage();
  }
});

/* ==========================================================================
   2. Events Directory Logic
   ========================================================================== */

/**
 * Initializes the Events Directory view:
 * - Binds search inputs and category filter dropdown.
 * - Renders event cards with calendar date blocks, organizer tags, seat capacity bars, and RSVP buttons.
 * - Handles empty search results state.
 */
function initEventsPage() {
  const searchInput = document.getElementById('event-search-input');
  const categoryFilter = document.getElementById('event-category-filter');
  const grid = document.getElementById('events-grid');
  const emptyState = document.getElementById('events-empty-state');
  const countBadge = document.getElementById('events-count');

  if (!grid) return;

  /**
   * Filters and renders event cards matching active criteria.
   */
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
      // Parse event date safely
      const dateObj = new Date(evt.date);
      const monthStr = isNaN(dateObj.getTime()) ? 'DATE' : dateObj.toLocaleString('en-US', { month: 'short' });
      const dayStr = isNaN(dateObj.getTime()) ? '—' : dateObj.getDate();

      const isRegistered = currentUser && evt.registeredUserIds && evt.registeredUserIds.includes(currentUser.id);
      const isFull = evt.seatsRegistered >= evt.seatsTotal;
      const percentFilled = Math.min(100, Math.round((evt.seatsRegistered / evt.seatsTotal) * 100));

      const safeTitle = escapeHtml(evt.title);
      const safeClubName = escapeHtml(evt.clubName);
      const safeCategory = escapeHtml(evt.category);
      const safeTime = escapeHtml(evt.time);
      const safeLocation = escapeHtml(evt.location);
      const safeDescription = escapeHtml(evt.description);

      return `
        <div class="col-lg-6 mb-4">
          <div class="edu-card edu-card-hover h-100 d-flex flex-column">
            <!-- Event Banner -->
            <div style="height: 140px; position: relative; overflow: hidden; background-color: var(--edu-charcoal);">
              <img src="${evt.banner}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
              <span class="badge position-absolute top-0 end-0 m-3 shadow-sm" style="background-color: var(--edu-gold); color: var(--edu-charcoal); font-weight: 700;">${safeCategory}</span>
              <div class="position-absolute bottom-0 start-0 m-3">
                <span class="badge ${isRegistered ? 'bg-success' : 'bg-dark bg-opacity-75'}">
                  <i class="bi ${isRegistered ? 'bi-check-circle-fill' : 'bi-people'} me-1"></i>
                  ${isRegistered ? 'You are Registered' : `${evt.seatsTotal - evt.seatsRegistered} seats left`}
                </span>
              </div>
            </div>

            <!-- Event Card Content -->
            <div class="p-3 d-flex flex-column flex-grow-1">
              <div class="d-flex align-items-start gap-3 mb-2">
                <!-- Date Block -->
                <div class="event-date-badge shadow-sm flex-shrink-0">
                  <div class="event-date-month">${monthStr}</div>
                  <div class="event-date-day">${dayStr}</div>
                </div>

                <div class="flex-grow-1">
                  <h5 class="fw-bold mb-1 serif-heading text-dark">${safeTitle}</h5>
                  <div class="small fw-semibold mb-1" style="color: var(--edu-maroon);">
                    <i class="bi bi-flag-fill text-warning me-1"></i>${safeClubName}
                  </div>
                </div>
              </div>

              <div class="small text-muted mb-2">
                <i class="bi bi-clock me-1 text-secondary"></i> ${safeTime}
              </div>
              <div class="small text-muted mb-3">
                <i class="bi bi-geo-alt-fill me-1 text-danger"></i> ${safeLocation}
              </div>

              <p class="small text-muted mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${safeDescription}
              </p>

              <!-- Seat Capacity Progress Bar -->
              <div class="mb-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Capacity</span>
                  <span>${evt.seatsRegistered} / ${evt.seatsTotal} enrolled (${percentFilled}%)</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar ${percentFilled > 85 ? 'bg-danger' : 'bg-primary'}" role="progressbar" style="width: ${percentFilled}%"></div>
                </div>
              </div>

              <!-- Action Buttons -->
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

  // Filter event listeners
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

  // Initial render
  renderList();
  setupCreateEventForm(renderList);
}

/* ==========================================================================
   3. Event Registration / Cancellation
   ========================================================================== */

/**
 * Toggles registration (RSVP) status for the current user on a given event:
 * - Checks seating capacity before confirming registration.
 * - Updates user list and registered seats counter in LocalStorage.
 * - Issues an in-app confirmation notification.
 *
 * @param {string} eventId - Unique ID of the event.
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

    // Create in-app notification
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

  // Re-render directory list if visible
  if (document.getElementById('events-grid')) {
    initEventsPage();
  }

  // Sync state with modal button if modal is open
  const modalBtn = document.getElementById('modal-register-btn');
  if (modalBtn) {
    const updatedStatus = evt.registeredUserIds.includes(currentUser.id);
    modalBtn.className = `btn ${updatedStatus ? 'btn-outline-danger' : 'btn-edu-primary'} px-4`;
    modalBtn.innerHTML = `
      <i class="bi ${updatedStatus ? 'bi-x-circle' : 'bi-check-circle'} me-1"></i>
      ${updatedStatus ? 'Cancel Registration' : 'Confirm Registration'}
    `;
  }
}

/* ==========================================================================
   4. Event Details Modal Dialog
   ========================================================================== */

/**
 * Opens and populates the Event Details Bootstrap modal dialog.
 *
 * @param {string} eventId - Unique ID of the event to inspect.
 */
function openEventDetailsModal(eventId) {
  const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const currentUser = getCurrentUser();
  const isRegistered = currentUser && evt.registeredUserIds && evt.registeredUserIds.includes(currentUser.id);

  const titleEl = document.getElementById('modal-event-title');
  const bannerEl = document.getElementById('modal-event-banner');
  const clubEl = document.getElementById('modal-event-club');
  const catEl = document.getElementById('modal-event-category');
  const dateEl = document.getElementById('modal-event-date');
  const timeEl = document.getElementById('modal-event-time');
  const locEl = document.getElementById('modal-event-location');
  const descEl = document.getElementById('modal-event-desc');
  const seatsEl = document.getElementById('modal-event-seats');

  if (titleEl) titleEl.textContent = evt.title;
  if (bannerEl) bannerEl.src = evt.banner;
  if (clubEl) clubEl.textContent = evt.clubName;
  if (catEl) catEl.textContent = evt.category;
  if (dateEl) dateEl.textContent = evt.date;
  if (timeEl) timeEl.textContent = evt.time;
  if (locEl) locEl.textContent = evt.location;
  if (descEl) descEl.textContent = evt.description;
  if (seatsEl) seatsEl.textContent = `${evt.seatsRegistered} / ${evt.seatsTotal} seats booked`;

  const statusBadge = document.getElementById('modal-event-status-badge');
  if (statusBadge) {
    statusBadge.className = `badge ${isRegistered ? 'bg-success' : 'bg-primary'}`;
    statusBadge.textContent = isRegistered ? 'You are Registered' : 'Open for Registration';
  }

  const registerBtn = document.getElementById('modal-register-btn');
  if (registerBtn) {
    registerBtn.className = `btn ${isRegistered ? 'btn-outline-danger' : 'btn-edu-primary'} px-4`;
    registerBtn.innerHTML = `
      <i class="bi ${isRegistered ? 'bi-x-circle' : 'bi-check-circle'} me-1"></i>
      ${isRegistered ? 'Cancel Registration' : 'Register for Event'}
    `;
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

/**
 * Sets up the event creation form modal submission handler.
 *
 * @param {Function} [renderCallback] - Optional callback to refresh the events list
 */
function setupCreateEventForm(renderCallback) {
  const form = document.getElementById('create-event-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast('You must be signed in to create and host university events.', 'warning');
      return;
    }

    const title = document.getElementById('new-event-title').value.trim();
    const category = document.getElementById('new-event-category').value;
    const clubId = document.getElementById('new-event-club').value;
    const seatsTotal = parseInt(document.getElementById('new-event-seats').value, 10) || 80;
    const date = document.getElementById('new-event-date').value;
    const time = document.getElementById('new-event-time').value.trim();
    const location = document.getElementById('new-event-location').value.trim();
    const banner = document.getElementById('new-event-banner').value.trim() || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80';
    const description = document.getElementById('new-event-desc').value.trim();

    const clubs = getStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    const hostClub = clubs.find(c => c.id === clubId);
    const clubName = hostClub ? hostClub.name : 'University Club';

    const events = getStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const newEvent = {
      id: 'evt_' + Date.now(),
      title,
      clubId,
      clubName,
      category,
      date,
      time,
      location,
      description,
      banner,
      seatsTotal,
      seatsRegistered: 0,
      registeredUserIds: [],
      isRegistrationOpen: true
    };

    events.unshift(newEvent);
    setStorage(STORAGE_KEYS.EVENTS, events);

    // Broadcast event notification
    const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifications.unshift({
      id: 'notif_' + Date.now(),
      type: 'event',
      title: 'New Event: ' + title,
      message: `${clubName} published an event: "${title}" scheduled for ${date}. Registration is open!`,
      timestamp: 'Just now',
      read: false,
      link: 'events.html'
    });
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

    showToast(`Campus event "${title}" published successfully!`, 'success');

    form.reset();
    const modalEl = document.getElementById('createEventModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    if (renderCallback) renderCallback();
  });
}
