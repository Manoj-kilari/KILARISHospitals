// Patient Management JavaScript
let currentPatients = [];
let currentPatient = null;

// Initialize patient management
document.addEventListener('DOMContentLoaded', function() {
    console.log('Patient management initializing...');
    
    // Check if patientAPI is available
    if (typeof patientAPI === 'undefined') {
        console.error('patientAPI not found, waiting for it to load...');
        // Wait for patientAPI to load
        setTimeout(() => {
            if (typeof patientAPI !== 'undefined') {
                console.log('patientAPI is now available, initializing...');
                initializePatientManagement();
            } else {
                console.error('patientAPI still not available after timeout');
            }
        }, 1000);
    } else {
        console.log('patientAPI is available, initializing...');
        initializePatientManagement();
    }
});

// Initialize patient management
function initializePatientManagement() {
    console.log('Initializing patient management...');
    
    // Add patient management link to navigation
    addPatientManagementLink();
    
    // Auto-load patients when page loads
    console.log('Auto-loading patients on page load...');
    loadPatients();
    
    // Set up search functionality
    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
        searchInput.addEventListener('input', searchPatients);
        console.log('Search functionality initialized');
    } else {
        console.error('Search input not found');
    }
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-patients');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadPatients);
        console.log('Refresh button initialized');
    } else {
        console.error('Refresh button not found');
    }
    
    // Set up add patient button
    const addPatientBtn = document.getElementById('add-patient');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', showAddPatientForm);
        console.log('Add patient button initialized');
    } else {
        console.error('Add patient button not found');
    }
    
    console.log('Patient management initialization complete');
}

// Add patient management link to navigation
function addPatientManagementLink() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.getElementById('patient-nav-link')) {
        const patientLink = document.createElement('a');
        patientLink.href = '#';
        patientLink.className = 'nav-link';
        patientLink.id = 'patient-nav-link';
        patientLink.textContent = 'Patient Records';
        patientLink.onclick = function(e) {
            e.preventDefault();
            showPatientManagement();
        };
        navMenu.appendChild(patientLink);
    }
}

// Show patient management section
function showPatientManagement() {
    console.log('Showing patient management section');
    
    // Hide all other sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id !== 'patient-management') {
            section.style.display = 'none';
        }
    });
    
    // Show patient management section
    const patientSection = document.getElementById('patient-management');
    if (patientSection) {
        // Force display override
        patientSection.style.display = 'block';
        patientSection.style.visibility = 'visible';
        patientSection.style.opacity = '1';
        patientSection.style.position = 'relative';
        patientSection.style.zIndex = '1';
        
        // Remove any inline display:none
        if (patientSection.style.display === 'none') {
            patientSection.style.removeProperty('display');
        }
        
        // Auto-load patients immediately
        console.log('Auto-loading patient data immediately...');
        loadPatients();
        
        // Also try loading again after a short delay
        setTimeout(() => {
            console.log('Secondary auto-load attempt...');
            loadPatients();
        }, 1000);
    }
    
    // Close any open modals
    closeLoginModal();
    closePlatform();
    
    // Scroll to top of patient section
    setTimeout(() => {
        patientSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Load patients
async function loadPatients() {
    console.log('Loading patients...');
    
    try {
        if (!patientAPI) {
            console.error('patientAPI not available');
            showError('Patient API not available');
            return;
        }
        
        console.log('Calling patientAPI.getAllPatients()...');
        const result = await patientAPI.getAllPatients();
        console.log('API result:', result);
        
        if (result.success) {
            console.log('Patients loaded successfully:', result.data);
            console.log('Number of patients:', result.data.length);
            currentPatients = result.data;
            displayPatients(currentPatients);
        } else {
            console.error('Failed to load patients:', result.message);
            showError('Failed to load patients: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showError('Error loading patients: ' + error.message);
    }
}

// Display patients
function displayPatients(patients) {
    const patientList = document.getElementById('patient-list');
    if (!patientList) {
        console.error('Patient list element not found');
        return;
    }
    
    console.log('Patients data received:', patients);
    
    if (patients.length === 0) {
        patientList.innerHTML = `
            <div class="no-patients">
                <div class="no-patients-icon">📋</div>
                <h3>No Patients Found</h3>
                <p>No patients match your search criteria. Try adjusting your search or add a new patient.</p>
                <button class="btn-primary" onclick="showAddPatientForm()">➕ Add First Patient</button>
            </div>
        `;
        return;
    }
    
    patientList.innerHTML = patients.map((patient, index) => {
        console.log('Creating patient card for:', patient, 'Index:', index);
        console.log('Patient ID:', patient.id, 'Type:', typeof patient.id);
        
        // Ensure patient has a valid ID
        const patientId = patient.id || index + 1;
        console.log('Using patient ID:', patientId);
        
        return `
        <div class="patient-card" onclick="viewPatient(${patientId})">
            <div class="patient-avatar">
                <div class="patient-avatar-text">${patient.name.split(' ').map(n => n[0]).join('')}</div>
            </div>
            <div class="patient-info">
                <h3 class="patient-name">${patient.name}</h3>
                <div class="patient-details">
                    <span class="patient-detail">👤 ${patient.age} years, ${patient.gender}</span>
                    <span class="patient-detail">🩸 ${patient.bloodGroup}</span>
                    <span class="patient-detail">📧 ${patient.email}</span>
                    <span class="patient-detail">📱 ${patient.phone}</span>
                </div>
                <div class="patient-appointments">
                    <strong>Appointments:</strong> 
                    ${patient.appointments && patient.appointments.length > 0 ? 
                        patient.appointments.map(apt => 
                            `<span class="appointment-badge ${apt.status.toLowerCase()}">${apt.date} - ${apt.doctor} (${apt.status})</span>`
                        ).join('') : 
                        '<span class="no-appointments">No appointments scheduled</span>'
                    }
                </div>
            </div>
            <div class="patient-actions" onclick="event.stopPropagation()">
                <button class="btn-small btn-primary" onclick="viewPatient(${patientId})">👁️ View</button>
                <button class="btn-small btn-secondary" onclick="editPatient(${patientId})">✏️ Edit</button>
                <button class="btn-small btn-success" onclick="showAppointmentBookingForm(${patientId})">📅 Book</button>
                ${patient.appointments && patient.appointments.some(apt => apt.status === 'Upcoming') ? 
                    `<button class="btn-small btn-warning" onclick="showCancelAppointmentDialog(${patientId})">❌ Cancel</button>` : 
                    ''
                }
                <button class="btn-small btn-danger" onclick="deletePatient(${patientId})">🗑️ Delete</button>
            </div>
        </div>
    `;}).join('');
    
    console.log('Displayed', patients.length, 'patients with working buttons');
}

// Show patient details modal
function showPatientDetails(patientId) {
    console.log('Showing patient details for ID:', patientId);
    patientAPI.getPatientById(patientId).then(result => {
        if (result.success) {
            currentPatient = result.data;
            displayPatientModal(currentPatient);
        } else {
            showError('Failed to load patient details: ' + result.message);
        }
    }).catch(error => {
        console.error('Error loading patient details:', error);
        showError('Error loading patient details: ' + error.message);
    });
}

// Display patient modal
function displayPatientModal(patient) {
    const modal = document.getElementById('patient-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = patient.name;
    
    modalBody.innerHTML = `
        <div class="patient-detail-view">
            <div class="patient-detail-header">
                <div class="patient-detail-avatar">
                    <span class="patient-avatar-text">${patient.name.charAt(0).toUpperCase()}</span>
                </div>
                <div class="patient-detail-info">
                    <h3>${patient.name}</h3>
                    <div class="patient-detail-meta">
                        <span class="badge">${patient.age} years</span>
                        <span class="badge">${patient.gender}</span>
                        <span class="badge">${patient.bloodGroup}</span>
                    </div>
                </div>
            </div>
            
            <div class="patient-detail-sections">
                <div class="detail-section">
                    <h4>📞 Contact Information</h4>
                    <div class="detail-grid">
                        <div><strong>Email:</strong> ${patient.email}</div>
                        <div><strong>Phone:</strong> ${patient.phone}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>📅 Appointments</h4>
                    ${patient.appointments.length > 0 ? `
                        <div class="appointments-list">
                            ${patient.appointments.map(apt => `
                                <div class="appointment-item ${apt.status.toLowerCase()}">
                                    <div class="appointment-date">${apt.date}</div>
                                    <div class="appointment-details">
                                        <div class="appointment-doctor">${apt.doctor}</div>
                                        <div class="appointment-dept">${apt.department}</div>
                                    </div>
                                    <div class="appointment-status">${apt.status}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="no-data">No appointments scheduled</div>'}
                </div>
                
                <div class="detail-section">
                    <h4>🩺 Medical History</h4>
                    ${patient.medicalHistory.length > 0 ? `
                        <div class="medical-history-list">
                            ${patient.medicalHistory.map(condition => `
                                <div class="medical-item">
                                    <div class="medical-condition">${condition.condition}</div>
                                    <div class="medical-details">
                                        <span>Diagnosed: ${condition.diagnosed}</span>
                                        <span>Treatment: ${condition.treatment}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="no-data">No medical history recorded</div>'}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="editPatient(${patient.id})">Edit Patient</button>
                <button class="btn-secondary" onclick="addAppointmentToPatient(${patient.id})">Add Appointment</button>
                <button class="btn-danger" onclick="deletePatientConfirm(${patient.id})">Delete Patient</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Close patient modal
function closePatientModal() {
    const modal = document.getElementById('patient-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentPatient = null;
}

// Setup patient search
function setupPatientSearch() {
    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const filtered = currentPatients.filter(patient => 
                patient.name.toLowerCase().includes(query) ||
                patient.email.toLowerCase().includes(query) ||
                patient.phone.includes(query)
            );
            displayPatients(filtered);
        });
    }
}

// Show appointment booking form
function showAppointmentBookingForm(patientId) {
    console.log('Opening appointment booking form for patient:', patientId);
    
    // Load available doctors first
    loadAvailableDoctors(patientId);
}

// Load available doctors for appointment booking
async function loadAvailableDoctors(patientId) {
    try {
        console.log('Loading available doctors...');
        const result = await patientAPI.getAvailableDoctors();
        
        if (result.success) {
            showAppointmentBookingModal(patientId, result.data);
        } else {
            showError('Failed to load available doctors');
        }
    } catch (error) {
        console.error('Error loading available doctors:', error);
        showError('Error loading available doctors');
    }
}

// Show appointment booking modal
function showAppointmentBookingModal(patientId, doctors) {
    const modal = document.getElementById('patient-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Book Appointment';
    
    modalBody.innerHTML = `
        <form id="appointment-booking-form" onsubmit="bookAppointment(event, ${patientId})">
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Select Doctor *</label>
                    <select name="doctorId" required>
                        <option value="">Choose a doctor...</option>
                        ${doctors.map(doctor => `
                            <option value="${doctor.id}">
                                ${doctor.name} - ${doctor.department} (${doctor.specialization})
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Appointment Date *</label>
                    <input type="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-group">
                    <label>Preferred Time *</label>
                    <select name="time" required>
                        <option value="">Select time...</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                    </select>
                </div>
                
                <div class="form-group full-width">
                    <label>Reason for Visit *</label>
                    <textarea name="reason" rows="3" placeholder="Please describe your symptoms or reason for visit..." required></textarea>
                </div>
                
                <div class="form-group full-width">
                    <label>Additional Notes</label>
                    <textarea name="notes" rows="2" placeholder="Any additional information..."></textarea>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="closePatientModal()">Cancel</button>
                <button type="submit" class="btn-primary">Book Appointment</button>
            </div>
        </form>
    `;
    
    // Show modal
    modal.style.display = 'flex';
}

// Book appointment
async function bookAppointment(event, patientId) {
    event.preventDefault();
    console.log('Booking appointment for patient:', patientId);
    
    const formData = new FormData(event.target);
    const appointmentData = {
        doctorId: parseInt(formData.get('doctorId')),
        doctor: formData.get('doctorId'), // Will be populated from doctor selection
        department: '', // Will be populated from doctor selection
        date: formData.get('date'),
        time: formData.get('time'),
        reason: formData.get('reason'),
        notes: formData.get('notes'),
        status: 'Upcoming'
    };
    
    // Get doctor details
    try {
        const doctorsResult = await patientAPI.getAvailableDoctors();
        if (doctorsResult.success) {
            const doctor = doctorsResult.data.find(d => d.id === appointmentData.doctorId);
            if (doctor) {
                appointmentData.doctor = doctor.name;
                appointmentData.department = doctor.department;
            }
        }
    } catch (error) {
        console.error('Error getting doctor details:', error);
    }
    
    console.log('Appointment data:', appointmentData);
    
    // Validate required fields
    if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.time || !appointmentData.reason) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        console.log('Calling patientAPI.addAppointment...');
        const result = await patientAPI.addAppointment(patientId, appointmentData);
        console.log('API result:', result);
        
        if (result.success) {
            showSuccess('Appointment booked successfully!');
            closePatientModal();
            loadPatients(); // Refresh patient list to show new appointment
        } else {
            showError(result.message || 'Failed to book appointment');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        showError('Error booking appointment');
    }
}

// Show cancel appointment dialog
function showCancelAppointmentDialog(patientId) {
    console.log('Showing cancel appointment dialog for patient:', patientId);
    
    patientAPI.getPatientById(patientId).then(result => {
        if (result.success) {
            const patient = result.data;
            const upcomingAppointments = patient.appointments.filter(apt => apt.status === 'Upcoming');
            
            if (upcomingAppointments.length === 0) {
                showError('No upcoming appointments to cancel');
                return;
            }
            
            showCancelAppointmentModal(patient, upcomingAppointments);
        } else {
            showError('Patient not found');
        }
    }).catch(error => {
        console.error('Error fetching patient for cancel:', error);
        showError('Error fetching patient data');
    });
}

// Show cancel appointment modal
function showCancelAppointmentModal(patient, appointments) {
    const modal = document.getElementById('patient-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Cancel Appointment';
    
    modalBody.innerHTML = `
        <div class="cancel-appointment-dialog">
            <div class="patient-header">
                <h3>${patient.name}</h3>
                <p>Select the appointment you want to cancel:</p>
            </div>
            
            <div class="appointments-list">
                ${appointments.map(apt => `
                    <div class="appointment-item ${apt.status.toLowerCase()}">
                        <div class="appointment-info">
                            <div class="appointment-date">${apt.date}</div>
                            <div class="appointment-doctor">${apt.doctor}</div>
                            <div class="appointment-department">${apt.department}</div>
                            <div class="appointment-status">${apt.status}</div>
                        </div>
                        <button class="btn-small btn-danger" onclick="cancelAppointment(${patient.id}, ${apt.id})">Cancel This</button>
                    </div>
                `).join('')}
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="closePatientModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Cancel appointment
async function cancelAppointment(patientId, appointmentId) {
    console.log('Cancelling appointment:', appointmentId, 'for patient:', patientId);
    
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    try {
        console.log('Calling patientAPI.cancelAppointment...');
        const result = await patientAPI.cancelAppointment(patientId, appointmentId);
        console.log('Cancel API result:', result);
        
        if (result.success) {
            showSuccess('Appointment cancelled successfully!');
            loadPatients(); // Refresh patient list
        } else {
            showError(result.message || 'Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showError('Error cancelling appointment');
    }
}

function showAddPatientForm() {
    console.log('Opening add patient form');
    const modal = document.getElementById('patient-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) {
        console.error('Modal elements not found:', { modal, modalTitle, modalBody });
        return;
    }
    
    modalTitle.textContent = 'Add New Patient';
    
    modalBody.innerHTML = `
        <form id="add-patient-form" onsubmit="addPatient(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required placeholder="Enter patient name">
                </div>
                <div class="form-group">
                    <label>Age *</label>
                    <input type="number" name="age" required min="0" max="150" placeholder="Enter age">
                </div>
                <div class="form-group">
                    <label>Gender *</label>
                    <select name="gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Blood Group *</label>
                    <select name="bloodGroup" required>
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label>Email *</label>
                    <input type="email" name="email" required placeholder="patient@email.com">
                </div>
                <div class="form-group full-width">
                    <label>Phone *</label>
                    <input type="tel" name="phone" required placeholder="+91 98765 43210">
                </div>
            </div>
            <div class="modal-actions">
                <button type="submit" class="btn-primary">➕ Add Patient</button>
                <button type="button" class="btn-secondary" onclick="closePatientModal()">Cancel</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    console.log('Add patient form displayed');
}

// Add patient
async function addPatient(event) {
    event.preventDefault();
    console.log('Adding patient...');
    
    const formData = new FormData(event.target);
    const patientData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    console.log('Patient data to add:', patientData);
    
    // Validate required fields
    if (!patientData.name || !patientData.age || !patientData.gender || !patientData.bloodGroup || !patientData.email || !patientData.phone) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        console.log('Calling patientAPI.addPatient...');
        const result = await patientAPI.addPatient(patientData);
        console.log('API result:', result);
        
        if (result.success) {
            showSuccess('Patient added successfully!');
            closePatientModal();
            loadPatients();
        } else {
            showError('Failed to add patient: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        showError('Error adding patient: ' + error.message);
    }
}

// View patient details
function viewPatient(patientId) {
    console.log('Viewing patient:', patientId);
    try {
        showPatientDetails(patientId);
    } catch (error) {
        console.error('Error in viewPatient:', error);
        showError('Error viewing patient details');
    }
}

// Show patient details modal
function showPatientDetails(patientId) {
    console.log('Showing patient details for ID:', patientId);
    
    try {
        if (!patientAPI) {
            console.error('patientAPI not available');
            showError('Patient API not available');
            return;
        }
        
        patientAPI.getPatientById(patientId).then(result => {
            console.log('API result:', result);
            if (result.success) {
                currentPatient = result.data;
                displayPatientModal(currentPatient);
            } else {
                showError('Patient not found: ' + result.message);
            }
        }).catch(error => {
            console.error('Error fetching patient details:', error);
            showError('Error fetching patient details: ' + error.message);
        });
    } catch (error) {
        console.error('Error in showPatientDetails:', error);
        showError('Error showing patient details');
    }
}

// Display patient modal with details
function displayPatientModal(patient) {
    console.log('Displaying patient modal for:', patient.name);
    
    try {
        const modal = document.getElementById('patient-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) {
            console.error('Modal elements not found:', { modal, modalTitle, modalBody });
            showError('Modal elements not found');
            return;
        }
        
        modalTitle.textContent = 'Patient Details';
        
        modalBody.innerHTML = `
            <div class="patient-detail-view">
                <div class="patient-header">
                    <div class="patient-avatar-large">
                        <div class="patient-avatar-text">${patient.name.split(' ').map(n => n[0]).join('')}</div>
                    </div>
                    <div class="patient-info-header">
                        <h2>${patient.name}</h2>
                        <p>Patient ID: ${patient.id}</p>
                    </div>
                </div>
                
                <div class="patient-sections">
                    <div class="patient-section">
                        <h3>Personal Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Age:</label>
                                <span>${patient.age} years</span>
                            </div>
                            <div class="info-item">
                                <label>Gender:</label>
                                <span>${patient.gender}</span>
                            </div>
                            <div class="info-item">
                                <label>Blood Group:</label>
                                <span>${patient.bloodGroup}</span>
                            </div>
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${patient.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Phone:</label>
                                <span>${patient.phone}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="patient-section">
                        <h3>Appointments</h3>
                        ${patient.appointments.length > 0 ? 
                            `<div class="appointments-list">
                                ${patient.appointments.map(apt => {
                                    console.log('Appointment:', apt);
                                    const showCancel = apt.status === 'Upcoming' && apt.id;
                                    console.log('Show cancel button:', showCancel, 'Status:', apt.status, 'ID:', apt.id);
                                    return `
                                    <div class="appointment-item ${apt.status.toLowerCase()}">
                                        <div class="appointment-date">${apt.date}</div>
                                        <div class="appointment-doctor">${apt.doctor}</div>
                                        <div class="appointment-department">${apt.department}</div>
                                        <div class="appointment-status">${apt.status}</div>
                                        ${showCancel ? 
                                            `<button class="btn-small btn-danger" onclick="cancelAppointment(${patient.id}, ${apt.id})">Cancel</button>` : 
                                            `<span style="color: #999; font-size: 0.8rem;">${!apt.id ? 'No ID' : apt.status !== 'Upcoming' ? 'Not cancellable' : 'Missing data'}</span>`
                                        }
                                    </div>
                                `;}).join('')}
                            </div>` : 
                            '<p class="no-appointments">No appointments scheduled</p>'
                        }
                    </div>
                    
                    <div class="patient-section">
                        <h3>Medical History</h3>
                        ${patient.medicalHistory.length > 0 ? 
                            `<div class="medical-history-list">
                                ${patient.medicalHistory.map(hist => `
                                    <div class="medical-history-item">
                                        <div class="condition">${hist.condition}</div>
                                        <div class="diagnosed">Diagnosed: ${hist.diagnosed}</div>
                                        <div class="treatment">Treatment: ${hist.treatment}</div>
                                    </div>
                                `).join('')}
                            </div>` : 
                            '<p class="no-medical-history">No medical history records</p>'
                        }
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closePatientModal()">Close</button>
                    <button type="button" class="btn-primary" onclick="editPatient(${patient.id})">✏️ Edit Patient</button>
                    <button type="button" class="btn-success" onclick="showAppointmentBookingForm(${patient.id})">📅 Book Appointment</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        console.log('Patient modal displayed successfully');
    } catch (error) {
        console.error('Error in displayPatientModal:', error);
        showError('Error displaying patient modal');
    }
}

// Edit patient
function editPatient(patientId) {
    console.log('Editing patient:', patientId);
    
    try {
        if (!patientAPI) {
            console.error('patientAPI not available');
            showError('Patient API not available');
            return;
        }
        
        patientAPI.getPatientById(patientId).then(result => {
            console.log('Edit API result:', result);
            if (result.success) {
                currentPatient = result.data;
                showEditPatientForm(currentPatient);
            } else {
                showError('Patient not found: ' + result.message);
            }
        }).catch(error => {
            console.error('Error fetching patient for edit:', error);
            showError('Error fetching patient for edit: ' + error.message);
        });
    } catch (error) {
        console.error('Error in editPatient:', error);
        showError('Error editing patient');
    }
}

// Show edit patient form
function showEditPatientForm(patient) {
    console.log('Showing edit form for patient:', patient.name);
    
    try {
        const modal = document.getElementById('patient-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) {
            console.error('Modal elements not found:', { modal, modalTitle, modalBody });
            showError('Modal elements not found');
            return;
        }
        
        modalTitle.textContent = 'Edit Patient';
        
        modalBody.innerHTML = `
            <form id="edit-patient-form" onsubmit="updatePatient(event, ${patient.id})">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value="${patient.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Age *</label>
                        <input type="number" name="age" value="${patient.age}" min="1" max="120" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Gender *</label>
                        <select name="gender" required>
                            <option value="Male" ${patient.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${patient.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${patient.gender === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Blood Group *</label>
                        <select name="bloodGroup" required>
                            <option value="A+" ${patient.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${patient.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${patient.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${patient.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${patient.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${patient.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${patient.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${patient.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value="${patient.email}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Phone *</label>
                        <input type="tel" name="phone" value="${patient.phone}" required>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closePatientModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Patient</button>
                </div>
            </form>
        `;
        
        modal.style.display = 'flex';
        console.log('Edit patient form displayed successfully');
    } catch (error) {
        console.error('Error in showEditPatientForm:', error);
        showError('Error showing edit patient form');
    }
}

// Update patient
async function updatePatient(event, patientId) {
    event.preventDefault();
    console.log('Updating patient:', patientId);
    
    const formData = new FormData(event.target);
    const patientData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    console.log('Patient data to update:', patientData);
    
    // Validate required fields
    if (!patientData.name || !patientData.age || !patientData.gender || !patientData.bloodGroup || !patientData.email || !patientData.phone) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        console.log('Calling patientAPI.updatePatient...');
        const result = await patientAPI.updatePatient(patientId, patientData);
        console.log('API result:', result);
        
        if (result.success) {
            showSuccess('Patient updated successfully!');
            closePatientModal();
            loadPatients(); // Refresh patient list
        } else {
            showError(result.message || 'Failed to update patient');
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        showError('Error updating patient');
    }
}

// Delete patient
async function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        return;
    }
    
    try {
        console.log('Deleting patient:', patientId);
        const result = await patientAPI.deletePatient(patientId);
        
        if (result.success) {
            showSuccess('Patient deleted successfully!');
            loadPatients(); // Refresh patient list
        } else {
            showError(result.message || 'Failed to delete patient');
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showError('Error deleting patient');
    }
}

// Utility functions
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('patient-modal');
    if (event.target === modal) {
        closePatientModal();
    }
}
