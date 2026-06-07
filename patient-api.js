// Simple patient API wrapper — calls backend endpoints with graceful fallback.
// Configure `API_BASE` to point to your backend (e.g. https://api.kilarishospitals.com)
(function () {
  const API_BASE = window.PATIENT_API_BASE || '/api';
  let backendAvailable = true; // assume backend is available, set to false if check fails

  async function postJson(path, body) {
    const url = API_BASE.replace(/\/$/, '') + path;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        timeout: 5000
      });
      const text = await res.text();
      try { return JSON.parse(text); } catch (e) { return { ok: res.ok, raw: text }; }
    } catch (e) {
      console.warn(`[PatientAPI] Backend unavailable at ${API_BASE}:`, e.message);
      backendAvailable = false;
      throw e;
    }
  }

  window.PatientAPI = {
    isBackendAvailable: () => backendAvailable,

    // registerUser: expects { name, firstName, email, phone, password }
    async registerUser(payload) {
      try {
        const data = await postJson('/patients/register', payload);
        return { ok: true, data, backend: true };
      } catch (e) {
        console.error('[PatientAPI] Register failed:', e.message);
        return { ok: false, error: e, backend: false };
      }
    },

    // loginUser: expects { email, password }
    async loginUser(payload) {
      try {
        const data = await postJson('/patients/login', payload);
        return { ok: true, data, backend: true };
      } catch (e) {
        console.error('[PatientAPI] Login failed:', e.message);
        return { ok: false, error: e, backend: false };
      }
    }
  };
})();
