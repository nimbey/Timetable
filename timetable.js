// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    return token;
}

// Parse JWT token
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// Initialize user info
function initializeUser() {
    const token = checkAuth();
    const user = parseJwt(token);
    if (user) {
        document.getElementById('userName').textContent = `${user.name} (${user.role})`;
    }
}

// Logout function
function logout() {
    console.log('Logging out...'); // Debug log
    localStorage.clear(); // Clear all localStorage items
    window.location.href = 'index.html';
}

// Populate timetable
async function populateTimetable() {
    const token = checkAuth();
    if (!token) return;

    try {
        console.log('Fetching timetable...'); // Debug log

        const response = await fetch('http://localhost:3001/api/timetable', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const timetableData = await response.json();
        console.log('Timetable data received:', timetableData); // Debug log

        // Create timetable HTML
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = ''; // Clear existing content

        // Days of the week
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // Create a row for each day
        days.forEach(day => {
            const dayKey = day.toLowerCase();
            const dayData = timetableData[dayKey] || { time: 'N/A', subject: 'No Class', teacher: 'N/A', room: 'N/A' };
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${day}</strong></td>
                <td>${dayData.time}</td>
                <td>${dayData.subject}</td>
                <td>${dayData.teacher}</td>
                <td>${dayData.room}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error); // Debug log
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Error loading timetable. Please try again later.';
        document.querySelector('.timetable-container').prepend(errorDiv);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...'); // Debug log
    initializeUser();
    populateTimetable();
}); 