/**
 * EDUConnect - MySQL API Client (api.js)
 * Created for CSE 242: Web Development - East Delta University (Fall 2026)
 *
 * Bridges the static frontend with the PHP REST API in /api:
 * - EDUApi.fetchDataSync(): blocking boot-time sync with MySQL (used by data.js
 *   so every page renders database-backed content from its first paint).
 * - EDUApi.action(): fire-and-forget write-through persistence for user
 *   mutations (registrations, likes, follows, admin decisions, ...).
 * - EDUApi.request(): async JSON POST used by the authentication flow.
 *
 * All calls degrade gracefully: when the PHP API or MySQL is unreachable
 * (e.g. the site is opened as a plain file:// page without XAMPP), the
 * platform falls back to the bundled LocalStorage seed datasets.
 */

const EDUApi = {
  /** True when the last connectivity probe against /api succeeded. */
  available: false,

  /** Base path of the PHP endpoints (relative to the project root pages). */
  base: 'api',

  /**
   * Performs a synchronous JSON GET against an API endpoint.
   * Synchronous XHR keeps the boot sequence of data.js deterministic:
   * the LocalStorage cache is populated with MySQL data before any page
   * script renders.
   *
   * @param {string} path - Endpoint path relative to the API base.
   * @param {number} [timeoutMs=4000] - Abort threshold to keep page load snappy.
   * @returns {Object|null} Parsed JSON response, or null when unreachable.
   */
  getSync(path, timeoutMs = 4000) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${this.base}/${path}`, false);
      xhr.timeout = timeoutMs;
      xhr.send(null);
      if (xhr.status !== 200) return null;
      const payload = JSON.parse(xhr.responseText);
      this.available = payload && payload.ok === true;
      return this.available ? payload : null;
    } catch (e) {
      this.available = false;
      return null;
    }
  },

  /**
   * Performs an asynchronous JSON POST to an API endpoint.
   *
   * @param {string} path - Endpoint path relative to the API base.
   * @param {Object} payload - JSON body sent to the endpoint.
   * @param {'POST'} [method='POST'] - HTTP verb.
   * @returns {Promise<Object|null>} Parsed JSON response, or null on failure.
   */
  async request(path, payload, method = 'POST') {
    try {
      const response = await fetch(`${this.base}/${path}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify(payload || {}) : undefined
      });

      const data = await response.json();
      if (!response.ok || data.ok === false) {
        console.warn(`[EDUConnect API] ${path} responded with an error:`, data.error || response.status);
        return { ok: false, error: data.error || `HTTP ${response.status}`, status: response.status };
      }

      this.available = true;
      return data;
    } catch (e) {
      this.available = false;
      console.info('[EDUConnect API] Endpoint unreachable, running in LocalStorage fallback mode.');
      return null;
    }
  },

  /**
   * Fire-and-forget write-through persistence for UI mutations. Never blocks
   * or fails the UI: failures are logged and the LocalStorage state remains
   * the fallback source of truth.
   *
   * @param {string} action - Action name handled by api/actions.php.
   * @param {Object} payload - Action payload (ids, flags, edited fields).
   */
  action(action, payload) {
    this.request('actions.php', Object.assign({ action: action }, payload || {}))
      .then(result => {
        if (result && result.ok === false) {
          console.warn(`[EDUConnect API] Action "${action}" failed:`, result.error);
        }
      })
      .catch(() => { /* silent - fallback persistence already applied */ });
  }
};

// Expose for page scripts and inline handlers
window.EDUApi = EDUApi;
