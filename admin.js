async function loadUsers() {
    const token = checkAuth();
    try {
        console.log('Fetching users with token:', token ? 'Token exists' : 'No token');
        
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch users');
        }
        
        const users = await response.json();
        console.log('Fetched users:', users);
        
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            throw new Error('Users table body element not found');
        }
        
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.subject || '-'}</td>
                <td>
                    <button onclick="editUser('${user._id}')" class="btn-primary">Edit</button>
                    <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showError(error.message || 'Error loading users');
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
