
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

  // Keyboard: Escape closes modals, Enter submits login form
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLoginModal(); closePlatform(); }
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
});

/* ═══════════════════════════════════════════════════
   AUTH STATE
   ═══════════════════════════════════════════════════ */
const DEMO_USER = { email: 'patient@meridian.com', password: 'Patient@123', name: 'Rahul Sharma', firstName: 'Rahul', phone: '+91 98765 43210' };
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
      <button class="btn-book" onclick="requireLogin()">📅 Book Appointment</button>
      <div class="nav-user" id="nav-user-wrap">
        <div class="nav-avatar" onclick="toggleUserDropdown(event)">${initials}</div>
        <span class="nav-user-name" onclick="toggleUserDropdown(event)">${currentUser.firstName}</span>
        <div class="nav-user-dropdown" id="nav-dropdown">
          <div class="nud-header">
            <div class="nud-name">${currentUser.name}</div>
            <div class="nud-email">${currentUser.email}</div>
          </div>
          <button class="nud-item" onclick="openPlatform('patient');closeDropdown()">🏠 My Dashboard</button>
          <button class="nud-item" onclick="setPatSec&&setPatSec('book');openPlatform('patient');closeDropdown()">📅 Book Appointment</button>
          <button class="nud-item" onclick="setPatSec&&setPatSec('reports');openPlatform('patient');closeDropdown()">📊 My Reports</button>
          <button class="nud-item" onclick="setPatSec&&setPatSec('myappts');openPlatform('patient');closeDropdown()">📋 My Appointments</button>
          <div class="nud-divider"></div>
          <button class="nud-item danger" onclick="doLogout()">🚪 Sign Out</button>
        </div>
      </div>`;
    // Mobile
    if (mobileActions) mobileActions.innerHTML = `
      <button class="btn-book" onclick="closeNav();openPlatform('patient')">📅 Book Appointment</button>
      <button class="btn-login" style="background:rgba(230,57,70,.1);color:var(--red);border-color:var(--red);" onclick="closeNav();doLogout()">🚪 Sign Out (${currentUser.firstName})</button>`;
  } else {
    // Desktop
    actions.innerHTML = `
      <button class="btn-login" id="nav-login-btn" onclick="openLoginModal('login')">Patient Login</button>
      <button class="btn-book" id="nav-book-btn" onclick="requireLogin()">Book Appointment</button>`;
    // Mobile
    if (mobileActions) mobileActions.innerHTML = `
      <button class="btn-login" onclick="closeNav();openLoginModal('login')">Patient Login</button>
      <button class="btn-book" onclick="closeNav();requireLogin()">Book Appointment</button>`;
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
// Close nav & dropdown on outside click — handled in DOMContentLoaded above

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
    document.getElementById('lm-sub').textContent = 'Join Meridian Health Platform';
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
  // Demo social login — auto-login with demo user
  showSuccessState(`Signed in with ${provider}`, DEMO_USER);
}

/* ─── LOGIN ─── */
function doLogin() {
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
  setTimeout(() => {
    setLoading('login-submit-btn', false);
    // Check demo credentials (or accept any registered user)
    const registered = getRegisteredUsers();
    const found = registered.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (email.toLowerCase() === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
      showSuccessState('Welcome back, Rahul!', DEMO_USER);
    } else if (found) {
      showSuccessState(`Welcome back, ${found.firstName}!`, found);
    } else {
      document.getElementById('login-email')?.classList.add('error');
      document.getElementById('login-password')?.classList.add('error');
      showErr('login-pw-err', 'Incorrect email or password. Use patient@meridian.com / Patient@123');
    }
  }, 1200);
}

/* ─── REGISTER ─── */
function doRegister() {
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
  setTimeout(() => {
    setLoading('reg-submit-btn', false);
    const newUser = { name: fname + ' ' + lname, firstName: fname, email, phone, password };
    // save to registered users
    const all = getRegisteredUsers();
    if (all.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      document.getElementById('reg-email')?.classList.add('error');
      showErr('reg-email-err', 'This email is already registered. Please sign in.');
      return;
    }
    all.push(newUser);
    try { sessionStorage.setItem('mh_reg_users', JSON.stringify(all)); } catch (e) { }
    showSuccessState(`Account created! Welcome, ${fname}!`, newUser);
  }, 1400);
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
  document.getElementById('lm-success-sub').textContent = 'Opening your patient portal…';
  saveUser(user);
  renderNavAuth();
  setTimeout(() => {
    closeLoginModal();
    openPlatform('patient');
  }, 1600);
}

/* ─── LOGOUT ─── */
function doLogout() {
  closeDropdown();
  closePlatform();
  clearUser();
  currentUser = null;
  renderNavAuth();
  // Show brief toast
  showToast('👋 Signed out successfully');
}

/* ─── REQUIRE LOGIN guard ─── */
function requireLogin() {
  if (currentUser) { openPlatform('patient'); }
  else { openLoginModal('login'); }
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

/* data, state, platform functions below */
const DAILY = [{ day: 'Mon', d: 3, h: 1, p: 24, paid: 18 }, { day: 'Tue', d: 5, h: 2, p: 31, paid: 22 }, { day: 'Wed', d: 2, h: 1, p: 38, paid: 29 }, { day: 'Thu', d: 7, h: 3, p: 45, paid: 34 }, { day: 'Fri', d: 4, h: 2, p: 52, paid: 41 }, { day: 'Sat', d: 6, h: 1, p: 60, paid: 48 }, { day: 'Sun', d: 3, h: 2, p: 55, paid: 44 }];
const MONTHLY = [{ m: 'Jan', d: 12, h: 4, p: 180, paid: 132, free: 48 }, { m: 'Feb', d: 18, h: 6, p: 220, paid: 165, free: 55 }, { m: 'Mar', d: 25, h: 8, p: 310, paid: 241, free: 69 }, { m: 'Apr', d: 31, h: 10, p: 390, paid: 298, free: 92 }, { m: 'May', d: 40, h: 13, p: 470, paid: 371, free: 99 }, { m: 'Jun', d: 52, h: 16, p: 560, paid: 430, free: 130 }];
const HOSPITALS = [{ id: 1, name: 'Meridian Medical Center', city: 'Hyderabad', rating: 4.9, depts: ['Cardiology', 'Neurology', 'Orthopedics'], joined: '2024-01-15' }, { id: 2, name: 'Apollo Health Hub', city: 'Mumbai', rating: 4.7, depts: ['Oncology', 'Pediatrics', 'Pulmonology'], joined: '2024-02-10' }, { id: 3, name: 'City Care Hospital', city: 'Bangalore', rating: 4.5, depts: ['General Medicine', 'Ophthalmology'], joined: '2024-03-05' }, { id: 4, name: 'Sunrise Multispecialty', city: 'Chennai', rating: 4.8, depts: ['Cardiology', 'Orthopedics'], joined: '2024-04-20' }];
const DOCTORS = [{ id: 1, name: 'Dr. Arjun Mehta', spec: 'Cardiologist', hosp: 'Meridian Medical Center', exp: 18, rating: 4.9, av: true }, { id: 2, name: 'Dr. Priya Nair', spec: 'Neurologist', hosp: 'Apollo Health Hub', exp: 15, rating: 4.8, av: true }, { id: 3, name: 'Dr. Samuel Osei', spec: 'Oncologist', hosp: 'City Care Hospital', exp: 21, rating: 5.0, av: false }, { id: 4, name: 'Dr. Ananya Sharma', spec: 'Orthopedic', hosp: 'Sunrise Multispecialty', exp: 12, rating: 4.7, av: true }];
const BLOOD_TESTS = [{ id: 1, name: 'Complete Blood Count (CBC)', price: 299, turn: '24 hrs' }, { id: 2, name: 'Lipid Profile', price: 499, turn: '24 hrs' }, { id: 3, name: 'HbA1c (Diabetes)', price: 599, turn: '24 hrs' }, { id: 4, name: 'Thyroid Panel', price: 799, turn: '48 hrs' }, { id: 5, name: 'Liver Function Test', price: 699, turn: '24 hrs' }, { id: 6, name: 'Kidney Function Test', price: 649, turn: '24 hrs' }];
const REPORTS = [{ id: 'RPT-001', test: 'Complete Blood Count (CBC)', date: '2025-02-10', status: 'Normal', res: [{ p: 'Hemoglobin', v: '14.2 g/dL', r: '13.5–17.5 g/dL', s: 'Normal' }, { p: 'RBC Count', v: '5.1 M/µL', r: '4.5–5.9 M/µL', s: 'Normal' }, { p: 'WBC Count', v: '7200 /µL', r: '4500–11000 /µL', s: 'Normal' }, { p: 'Platelets', v: '285000 /µL', r: '150000–400000', s: 'Normal' }] }, { id: 'RPT-002', test: 'Lipid Profile', date: '2025-01-22', status: 'Borderline', res: [{ p: 'Total Cholesterol', v: '215 mg/dL', r: '<200 mg/dL', s: 'High' }, { p: 'LDL', v: '138 mg/dL', r: '<100 mg/dL', s: 'High' }, { p: 'HDL', v: '52 mg/dL', r: '>40 mg/dL', s: 'Normal' }, { p: 'Triglycerides', v: '145 mg/dL', r: '<150 mg/dL', s: 'Normal' }] }];
const MY_APPTS = [{ hosp: 'Meridian Medical Center', doc: 'Dr. Arjun Mehta', date: '2025-02-25', time: '10:30 AM', status: 'Confirmed', type: 'Cardiology' }, { hosp: 'Apollo Health Hub', doc: 'Dr. Priya Nair', date: '2025-03-10', time: '2:00 PM', status: 'Pending', type: 'Neurology' }];
const MY_BLOOD = [{ test: 'CBC', date: '2025-02-10', time: '8:00 AM', status: 'Report Ready', rpt: 'RPT-001' }, { test: 'Lipid Profile', date: '2025-01-22', time: '9:00 AM', status: 'Report Ready', rpt: 'RPT-002' }];

/* ─────────── STATE ─────────── */
let role = 'patient', adminTab = 'overview', patSec = 'home';
let bStep = 1, blStep = 1;
let selH = null, selD = null, selT = null;
let aDate = '', aTime = '', bDate = '', bTime = '', bAddr = '';
let bDone = false, blDone = false, viewRpt = null;
const charts = {};

/* ─────────── OPEN/CLOSE ─────────── */
function openPlatform(r) {
  // Patient portal requires login
  if (r === 'patient' && !currentUser) {
    openLoginModal('login');
    return;
  }
  role = r; bStep = 1; blStep = 1; selH = selD = selT = null;
  aDate = aTime = bDate = bTime = bAddr = ''; bDone = blDone = false; viewRpt = null; patSec = 'home'; adminTab = 'overview';
  document.getElementById('platform-overlay').classList.add('show');
  document.getElementById('pt-role-label').textContent = r.charAt(0).toUpperCase() + r.slice(1);
  renderPlatform();
}
function closePlatform() {
  document.getElementById('platform-overlay').classList.remove('show');
  Object.values(charts).forEach(c => { try { c.destroy(); } catch (e) { } });
  for (let k in charts) delete charts[k];
}

/* ─────────── RENDER ─────────── */
function renderPlatform() {
  const el = document.getElementById('platform-content');
  if (role === 'admin') el.innerHTML = renderAdmin();
  else if (role === 'hospital') el.innerHTML = renderHosp();
  else el.innerHTML = renderPatient();
  bindEvents();
  setTimeout(renderCharts, 60);
}
function setAdminTab(t) { adminTab = t; renderPlatform(); }
function setPatSec(s) { patSec = s; bStep = 1; blStep = 1; selH = selD = selT = null; aDate = aTime = bDate = bTime = bAddr = ''; bDone = blDone = false; viewRpt = null; renderPlatform(); }

/* ─────────── HELPERS ─────────── */
const CC = '<style>canvas{width:100%!important;}</style>';
function sc(icon, lbl, val, sub, accent) { return `<div class="p-stat"><div class="p-stat-glow" style="background:${accent}"></div><div class="p-stat-icon">${icon}</div><div class="p-stat-label">${lbl}</div><div class="p-stat-value">${val}</div><div class="p-stat-sub" style="color:${accent}">${sub}</div></div>`; }
function badge(text, cls) { return `<span class="p-badge p-badge-${cls}">${text}</span>`; }
function stepBars(n, total, color) { return `<div class="p-step-bar">${Array.from({ length: total }, (_, i) => `<div class="p-bar" style="background:${i < n ? color : 'rgba(255,255,255,0.1)'}"></div>`).join('')}</div>`; }

/* ─────────── ADMIN ─────────── */
function renderAdmin() {
  const tabs = ['overview', 'growth', 'paid', 'hospitals', 'doctors'];
  let body = '';
  if (adminTab === 'overview') {
    body = `<div class="p-grid2">
      <div class="p-chart-card"><div class="p-chart-label">Monthly Growth — Doctors, Hospitals & Patients</div><canvas id="c1" height="130"></canvas></div>
      <div class="p-chart-card"><div class="p-chart-label">Patient Split</div><canvas id="c2" height="170"></canvas>
        <div class="pie-legend">
          <div class="pie-leg-row"><span class="pie-leg-label"><span class="pie-dot" style="background:#00C9A7"></span>Paid Patients</span><span style="color:#fff;font-weight:600">430</span></div>
          <div class="pie-leg-row"><span class="pie-leg-label"><span class="pie-dot" style="background:#F4845F"></span>Free Patients</span><span style="color:#fff;font-weight:600">130</span></div>
        </div>
      </div>
    </div>`;
  } else if (adminTab === 'growth') {
    body = `<div class="p-grid-eq">
      <div class="p-chart-card"><div class="p-chart-label">Daily New Joinings</div><canvas id="c3" height="150"></canvas></div>
      <div class="p-chart-card"><div class="p-chart-label">Monthly Patient Growth (Area)</div><canvas id="c4" height="150"></canvas></div>
    </div>`;
  } else if (adminTab === 'paid') {
    body = `<div class="p-grid-eq">
      <div class="p-chart-card"><div class="p-chart-label">Paid vs Free (Bar)</div><canvas id="c5" height="150"></canvas></div>
      <div class="p-chart-card"><div class="p-chart-label">Paid Conversion Trend (Line)</div><canvas id="c6" height="150"></canvas></div>
    </div>`;
  } else if (adminTab === 'hospitals') {
    body = `<div class="p-table-wrap"><div class="p-table-head"><span class="p-table-head-title">Registered Hospitals</span></div>
    <table class="p-table"><thead><tr><th>Hospital</th><th>City</th><th>Rating</th><th>Departments</th><th>Joined</th></tr></thead><tbody>
    ${HOSPITALS.map(h => `<tr><td style="color:#fff;font-weight:500">${h.name}</td><td>${h.city}</td><td style="color:#F59E0B">★ ${h.rating}</td><td>${h.depts.map(d => `<span class="p-dept-tag" style="background:rgba(0,201,167,.08);color:#00C9A7;font-size:.63rem;padding:.12rem .45rem;border-radius:50px;margin:2px;display:inline-block">${d}</span>`).join('')}</td><td>${h.joined}</td></tr>`).join('')}
    </tbody></table></div>`;
  } else if (adminTab === 'doctors') {
    body = `<div class="p-table-wrap"><div class="p-table-head"><span class="p-table-head-title">Registered Doctors</span></div>
    <table class="p-table"><thead><tr><th>Doctor</th><th>Specialty</th><th>Hospital</th><th>Exp</th><th>Rating</th><th>Status</th></tr></thead><tbody>
    ${DOCTORS.map(d => `<tr><td style="color:#fff;font-weight:500">${d.name}</td><td>${d.spec}</td><td>${d.hosp}</td><td>${d.exp} yrs</td><td style="color:#F59E0B">★ ${d.rating}</td><td>${badge(d.av ? 'Available' : 'Unavailable', d.av ? 'teal' : 'red')}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  return `<div class="p-pad">${CC}<div class="p-sec-title">Admin Dashboard</div><div class="p-sec-sub">Real-time platform analytics</div>
  <div class="p-stats-grid">${sc('🏥', 'Total Hospitals', '127', '+3 today', '#00C9A7')}${sc('👨‍⚕️', 'Total Doctors', '842', '+7 today', '#3B82F6')}${sc('🧑‍🤝‍🧑', 'Total Patients', '15,430', '+55 today', '#F59E0B')}${sc('💳', 'Paid Patients', '11,204', '72.6% conversion', '#EC4899')}</div>
  <div class="p-tab-bar">${tabs.map(t => `<button class="p-tab ${adminTab === t ? 'active' : ''}" onclick="setAdminTab('${t}')">${t}</button>`).join('')}</div>
  ${body}</div>`;
}

/* ─────────── HOSPITAL ─────────── */
function renderHosp() {
  return `<div class="p-pad">${CC}<div class="p-sec-title">Hospital Dashboard</div><div class="p-sec-sub">Meridian Medical Center</div>
  <div class="p-stats-grid">${sc('📅', "Today's Appointments", '12', '4 pending', '#3B82F6')}${sc('👥', 'Total Patients', '3,240', '+24 this week', '#F59E0B')}${sc('💳', 'Paid Patients', '2,680', '82.7% paid', '#00C9A7')}${sc('👨‍⚕️', 'Active Doctors', '18', '2 on leave', '#EC4899')}</div>
  <div class="p-grid-eq">
    <div class="p-chart-card"><div class="p-chart-label">Weekly Appointment Trends</div><canvas id="ch1" height="140"></canvas></div>
    <div class="p-chart-card"><div class="p-chart-label">Monthly Paid Patients Trend</div><canvas id="ch2" height="140"></canvas></div>
  </div>
  <div class="p-table-wrap"><div class="p-table-head"><span class="p-table-head-title">Upcoming Appointments</span></div>
  <table class="p-table"><thead><tr><th>Patient</th><th>Type</th><th>Doctor</th><th>Date & Time</th><th>Paid</th><th>Status</th></tr></thead><tbody>
  ${[{ pat: 'Rahul Sharma', age: 32, type: 'Cardiology', doc: 'Dr. Arjun Mehta', date: '2025-02-25', time: '10:30 AM', status: 'Confirmed', paid: true }, { pat: 'Meera Patel', age: 45, type: 'Neurology', doc: 'Dr. Priya Nair', date: '2025-02-25', time: '11:00 AM', status: 'Confirmed', paid: true }, { pat: 'Aditya Kumar', age: 28, type: 'Orthopedics', doc: 'Dr. Ananya Sharma', date: '2025-02-26', time: '2:00 PM', status: 'Pending', paid: false }, { pat: 'Sunita Rao', age: 55, type: 'General', doc: 'Dr. Arjun Mehta', date: '2025-02-27', time: '4:00 PM', status: 'Pending', paid: true }].map(a => `<tr><td><div style="color:#fff;font-weight:500">${a.pat}</div><div style="font-size:.72rem;color:#8899bb">Age ${a.age}</div></td><td>${a.type}</td><td>${a.doc}</td><td><div>${a.date}</div><div style="font-size:.72rem;color:#8899bb">${a.time}</div></td><td>${badge(a.paid ? 'Paid' : 'Free', a.paid ? 'teal' : 'red')}</td><td>${badge(a.status, a.status === 'Confirmed' ? 'blue' : 'yellow')}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

/* ─────────── PATIENT ─────────── */
function renderPatient() {
  const uname = currentUser ? currentUser.name : 'Rahul Sharma';
  const ufirst = currentUser ? currentUser.firstName : 'Rahul';
  const uemail = currentUser ? currentUser.email : 'patient@meridian.com';
  const initials = ufirst.charAt(0).toUpperCase();
  const sideItems = [{ id: 'home', icon: '🏠', lbl: 'Dashboard' }, { id: 'book', icon: '📅', lbl: 'Book Appointment' }, { id: 'blood', icon: '🩸', lbl: 'Book Blood Test' }, { id: 'myappts', icon: '📋', lbl: 'My Appointments' }, { id: 'reports', icon: '📊', lbl: 'My Reports' }];
  const sidebar = `<div class="p-sidebar">
    <div class="p-user-info">
      <div class="p-user-av" style="font-size:.9rem;font-weight:700;">${initials}</div>
      <div><div class="p-user-name">${uname}</div><div class="p-user-role" style="font-size:.62rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;">${uemail}</div></div>
    </div>
    ${sideItems.map(s => `<button class="p-side-btn ${patSec === s.id ? 'active' : ''}" onclick="setPatSec('${s.id}')"><span>${s.icon}</span>${s.lbl}</button>`).join('')}
    <div style="margin-top:auto;padding-top:1rem;border-top:1px solid rgba(255,255,255,.06);margin-top:1.5rem;">
      <button class="p-side-btn" onclick="doLogout();closePlatform();" style="color:#F87171;"><span>🚪</span>Sign Out</button>
    </div>
  </div>`;
  let main = '';
  if (patSec === 'home') main = patHome();
  else if (patSec === 'book') main = bDone ? bookSuccess() : bookFlow();
  else if (patSec === 'blood') main = blDone ? bloodSuccess() : bloodFlow();
  else if (patSec === 'myappts') main = myAppts();
  else if (patSec === 'reports') main = myReports();
  return `<div class="p-patient-layout">${sidebar}<div class="p-main">${CC}${main}</div></div>`;
}

function patHome() {
  const ufirst = currentUser ? currentUser.firstName : 'Rahul';
  return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.25rem">Good Morning, ${ufirst} 👋</h2>
  <div style="color:#8899bb;font-size:.85rem;margin-bottom:2rem">Your health, always at your fingertips.</div>
  <div class="p-stats-grid" style="grid-template-columns:repeat(3,1fr)">${sc('📅', 'Upcoming Appointments', '2', 'Next: Feb 25', '#3B82F6')}${sc('🩸', 'Blood Tests Done', '2', 'Latest: Feb 10', '#EF4444')}${sc('📊', 'Reports Available', '2', 'All normal', '#00C9A7')}</div>
  <div class="p-chart-card"><div class="p-chart-label">Quick Actions</div>
  <div class="p-quick-grid">
    ${[{ id: 'book', icon: '📅', c: '#3B82F6', lbl: 'Book Hospital Appointment' }, { id: 'blood', icon: '🩸', c: '#EF4444', lbl: 'Book Home Blood Collection' }, { id: 'myappts', icon: '📋', c: '#00C9A7', lbl: 'View My Appointments' }, { id: 'reports', icon: '📊', c: '#F59E0B', lbl: 'View Lab Reports' }].map(a => `<button class="p-quick-btn" onclick="setPatSec('${a.id}')" style="border-color:${a.c}22"><div class="p-quick-icon" style="background:${a.c}20">${a.icon}</div><span class="p-quick-label">${a.lbl}</span></button>`).join('')}
  </div></div>`;
}

function bookFlow() {
  const bars = stepBars(bStep, 4, '#00C9A7');
  if (bStep === 1) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Book Appointment</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 1 of 4 · Select a Hospital</div>${bars}<div class="p-sel-grid">${HOSPITALS.map(h => `<div class="p-sel-card ${selH && selH.id === h.id ? 'chosen' : ''}" onclick="selH=HOSPITALS.find(x=>x.id===${h.id});renderPlatform()"><div style="font-size:1.4rem">🏥</div><div class="p-sel-name">${h.name}</div><div class="p-sel-sub">${h.city} · <span style="color:#F59E0B">★ ${h.rating}</span></div><div style="margin-top:.6rem">${h.depts.map(d => `<span class="p-dept-tag">${d}</span>`).join('')}</div></div>`).join('')}</div><div class="pb-row"><button class="pb pb-teal" ${!selH ? 'disabled' : ''} onclick="bStep=2;renderPlatform()">Next →</button></div>`;
  if (bStep === 2) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Book Appointment</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 2 of 4 · Select a Doctor</div>${bars}<div class="p-sel-grid">${DOCTORS.map(d => `<div class="p-sel-card ${selD && selD.id === d.id ? 'chosen' : ''}" style="opacity:${d.av ? 1 : .5};cursor:${d.av ? 'pointer' : 'not-allowed'}" ${d.av ? `onclick="selD=DOCTORS.find(x=>x.id===${d.id});renderPlatform()"` : ''}>
  <div style="display:flex;justify-content:space-between"><span style="font-size:1.4rem">👨‍⚕️</span>${badge(d.av ? 'Available' : 'Busy', d.av ? 'teal' : 'red')}</div>
  <div class="p-sel-name">${d.name}</div><div class="p-sel-sub" style="color:#00C9A7">${d.spec}</div>
  <div class="p-sel-sub">${d.exp} yrs · <span style="color:#F59E0B">★ ${d.rating}</span></div></div>`).join('')}</div>
  <div class="pb-row"><button class="pb pb-sec" onclick="bStep=1;renderPlatform()">← Back</button><button class="pb pb-teal" ${!selD ? 'disabled' : ''} onclick="bStep=3;renderPlatform()">Next →</button></div>`;
  if (bStep === 3) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Book Appointment</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 3 of 4 · Choose Date & Time</div>${bars}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:480px">
    <div class="pf-group"><label class="pf-label">Date</label><input type="date" class="pf-input" id="ad" value="${aDate}" onchange="aDate=this.value;document.getElementById('s3n').disabled=!(aDate&&aTime)"></div>
    <div class="pf-group"><label class="pf-label">Time Slot</label><select class="pf-input" id="at" onchange="aTime=this.value;document.getElementById('s3n').disabled=!(aDate&&aTime)"><option value="">Select</option>${['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map(t => `<option ${aTime === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
  </div>
  <div class="pb-row"><button class="pb pb-sec" onclick="bStep=2;renderPlatform()">← Back</button><button class="pb pb-teal" id="s3n" ${!aDate || !aTime ? 'disabled' : ''} onclick="bStep=4;renderPlatform()">Next →</button></div>`;
  if (bStep === 4) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Book Appointment</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 4 of 4 · Confirm</div>${bars}
  <div class="p-confirm" style="border:1px solid rgba(0,201,167,.2)">${[['🏥 Hospital', selH?.name], ['👨‍⚕️ Doctor', selD?.name], ['🔬 Specialty', selD?.spec], ['📅 Date', aDate], ['🕐 Time', aTime]].map(([k, v]) => `<div class="p-confirm-row"><span class="p-ck">${k}</span><span class="p-cv">${v}</span></div>`).join('')}</div>
  <div class="pb-row"><button class="pb pb-sec" onclick="bStep=3;renderPlatform()">← Back</button><button class="pb pb-teal" onclick="bDone=true;renderPlatform()">✓ Confirm Booking</button></div>`;
}

function bookSuccess() { return `<div class="p-success"><div class="p-success-icon">✅</div><h2 class="p-success-title" style="color:#00C9A7">Appointment Confirmed!</h2><p class="p-success-desc">Your appointment with ${selD?.name} at ${selH?.name} on ${aDate} at ${aTime} has been booked successfully.</p><button class="pb pb-teal" style="margin-top:1.5rem" onclick="setPatSec('myappts')">View My Appointments</button></div>`; }

function bloodFlow() {
  const bars = stepBars(blStep, 3, '#EF4444');
  if (blStep === 1) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Book Home Blood Collection</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 1 of 3 · Select Test</div>${bars}<div class="p-sel-grid">${BLOOD_TESTS.map(t => `<div class="p-sel-card ${selT && selT.id === t.id ? 'chosen-r' : ''}" onclick="selT=BLOOD_TESTS.find(x=>x.id===${t.id});renderPlatform()">
  <div style="display:flex;justify-content:space-between"><span style="font-size:1.3rem">🩸</span><span style="color:#00C9A7;font-weight:700;font-size:.9rem">₹${t.price}</span></div>
  <div class="p-sel-name">${t.name}</div><div class="p-sel-sub">⏱ Report in ${t.turn}</div></div>`).join('')}</div>
  <div class="pb-row"><button class="pb pb-red" ${!selT ? 'disabled' : ''} onclick="blStep=2;renderPlatform()">Next →</button></div>`;
  if (blStep === 2) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Book Home Blood Collection</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 2 of 3 · Collection Details</div>${bars}
  <div style="max-width:480px">
    <div class="pf-group"><label class="pf-label">Home Address</label><textarea class="pf-input" id="ba" placeholder="Enter your full address for collection...">${bAddr}</textarea></div>
    <div class="pf-row">
      <div class="pf-group"><label class="pf-label">Date</label><input type="date" class="pf-input" id="bd" value="${bDate}"></div>
      <div class="pf-group"><label class="pf-label">Time Slot</label><select class="pf-input" id="bt"><option value="">Select</option>${['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'].map(t => `<option ${bTime === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    </div>
  </div>
  <div class="pb-row"><button class="pb pb-sec" onclick="blStep=1;renderPlatform()">← Back</button><button class="pb pb-red" id="bl2n" onclick="blStep=3;renderPlatform()">Next →</button></div>`;
  if (blStep === 3) return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:.5rem">Confirm Blood Test</h2><div style="color:#8899bb;font-size:.82rem;margin-bottom:1.5rem">Step 3 of 3 · Review & Pay</div>${bars}
  <div class="p-confirm" style="border:1px solid rgba(239,68,68,.2)">${[['🩸 Test', selT?.name], ['💰 Price', '₹' + selT?.price], ['⏱ Turnaround', selT?.turn], ['📍 Address', bAddr], ['📅 Date', bDate], ['🕐 Time', bTime]].map(([k, v]) => `<div class="p-confirm-row"><span class="p-ck">${k}</span><span class="p-cv">${v}</span></div>`).join('')}</div>
  <div class="pb-row"><button class="pb pb-sec" onclick="blStep=2;renderPlatform()">← Back</button><button class="pb pb-red" onclick="blDone=true;renderPlatform()">✓ Confirm & Pay ₹${selT?.price}</button></div>`;
}

function bloodSuccess() { return `<div class="p-success"><div class="p-success-icon">🎉</div><h2 class="p-success-title" style="color:#EF4444">Blood Test Booked!</h2><p class="p-success-desc">A phlebotomist will visit on ${bDate} at ${bTime}. Your ${selT?.name} report will be ready in ${selT?.turn}.</p><button class="pb pb-red" style="margin-top:1.5rem" onclick="setPatSec('reports')">View Reports</button></div>`; }

function myAppts() {
  return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:1.5rem">My Appointments</h2>
${MY_APPTS.map(a => `<div class="p-appt"><div class="p-appt-l"><div class="p-appt-ic" style="background:rgba(59,130,246,.15)">🏥</div><div><div class="p-appt-title">${a.hosp}</div><div class="p-appt-sub">${a.doc} · ${a.type}</div><div class="p-appt-sub">📅 ${a.date} · 🕐 ${a.time}</div></div></div><div class="p-appt-r">${badge(a.status, a.status === 'Confirmed' ? 'teal' : 'yellow')}</div></div>`).join('')}
<div style="font-family:'Playfair Display',serif;font-size:1.3rem;color:#fff;margin:1.5rem 0 1rem">Blood Test Appointments</div>
${MY_BLOOD.map(b => `<div class="p-appt"><div class="p-appt-l"><div class="p-appt-ic" style="background:rgba(239,68,68,.15)">🩸</div><div><div class="p-appt-title">${b.test}</div><div class="p-appt-sub">📅 ${b.date} · 🕐 ${b.time} · Home Collection</div></div></div><div class="p-appt-r">${badge(b.status, 'teal')}<button class="pb pb-sec" style="padding:.3rem .8rem;font-size:.7rem;border-radius:50px" onclick="viewRpt='${b.rpt}';setPatSec('reports')">View Report</button></div></div>`).join('')}`;
}

function myReports() {
  if (viewRpt) {
    const r = REPORTS.find(x => x.id === viewRpt);
    return `<button class="back-lnk" onclick="viewRpt=null;renderPlatform()">← Back to Reports</button>
    <div class="p-chart-card" style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem"><div><div class="p-rep-title">${r.test}</div><div class="p-rep-meta">ID: ${r.id} · Date: ${r.date}</div></div>${badge(r.status, r.status === 'Normal' ? 'teal' : 'yellow')}</div>
    <table class="p-table"><thead><tr><th>Parameter</th><th>Your Value</th><th>Normal Range</th><th>Status</th></tr></thead><tbody>${r.res.map(row => `<tr><td style="color:#c8d8e8">${row.p}</td><td style="color:#fff;font-weight:600">${row.v}</td><td style="color:#8899bb">${row.r}</td><td>${badge(row.s, row.s === 'Normal' ? 'teal' : 'red')}</td></tr>`).join('')}</tbody></table></div>
    <div class="p-info-box"><span>ℹ️</span><span class="p-info-text">Always consult your doctor before making any health decisions based on these results.</span></div>`;
  }
  return `<h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:#fff;margin-bottom:1.5rem">My Lab Reports</h2>
  ${REPORTS.map(r => `<div class="p-rep-item" onclick="viewRpt='${r.id}';renderPlatform()"><div class="p-appt-l"><div class="p-appt-ic" style="background:rgba(0,201,167,.12)">📊</div><div><div class="p-appt-title">${r.test}</div><div class="p-appt-sub">ID: ${r.id} · ${r.date}</div></div></div><div class="p-appt-r">${badge(r.status, r.status === 'Normal' ? 'teal' : 'yellow')}<span style="color:#8899bb">→</span></div></div>`).join('')}`;
}

/* ─────────── EVENTS ─────────── */
function bindEvents() {
  const ba = document.getElementById('ba');
  const bd = document.getElementById('bd');
  const bt = document.getElementById('bt');
  if (ba) ba.addEventListener('input', e => { bAddr = e.target.value; });
  if (bd) bd.addEventListener('change', e => { bDate = e.target.value; });
  if (bt) bt.addEventListener('change', e => { bTime = e.target.value; });
}

/* ─────────── CHARTS ─────────── */
const CD = { plugins: { legend: { labels: { color: '#8899bb', font: { family: 'Inter', size: 10 } } } }, scales: { x: { ticks: { color: '#8899bb', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#8899bb', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } } } };
const CDn = { plugins: { legend: { labels: { color: '#8899bb', font: { family: 'Inter', size: 10 } } } } };
function mc(id, cfg) { if (charts[id]) { try { charts[id].destroy(); } catch (e) { } } const c = document.getElementById(id); if (!c) return; charts[id] = new Chart(c.getContext('2d'), cfg); }
function renderCharts() {
  if (role === 'admin') {
    if (adminTab === 'overview') {
      mc('c1', { type: 'line', data: { labels: MONTHLY.map(d => d.m), datasets: [{ label: 'Doctors', data: MONTHLY.map(d => d.d), borderColor: '#3B82F6', pointBg: '#3B82F6', tension: .4, borderWidth: 2.5 }, { label: 'Hospitals', data: MONTHLY.map(d => d.h), borderColor: '#00C9A7', tension: .4, borderWidth: 2.5 }, { label: 'Patients', data: MONTHLY.map(d => d.p), borderColor: '#F59E0B', tension: .4, borderWidth: 2.5 }] }, options: { ...CD, responsive: true, maintainAspectRatio: true } });
      mc('c2', { type: 'doughnut', data: { labels: ['Paid', 'Free'], datasets: [{ data: [430, 130], backgroundColor: ['#00C9A7', '#F4845F'], borderWidth: 0, hoverOffset: 6 }] }, options: { ...CDn, responsive: true, cutout: '60%' } });
    }
    if (adminTab === 'growth') {
      mc('c3', { type: 'bar', data: { labels: DAILY.map(d => d.day), datasets: [{ label: 'Doctors', data: DAILY.map(d => d.d), backgroundColor: '#3B82F6', borderRadius: 4 }, { label: 'Hospitals', data: DAILY.map(d => d.h), backgroundColor: '#00C9A7', borderRadius: 4 }, { label: 'Patients', data: DAILY.map(d => d.p), backgroundColor: '#F59E0B', borderRadius: 4 }] }, options: { ...CD, responsive: true } });
      mc('c4', { type: 'line', data: { labels: MONTHLY.map(d => d.m), datasets: [{ label: 'Patients', data: MONTHLY.map(d => d.p), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,.12)', fill: true, tension: .4, borderWidth: 2.5 }] }, options: { ...CD, responsive: true } });
    }
    if (adminTab === 'paid') {
      mc('c5', { type: 'bar', data: { labels: MONTHLY.map(d => d.m), datasets: [{ label: 'Paid', data: MONTHLY.map(d => d.paid), backgroundColor: '#00C9A7', borderRadius: 4 }, { label: 'Free', data: MONTHLY.map(d => d.free), backgroundColor: '#F4845F', borderRadius: 4 }] }, options: { ...CD, responsive: true } });
      mc('c6', { type: 'line', data: { labels: MONTHLY.map(d => d.m), datasets: [{ label: 'Paid', data: MONTHLY.map(d => d.paid), borderColor: '#00C9A7', tension: .4, borderWidth: 2.5 }, { label: 'Free', data: MONTHLY.map(d => d.free), borderColor: '#F4845F', tension: .4, borderDash: [5, 4], borderWidth: 2 }] }, options: { ...CD, responsive: true } });
    }
  }
  if (role === 'hospital') {
    mc('ch1', { type: 'bar', data: { labels: DAILY.map(d => d.day), datasets: [{ label: 'Total', data: DAILY.map(d => d.p), backgroundColor: '#3B82F6', borderRadius: 4 }, { label: 'Paid', data: DAILY.map(d => d.paid), backgroundColor: '#00C9A7', borderRadius: 4 }] }, options: { ...CD, responsive: true } });
    mc('ch2', { type: 'line', data: { labels: MONTHLY.map(d => d.m), datasets: [{ label: 'Paid Patients', data: MONTHLY.map(d => d.paid), borderColor: '#00C9A7', backgroundColor: 'rgba(0,201,167,.1)', fill: true, tension: .4, borderWidth: 2.5 }] }, options: { ...CD, responsive: true } });
  }
}
