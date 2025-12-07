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
			alert('Session expired. Please login again');
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
	setTimeout(() => msg.style.display = 'none', 5000);
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
function openTab(tabId) {
	document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
	document.getElementById(tabId).style.display = 'block';

	document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
	const btn = document.querySelector(`[onclick="openTab('${tabId}')"]`);
	if (btn) btn.classList.add('active');

	if (tabId === 'view-appointments') loadAppointments();
	if (tabId === 'view-today') loadTodayAppointments();
}

// ==========================
// Load all appointments
// ==========================
async function loadAppointments() {
	const tbody = document.querySelector('#appointments-table tbody');
	tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px">Loading...</td></tr>';

	try {
		const response = await apiFetch('/doctor/appointments');
		if (!response?.ok) throw new Error();

		const appointments = await response.json();
		tbody.innerHTML = '';

		if (appointments.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px">No appointments found</td></tr>';
			return;
		}

		appointments.forEach(app => {
			const row = document.createElement('tr');
			row.innerHTML = `
                <td>${app.id}</td>
                <td>${escapeHtml(app.patient.name)}</td>
                <td>${app.patient.age || '-'}</td>
                <td>${app.appointmentDate}</td>
                <td>${app.appointmentTime}</td>
                <td>
                    <select onchange="updateStatus(${app.id}, this.value)" class="status-select ${app.status.toLowerCase()}">
                        <option value="PENDING"   ${app.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="BOOKED"    ${app.status === 'BOOKED' ? 'selected' : ''}>Booked</option>
                        <option value="COMPLETED" ${app.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                        <option value="CANCELLED" ${app.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td><button class="btn-primary" onclick="openPrescriptionModal(${app.id}, '${escapeHtml(app.patient.name)}')">Prescribe</button></td>
            `;
			tbody.appendChild(row);
		});

	} catch {
		showMessage('Failed to load appointments');
	}
}

// ==========================
// Update status
// ==========================
async function updateStatus(id, newStatus) {
	try {
		const response = await apiFetch(`/doctor/appointments/status/${id}`, {
			method: 'PUT',
			body: JSON.stringify(newStatus)
		});

		if (response.ok) {
			showMessage(`Status updated to ${newStatus}`, 'success');
			loadAppointments();
		} else {
			showMessage('Failed to update status', 'error');
			loadAppointments();
		}
	} catch {
		showMessage('Network error', 'error');
	}
}

// ==========================
// Load today's appointments
// ==========================
async function loadTodayAppointments() {
	const tbody = document.querySelector('#today-table tbody');
	tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">Loading...</td></tr>';

	try {
		const response = await apiFetch('/doctor/appointments/today');
		if (!response?.ok) throw new Error();

		const appointments = await response.json();
		tbody.innerHTML = '';

		if (appointments.length === 0) {
			tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px">No appointments today</td></tr>';
			return;
		}

		appointments.forEach(app => {
			const row = document.createElement('tr');
			row.innerHTML = `
                <td>${app.id}</td>
                <td>${escapeHtml(app.patient.name)}</td>
                <td>${app.patient.age || '-'}</td>
                <td>${app.appointmentTime}</td>
                <td>
                    <select onchange="updateStatus(${app.id}, this.value)" class="status-select ${app.status.toLowerCase()}">
                        <option value="PENDING"   ${app.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="BOOKED"    ${app.status === 'BOOKED' ? 'selected' : ''}>Booked</option>
                        <option value="COMPLETED" ${app.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                        <option value="CANCELLED" ${app.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td><button class="btn-primary" onclick="openPrescriptionModal(${app.id}, '${escapeHtml(app.patient.name)}')">Prescribe</button></td>
            `;
			tbody.appendChild(row);
		});

	} catch {
		showMessage('Failed to load today appointments');
	}
}

// ==========================
// Prescription modal
// ==========================
function openPrescriptionModal(id, name) {
	document.getElementById('prescription-modal').style.display = 'flex';
	document.getElementById('modal-patient-name').textContent = name;
	document.getElementById('prescription-appointment-id').value = id;
}

function closeModal() {
	document.getElementById('prescription-modal').style.display = 'none';
	document.getElementById('prescription-details').value = '';
}

async function submitPrescription() {
	const id = document.getElementById('prescription-appointment-id').value;
	const details = document.getElementById('prescription-details').value.trim();
	if (!details) return showMessage('Please enter prescription details');

	const response = await apiFetch('/doctor/prescriptions', {
		method: 'POST',
		body: JSON.stringify({ appointmentId: parseInt(id), details })
	});

	if (response.ok) {
		showMessage('Prescription saved!', 'success');
		closeModal();
		loadAppointments();
	} else {
		showMessage('Failed to save prescription');
	}
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
// Load doctor profile
// ==========================
async function loadProfile() {
	try {
		const response = await apiFetch('/doctor/me');
		if (response?.ok) {
			const doctor = await response.json();
			document.getElementById('doctor-name').textContent = doctor.name;
		}
	} catch { }
}

// ==========================
// On page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
	if (localStorage.getItem('role') !== 'ROLE_DOCTOR') {
		alert('Access denied');
		window.location.href = '/index.html';
	}

	openTab('view-appointments');
	loadProfile();
});