// ==========================
// Secure API Fetch
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
        showMessage("table-message", "Server not reachable. Try later.");
        return null;
    }
}

// ==========================
// Show Message
// ==========================
function showMessage(areaId, text, type = "error") {
    const msgBox = document.getElementById(areaId);
    if (!msgBox) return;
    msgBox.textContent = text;
    msgBox.className = `message ${type}`;
    msgBox.style.display = 'block';
    setTimeout(() => msgBox.style.display = 'none', 4000);
}

// ==========================
// Logout
// ==========================
function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}

// ==========================
// Tabs
// ==========================
function openTab(sectionId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
    document.getElementById(sectionId).style.display = "block";

    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[onclick="openTab('${sectionId}')"]`).classList.add("active");

    if (sectionId === "view-doctors") loadDoctors();
}

// ==========================
// Load Doctors
// ==========================
async function loadDoctors() {
    const tbody = document.querySelector("#doctors-table tbody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Loading...</td></tr>';

    const response = await apiFetch("/admin/doctors");
    if (!response?.ok) {
        showMessage("table-message", "Failed to load doctors");
        tbody.innerHTML = '';
        return;
    }

    const doctors = await response.json();
    tbody.innerHTML = doctors.length === 0 ? '<tr><td colspan="7" style="text-align:center">No doctors found</td></tr>' : '';

    doctors.forEach(doc => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${doc.id}</td>
            <td>${escapeHtml(doc.name)}</td>
            <td>${escapeHtml(doc.specialization || "-")}</td>
            <td>${escapeHtml(doc.phone || "-")}</td>
            <td>${escapeHtml(doc.email || "-")}</td>
            <td>${escapeHtml(doc.availabilityNotes || "-")}</td>
            <td><button class="btn-danger" onclick="deleteDoctor(${doc.id})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

// ==========================
// Add Doctor
// ==========================
async function addDoctor() {
    const payload = {
        username: document.getElementById("doctor-username").value.trim(),
        password: document.getElementById("doctor-password").value,
        name: document.getElementById("doctor-name").value.trim(),
        specialization: document.getElementById("doctor-specialization").value.trim() || null,
        phone: document.getElementById("doctor-phone").value.trim() || null,
        email: document.getElementById("doctor-email").value.trim() || null,
        availabilityNotes: document.getElementById("doctor-availability").value.trim() || null
    };

    if (!payload.username || !payload.password || !payload.name) {
        showMessage("doctor-message", "Username, password, and name are required");
        return;
    }

    const response = await apiFetch("/admin/doctor", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    if (response?.ok) {
        showMessage("doctor-message", "Doctor added successfully!", "success");
        document.getElementById("add-doctor-form").reset();
        loadDoctors();
    } else {
        const error = await response.text();
        showMessage("doctor-message", error || "Failed to add doctor");
    }
}

// ==========================
// Delete Doctor
// ==========================
async function deleteDoctor(id) {
    if (!confirm("Delete this doctor permanently?")) return;

    const response = await apiFetch(`/admin/doctor/${id}`, { method: "DELETE" });

    if (response?.ok) {
        showMessage("table-message", "Doctor deleted successfully", "success");
        loadDoctors();
    } else showMessage("table-message", "Failed to delete doctor");
}

// ==========================
// Escape HTML
// ==========================
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ==========================
// Load Admin Profile
// ==========================
function loadAdminProfile() {
	const name = localStorage.getItem('sub');	
	document.getElementById('admin-name').textContent = name;        
}

// ==========================
// Page Load
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("role") !== "ROLE_ADMIN") {
        alert("Access denied");
        window.location.href = "/index.html";
        return;
    }

	loadAdminProfile();

    document.getElementById("add-doctor-form").addEventListener("submit", e => { 
        e.preventDefault(); 
        addDoctor(); 
    });

    openTab('add-doctor');
});