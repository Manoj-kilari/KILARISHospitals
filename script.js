



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

      <button class="btn-book" onclick="requireLogin()">👤 Patient Portal</button>

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

          <button class="nud-item" onclick="alert('Reports feature coming soon!');closeDropdown()">📊 My Reports</button>

          <button class="nud-item" onclick="openCalendar();closeDropdown()">� My Appointments</button>

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

    const registered = getRegisteredUsers();

    const found = registered.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    // Production: Remove demo credentials check

    // if (email.toLowerCase() === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {

    //   showSuccessState('Welcome back, Rahul!', DEMO_USER);

    // } else 

    if (found) {

      showSuccessState(`Welcome back, ${found.firstName}!`, found);

    } else {

      document.getElementById('login-email')?.classList.add('error');

      document.getElementById('login-password')?.classList.add('error');

      showErr('login-pw-err', 'Incorrect email or password. Please try again.');

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
  alert('Reports feature coming soon!');
}

function showAppointmentsComingSoon() {
  alert('Appointments feature coming soon!');
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
  
  const appointments = getAppointments().filter(appt => appt.date === dateStr);
  
  if (appointments.length > 0) {
    let msg = `Appointments on ${dateStr}:\n\n`;
    appointments.forEach(appt => {
      msg += `• ${appt.time} - ${appt.department}\n  ${appt.reason || 'No reason specified'}\n\n`;
    });
    alert(msg);
  }
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

