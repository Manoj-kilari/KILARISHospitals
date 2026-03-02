// Dummy Patient API
class PatientAPI {
    constructor() {
        // Load patients from localStorage or use default data
        this.loadPatients();
    }

    // Load patients from localStorage or initialize with default data
    loadPatients() {
        const storedPatients = localStorage.getItem('patients');
        if (storedPatients) {
            try {
                this.patients = JSON.parse(storedPatients);
                console.log('Loaded patients from localStorage:', this.patients.length);
                console.log('Loaded patients data:', this.patients);
                
                // Validate that patients have required properties
                if (this.patients.length === 0 || !this.patients[0].id) {
                    console.error('Invalid patient data in localStorage, using defaults');
                    this.initializeDefaultPatients();
                }
            } catch (error) {
                console.error('Error parsing localStorage patients:', error);
                console.log('Using default patients instead');
                this.initializeDefaultPatients();
            }
        } else {
            console.log('No patients in localStorage, using defaults');
            this.initializeDefaultPatients();
        }
    }
    
    // Initialize default patients
    initializeDefaultPatients() {
        // Default initial patients
        this.patients = [
            {
                id: 1,
                name: "Rajesh Kumar",
                age: 45,
                gender: "Male",
                email: "rajesh.kumar@email.com",
                phone: "+91 98765 43210",
                bloodGroup: "O+",
                appointments: [
                    { id: 1, date: "2024-03-15", doctor: "Dr. Arjun Mehta", department: "Cardiology", status: "Completed" },
                    { id: 2, date: "2024-03-20", doctor: "Dr. Priya Nair", department: "Neurology", status: "Upcoming" }
                ],
                medicalHistory: [
                    { condition: "Hypertension", diagnosed: "2020", treatment: "Medication" },
                    { condition: "Diabetes Type 2", diagnosed: "2019", treatment: "Insulin" }
                ]
            },
            {
                id: 2,
                name: "Priya Sharma",
                age: 32,
                gender: "Female",
                email: "priya.sharma@email.com",
                phone: "+91 98765 43211",
                bloodGroup: "A+",
                appointments: [
                    { id: 1, date: "2024-03-18", doctor: "Dr. Rohan Gupta", department: "Pediatrics", status: "Completed" },
                    { id: 2, date: "2024-03-25", doctor: "Dr. Sneha Reddy", department: "Gynecology", status: "Upcoming" }
                ],
                medicalHistory: [
                    { condition: "Anemia", diagnosed: "2021", treatment: "Iron Supplements" },
                    { condition: "Thyroid", diagnosed: "2020", treatment: "Medication" }
                ]
            },
            {
                id: 3,
                name: "Amit Patel",
                age: 38,
                gender: "Male",
                email: "amit.patel@email.com",
                phone: "+91 98765 43212",
                bloodGroup: "B+",
                appointments: [
                    { id: 1, date: "2024-03-10", doctor: "Dr. Kavita Malhotra", department: "Dermatology", status: "Completed" },
                    { id: 2, date: "2024-03-22", doctor: "Dr. Arjun Mehta", department: "Cardiology", status: "Upcoming" }
                ],
                medicalHistory: [
                    { condition: "Eczema", diagnosed: "2019", treatment: "Topical Creams" },
                    { condition: "Allergies", diagnosed: "2018", treatment: "Antihistamines" }
                ]
            },
            {
                id: 4,
                name: "Neha Gupta",
                age: 29,
                gender: "Female",
                email: "neha.gupta@email.com",
                phone: "+91 98765 43213",
                bloodGroup: "AB+",
                appointments: [
                    { id: 1, date: "2024-03-14", doctor: "Dr. Priya Nair", department: "Neurology", status: "Completed" },
                    { id: 2, date: "2024-03-28", doctor: "Dr. Rohan Gupta", department: "Pediatrics", status: "Upcoming" }
                ],
                medicalHistory: [
                    { condition: "Migraine", diagnosed: "2020", treatment: "Pain Relievers" },
                    { condition: "Vitamin D Deficiency", diagnosed: "2022", treatment: "Supplements" }
                ]
            },
            {
                id: 5,
                name: "Vikram Singh",
                age: 52,
                gender: "Male",
                email: "vikram.singh@email.com",
                phone: "+91 98765 43214",
                bloodGroup: "O-",
                appointments: [
                    { id: 1, date: "2024-03-12", doctor: "Dr. Ananya Sharma", department: "Orthopedics", status: "Completed" }
                ],
                medicalHistory: [
                    { condition: "Knee Replacement", diagnosed: "2022", treatment: "Surgery" },
                    { condition: "High Cholesterol", diagnosed: "2020", treatment: "Statins" }
                ]
            }
        ];
        // Save initial data to localStorage
        this.savePatients();
        console.log('Initialized default patients:', this.patients.length);
    }

    // Save patients to localStorage
    savePatients() {
        localStorage.setItem('patients', JSON.stringify(this.patients));
        console.log('Saved patients to localStorage:', this.patients.length);
    }

    // Simulate API delay
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get all patients
    async getAllPatients() {
        await this.delay();
        return {
            success: true,
            data: this.patients,
            message: "Patients retrieved successfully"
        };
    }

    // Get patient by ID
    async getPatientById(id) {
        await this.delay();
        const patient = this.patients.find(p => p.id === parseInt(id));
        if (patient) {
            return {
                success: true,
                data: patient,
                message: "Patient retrieved successfully"
            };
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Add new patient
    async addPatient(patientData) {
        await this.delay();
        const newPatient = {
            id: Math.max(...this.patients.map(p => p.id)) + 1,
            ...patientData,
            appointments: [],
            medicalHistory: []
        };
        this.patients.push(newPatient);
        
        // Save to localStorage for permanent storage
        this.savePatients();
        
        console.log('Patient added and saved permanently:', newPatient.name);
        
        return {
            success: true,
            data: newPatient,
            message: "Patient added successfully and saved permanently"
        };
    }

    // Update patient
    async updatePatient(id, patientData) {
        await this.delay();
        const index = this.patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.patients[index] = { ...this.patients[index], ...patientData };
            
            // Save to localStorage for permanent storage
            this.savePatients();
            
            console.log('Patient updated and saved permanently:', this.patients[index].name);
            
            return {
                success: true,
                data: this.patients[index],
                message: "Patient updated successfully and saved permanently"
            };
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Delete patient
    async deletePatient(id) {
        await this.delay();
        const index = this.patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            const deletedPatient = this.patients[index];
            this.patients.splice(index, 1);
            
            // Save to localStorage for permanent storage
            this.savePatients();
            
            console.log('Patient deleted and saved permanently:', deletedPatient.name);
            
            return {
                success: true,
                data: deletedPatient,
                message: "Patient deleted successfully and saved permanently"
            };
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Search patients
    async searchPatients(query) {
        await this.delay();
        const searchResults = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(query.toLowerCase()) ||
            patient.email.toLowerCase().includes(query.toLowerCase()) ||
            patient.phone.includes(query)
        );
        return {
            success: true,
            data: searchResults,
            message: `Found ${searchResults.length} patients matching "${query}"`
        };
    }

    // Get patient appointments
    async getPatientAppointments(id) {
        await this.delay();
        const patient = this.patients.find(p => p.id === parseInt(id));
        if (patient) {
            return {
                success: true,
                data: patient.appointments,
                message: "Appointments retrieved successfully"
            };
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Add appointment
    async addAppointment(patientId, appointmentData) {
        await this.delay();
        const patient = this.patients.find(p => p.id === parseInt(patientId));
        if (patient) {
            // Fix ID generation - handle empty appointments array
            let maxId = 0;
            if (patient.appointments && patient.appointments.length > 0) {
                const validIds = patient.appointments
                    .map(a => a.id)
                    .filter(id => id !== undefined && id !== null && !isNaN(id));
                maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
            }
            
            const newAppointment = {
                id: maxId + 1,
                ...appointmentData,
                status: "Upcoming"
            };
            
            // Ensure appointments array exists
            if (!patient.appointments) {
                patient.appointments = [];
            }
            
            patient.appointments.push(newAppointment);
            
            // Save to localStorage for permanent storage
            this.savePatients();
            
            console.log('Appointment added and saved permanently for patient:', patient.name);
            console.log('New appointment ID:', newAppointment.id);
            
            return {
                success: true,
                data: newAppointment,
                message: "Appointment booked successfully and saved permanently"
            };
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Update appointment
    async updateAppointment(patientId, appointmentId, appointmentData) {
        await this.delay();
        const patient = this.patients.find(p => p.id === parseInt(patientId));
        if (patient) {
            const appointment = patient.appointments.find(a => a.id === parseInt(appointmentId));
            if (appointment) {
                Object.assign(appointment, appointmentData);
                
                // Save to localStorage for permanent storage
                this.savePatients();
                
                console.log('Appointment updated and saved permanently for patient:', patient.name);
                
                return {
                    success: true,
                    data: appointment,
                    message: "Appointment updated successfully and saved permanently"
                };
            } else {
                return {
                    success: false,
                    message: "Appointment not found"
                };
            }
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Cancel appointment
    async cancelAppointment(patientId, appointmentId) {
        await this.delay();
        const patient = this.patients.find(p => p.id === parseInt(patientId));
        if (patient) {
            // Validate appointmentId
            const aptId = parseInt(appointmentId);
            if (isNaN(aptId) || aptId <= 0) {
                console.error('Invalid appointment ID:', appointmentId);
                return {
                    success: false,
                    message: "Invalid appointment ID"
                };
            }
            
            const appointmentIndex = patient.appointments.findIndex(a => a.id === aptId);
            if (appointmentIndex !== -1) {
                const cancelledAppointment = patient.appointments[appointmentIndex];
                patient.appointments[appointmentIndex].status = "Cancelled";
                
                // Save to localStorage for permanent storage
                this.savePatients();
                
                console.log('Appointment cancelled and saved permanently for patient:', patient.name);
                console.log('Cancelled appointment ID:', aptId);
                
                return {
                    success: true,
                    data: patient.appointments[appointmentIndex],
                    message: "Appointment cancelled successfully and saved permanently"
                };
            } else {
                console.error('Appointment not found with ID:', aptId);
                console.log('Available appointments:', patient.appointments.map(a => ({ id: a.id, date: a.date, doctor: a.doctor })));
                return {
                    success: false,
                    message: "Appointment not found"
                };
            }
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }

    // Get available doctors for appointments
    async getAvailableDoctors() {
        await this.delay();
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: "Dr. Arjun Mehta",
                    department: "Cardiology",
                    specialization: "Interventional Cardiology",
                    experience: "15 years",
                    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    availableTime: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]
                },
                {
                    id: 2,
                    name: "Dr. Priya Nair",
                    department: "Neurology",
                    specialization: "Neurophysiology",
                    experience: "12 years",
                    availableDays: ["Monday", "Wednesday", "Friday"],
                    availableTime: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]
                },
                {
                    id: 3,
                    name: "Dr. Rohan Gupta",
                    department: "Pediatrics",
                    specialization: "Pediatric Cardiology",
                    experience: "10 years",
                    availableDays: ["Tuesday", "Thursday", "Saturday"],
                    availableTime: ["9:00 AM", "10:00 AM", "11:00 AM", "4:00 PM", "5:00 PM"]
                },
                {
                    id: 4,
                    name: "Dr. Sneha Reddy",
                    department: "Gynecology",
                    specialization: "Maternal-Fetal Medicine",
                    experience: "8 years",
                    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
                    availableTime: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]
                },
                {
                    id: 5,
                    name: "Dr. Kavita Malhotra",
                    department: "Dermatology",
                    specialization: "Cosmetic Dermatology",
                    experience: "6 years",
                    availableDays: ["Wednesday", "Thursday", "Friday", "Saturday"],
                    availableTime: ["11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]
                },
                {
                    id: 6,
                    name: "Dr. Ananya Sharma",
                    department: "Orthopedics",
                    specialization: "Joint Replacement Surgery",
                    experience: "18 years",
                    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
                    availableTime: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]
                }
            ],
            message: "Available doctors retrieved successfully"
        };
    }

    // Get patient medical history
    async getPatientMedicalHistory(id) {
        await this.delay();
        const patient = this.patients.find(p => p.id === parseInt(id));
        if (patient) {
            return {
                success: true,
                data: patient.medicalHistory,
                message: "Medical history retrieved successfully"
            };
        } else {
            return {
                success: false,
                message: "Patient not found"
            };
        }
    }
}

// Initialize the API
const patientAPI = new PatientAPI();

// Make it available globally
window.patientAPI = patientAPI;

// Example usage functions for testing
async function testPatientAPI() {
    console.log("Testing Patient API...");
    
    // Get all patients
    const allPatients = await patientAPI.getAllPatients();
    console.log("All Patients:", allPatients);
    
    // Get patient by ID
    const patient = await patientAPI.getPatientById(1);
    console.log("Patient 1:", patient);
    
    // Search patients
    const searchResults = await patientAPI.searchPatients("Priya");
    console.log("Search Results:", searchResults);
    
    // Add new patient
    const newPatient = await patientAPI.addPatient({
        name: "Test Patient",
        age: 35,
        gender: "Male",
        email: "test@email.com",
        phone: "+91 98765 43215",
        bloodGroup: "A+"
    });
    console.log("New Patient:", newPatient);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientAPI;
}
