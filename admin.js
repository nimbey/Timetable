async function loadUsers() {
    const token = checkAuth();
    if (!token) {
        console.error('No auth token available');
        return;
    }

    try {
        console.log('Making request to:', `${API_URL}/api/admin/users`);
        
        const response = await fetch(`${API_URL}/api/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        console.log('Response received:', response.status);
        
        // Log the raw response text for debugging
        const rawText = await response.text();
        console.log('Raw response:', rawText);
        
        // Try to parse the response as JSON
        let users;
        try {
            users = JSON.parse(rawText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            throw new Error('Invalid response format from server');
        }

        console.log('Parsed users:', users);

        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            console.error('Could not find usersTableBody element');
            return;
        }

        tbody.innerHTML = '';
        
        if (Array.isArray(users)) {
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${user.role || ''}</td>
                    <td>${user.subject || '-'}</td>
                    <td>
                        <button onclick="editUser('${user._id}')" class="btn-primary">Edit</button>
                        <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error('Users data is not an array:', users);
        }
    } catch (error) {
        console.error('Error in loadUsers:', error);
        showError(error.message || 'Failed to load users');
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    console.log('Checking auth token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = 'index.html';
        return null;
    }
    
    const user = parseJwt(token);
    console.log('Decoded user:', user);
    
    if (!user || user.role !== 'admin') {
        console.log('User is not admin, redirecting to timetable');
        window.location.href = 'timetable.html';
        return null;
    }
    
    return token;
}
