// ==========================
// Secure fetch
// ==========================
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return null;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            alert('Session expired. Please login again.');
            window.location.href = '/index.html';
        }

        return response;
    } catch (e) {
        showMessage('Server not reachable, try again later');
        return null;
    }
}

// ==========================
// Show message
// ==========================
function showMessage(text, type = 'error') {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 4000);
}

// ==========================
// Logout
// ==========================
function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}

// ==========================
// Tab Switching
// ==========================
function openTab(sectionId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="openTab('${sectionId}')"]`).classList.add('active');
}

// ==========================
// Cancel Booking
// ==========================
function cancelBooking() {
    document.getElementById('booking-form').style.display = 'none';
    document.getElementById('doctors-list').style.display = 'block';

    document.getElementById('appointment-date').value = "";
    document.getElementById('appointment-time').value = "";
}

// ==========================
// Load All Doctors
// ==========================
async function loadDoctors() {
    const tbody = document.querySelector('#doctors-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    try {
        const response = await apiFetch('/patient/doctors');
        if (!response?.ok) throw new Error();

        const doctors = await response.json();
        tbody.innerHTML = doctors.length === 0 ? '<tr><td colspan="5">No doctors available</td></tr>' : '';

        doctors.forEach(doc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(doc.name)}</td>
                <td>${escapeHtml(doc.specialization || 'General')}</td>
                <td>${escapeHtml(doc.availabilityNotes || 'Not specified')}</td>
                <td>${escapeHtml(doc.phone || '-')}</td>
                <td><button class="btn-primary" onclick="selectDoctor(${doc.id}, '${escapeHtml(doc.name)}')">Book</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5">Error loading doctors</td></tr>';
    }
}

function selectDoctor(id, name) {
    document.getElementById('selected-doctor').textContent = name;
    document.getElementById('doctor-id').value = id;
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('doctors-list').style.display = 'none';
}

// ==========================
// Book Appointment
// ==========================
async function bookAppointment() {
    const doctorId = document.getElementById('doctor-id').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;

    if (!doctorId || !date || !time) return showMessage('Please fill all fields');

    if (new Date(date) < new Date().setHours(0,0,0,0))
        return showMessage('Cannot book in the past');

    const button = document.getElementById('book-btn');
    button.disabled = true;
    button.textContent = 'Booking...';

    try {
        const response = await apiFetch('/patient/appointments', {
            method: 'POST',
            body: JSON.stringify({ doctorId: parseInt(doctorId), date, time })
        });

        button.disabled = false;
        button.textContent = 'Confirm Booking';

        if (response?.ok) {
            showMessage('Appointment booked successfully!', 'success');
            cancelBooking();
            loadAppointments();
        } else {
            const error = await response.text();
            showMessage(error || 'This time slot is already booked');
        }
    } catch (e) {
        showMessage('Network error');
    }
}

// ==========================
// Load My Appointments
// ==========================
async function loadAppointments() {
    const tbody = document.querySelector('#appointments-table tbody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const response = await apiFetch('/patient/appointments');
        if (!response?.ok) throw new Error();

        const appointments = await response.json();
        tbody.innerHTML = appointments.length === 0 ? '<tr><td colspan="4">No appointments</td></tr>' : '';

        appointments.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.appointmentDate}</td>
                <td>${app.appointmentTime}</td>
                <td>${escapeHtml(app.doctor.name)}</td>
                <td><span class="status ${app.status.toLowerCase()}">${escapeHtml(app.status)}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        showMessage('Failed to load appointments');
    }
}

// ==========================
// Load My Prescription
// ==========================
async function loadPrescriptions() {
    const tbody = document.querySelector('#prescriptions-table tbody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        const response = await apiFetch('/patient/prescriptions');
        if (!response?.ok) throw new Error();

        const prescriptions = await response.json();
        tbody.innerHTML = prescriptions.length === 0
            ? '<tr><td colspan="4">No prescriptions yet</td></tr>'
            : '';

        prescriptions.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(p.appointment.appointmentDate)}</td>
                <td>${escapeHtml(p.doctor.name)}</td>
                <td>${escapeHtml(p.details)}</td>
                <td>
                    <button class="btn-primary"
                        onclick="printPrescription('${escapeHtml(p.doctor.name)}','${escapeHtml(p.appointment.appointmentDate)}','${escapeHtml(p.details)}')">
                        Print
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        showMessage('Failed to load prescriptions');
    }
}

// ==========================
// Print My Prescription
// ==========================
function printPrescription(name,date,details) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>Prescription</title>
        <style>body{font-family:Arial;margin:40px;}pre{white-space:pre-wrap;font-size:16px;}</style>
        </head><body>
		<h2>Dr.${name}</h2>
        <h3>Prescription</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p>${details}</p>
        </body></html>
    `);
    win.document.close();
    win.print();
}

// ==========================
// Load Profile
// ==========================
async function loadProfile() {
    try {
        const response = await apiFetch('/patient/me');
        if (response?.ok) {
            const patient = await response.json();
            document.getElementById('patient-name').textContent = patient.name;
            document.getElementById('patient-info').innerHTML = `
                Age: ${patient.age || '-'} |
                Gender: ${patient.gender || '-'} |
                Phone: ${patient.phone || '-'}
            `;
        }
    } catch {}
}

// ==========================
// Escape HTML
// ==========================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================
// On page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    if (role !== 'ROLE_PATIENT') {
        alert('Access denied');
        return window.location.href = '/index.html';
    }

    loadProfile();
    loadDoctors();
    loadAppointments();
    loadPrescriptions();
});