function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    const user = parseJwt(token);
    if (user.role !== 'student') {
        window.location.href = 'index.html';
        return null;
    }
    return token;
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function initializeUser() {
    const token = checkAuth();
    const user = parseJwt(token);
    if (user) {
        console.log('User data:', user);
        
        document.getElementById('userName').textContent = user.name;
        document.getElementById('welcomeMessage').textContent = 
            `Welcome ${user.name} (${user.subject || 'No Subject'} Student)`;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
}

async function loadMyClasses() {
    const token = checkAuth();
    const user = parseJwt(token);
    
    try {
        console.log('Loading classes for subject:', user.subject);
        
        const response = await fetch('http://localhost:3001/api/timetable/student', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch schedule');
        }

        const slots = await response.json();
        console.log('Received slots:', slots);
        
        const tbody = document.getElementById('myClassesTableBody');
        tbody.innerHTML = '';

        if (!slots || slots.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">No classes scheduled for ${user.subject || 'your subject'}</td>
                </tr>
            `;
            return;
        }

        slots.forEach(slot => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${slot.day}</td>
                <td>${slot.startTime} - ${slot.endTime}</td>
                <td>${slot.subject}</td>
                <td>${slot.teacher}</td>
                <td>${slot.room}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load your schedule: ' + error.message);
    }
}

async function loadAllSchedules() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3001/api/timetable/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch schedules');
        }

        const slots = await response.json();
        const tbody = document.getElementById('allSchedulesTableBody');
        tbody.innerHTML = '';

        if (slots.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">No schedules available</td>
                </tr>
            `;
            return;
        }

        slots.forEach(slot => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${slot.day}</td>
                <td>${slot.startTime} - ${slot.endTime}</td>
                <td>${slot.subject}</td>
                <td>${slot.teacher}</td>
                <td>${slot.room}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load all schedules');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    loadMyClasses();
    loadAllSchedules();
});