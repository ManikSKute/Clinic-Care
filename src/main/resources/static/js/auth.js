// ============================
// Show message UI
// ============================
function showMessage(message, type = 'error', elementId) {
    const msgDiv = document.getElementById(elementId);
    if (!msgDiv) return;

    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;

    setTimeout(() => {
        msgDiv.textContent = '';
		msgDiv.className = '';
    }, 3000);
}

// =============================================
// Save token + redirect based on role
// =============================================
function setAuthData(token) {
    localStorage.setItem('token', token);

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        localStorage.setItem('role', role);
        localStorage.setItem('sub', payload.sub);

        // Redirect
        switch (role) {
            case 'ROLE_ADMIN':
                window.location.href = 'dashboard/admin.html';
                break;
            case 'ROLE_DOCTOR':
                window.location.href = 'dashboard/doctor.html';
                break;
            case 'ROLE_PATIENT':
                window.location.href = 'dashboard/patient.html';
                break;
            case 'ROLE_RECEPTIONIST':
                window.location.href = 'dashboard/receptionist.html';
                break;
            default:
                showMessage('Unknown role. Contact administrator.', 'error');
        }
    } catch (e) {
        console.error('Invalid token format');
        showMessage('Login failed. Invalid token.', 'error');
    }
}

// ======
// Login
// ======
async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showMessage('Please fill all fields', 'error', 'login-error');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            setAuthData(data.token);
        } else {
            showMessage('Invalid credentials', 'error', 'login-error');
        }
    } catch (err) {
        showMessage('Network error. Please try again.', 'error', 'login-error');
    }
}

// =================
// Register Patient
// =================
async function registerPatient() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value.trim();
    const age = document.getElementById('regAge').value ? parseInt(document.getElementById('regAge').value) : null;
    const gender = document.getElementById('regGender').value || null;
    const phone = document.getElementById('regPhone').value.trim() || null;
    const email = document.getElementById('regEmail').value.trim() || null;
    const address = document.getElementById('regAddress').value.trim() || null;
    const medicalHistory = document.getElementById('regMedicalHistory').value.trim() || null;

    if (!username || !password || !name) {
        showMessage('Username, password, and name are required', 'error', 'patient-register-error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register/patient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name, age, gender, phone, email, address, medicalHistory })
        });

        if (response.ok) {
            showMessage('Registration successful! Redirecting to login...', 'success', 'patient-register-success');
            setTimeout(() => window.location.href = '/login.html', 2000);
        } else {
            const error = await response.text();
            showMessage(error || 'Registration failed', 'error', 'patient-register-error');
        }
    } catch (err) {
        showMessage('Connection failed. Please try again.', 'error', 'patient-register-error');
    }
}