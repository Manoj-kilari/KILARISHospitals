



/* ═══════════════════════════════════════════════════

   INIT – wire up static buttons after DOM is ready

   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // Hamburger

  const hamburger = document.getElementById('hamburger');

  if (hamburger) hamburger.addEventListener('click', toggleNav);



  // Desktop nav buttons (initial state — logged-out)

  const navLoginBtn = document.getElementById('nav-login-btn');

  if (navLoginBtn) navLoginBtn.addEventListener('click', () => openLoginModal('login'));



  const navBookBtn = document.getElementById('nav-book-btn');

  if (navBookBtn) navBookBtn.addEventListener('click', requireLogin);



  // Mobile nav buttons (initial state — logged-out)

  const mobLoginBtn = document.getElementById('mob-login-btn');

  if (mobLoginBtn) mobLoginBtn.addEventListener('click', () => { closeNav(); openLoginModal('login'); });



  const mobBookBtn = document.getElementById('mob-book-btn');

  if (mobBookBtn) mobBookBtn.addEventListener('click', () => { closeNav(); requireLogin(); });



  // Mobile nav links — close drawer on click

  document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {

    link.addEventListener('click', closeNav);

  });



  // Login modal – backdrop click

  const loginOverlay = document.getElementById('login-overlay');

  if (loginOverlay) loginOverlay.addEventListener('click', function (e) {

    if (e.target === this) closeLoginModal();

  });

  // Appointment booking modal – backdrop click
  const apptOverlay = document.getElementById('appt-overlay');
  if (apptOverlay) apptOverlay.addEventListener('click', function (e) {
    if (e.target === this) closeAppointmentBooking();
  });

  // Calendar modal – backdrop click
  const calendarOverlay = document.getElementById('calendar-overlay');
  if (calendarOverlay) calendarOverlay.addEventListener('click', function (e) {
    if (e.target === this) closeCalendar();
  });

  // Time slots modal – backdrop click
  const timeSlotsOverlay = document.getElementById('time-slots-overlay');
  if (timeSlotsOverlay) timeSlotsOverlay.addEventListener('click', function (e) {
    if (e.target === this) closeTimeSlots();
  });

  // Appointment booking form submit
  const apptForm = document.getElementById('appt-form');
  if (apptForm) apptForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitAppointmentBooking();
  });

  // Plans compare modal – backdrop click
  const plansCompareModal = document.getElementById('plans-compare-modal');
  if (plansCompareModal) plansCompareModal.addEventListener('click', function (e) {
    if (e.target === this) closePlansCompare();
  });



  // Keyboard: Escape closes modals, Enter submits login form

  document.addEventListener('keydown', function (e) {

    if (e.key === 'Escape') { closeLoginModal(); closePlatform(); closeReports(); closeCalendar(); }

    if (e.key === 'Enter') {

      const lo = document.getElementById('login-overlay');

      if (lo && lo.classList.contains('show')) {

        if (authTab === 'login') doLogin();

        else doRegister();

      }

    }

  });



  // Outside-click closes nav drawer & user dropdown

  document.addEventListener('click', function (e) {

    const h = document.getElementById('hamburger');

    const n = document.getElementById('mobile-nav');

    const dd = document.getElementById('nav-dropdown');

    const uw = document.getElementById('nav-user-wrap');

    if (h && n && !h.contains(e.target) && !n.contains(e.target)) {

      h.classList.remove('open'); n.classList.remove('open');

    }

    if (dd && uw && !uw.contains(e.target)) dd.classList.remove('open');

  });



  // Restore session

  try {

    const saved = sessionStorage.getItem('mh_user');

    if (saved) { currentUser = JSON.parse(saved); renderNavAuth(); }

  } catch (err) { }

  // Initialize sample reports (if not already present)
  initializeSampleReports();

});



/* ═══════════════════════════════════════════════════

   AUTH STATE

   ═══════════════════════════════════════════════════ */

// Production: Remove demo credentials for live deployment

// const DEMO_USER = { email: 'patient@kilaris.com', password: 'Patient@123', name: 'Manoj Chowdary', firstName: 'Manoj', phone: '+91 98765 43210' };

let currentUser = null;

let authTab = 'login';



function saveUser(u) { currentUser = u; try { sessionStorage.setItem('mh_user', JSON.stringify(u)); } catch (e) { } }

function clearUser() { currentUser = null; try { sessionStorage.removeItem('mh_user'); } catch (e) { } }



/* ═══════════════════════════════════════════════════

   NAVBAR AUTH RENDER

   ═══════════════════════════════════════════════════ */

function renderNavAuth() {

  const actions = document.getElementById('nav-actions');

  const mobileActions = document.getElementById('mobile-nav-actions');

  if (!actions) return;



  if (currentUser) {

    const initials = currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'P';

    // Desktop

    actions.innerHTML = `

      <button class="btn-book" onclick="if(currentUser) openPlatform('patient'); else requireLogin()">👤 Patient Portal</button>

      <div class="nav-user" id="nav-user-wrap">

        <div class="nav-avatar" onclick="toggleUserDropdown(event)">${initials}</div>

        <span class="nav-user-name" onclick="toggleUserDropdown(event)">${currentUser.firstName}</span>

        <div class="nav-user-dropdown" id="nav-dropdown">

          <div class="nud-header">

            <div class="nud-name">${currentUser.name}</div>

            <div class="nud-email">${currentUser.email}</div>

          </div>

          <button class="nud-item" onclick="openPlatform('patient');closeDropdown()">🏠 My Dashboard</button>

          <button class="nud-item" onclick="openPlatform('patient');closeDropdown()">👤 Patient Portal</button>

          <button class="nud-item" onclick="openReports();closeDropdown()">📊 My Reports</button>

          <button class="nud-item" onclick="openCalendar();closeDropdown()">📅 My Appointments</button>

          <div class="nud-divider"></div>

          <button class="nud-item danger" onclick="doLogout()">🚪 Sign Out</button>

        </div>

      </div>`;

    // Mobile

    if (mobileActions) mobileActions.innerHTML = `

      <button class="btn-book" onclick="closeNav();openPlatform('patient')">👤 Patient Portal</button>

      <button class="btn-login" style="background:rgba(230,57,70,.1);color:var(--red);border-color:var(--red);" onclick="closeNav();doLogout()">🚪 Sign Out (${currentUser.firstName})</button>`;

  } else {

    // Desktop

    actions.innerHTML = `

      <button class="btn-login" id="nav-login-btn" onclick="openLoginModal('login')">Patient Login</button>

      <button class="btn-book" id="nav-book-btn" onclick="requireLogin()">Patient Portal</button>`;

    // Mobile

    if (mobileActions) mobileActions.innerHTML = `

      <button class="btn-login" onclick="closeNav();openLoginModal('login')">Patient Login</button>

      <button class="btn-book" onclick="closeNav();requireLogin()">Patient Portal</button>`;

  }

}



function toggleUserDropdown(e) {

  e.stopPropagation();

  document.getElementById('nav-dropdown')?.classList.toggle('open');

}

function closeDropdown() {

  document.getElementById('nav-dropdown')?.classList.remove('open');

}



/* ─── MOBILE NAV ─── */

function toggleNav() {

  const h = document.getElementById('hamburger');

  const n = document.getElementById('mobile-nav');

  h.classList.toggle('open');

  n.classList.toggle('open');

}

function closeNav() {

  document.getElementById('hamburger').classList.remove('open');

  document.getElementById('mobile-nav').classList.remove('open');

}



/* ═══════════════════════════════════════════════════

   LOGIN MODAL

   ═══════════════════════════════════════════════════ */

function openLoginModal(tab = 'login') {

  clearLoginErrors();

  switchAuthTab(tab);

  document.getElementById('login-overlay').classList.add('show');

  document.getElementById('lm-success-state').style.display = 'none';

  document.getElementById('lm-tabs').style.display = 'flex';

  const lf = document.getElementById('lm-login-form');

  const rf = document.getElementById('lm-register-form');

  if (tab === 'login') { lf.style.display = 'block'; rf.style.display = 'none'; }

  else { lf.style.display = 'none'; rf.style.display = 'block'; }

  setTimeout(() => {

    const inp = document.getElementById(tab === 'login' ? 'login-email' : 'reg-fname');

    if (inp) inp.focus();

  }, 200);

}

function closeLoginModal() {

  document.getElementById('login-overlay').classList.remove('show');

  clearLoginErrors();

}

function switchAuthTab(tab) {

  authTab = tab;

  document.getElementById('tab-login').classList.toggle('active', tab === 'login');

  document.getElementById('tab-register').classList.toggle('active', tab === 'register');

  const lf = document.getElementById('lm-login-form');

  const rf = document.getElementById('lm-register-form');

  if (lf) lf.style.display = tab === 'login' ? 'block' : 'none';

  if (rf) rf.style.display = tab === 'register' ? 'block' : 'none';

  if (tab === 'login') {

    document.getElementById('lm-title').textContent = 'Welcome Back';

    document.getElementById('lm-sub').textContent = 'Sign in to your patient account';

  } else {

    document.getElementById('lm-title').textContent = 'Create Account';

    document.getElementById('lm-sub').textContent = 'Join Kilars Health Platform';

  }

  clearLoginErrors();

}

function clearLoginErrors() {

  document.querySelectorAll('.lm-error').forEach(e => e.classList.remove('show'));

  document.querySelectorAll('.lm-input').forEach(e => e.classList.remove('error'));

}

function togglePw(id, btn) {

  const inp = document.getElementById(id);

  if (!inp) return;

  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }

  else { inp.type = 'password'; btn.textContent = '👁'; }

}

function showForgot() {

  const emailEl = document.getElementById('login-email');

  const email = emailEl?.value.trim();

  if (!email) {

    showErr('login-email-err', 'Enter your email first');

    emailEl?.classList.add('error');

    return;

  }

  alert(`📧 Password reset link sent to ${email}\n\nCheck your inbox!`);

}

function showErr(id, msg) {

  const el = document.getElementById(id);

  if (!el) return;

  if (msg) el.textContent = msg;

  el.classList.add('show');

}

function setLoading(btnId, loading) {

  const btn = document.getElementById(btnId);

  if (!btn) return;

  btn.disabled = loading;

  btn.innerHTML = loading ? `<span class="lm-spinner"></span>Processing…` : btn.dataset.orig || btn.innerHTML;

  if (!loading && btn.dataset.orig) btn.innerHTML = btn.dataset.orig;

}

function socialLogin(provider) {

  // Production: Implement proper OAuth integration

  showSuccessState(`Signing in with ${provider}...`, null);

  // TODO: Integrate with real OAuth providers

}



/* ─── LOGIN ─── */

async function doLogin() {

  clearLoginErrors();

  const email = document.getElementById('login-email')?.value.trim();

  const password = document.getElementById('login-password')?.value;

  let valid = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

    document.getElementById('login-email')?.classList.add('error');

    showErr('login-email-err', 'Please enter a valid email address');

    valid = false;

  }

  if (!password || password.length < 4) {

    document.getElementById('login-password')?.classList.add('error');

    showErr('login-pw-err', 'Please enter your password');

    valid = false;

  }

  if (!valid) return;

  const btn = document.getElementById('login-submit-btn');

  btn.dataset.orig = 'Sign In';

  setLoading('login-submit-btn', true);

  try {
    // Try backend login if available
    if (window.PatientAPI && window.PatientAPI.loginUser) {
      const resp = await window.PatientAPI.loginUser({ email, password });
      if (resp && resp.ok && resp.data) {
        // Expect backend to return a user object in resp.data.user or resp.data
        const payload = resp.data.user || resp.data;
        if (payload && payload.email) {
          // store token if present
          if (resp.data.token) try { localStorage.setItem('mh_token', resp.data.token); } catch (e) { }
          showSuccessState(`Welcome back, ${payload.firstName || payload.name || ''}!`, payload);
          return;
        }
      }
      // If backend failed, fall back to local storage instead of showing error
      if (resp && resp.backend === false) {
        console.log('[Login] Backend unavailable, using local storage fallback');
      } else {
        // Backend is available but returned an error
        const msg = (resp && resp.data && resp.data.message) ? resp.data.message : 'Incorrect email or password. Please try again.';
        document.getElementById('login-email')?.classList.add('error');
        document.getElementById('login-password')?.classList.add('error');
        showErr('login-pw-err', msg);
        return;
      }
    }

    // Fallback: local/session storage based auth (dev mode or backend down)
    const registered = getRegisteredUsers();
    const found = registered.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      showSuccessState(`Welcome back, ${found.firstName}!`, found);
    } else {
      document.getElementById('login-email')?.classList.add('error');
      document.getElementById('login-password')?.classList.add('error');
      showErr('login-pw-err', 'Incorrect email or password. Please try again.');
    }

  } catch (e) {
    console.error('[Login] Unexpected error:', e);
    document.getElementById('login-email')?.classList.add('error');
    document.getElementById('login-password')?.classList.add('error');
    showErr('login-pw-err', 'Unable to sign in. Try again.');
  } finally {
    setLoading('login-submit-btn', false);
  }

}



/* ─── REGISTER ─── */

async function doRegister() {

  clearLoginErrors();

  const fname = document.getElementById('reg-fname')?.value.trim();

  const lname = document.getElementById('reg-lname')?.value.trim();

  const email = document.getElementById('reg-email')?.value.trim();

  const phone = document.getElementById('reg-phone')?.value.trim();

  const password = document.getElementById('reg-password')?.value;

  let valid = true;

  if (!fname) { document.getElementById('reg-fname')?.classList.add('error'); showErr('reg-fname-err', 'First name is required'); valid = false; }

  if (!lname) { document.getElementById('reg-lname')?.classList.add('error'); showErr('reg-lname-err', 'Last name is required'); valid = false; }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('reg-email')?.classList.add('error'); showErr('reg-email-err', 'Enter a valid email address'); valid = false; }

  if (!phone || phone.length < 6) { document.getElementById('reg-phone')?.classList.add('error'); showErr('reg-phone-err', 'Enter a valid phone number'); valid = false; }

  if (!password || password.length < 8) { document.getElementById('reg-password')?.classList.add('error'); showErr('reg-pw-err', 'Password must be at least 8 characters'); valid = false; }

  if (!valid) return;

  const btn = document.getElementById('reg-submit-btn');

  btn.dataset.orig = 'Create Account';

  setLoading('reg-submit-btn', true);

  try {
    const newUser = { name: fname + ' ' + lname, firstName: fname, email, phone, password };
    
    // Try backend registration if available
    if (window.PatientAPI && window.PatientAPI.registerUser) {
      const resp = await window.PatientAPI.registerUser(newUser);
      if (resp && resp.ok && resp.data) {
        const payload = resp.data.user || resp.data;
        showSuccessState(`Account created! Welcome, ${fname}!`, payload || newUser);
        return;
      }
      // If backend failed, fall back to local storage instead of showing error
      if (resp && resp.backend === false) {
        console.log('[Registration] Backend unavailable, using local storage fallback');
      } else {
        // Backend is available but returned an error
        const msg = (resp && resp.data && resp.data.message) ? resp.data.message : 'Email already exists. Please sign in.';
        document.getElementById('reg-email')?.classList.add('error');
        showErr('reg-email-err', msg);
        return;
      }
    }

    // Fallback: local/session storage registration (dev mode or backend down)
    const all = getRegisteredUsers();
    if (all.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      document.getElementById('reg-email')?.classList.add('error');
      showErr('reg-email-err', 'This email is already registered. Please sign in.');
      return;
    }
    all.push(newUser);
    try { sessionStorage.setItem('mh_reg_users', JSON.stringify(all)); } catch (e) { }
    showSuccessState(`Account created! Welcome, ${fname}!`, newUser);

  } catch (e) {
    console.error('[Registration] Unexpected error:', e);
    document.getElementById('reg-email')?.classList.add('error');
    showErr('reg-email-err', 'Unable to create account. Try again.');
  } finally {
    setLoading('reg-submit-btn', false);
  }

}

function getRegisteredUsers() {
  try { const d = sessionStorage.getItem('mh_reg_users'); return d ? JSON.parse(d) : []; } catch (e) { return []; }
}

/* ─── SUCCESS ─── */
function showSuccessState(title, user) {
  document.getElementById('lm-login-form').style.display = 'none';
  document.getElementById('lm-register-form').style.display = 'none';
  document.getElementById('lm-tabs').style.display = 'none';
  const ss = document.getElementById('lm-success-state');
  ss.style.display = 'flex';
  document.getElementById('lm-success-title').textContent = title;
  document.getElementById('lm-success-sub').textContent = 'Appointment booking successful!';
  saveUser(user);
  renderNavAuth();
  setTimeout(() => {
    closeLoginModal();
    if (typeof window.__postLoginAction === 'function') {
      const fn = window.__postLoginAction;
      window.__postLoginAction = null;
      try { fn(); } catch (e) { }
    }
  }, 1600);
}

/* ─── LOGOUT ─── */
function doLogout() {
  closeDropdown();
  clearUser();
  currentUser = null;
  renderNavAuth();
  showToast('👋 Signed out successfully');
}


/* ─── REQUIRE LOGIN guard ─── */

function requireLogin() {

  if (currentUser) {
    openCalendar();
  } else {
    openLoginModal('login');
  }

}



/* ─── TOAST ─── */

function showToast(msg) {

  let t = document.getElementById('mh-toast');

  if (!t) {

    t = document.createElement('div');

    t.id = 'mh-toast';

    t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);background:#1a2540;color:#fff;padding:.75rem 1.5rem;border-radius:50px;font-size:.82rem;font-weight:500;z-index:9999;opacity:0;transition:all .3s;box-shadow:0 8px 24px rgba(0,0,0,.2);white-space:nowrap;';

    document.body.appendChild(t);

  }

  t.textContent = msg;

  setTimeout(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; }, 10);

  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 3000);

}

function showReportsComingSoon() {
  openReports();
}

function showAppointmentsComingSoon() {
  alert('Appointments feature coming soon!');
}

/* ═══════════════════════════════════════════════════
   REPORTS MODAL & FUNCTIONS
   ═══════════════════════════════════════════════════ */

let currentReportsTab = 'lab';

function openReports() {
  const overlay = document.getElementById('reports-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  renderReports();
}

function closeReports() {
  const overlay = document.getElementById('reports-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
}

function switchReportsTab(tab) {
  currentReportsTab = tab;
  // Update active tab styling
  document.querySelectorAll('.reports-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  // Hide all tabs, show selected
  document.querySelectorAll('.reports-tab-content').forEach(el => el.style.display = 'none');
  document.getElementById(`reports-${tab}-tab`).style.display = 'block';
  
  renderReports();
}

function renderReports() {
  // Sample/cached lab reports
  const labReports = getLabReports();
  const consultations = getConsultations();
  const prescriptions = getPrescriptions();

  if (currentReportsTab === 'lab') {
    renderLabReports(labReports);
  } else if (currentReportsTab === 'consultation') {
    renderConsultations(consultations);
  } else if (currentReportsTab === 'prescriptions') {
    renderPrescriptions(prescriptions);
  }
}

function getLabReports() {
  // Fetch from backend or local storage
  try {
    return JSON.parse(localStorage.getItem('mh_lab_reports') || '[]');
  } catch (e) {
    return [];
  }
}

function getConsultations() {
  try {
    return JSON.parse(localStorage.getItem('mh_consultations') || '[]');
  } catch (e) {
    return [];
  }
}

function getPrescriptions() {
  try {
    return JSON.parse(localStorage.getItem('mh_prescriptions') || '[]');
  } catch (e) {
    return [];
  }
}

function renderLabReports(reports) {
  const container = document.getElementById('lab-reports-list');
  const empty = document.getElementById('reports-empty');
  if (!container) return;

  if (!reports || reports.length === 0) {
    container.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  container.style.display = 'flex';
  container.innerHTML = reports.map(r => `
    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
        <div>
          <div style="font-weight:600;color:var(--text);">${r.testName}</div>
          <div style="font-size:.85rem;color:var(--subtext);margin-top:.25rem;">📅 ${new Date(r.date).toLocaleDateString('en-IN')}</div>
        </div>
        <span style="background:${r.status === 'Normal' ? '#d4edda' : '#fff3cd'};color:${r.status === 'Normal' ? '#155724' : '#856404'};padding:.25rem .75rem;border-radius:4px;font-size:.8rem;font-weight:600;">${r.status}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.75rem;margin-top:1rem;font-size:.85rem;">
        ${(r.results || []).map(result => `
          <div style="background:#fff;padding:.75rem;border-radius:4px;border-left:3px solid var(--blue);">
            <div style="color:var(--subtext);margin-bottom:.25rem;">${result.name}</div>
            <div style="font-weight:600;color:var(--text);">${result.value}</div>
            <div style="font-size:.75rem;color:#999;margin-top:.25rem;">${result.unit || ''}</div>
          </div>
        `).join('')}
      </div>
      <button style="margin-top:1rem;padding:.5rem 1rem;background:var(--blue);color:#fff;border:none;border-radius:4px;font-size:.85rem;cursor:pointer;" onclick="downloadReport('${r.id}')">⬇ Download</button>
    </div>
  `).join('');
}

function renderConsultations(consultations) {
  const container = document.getElementById('consultation-reports-list');
  const empty = document.getElementById('reports-empty');
  if (!container) return;

  if (!consultations || consultations.length === 0) {
    container.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  container.style.display = 'flex';
  container.innerHTML = consultations.map(c => `
    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
        <div>
          <div style="font-weight:600;color:var(--text);">👨‍⚕️ Dr. ${c.doctorName}</div>
          <div style="font-size:.85rem;color:var(--subtext);margin-top:.25rem;">${c.specialty}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:.85rem;color:var(--subtext);">📅 ${new Date(c.date).toLocaleDateString('en-IN')}</div>
          <div style="font-size:.85rem;color:var(--subtext);">🕐 ${c.time}</div>
        </div>
      </div>
      <div style="margin-top:1rem;padding:.75rem;background:#fff;border-radius:4px;border-left:3px solid var(--teal);">
        <div style="font-size:.85rem;color:var(--subtext);margin-bottom:.5rem;font-weight:600;">Notes:</div>
        <div style="font-size:.85rem;color:var(--text);line-height:1.5;">${c.notes || 'No notes available'}</div>
      </div>
      <button style="margin-top:1rem;padding:.5rem 1rem;background:var(--teal);color:#fff;border:none;border-radius:4px;font-size:.85rem;cursor:pointer;" onclick="downloadConsultationPDF('${c.id}')">⬇ Download PDF</button>
    </div>
  `).join('');
}

function renderPrescriptions(prescriptions) {
  const container = document.getElementById('prescriptions-list');
  const empty = document.getElementById('reports-empty');
  if (!container) return;

  if (!prescriptions || prescriptions.length === 0) {
    container.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  container.style.display = 'flex';
  container.innerHTML = prescriptions.map(p => `
    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
        <div>
          <div style="font-weight:600;color:var(--text);">💊 ${p.medicationName}</div>
          <div style="font-size:.85rem;color:var(--subtext);margin-top:.25rem;">Prescribed by Dr. ${p.doctorName}</div>
        </div>
        <span style="background:${p.status === 'Active' ? '#d4edda' : '#f0f0f0'};color:${p.status === 'Active' ? '#155724' : '#666'};padding:.25rem .75rem;border-radius:4px;font-size:.8rem;font-weight:600;">${p.status}</span>
      </div>
      <div style="margin-top:1rem;display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;font-size:.85rem;">
        <div style="background:#fff;padding:.75rem;border-radius:4px;">
          <div style="color:var(--subtext);margin-bottom:.25rem;">Dosage</div>
          <div style="font-weight:600;color:var(--text);">${p.dosage}</div>
        </div>
        <div style="background:#fff;padding:.75rem;border-radius:4px;">
          <div style="color:var(--subtext);margin-bottom:.25rem;">Duration</div>
          <div style="font-weight:600;color:var(--text);">${p.duration}</div>
        </div>
      </div>
      <div style="margin-top:.75rem;padding:.75rem;background:#fff;border-radius:4px;font-size:.85rem;border-left:3px solid var(--orange);">
        <div style="color:var(--subtext);margin-bottom:.25rem;">Instructions:</div>
        <div style="color:var(--text);">${p.instructions || 'No special instructions'}</div>
      </div>
    </div>
  `).join('');
}

function downloadReport(reportId) {
  showToast('⬇ Downloading report...');
  // TODO: Implement actual download
  setTimeout(() => showToast('✅ Report downloaded'), 1000);
}

function downloadConsultationPDF(consultationId) {
  showToast('⬇ Downloading PDF...');
  // TODO: Implement actual PDF download
  setTimeout(() => showToast('✅ PDF downloaded'), 1000);
}

/* ─── Initialize Sample Reports ─── */

function initializeSampleReports() {
  // Initialize sample lab reports if not already present
  try {
    const existingLab = localStorage.getItem('mh_lab_reports');
    if (!existingLab || JSON.parse(existingLab).length === 0) {
      const sampleLabReports = [
        {
          id: 'LAB-001',
          testName: 'Complete Blood Count (CBC)',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Normal',
          results: [
            { name: 'RBC', value: '4.8', unit: 'M/μL' },
            { name: 'WBC', value: '7.2', unit: 'K/μL' },
            { name: 'Hemoglobin', value: '14.5', unit: 'g/dL' },
            { name: 'Platelets', value: '250', unit: 'K/μL' }
          ]
        },
        {
          id: 'LAB-002',
          testName: 'Lipid Profile',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Normal',
          results: [
            { name: 'Total Cholesterol', value: '180', unit: 'mg/dL' },
            { name: 'LDL', value: '100', unit: 'mg/dL' },
            { name: 'HDL', value: '45', unit: 'mg/dL' },
            { name: 'Triglycerides', value: '120', unit: 'mg/dL' }
          ]
        },
        {
          id: 'LAB-003',
          testName: 'Thyroid Profile (TSH, T3, T4)',
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Normal',
          results: [
            { name: 'TSH', value: '2.5', unit: 'mIU/L' },
            { name: 'T3', value: '110', unit: 'ng/dL' },
            { name: 'T4', value: '8.5', unit: 'μg/dL' }
          ]
        }
      ];
      localStorage.setItem('mh_lab_reports', JSON.stringify(sampleLabReports));
    }
  } catch (e) { }

  // Initialize sample consultations
  try {
    const existingConsult = localStorage.getItem('mh_consultations');
    if (!existingConsult || JSON.parse(existingConsult).length === 0) {
      const sampleConsultations = [
        {
          id: 'CONS-001',
          doctorName: 'Dr. Arjun Mehta',
          specialty: 'Interventional Cardiology',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          time: '2:30 PM',
          notes: 'Patient doing well post-consultation. Continue current medications. Follow-up in 4 weeks. BP control is good.'
        },
        {
          id: 'CONS-002',
          doctorName: 'Dr. Priya Nair',
          specialty: 'General Medicine',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          time: '11:00 AM',
          notes: 'Routine checkup completed. All vitals normal. Advised lifestyle modifications. Repeat tests in 3 months.'
        }
      ];
      localStorage.setItem('mh_consultations', JSON.stringify(sampleConsultations));
    }
  } catch (e) { }

  // Initialize sample prescriptions
  try {
    const existingPrescr = localStorage.getItem('mh_prescriptions');
    if (!existingPrescr || JSON.parse(existingPrescr).length === 0) {
      const samplePrescriptions = [
        {
          id: 'PRESC-001',
          medicationName: 'Aspirin',
          doctorName: 'Dr. Arjun Mehta',
          dosage: '75 mg, Once daily',
          duration: '6 months',
          status: 'Active',
          instructions: 'Take after breakfast. May cause mild stomach upset.'
        },
        {
          id: 'PRESC-002',
          medicationName: 'Atorvastatin',
          doctorName: 'Dr. Arjun Mehta',
          dosage: '20 mg, Once daily',
          duration: 'Ongoing',
          status: 'Active',
          instructions: 'Take at night. Avoid with grapefruit juice.'
        },
        {
          id: 'PRESC-003',
          medicationName: 'Metformin',
          doctorName: 'Dr. Priya Nair',
          dosage: '500 mg, Twice daily',
          duration: '3 months',
          status: 'Active',
          instructions: 'Take with meals to avoid stomach upset. Monitor blood sugar regularly.'
        },
        {
          id: 'PRESC-004',
          medicationName: 'Vitamin D3',
          doctorName: 'Dr. Priya Nair',
          dosage: '2000 IU, Once daily',
          duration: 'Ongoing',
          status: 'Active',
          instructions: 'Take with breakfast. Helps bone health.'
        }
      ];
      localStorage.setItem('mh_prescriptions', JSON.stringify(samplePrescriptions));
    }
  } catch (e) { }
}

function openAppointmentBooking() {
  const open = () => {
    const overlay = document.getElementById('appt-overlay');
    const form = document.getElementById('appt-form');
    const success = document.getElementById('appt-success');
    if (!overlay || !form || !success) return;

    success.style.display = 'none';
    form.style.display = 'block';

    // prefill if user known
    try {
      const u = currentUser || JSON.parse(localStorage.getItem('mh_user') || 'null');
      if (u && u.name) document.getElementById('appt-name').value = u.name;
      if (u && u.phone) document.getElementById('appt-phone').value = u.phone;
    } catch (e) { }

    overlay.style.display = 'flex';
  };

  if (currentUser) open();
  else {
    window.__postLoginAction = open;
    openLoginModal('login');
  }
}

function closeAppointmentBooking() {
  const overlay = document.getElementById('appt-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
}

function submitAppointmentBooking() {
  const name = document.getElementById('appt-name')?.value.trim();
  const phone = document.getElementById('appt-phone')?.value.trim();
  const date = document.getElementById('appt-date')?.value;
  const time = document.getElementById('appt-time')?.value;
  const dept = document.getElementById('appt-dept')?.value;
  const reason = document.getElementById('appt-reason')?.value.trim() || '';

  if (!name || !phone || !date || !time || !dept) {
    alert('Please fill all required fields.');
    return;
  }

  const booking = {
    id: 'APPT-' + Date.now(),
    name,
    phone,
    date,
    time,
    department: dept,
    reason,
    createdAt: new Date().toISOString(),
    reminderSent: false
  };

  try {
    const existing = JSON.parse(localStorage.getItem('mh_appointments') || '[]');
    existing.unshift(booking);
    localStorage.setItem('mh_appointments', JSON.stringify(existing));
  } catch (e) { }

  const form = document.getElementById('appt-form');
  const success = document.getElementById('appt-success');
  if (form) form.style.display = 'none';
  if (success) {
    success.innerHTML = `
      <div style="font-weight:800;color:var(--text);font-size:1.15rem;margin-bottom:.35rem;">Appointment booked!</div>
      <div style="color:var(--subtext);line-height:1.6;">We saved your booking. Our team will contact you shortly.</div>
      <div style="margin-top:1rem;display:flex;gap:.75rem;justify-content:flex-end;">
        <button class="btn-secondary" onclick="closeAppointmentBooking()">Close</button>
        <button class="btn-primary" onclick="closeAppointmentBooking();openCalendar()">📅 View Calendar</button>
      </div>
    `;
    success.style.display = 'block';
  }
  try { showToast('✅ Appointment booked'); } catch (e) { }
  
  // Set reminder for the appointment
  setReminder(booking);
}

/* ═══════════════════════════════════════════════════
   CALENDAR & REMINDER SYSTEM
   ═══════════════════════════════════════════════════ */

let currentCalendarDate = new Date();

function openCalendar() {
  const overlay = document.getElementById('calendar-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  renderCalendar();
  renderUpcomingAppointments();
}

function closeCalendar() {
  const overlay = document.getElementById('calendar-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
}

function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('calendar-month-year');
  if (!grid || !monthYear) return;

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const appointments = getAppointments();
  const appointmentsByDate = {};
  appointments.forEach(appt => {
    const apptDate = new Date(appt.date);
    if (apptDate.getFullYear() === year && apptDate.getMonth() === month) {
      const day = apptDate.getDate();
      if (!appointmentsByDate[day]) {
        appointmentsByDate[day] = [];
      }
      appointmentsByDate[day].push(appt);
    }
  });

  let html = '';
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = today.getDate() === day && 
                    today.getMonth() === month && 
                    today.getFullYear() === year;
    const dayAppointments = appointmentsByDate[day] || [];
    const hasAppointment = dayAppointments.length > 0;
    
    let timeDisplay = '';
    if (hasAppointment) {
      const times = dayAppointments.map(a => a.time).sort();
      timeDisplay = `<div class="calendar-appointment-times">${times.slice(0, 2).join(', ')}${times.length > 2 ? ' +' : ''}</div>`;
    }
    
    html += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasAppointment ? 'has-appointment' : ''}" 
                 onclick="showDayAppointments(${day})">
              <span class="calendar-day-number">${day}</span>
              ${timeDisplay}
            </div>`;
  }

  grid.innerHTML = html;
}

function showDayAppointments(day) {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // Show time slots modal instead of alert
  showAvailableTimeSlots(dateStr, day, month, year);
}

/* ─── TIME SLOTS MODAL ─── */

let selectedTimeSlot = null;
let selectedDateForSlot = null;

const AVAILABLE_TIME_SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', 
                               '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];

function showAvailableTimeSlots(dateStr, day, month, year) {
  const overlay = document.getElementById('time-slots-overlay');
  if (!overlay) return;

  selectedTimeSlot = null;
  selectedDateForSlot = dateStr;

  // Format date for display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
  const dateDisplay = `${day} ${monthNames[month]}, ${year}`;
  
  document.getElementById('selected-date-display').textContent = dateDisplay;

  // Get existing appointments on this date
  const appointments = getAppointments().filter(appt => appt.date === dateStr);
  const bookedTimes = appointments.map(a => a.time);

  // Render time slots
  const slotsContainer = document.getElementById('time-slots-grid');
  slotsContainer.innerHTML = AVAILABLE_TIME_SLOTS.map(time => {
    const isBooked = bookedTimes.includes(time);
    return `
      <button 
        class="time-slot-btn ${isBooked ? 'booked' : ''}" 
        onclick="${isBooked ? '' : `selectTimeSlot('${time}')`}"
        style="
          padding:0.75rem;
          border:1px solid ${isBooked ? '#ddd' : 'var(--blue)'};
          background:${isBooked ? '#f0f0f0' : '#fff'};
          color:${isBooked ? '#999' : 'var(--blue)'};
          border-radius:6px;
          cursor:${isBooked ? 'not-allowed' : 'pointer'};
          font-weight:600;
          font-size:.85rem;
          transition:all 0.2s;
          opacity:${isBooked ? '0.6' : '1'};
        "
        ${isBooked ? 'disabled' : ''}
      >
        ${time}${isBooked ? '<br><span style="font-size:.7rem;">Booked</span>' : ''}
      </button>
    `;
  }).join('');

  overlay.style.display = 'flex';
}

function selectTimeSlot(time) {
  selectedTimeSlot = time;
  
  // Update UI to show selected slot
  document.querySelectorAll('.time-slot-btn').forEach(btn => {
    btn.style.background = btn.textContent.includes(time) ? 'var(--blue)' : '#fff';
    btn.style.color = btn.textContent.includes(time) ? '#fff' : 'var(--blue)';
  });

  // Show confirm button
  document.getElementById('confirm-time-slot-btn').style.display = 'block';
}

function closeTimeSlots() {
  const overlay = document.getElementById('time-slots-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  selectedTimeSlot = null;
  selectedDateForSlot = null;
}

function confirmTimeSlot() {
  if (!selectedTimeSlot || !selectedDateForSlot) {
    alert('Please select a time slot');
    return;
  }

  // Close time slots modal
  closeTimeSlots();

  // Open appointment booking form with selected date and time
  openAppointmentBookingWithSlot(selectedDateForSlot, selectedTimeSlot);
}

function openAppointmentBookingWithSlot(dateStr, timeStr) {
  const overlay = document.getElementById('appt-overlay');
  const form = document.getElementById('appt-form');
  const success = document.getElementById('appt-success');
  if (!overlay || !form || !success) return;

  success.style.display = 'none';
  form.style.display = 'block';

  // Pre-fill date and time
  document.getElementById('appt-date').value = dateStr;
  document.getElementById('appt-time').value = timeStr;

  // Pre-fill patient info if logged in
  try {
    const u = currentUser || JSON.parse(localStorage.getItem('mh_user') || 'null');
    if (u && u.name) document.getElementById('appt-name').value = u.name;
    if (u && u.phone) document.getElementById('appt-phone').value = u.phone;
  } catch (e) { }

  overlay.style.display = 'flex';
}

function renderUpcomingAppointments() {
  const container = document.getElementById('upcoming-appointments');
  if (!container) return;

  const appointments = getAppointments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    return apptDate >= today;
  }).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

  if (upcoming.length === 0) {
    container.innerHTML = '<div class="no-appointments-msg">No upcoming appointments. Book your first appointment!</div>';
    return;
  }

  let html = '';
  upcoming.forEach(appt => {
    const apptDate = new Date(appt.date);
    const isUrgent = (apptDate - today) / (1000 * 60 * 60 * 24) <= 2; // Within 2 days
    
    html += `<div class="appointment-item ${isUrgent ? 'urgent' : ''}">
              <div class="appointment-date">${formatDate(appt.date)}</div>
              <div class="appointment-time">⏰ ${appt.time}</div>
              <div class="appointment-dept">🏥 ${appt.department}</div>
              ${appt.reason ? `<div class="appointment-reason">${appt.reason}</div>` : ''}
              <div class="appointment-actions">
                <button class="btn-reschedule" onclick="rescheduleAppointment('${appt.id}')">📅 Reschedule</button>
                <button class="btn-cancel" onclick="cancelAppointment('${appt.id}')">✕ Cancel</button>
              </div>
            </div>`;
  });

  container.innerHTML = html;
}

function getAppointments() {
  try {
    return JSON.parse(localStorage.getItem('mh_appointments') || '[]');
  } catch (e) {
    return [];
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function cancelAppointment(id) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  
  const appointments = getAppointments();
  const filtered = appointments.filter(appt => appt.id !== id);
  localStorage.setItem('mh_appointments', JSON.stringify(filtered));
  
  renderCalendar();
  renderUpcomingAppointments();
  showToast('🗑️ Appointment cancelled');
}

function rescheduleAppointment(id) {
  const appointments = getAppointments();
  const appt = appointments.find(a => a.id === id);
  if (!appt) return;
  
  const newDate = prompt('Enter new date (YYYY-MM-DD):', appt.date);
  if (!newDate) return;
  
  const newTime = prompt('Enter new time:', appt.time);
  if (!newTime) return;
  
  appt.date = newDate;
  appt.time = newTime;
  appt.reminderSent = false;
  
  localStorage.setItem('mh_appointments', JSON.stringify(appointments));
  
  renderCalendar();
  renderUpcomingAppointments();
  setReminder(appt);
  showToast('📅 Appointment rescheduled');
}

/* REMINDER SYSTEM */

function setReminder(appointment) {
  const apptDateTime = new Date(appointment.date + ' ' + convertTo24Hour(appointment.time));
  const now = new Date();
  const timeUntilAppointment = apptDateTime - now;
  
  // Set reminder for 1 hour before appointment
  const reminderTime = timeUntilAppointment - (60 * 60 * 1000);
  
  if (reminderTime > 0) {
    setTimeout(() => {
      showReminderNotification(appointment);
    }, reminderTime);
  }
}

function convertTo24Hour(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function showReminderNotification(appointment) {
  // Check if reminder already sent
  const appointments = getAppointments();
  const updatedAppt = appointments.find(a => a.id === appointment.id);
  if (updatedAppt && updatedAppt.reminderSent) return;
  
  // Mark reminder as sent
  if (updatedAppt) {
    updatedAppt.reminderSent = true;
    localStorage.setItem('mh_appointments', JSON.stringify(appointments));
  }
  
  const notification = document.createElement('div');
  notification.className = 'reminder-notification';
  notification.innerHTML = `
    <button class="reminder-close" onclick="this.parentElement.remove()">✕</button>
    <h4>🔔 Appointment Reminder</h4>
    <p>Your ${appointment.department} appointment is in 1 hour at ${appointment.time}</p>
    <p style="margin-top: 0.5rem; font-size: 0.8rem;">${formatDate(appointment.date)}</p>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    notification.remove();
  }, 10000);
  
  // Play notification sound if available
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQkFZrW2h4h1FA2etbGHi3UVDa61sYeLdRQ');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
}

// Check for reminders every minute
setInterval(() => {
  const appointments = getAppointments();
  const now = new Date();
  
  appointments.forEach(appt => {
    if (appt.reminderSent) return;
    
    const apptDateTime = new Date(appt.date + ' ' + convertTo24Hour(appt.time));
    const timeUntilAppointment = apptDateTime - now;
    
    // If appointment is within 1 hour and reminder not sent
    if (timeUntilAppointment > 0 && timeUntilAppointment <= (60 * 60 * 1000)) {
      showReminderNotification(appt);
    }
  });
}, 60000); // Check every minute

/* ─── HEALTH PLANS compare modal ─── */
function openPlansCompare() {
  const modal = document.getElementById('plans-compare-modal');
  if (!modal) return;
  modal.style.display = 'flex';
}

function closePlansCompare() {
  const modal = document.getElementById('plans-compare-modal');
  if (!modal) return;
  modal.style.display = 'none';
}

/* ═══════════════════════════════════════════════════
   PATIENT PORTAL / PLATFORM
   ═══════════════════════════════════════════════════ */

function openPlatform(role = 'patient') {
  const overlay = document.getElementById('platform-overlay');
  if (!overlay) return;
  
  overlay.classList.add('show');
  overlay.style.display = 'flex';
  
  // Update role label
  document.getElementById('pt-role-label').textContent = role === 'patient' ? 'Patient' : role.charAt(0).toUpperCase() + role.slice(1);
  
  if (role === 'patient') {
    renderPatientPortal();
  } else if (role === 'admin') {
    renderAdminPortal();
  } else if (role === 'hospital') {
    renderHospitalPortal();
  }
}

function closePlatform() {
  const overlay = document.getElementById('platform-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.style.display = 'none';
}

function renderPatientPortal() {
  const content = document.getElementById('platform-content');
  if (!content) return;

  const user = currentUser || { name: 'Manoj K', email: 'kilarimanoj010@gmail.com', phone: '', firstName: 'Manoj' };
  const appointments = getAppointments();
  const labReports = getLabReports();
  
  const upcomingCount = appointments.filter(a => new Date(a.date) >= new Date()).length;

  content.innerHTML = `
    <div style="max-width:1200px;margin:0 auto;padding:1.5rem;">
      <!-- User Info Header -->
      <div style="background:linear-gradient(135deg, var(--blue) 0%, #0099CC 100%);border-radius:12px;padding:2rem;color:#fff;margin-bottom:2rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
          <div>
            <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem;">Welcome back</div>
            <h1 style="font-size:2rem;margin:0;font-weight:700;">${user.name}</h1>
            <div style="font-size:0.9rem;opacity:0.85;margin-top:0.5rem;">✉️ ${user.email}</div>
            ${user.phone ? `<div style="font-size:0.9rem;opacity:0.85;">📞 ${user.phone}</div>` : ''}
          </div>
          <div style="text-align:right;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">👤</div>
            <button style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Profile settings coming soon')">Edit Profile</button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem;">
        <div style="background:#f5f5f5;border-radius:10px;padding:1.5rem;border-left:4px solid var(--blue);">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Upcoming Appointments</div>
          <div style="font-size:2rem;font-weight:700;color:var(--blue);">${upcomingCount}</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">📅 You have ${upcomingCount} appointment${upcomingCount !== 1 ? 's' : ''}</div>
        </div>
        <div style="background:#f5f5f5;border-radius:10px;padding:1.5rem;border-left:4px solid var(--teal);">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Medical Reports</div>
          <div style="font-size:2rem;font-weight:700;color:var(--teal);">${labReports.length}</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">🩸 Recent lab test results available</div>
        </div>
        <div style="background:#f5f5f5;border-radius:10px;padding:1.5rem;border-left:4px solid var(--orange);">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Last Checkup</div>
          <div style="font-size:1.2rem;font-weight:700;color:var(--orange);">30 days ago</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">✅ You're on track</div>
        </div>
      </div>

      <!-- Dashboard Tabs -->
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;border-bottom:1px solid #e0e0e0;flex-wrap:wrap;padding-bottom:1rem;">
        <button class="portal-tab active" onclick="switchPortalTab('dashboard')" style="padding:0.75rem 1.5rem;background:none;border:none;color:var(--blue);font-weight:600;cursor:pointer;border-bottom:2px solid var(--blue);margin-bottom:-1rem;">🏠 My Dashboard</button>
        <button class="portal-tab" onclick="switchPortalTab('appointments')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">📅 My Appointments</button>
        <button class="portal-tab" onclick="switchPortalTab('reports')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">📋 My Reports</button>
        <button class="portal-tab" onclick="switchPortalTab('health')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">❤️ Health Info</button>
      </div>

      <!-- Dashboard Tab Content -->
      <div id="portal-dashboard-tab" class="portal-tab-content">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
          <!-- Quick Actions -->
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);font-size:1.1rem;">Quick Actions</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <button style="padding:0.75rem 1rem;background:var(--blue);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="closePlatform();openAppointmentBooking()">📅 Book Appointment</button>
              <button style="padding:0.75rem 1rem;background:var(--teal);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="closePlatform();openReports()">📊 View Reports</button>
              <button style="padding:0.75rem 1rem;background:var(--orange);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="closePlatform();openCalendar()">📅 View Calendar</button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);font-size:1.1rem;">Recent Activity</h3>
            ${appointments.slice(0, 3).map(appt => `
              <div style="padding:0.75rem;border-bottom:1px solid #eee;font-size:0.9rem;">
                <div style="font-weight:600;color:var(--text);">📅 ${appt.department}</div>
                <div style="color:var(--subtext);font-size:0.85rem;">${formatDate(appt.date)} at ${appt.time}</div>
              </div>
            `).join('')}
            ${appointments.length === 0 ? '<div style="color:var(--subtext);padding:1rem;text-align:center;">No appointments yet</div>' : ''}
          </div>
        </div>
      </div>

      <!-- Appointments Tab -->
      <div id="portal-appointments-tab" class="portal-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;color:var(--text);">All Appointments</h3>
            <button style="padding:0.5rem 1rem;background:var(--blue);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.9rem;" onclick="closePlatform();openAppointmentBooking()">+ New Appointment</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${appointments.length > 0 ? appointments.map(appt => `
              <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                  <div>
                    <div style="font-weight:600;color:var(--text);">🏥 ${appt.department}</div>
                    <div style="color:var(--subtext);font-size:0.9rem;margin-top:0.25rem;">📅 ${formatDate(appt.date)} at ⏰ ${appt.time}</div>
                  </div>
                  <span style="background:${new Date(appt.date) > new Date() ? '#d4edda' : '#fff3cd'};color:${new Date(appt.date) > new Date() ? '#155724' : '#856404'};padding:0.25rem 0.75rem;border-radius:4px;font-size:0.8rem;font-weight:600;">${new Date(appt.date) > new Date() ? 'Upcoming' : 'Completed'}</span>
                </div>
                ${appt.reason ? `<div style="color:var(--subtext);font-size:0.9rem;margin-bottom:0.75rem;padding:0.75rem;background:#fff;border-radius:4px;">💬 ${appt.reason}</div>` : ''}
                <div style="display:flex;gap:0.5rem;">
                  <button style="flex:1;padding:0.5rem;background:var(--teal);color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.85rem;" onclick="rescheduleAppointment('${appt.id}')">📅 Reschedule</button>
                  <button style="flex:1;padding:0.5rem;background:#ff6b6b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.85rem;" onclick="cancelAppointment('${appt.id}')">✕ Cancel</button>
                </div>
              </div>
            `).join('') : '<div style="text-align:center;padding:2rem;color:var(--subtext);">No appointments yet. <a href="#" onclick="closePlatform();openAppointmentBooking();return false;" style="color:var(--blue);font-weight:600;">Book your first appointment</a></div>'}
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div id="portal-reports-tab" class="portal-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <h3 style="margin-top:0;color:var(--text);">Lab Reports & Results</h3>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${labReports.length > 0 ? labReports.map(r => `
              <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                  <div>
                    <div style="font-weight:600;color:var(--text);">🩸 ${r.testName}</div>
                    <div style="color:var(--subtext);font-size:0.9rem;margin-top:0.25rem;">📅 ${new Date(r.date).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style="background:${r.status === 'Normal' ? '#d4edda' : '#fff3cd'};color:${r.status === 'Normal' ? '#155724' : '#856404'};padding:0.25rem 0.75rem;border-radius:4px;font-size:0.8rem;font-weight:600;">${r.status}</span>
                </div>
                <button style="width:100%;padding:0.5rem;background:var(--blue);color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.9rem;" onclick="closePlatform();openReports()">View Full Report</button>
              </div>
            `).join('') : '<div style="text-align:center;padding:2rem;color:var(--subtext);">No lab reports available yet. <a href="#" onclick="closePlatform();openReports();return false;" style="color:var(--blue);font-weight:600;">View all reports</a></div>'}
          </div>
        </div>
      </div>

      <!-- Health Info Tab -->
      <div id="portal-health-tab" class="portal-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <h3 style="margin-top:0;color:var(--text);">Health Information</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem;">
            <div style="background:#f9f9f9;border-radius:8px;padding:1rem;border-left:3px solid var(--blue);">
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Blood Type</div>
              <div style="font-size:1.3rem;font-weight:700;color:var(--text);">O+</div>
            </div>
            <div style="background:#f9f9f9;border-radius:8px;padding:1rem;border-left:3px solid var(--teal);">
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Allergies</div>
              <div style="font-size:1rem;color:var(--text);">None reported</div>
            </div>
            <div style="background:#f9f9f9;border-radius:8px;padding:1rem;border-left:3px solid var(--orange);">
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Chronic Conditions</div>
              <div style="font-size:1rem;color:var(--text);">None</div>
            </div>
            <div style="background:#f9f9f9;border-radius:8px;padding:1rem;border-left:3px solid var(--red);">
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">Current Medications</div>
              <div style="font-size:1rem;color:var(--text);">4 active</div>
            </div>
          </div>
          <div style="margin-top:1.5rem;background:#f0f7ff;border:1px solid #bfe3f3;border-radius:8px;padding:1rem;">
            <div style="font-weight:600;color:var(--blue);margin-bottom:0.5rem;">💡 Health Tips</div>
            <div style="font-size:0.9rem;color:var(--subtext);line-height:1.6;">
              • Maintain regular exercise for better health<br>
              • Stay hydrated throughout the day<br>
              • Schedule regular health checkups<br>
              • Keep your medication reminders on
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchPortalTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.portal-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.portal-tab').forEach(btn => {
    btn.style.color = '#999';
    btn.style.borderBottom = 'none';
    btn.style.marginBottom = '0';
  });

  // Show selected tab
  document.getElementById(`portal-${tab}-tab`).style.display = 'block';
  event.target.style.color = 'var(--blue)';
  event.target.style.borderBottom = '2px solid var(--blue)';
  event.target.style.marginBottom = '-1rem';
}

function renderAdminPortal() {
  const content = document.getElementById('platform-content');
  if (!content) return;

  const appointments = getAppointments();
  const registeredUsers = getRegisteredUsers();
  const labReports = getLabReports();

  content.innerHTML = `
    <div style="max-width:1400px;margin:0 auto;padding:1.5rem;">
      <!-- Admin Header -->
      <div style="background:linear-gradient(135deg, #F59E0B 0%, #F97316 100%);border-radius:12px;padding:2rem;color:#fff;margin-bottom:2rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
          <div>
            <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem;">Admin Dashboard</div>
            <h1 style="font-size:2rem;margin:0;font-weight:700;">System Administrator</h1>
            <div style="font-size:0.9rem;opacity:0.85;margin-top:0.5rem;">📊 Manage hospital operations & patient data</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">⚙️</div>
            <button style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Settings coming soon')">Admin Settings</button>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:2rem;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #3B82F6;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">TOTAL PATIENTS</div>
          <div style="font-size:2.5rem;font-weight:700;color:#3B82F6;">${registeredUsers.length}</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">Active users</div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #10B981;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">APPOINTMENTS</div>
          <div style="font-size:2.5rem;font-weight:700;color:#10B981;">${appointments.length}</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">Total bookings</div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #8B5CF6;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">LAB REPORTS</div>
          <div style="font-size:2.5rem;font-weight:700;color:#8B5CF6;">${labReports.length}</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">Recent results</div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #EC4899;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">COMPLIANCE</div>
          <div style="font-size:2.5rem;font-weight:700;color:#EC4899;">98%</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">System uptime</div>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;border-bottom:1px solid #e0e0e0;flex-wrap:wrap;padding-bottom:1rem;">
        <button class="admin-tab active" onclick="switchAdminTab('dashboard')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#F59E0B;font-weight:600;cursor:pointer;border-bottom:2px solid #F59E0B;margin-bottom:-1rem;">📊 Dashboard</button>
        <button class="admin-tab" onclick="switchAdminTab('patients')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">👥 Patients</button>
        <button class="admin-tab" onclick="switchAdminTab('appointments')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">📅 Appointments</button>
        <button class="admin-tab" onclick="switchAdminTab('reports')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">📋 Reports</button>
        <button class="admin-tab" onclick="switchAdminTab('departments')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">🏥 Departments</button>
      </div>

      <!-- Dashboard Tab -->
      <div id="admin-dashboard-tab" class="admin-tab-content">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
          <!-- Quick Stats -->
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);">Recent Appointments</h3>
            ${appointments.slice(0, 5).map(appt => `
              <div style="padding:0.75rem;border-bottom:1px solid #eee;font-size:0.9rem;">
                <div style="font-weight:600;color:var(--text);">📅 ${appt.department}</div>
                <div style="color:var(--subtext);font-size:0.85rem;">${formatDate(appt.date)} at ${appt.time}</div>
              </div>
            `).join('')}
            <button style="width:100%;margin-top:1rem;padding:0.5rem;background:#F59E0B;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.9rem;" onclick="switchAdminTab('appointments')">View All</button>
          </div>

          <!-- System Status -->
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);">System Status</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <div style="padding:0.75rem;background:#f0f9ff;border-left:3px solid #3B82F6;border-radius:4px;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);">✅ Database</div>
                <div style="font-size:0.8rem;color:var(--subtext);">Connected & Healthy</div>
              </div>
              <div style="padding:0.75rem;background:#f0fdf4;border-left:3px solid #10B981;border-radius:4px;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);">✅ API Service</div>
                <div style="font-size:0.8rem;color:var(--subtext);">Running (5 servers)</div>
              </div>
              <div style="padding:0.75rem;background:#fef2f2;border-left:3px solid #EC4899;border-radius:4px;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);">⚠️ Storage</div>
                <div style="font-size:0.8rem;color:var(--subtext);">72% capacity used</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);">Admin Actions</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <button style="padding:0.75rem 1rem;background:#3B82F6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Add patient feature coming soon')">➕ Add New Patient</button>
              <button style="padding:0.75rem 1rem;background:#10B981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Approve appointments feature coming soon')">✓ Approve Pending</button>
              <button style="padding:0.75rem 1rem;background:#8B5CF6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Generate reports coming soon')">📊 Generate Report</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Patients Tab -->
      <div id="admin-patients-tab" class="admin-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <h3 style="margin:0;color:var(--text);">Patient Management</h3>
            <div style="display:flex;gap:0.5rem;">
              <input type="text" placeholder="Search patients..." style="padding:0.5rem 1rem;border:1px solid #ddd;border-radius:6px;font-size:0.9rem;" />
              <button style="padding:0.5rem 1rem;background:#3B82F6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">🔍 Search</button>
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
              <thead>
                <tr style="background:#f5f5f5;border-bottom:2px solid #e0e0e0;">
                  <th style="padding:1rem;text-align:left;font-weight:600;">Patient Name</th>
                  <th style="padding:1rem;text-align:left;font-weight:600;">Email</th>
                  <th style="padding:1rem;text-align:left;font-weight:600;">Phone</th>
                  <th style="padding:1rem;text-align:left;font-weight:600;">Status</th>
                  <th style="padding:1rem;text-align:left;font-weight:600;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${registeredUsers.length > 0 ? registeredUsers.map(user => `
                  <tr style="border-bottom:1px solid #e0e0e0;">
                    <td style="padding:1rem;">${user.name}</td>
                    <td style="padding:1rem;color:var(--subtext);font-size:0.85rem;">${user.email}</td>
                    <td style="padding:1rem;color:var(--subtext);font-size:0.85rem;">${user.phone}</td>
                    <td style="padding:1rem;"><span style="background:#d4edda;color:#155724;padding:0.25rem 0.75rem;border-radius:4px;font-size:0.75rem;font-weight:600;">Active</span></td>
                    <td style="padding:1rem;">
                      <button style="padding:0.4rem 0.8rem;background:#3B82F6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;margin-right:0.5rem;" onclick="showToast('View patient details coming soon')">View</button>
                      <button style="padding:0.4rem 0.8rem;background:#EC4899;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;" onclick="showToast('Edit patient coming soon')">Edit</button>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="padding:2rem;text-align:center;color:var(--subtext);">No patients registered yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Appointments Tab -->
      <div id="admin-appointments-tab" class="admin-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <h3 style="margin-top:0;color:var(--text);">Appointment Management</h3>
          <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem;">
            ${appointments.length > 0 ? appointments.map(appt => `
              <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                  <div>
                    <div style="font-weight:600;color:var(--text);">🏥 ${appt.department}</div>
                    <div style="color:var(--subtext);font-size:0.9rem;margin-top:0.25rem;">📅 ${formatDate(appt.date)} at ⏰ ${appt.time}</div>
                    <div style="color:var(--subtext);font-size:0.9rem;margin-top:0.25rem;">👤 ${appt.name}</div>
                  </div>
                  <span style="background:#d4edda;color:#155724;padding:0.25rem 0.75rem;border-radius:4px;font-size:0.8rem;font-weight:600;">Scheduled</span>
                </div>
                <div style="display:flex;gap:0.5rem;">
                  <button style="flex:1;padding:0.5rem;background:#10B981;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.85rem;" onclick="showToast('Approve appointment')">✓ Approve</button>
                  <button style="flex:1;padding:0.5rem;background:#3B82F6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.85rem;" onclick="showToast('View details')">👁 View</button>
                  <button style="flex:1;padding:0.5rem;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.85rem;" onclick="showToast('Cancel appointment')">✕ Cancel</button>
                </div>
              </div>
            `).join('') : '<div style="text-align:center;padding:2rem;color:var(--subtext);">No appointments scheduled</div>'}
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div id="admin-reports-tab" class="admin-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;color:var(--text);">Lab Reports & Analytics</h3>
            <button style="padding:0.5rem 1rem;background:#8B5CF6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Generate analytics report')">📊 Export Report</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-bottom:2rem;">
            <div style="background:#f0f9ff;border-radius:8px;padding:1rem;border-left:3px solid #3B82F6;">
              <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;">Total Results Processed</div>
              <div style="font-size:2rem;font-weight:700;color:#3B82F6;">${labReports.length}</div>
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:1rem;border-left:3px solid #10B981;">
              <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;">Normal Results</div>
              <div style="font-size:2rem;font-weight:700;color:#10B981;">${labReports.filter(r => r.status === 'Normal').length}</div>
            </div>
            <div style="background:#fef3c7;border-radius:8px;padding:1rem;border-left:3px solid #F59E0B;">
              <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;">Abnormal Results</div>
              <div style="font-size:2rem;font-weight:700;color:#F59E0B;">${labReports.filter(r => r.status !== 'Normal').length}</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${labReports.length > 0 ? labReports.map(r => `
              <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f9f9f9;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                  <div>
                    <div style="font-weight:600;color:var(--text);">🩸 ${r.testName}</div>
                    <div style="color:var(--subtext);font-size:0.9rem;margin-top:0.25rem;">📅 ${new Date(r.date).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style="background:${r.status === 'Normal' ? '#d4edda' : '#fef3c7'};color:${r.status === 'Normal' ? '#155724' : '#856404'};padding:0.25rem 0.75rem;border-radius:4px;font-size:0.8rem;font-weight:600;">${r.status}</span>
                </div>
              </div>
            `).join('') : '<div style="text-align:center;padding:2rem;color:var(--subtext);">No lab reports available</div>'}
          </div>
        </div>
      </div>

      <!-- Departments Tab -->
      <div id="admin-departments-tab" class="admin-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;color:var(--text);">Department Management</h3>
            <button style="padding:0.5rem 1rem;background:#3B82F6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Add department coming soon')">➕ Add Department</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;text-align:center;background:#f9f9f9;">
              <div style="font-size:2rem;margin-bottom:0.5rem;">❤️</div>
              <div style="font-weight:600;color:var(--text);">Cardiology</div>
              <div style="font-size:0.8rem;color:var(--subtext);margin-top:0.5rem;">85 Doctors • 234 Patients</div>
            </div>
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;text-align:center;background:#f9f9f9;">
              <div style="font-size:2rem;margin-bottom:0.5rem;">🧠</div>
              <div style="font-weight:600;color:var(--text);">Neurology</div>
              <div style="font-size:0.8rem;color:var(--subtext);margin-top:0.5rem;">62 Doctors • 156 Patients</div>
            </div>
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;text-align:center;background:#f9f9f9;">
              <div style="font-size:2rem;margin-bottom:0.5rem;">🦴</div>
              <div style="font-weight:600;color:var(--text);">Orthopedics</div>
              <div style="font-size:0.8rem;color:var(--subtext);margin-top:0.5rem;">74 Doctors • 189 Patients</div>
            </div>
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;text-align:center;background:#f9f9f9;">
              <div style="font-size:2rem;margin-bottom:0.5rem;">🔬</div>
              <div style="font-weight:600;color:var(--text);">Oncology</div>
              <div style="font-size:0.8rem;color:var(--subtext);margin-top:0.5rem;">90 Doctors • 267 Patients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchAdminTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.style.color = '#999';
    btn.style.borderBottom = 'none';
    btn.style.marginBottom = '0';
  });

  // Show selected tab
  document.getElementById(`admin-${tab}-tab`).style.display = 'block';
  event.target.style.color = '#F59E0B';
  event.target.style.borderBottom = '2px solid #F59E0B';
  event.target.style.marginBottom = '-1rem';
}

function renderHospitalPortal() {
  const content = document.getElementById('platform-content');
  if (!content) return;

  const appointments = getAppointments();

  content.innerHTML = `
    <div style="max-width:1400px;margin:0 auto;padding:1.5rem;">
      <!-- Hospital Manager Header -->
      <div style="background:linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);border-radius:12px;padding:2rem;color:#fff;margin-bottom:2rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
          <div>
            <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem;">Hospital Operations</div>
            <h1 style="font-size:2rem;margin:0;font-weight:700;">Kilari's Hospital Management</h1>
            <div style="font-size:0.9rem;opacity:0.85;margin-top:0.5rem;">🏥 Manage beds, doctors, and operations</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">🏥</div>
            <button style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Hospital settings coming soon')">Hospital Settings</button>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:2rem;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #3B82F6;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">BEDS AVAILABLE</div>
          <div style="font-size:2.5rem;font-weight:700;color:#3B82F6;">245/500</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">49% Occupancy</div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #10B981;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">DOCTORS ON DUTY</div>
          <div style="font-size:2.5rem;font-weight:700;color:#10B981;">32</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">Specialists available</div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #8B5CF6;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">EMERGENCY CASES</div>
          <div style="font-size:2.5rem;font-weight:700;color:#8B5CF6;">12</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">In treatment</div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;text-align:center;border-top:4px solid #EC4899;">
          <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:0.5rem;font-weight:600;">SURGERIES TODAY</div>
          <div style="font-size:2.5rem;font-weight:700;color:#EC4899;">8</div>
          <div style="font-size:0.75rem;color:var(--subtext);margin-top:0.5rem;">Scheduled</div>
        </div>
      </div>

      <!-- Hospital Tabs -->
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;border-bottom:1px solid #e0e0e0;flex-wrap:wrap;padding-bottom:1rem;">
        <button class="hospital-tab active" onclick="switchHospitalTab('overview')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#3B82F6;font-weight:600;cursor:pointer;border-bottom:2px solid #3B82F6;margin-bottom:-1rem;">📊 Overview</button>
        <button class="hospital-tab" onclick="switchHospitalTab('beds')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">🛏️ Beds</button>
        <button class="hospital-tab" onclick="switchHospitalTab('doctors')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">👨‍⚕️ Doctors</button>
        <button class="hospital-tab" onclick="switchHospitalTab('emergency')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">🚨 Emergency</button>
        <button class="hospital-tab" onclick="switchHospitalTab('schedule')" style="padding:0.75rem 1.5rem;background:none;border:none;color:#999;font-weight:500;cursor:pointer;margin-bottom:-1rem;">📅 Schedule</button>
      </div>

      <!-- Overview Tab -->
      <div id="hospital-overview-tab" class="hospital-tab-content">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);">Today's Schedule</h3>
            ${appointments.slice(0, 5).map(appt => `
              <div style="padding:0.75rem;border-bottom:1px solid #eee;font-size:0.9rem;">
                <div style="font-weight:600;color:var(--text);">📅 ${appt.department}</div>
                <div style="color:var(--subtext);font-size:0.85rem;">${appt.time} - ${appt.name}</div>
              </div>
            `).join('')}
          </div>

          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);">Ward Status</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <div style="padding:0.75rem;background:#f0f9ff;border-radius:4px;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);">ICU</div>
                <div style="font-size:0.8rem;color:var(--subtext);">45/50 beds occupied</div>
              </div>
              <div style="padding:0.75rem;background:#f0fdf4;border-radius:4px;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);">General Ward</div>
                <div style="font-size:0.8rem;color:var(--subtext);">120/150 beds occupied</div>
              </div>
              <div style="padding:0.75rem;background:#fef3c7;border-radius:4px;">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text);">Maternity</div>
                <div style="font-size:0.8rem;color:var(--subtext);">25/40 beds occupied</div>
              </div>
            </div>
          </div>

          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
            <h3 style="margin-top:0;color:var(--text);">Quick Actions</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <button style="padding:0.75rem 1rem;background:#3B82F6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Admit patient feature coming soon')">🚑 Admit Patient</button>
              <button style="padding:0.75rem 1rem;background:#10B981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Discharge patient feature coming soon')">✓ Discharge</button>
              <button style="padding:0.75rem 1rem;background:#8B5CF6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Emergency alert feature coming soon')">🚨 Emergency Alert</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Beds Tab -->
      <div id="hospital-beds-tab" class="hospital-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <h3 style="margin-top:0;color:var(--text);">Bed Management</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1.5rem;">
            ${['ICU', 'General Ward', 'Maternity', 'Surgery', 'Pediatrics', 'Cardiology'].map((ward, idx) => `
              <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;text-align:center;background:#f9f9f9;">
                <div style="font-weight:600;color:var(--text);margin-bottom:0.75rem;">${ward}</div>
                <div style="display:flex;justify-content:space-around;margin:1rem 0;">
                  <div>
                    <div style="font-size:1.5rem;font-weight:700;color:#10B981;">${[45,120,25,18,35,22][idx]}</div>
                    <div style="font-size:0.7rem;color:var(--subtext);">Occupied</div>
                  </div>
                  <div>
                    <div style="font-size:1.5rem;font-weight:700;color:#3B82F6;">${[5,30,15,7,10,8][idx]}</div>
                    <div style="font-size:0.7rem;color:var(--subtext);">Available</div>
                  </div>
                </div>
                <button style="width:100%;padding:0.5rem;background:#3B82F6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;font-weight:600;" onclick="showToast('View ${ward} beds')">View Beds</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Doctors Tab -->
      <div id="hospital-doctors-tab" class="hospital-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;color:var(--text);">Doctor Roster</h3>
            <button style="padding:0.5rem 1rem;background:#3B82F6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;" onclick="showToast('Add doctor coming soon')">➕ Add Doctor</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;">
            ${['Dr. Arjun Mehta\nCardiology', 'Dr. Priya Nair\nNeurology', 'Dr. Samuel Osei\nOncology', 'Dr. Ananya Sharma\nOrthopedics', 'Dr. Raj Kumar\nEmergency', 'Dr. Neha Singh\nPediatrics'].map((doc, idx) => `
              <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;background:#f9f9f9;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">👨‍⚕️</div>
                <div style="font-weight:600;color:var(--text);margin-bottom:0.5rem;">${doc.split('\\n')[0]}</div>
                <div style="font-size:0.85rem;color:var(--subtext);margin-bottom:1rem;">${doc.split('\\n')[1]}</div>
                <div style="display:flex;gap:0.5rem;">
                  <button style="flex:1;padding:0.4rem;background:#10B981;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;" onclick="showToast('View schedule')">📅</button>
                  <button style="flex:1;padding:0.4rem;background:#3B82F6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;" onclick="showToast('Edit info')">✎</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Emergency Tab -->
      <div id="hospital-emergency-tab" class="hospital-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <h3 style="margin-top:0;color:var(--text);">Emergency Cases</h3>
          <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem;">
            <div style="border-left:4px solid #ef4444;background:#fef2f2;border-radius:8px;padding:1rem;">
              <div style="font-weight:600;color:#991b1b;margin-bottom:0.5rem;">🚨 Trauma - Road Accident</div>
              <div style="font-size:0.9rem;color:#7f1d1d;margin-bottom:0.75rem;">Patient: Male, 35 years | Bed: ICU-12</div>
              <div style="display:flex;gap:0.5rem;">
                <button style="flex:1;padding:0.5rem;background:#ef4444;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;font-weight:600;" onclick="showToast('View full details')">View Details</button>
                <button style="flex:1;padding:0.5rem;background:#3B82F6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;font-weight:600;" onclick="showToast('Alert team')">📢 Alert Team</button>
              </div>
            </div>
            <div style="border-left:4px solid #f59e0b;background:#fffbeb;border-radius:8px;padding:1rem;">
              <div style="font-weight:600;color:#92400e;margin-bottom:0.5rem;">⚠️ Cardiac Arrest - Monitored</div>
              <div style="font-size:0.9rem;color:#b45309;margin-bottom:0.75rem;">Patient: Female, 58 years | Bed: ICU-08</div>
              <div style="display:flex;gap:0.5rem;">
                <button style="flex:1;padding:0.5rem;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;font-weight:600;" onclick="showToast('View full details')">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Tab -->
      <div id="hospital-schedule-tab" class="hospital-tab-content" style="display:none;">
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:1.5rem;">
          <h3 style="margin-top:0;color:var(--text);">Operation Theater Schedule</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-top:1.5rem;">
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f0f9ff;">
              <div style="font-weight:600;color:var(--text);margin-bottom:0.75rem;">OT-1: Cardiology</div>
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;">09:00 AM - Dr. Arjun Mehta</div>
              <div style="font-size:0.85rem;color:var(--subtext);">Coronary Bypass Surgery</div>
              <div style="margin-top:0.75rem;background:#10B981;color:#fff;padding:0.5rem;border-radius:4px;text-align:center;font-size:0.8rem;font-weight:600;">IN PROGRESS</div>
            </div>
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#f0fdf4;">
              <div style="font-weight:600;color:var(--text);margin-bottom:0.75rem;">OT-2: Orthopedics</div>
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;">10:30 AM - Dr. Ananya Sharma</div>
              <div style="font-size:0.85rem;color:var(--subtext);">ACL Reconstruction</div>
              <div style="margin-top:0.75rem;background:#3B82F6;color:#fff;padding:0.5rem;border-radius:4px;text-align:center;font-size:0.8rem;font-weight:600;">SCHEDULED</div>
            </div>
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;background:#fef3c7;">
              <div style="font-weight:600;color:var(--text);margin-bottom:0.75rem;">OT-3: General Surgery</div>
              <div style="font-size:0.9rem;color:var(--subtext);margin-bottom:0.5rem;">02:00 PM - Dr. Vikram Singh</div>
              <div style="font-size:0.85rem;color:var(--subtext);">Appendectomy</div>
              <div style="margin-top:0.75rem;background:#f59e0b;color:#fff;padding:0.5rem;border-radius:4px;text-align:center;font-size:0.8rem;font-weight:600;">PENDING</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchHospitalTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.hospital-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.hospital-tab').forEach(btn => {
    btn.style.color = '#999';
    btn.style.borderBottom = 'none';
    btn.style.marginBottom = '0';
  });

  // Show selected tab
  document.getElementById(`hospital-${tab}-tab`).style.display = 'block';
  event.target.style.color = '#3B82F6';
  event.target.style.borderBottom = '2px solid #3B82F6';
  event.target.style.marginBottom = '-1rem';
}




  






  
    
  




/* ── 1. STICKY NAV SCROLL EFFECT ── */
(function () {
  var nav = document.querySelector('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ── 2. BACK TO TOP BUTTON ── */
(function () {
  var btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
})();



/* ── 3. SCROLL SPY NAV LINKS ── */
(function () {
  var sections = [
    { id: 'departments', link: '[href="#departments"]' },
    { id: 'doctors', link: '[href="#doctors"]' },
    { id: 'blood', link: '[href="#blood"]' },
    { id: 'locations', link: '[href="#locations"]' }
  ];

  function onScroll() {
    var scrollY = window.scrollY + 120;
    sections.forEach(function (s) {
      var el = document.getElementById(s.id);
      var lnk = document.querySelector('.nav-menu ' + s.link);
      if (!el || !lnk) return;
      var inView = scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight;
      lnk.classList.toggle('spy-active', inView);
      lnk.classList.toggle('active', inView);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── 4. SCROLL REVEAL (Intersection Observer) ── */
(function () {
  var targets = document.querySelectorAll(
    '.spec-card, .doc-card, .svc-card, .bt-item, .testi-card, .loc-card, ' +
    '.why-point, .blood-feat, .num-item, .hstat, .p-stat, .new-class'
  );

  var delays = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5'];

  targets.forEach(function (el, i) {

    el.classList.add('reveal');

    if (i % 6 !== 0) el.classList.add(delays[i % 6]);

  });



  var observer = new IntersectionObserver(function (entries) {

    entries.forEach(function (e) {

      if (e.isIntersecting) {

        e.target.classList.add('visible');

        observer.unobserve(e.target);

      }

    });

  }, { threshold: 0.1 });



  targets.forEach(function (el) { observer.observe(el); });

})();



/* ── 5. SECTION TITLE REVEALS ── */

(function () {

  var headers = document.querySelectorAll('.sec-header, .why-grid > div:last-child, .blood-grid > div:first-child');

  headers.forEach(function (el) {

    el.classList.add('reveal');

  });

  var observer2 = new IntersectionObserver(function (entries) {

    entries.forEach(function (e) {

      if (e.isIntersecting) { e.target.classList.add('visible'); observer2.unobserve(e.target); }

    });

  }, { threshold: 0.12 });

  headers.forEach(function (el) { observer2.observe(el); });

})();



/* ── 6. NEWSLETTER SUBSCRIBE ── */

function subscribeNewsletter() {

  var email = document.getElementById('nl-email').value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

    showToast('⚠️ Please enter a valid email address');

    return;

  }

  document.getElementById('nl-email').value = '';

  showToast('✅ Subscribed! You\'ll receive health tips at ' + email);

}



/* ── 7. HERO SEARCH ENTER KEY ── */

document.addEventListener('DOMContentLoaded', function () {

  var inp = document.getElementById('hero-search-input');

  if (inp) {

    inp.addEventListener('keydown', function (e) {

      if (e.key === 'Enter') requireLogin();

    });

  }

});









(function () {

  // Show splash for 3 seconds, then fade out and reveal site

  var SPLASH_DURATION = 3000; // 3 seconds total display time

  var FADE_DURATION = 700;  // matches CSS transition duration



  var splash = document.getElementById('splash-screen');



  // After SPLASH_DURATION ms, start the fade-out

  setTimeout(function () {

    splash.classList.add('hide');

    // After fade completes, remove from DOM and restore scroll

    setTimeout(function () {

      splash.style.display = 'none';

      document.body.classList.remove('splash-active');

    }, FADE_DURATION);

  }, SPLASH_DURATION);

})();

