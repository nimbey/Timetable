// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    const user = parseJwt(token);
    if (user.role !== 'admin') {
        window.location.href = 'timetable.html';
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
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Show tab
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// Load users
async function loadUsers() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3001/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
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
        showError('Error loading users');
    }
}

// Load timetable
async function loadTimetable() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3001/api/admin/timetable', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const slots = await response.json();
        const tbody = document.getElementById('timetableTableBody');
        tbody.innerHTML = '';
        
        slots.forEach(slot => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${slot.day}</td>
                <td>${slot.startTime} - ${slot.endTime}</td>
                <td>${slot.subject}</td>
                <td>${slot.teacher}</td>
                <td>${slot.room}</td>
                <td>
                    <button onclick="handleEditSlot('${slot._id}')">Edit</button>
                    <button onclick="handleDeleteSlot('${slot._id}')" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading timetable:', error);
        showError('Error loading timetable');
    }
}

// Add new user
async function addUser(formData) {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3001/api/admin/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            loadUsers();
            closeModal();
        } else {
            throw new Error('Failed to add user');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showError('Error adding user');
    }
}

// Add new timeslot
async function addTimeSlot(formData) {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3001/api/admin/timetable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            loadTimetable();
            closeModal();
        } else {
            throw new Error('Failed to add timeslot');
        }
    } catch (error) {
        console.error('Error adding timeslot:', error);
        showError('Error adding timeslot');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const token = checkAuth();
    try {
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            loadUsers();
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Error deleting user');
    }
}

// Delete timeslot
async function deleteSlot(slotId) {
    if (!confirm('Are you sure you want to delete this timeslot?')) return;
    
    const token = checkAuth();
    try {
        const response = await fetch(`http://localhost:3001/api/admin/timetable/${slotId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            loadTimetable();
        } else {
            throw new Error('Failed to delete timeslot');
        }
    } catch (error) {
        console.error('Error deleting timeslot:', error);
        showError('Error deleting timeslot');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    loadUsers();
    loadTimetable();
});

// Add New User Form
function showAddUserForm() {
    const formHTML = `
        <div id="addUserModal" class="modal">
            <div class="modal-content">
                <h2>Add New User</h2>
                <form id="addUserForm">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" required minlength="8">
                    </div>
                    <div class="form-group">
                        <label for="role">Role:</label>
                        <select id="role" required onchange="handleRoleChange()">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <div class="form-group" id="subjectGroup">
                        <label for="subject">Subject:</label>
                        <select id="subject" required>
                            <option value="">Select Subject</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Computer Science">Computer Science</option>
                        </select>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="btn-primary">Add User</button>
                        <button type="button" onclick="closeModal('addUserModal')" class="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
}

// Handle Add User
async function handleAddUser(e) {
    e.preventDefault();
    const token = checkAuth();
    
    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        subject: document.getElementById('subject').value
    };

    console.log('Creating user with data:', userData);

    try {
        const response = await fetch('http://localhost:3001/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add user');
        }

        const newUser = await response.json();
        console.log('User created successfully:', newUser);

        closeModal('addUserModal');
        loadUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        showError(error.message || 'Failed to add user');
    }
}

// Edit User
async function editUser(userId) {
    const token = checkAuth();
    try {
        console.log('Fetching user data for ID:', userId);
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch user data');
        }
        
        const user = await response.json();
        console.log('Fetched user data:', user);

        // Create modal HTML
        const formHTML = `
            <div id="editUserModal" class="modal">
                <div class="modal-content">
                    <h2>Edit User</h2>
                    <form id="editUserForm">
                        <input type="hidden" id="editUserId" value="${userId}">
                        <div class="form-group">
                            <label for="editName">Name:</label>
                            <input type="text" id="editName" value="${user.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editEmail">Email:</label>
                            <input type="email" id="editEmail" value="${user.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editRole">Role:</label>
                            <select id="editRole" required>
                                <option value="">Select Role</option>
                                <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Teacher</option>
                                <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editSubject">Subject:</label>
                            <select id="editSubject" required>
                                <option value="">Select Subject</option>
                                <option value="Mathematics" ${user.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                <option value="Physics" ${user.subject === 'Physics' ? 'selected' : ''}>Physics</option>
                                <option value="Computer Science" ${user.subject === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            </select>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="btn-primary">Update</button>
                            <button type="button" onclick="closeModal('editUserModal')" class="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        // Add submit handler
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateUser(userId);
        });
    } catch (error) {
        console.error('Error in editUser:', error);
        showError(error.message || 'Failed to load user data');
    }
}

// Add the updateUser function
async function updateUser(userId) {
    const token = checkAuth();
    const userData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value,
        subject: document.getElementById('editSubject').value
    };

    try {
        console.log('Updating user with data:', userData);
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        console.log('Update response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error during update:', errorData);
            throw new Error(errorData.message || 'Failed to update user');
        }

        const updatedUser = await response.json();
        console.log('User updated successfully:', updatedUser);

        closeModal('editUserModal');
        loadUsers(); // Refresh the users list
    } catch (error) {
        console.error('Error in updateUser:', error);
        showError(error.message || 'Failed to update user');
    }
}

// Delete User
async function handleDeleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const token = checkAuth();
    try {
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadUsers(); // Refresh user list
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to delete user');
    }
}

// Utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.add-user-btn').addEventListener('click', showAddUserForm);
    loadUsers();
}); 

// Show Add Slot Form
async function showAddSlotForm() {
    // First fetch teachers
    const teachers = await loadTeachers();
    
    const formHTML = `
        <div id="addSlotModal" class="modal">
            <div class="modal-content">
                <h2>Add New Time Slot</h2>
                <form id="addSlotForm">
                    <div class="form-group">
                        <label for="day">Day:</label>
                        <select id="day" required>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="startTime">Start Time:</label>
                        <input type="time" id="startTime" required>
                    </div>
                    <div class="form-group">
                        <label for="endTime">End Time:</label>
                        <input type="time" id="endTime" required>
                    </div>
                    <div class="form-group">
                        <label for="subject">Subject:</label>
                        <select id="subject" required onchange="updateTeacherOptions()">
                            <option value="">Select Subject</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Computer Science">Computer Science</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="teacher">Teacher:</label>
                        <select id="teacher" required>
                            <option value="">Select Teacher</option>
                            ${teachers.map(teacher => 
                                `<option value="${teacher.name}" data-subject="${teacher.subject}">
                                    ${teacher.name} (${teacher.subject})
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="room">Room:</label>
                        <select id="room" required>
                            <option value="Room 101">Room 101</option>
                            <option value="Room 102">Room 102</option>
                            <option value="Room 103">Room 103</option>
                        </select>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="btn-primary">Add Slot</button>
                        <button type="button" onclick="closeModal('addSlotModal')" class="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
    document.getElementById('addSlotForm').addEventListener('submit', handleAddSlot);
    updateTeacherOptions(); // Initialize teacher options
}

// Handle Add Slot Form Submission
async function handleAddSlot(e) {
    e.preventDefault();
    const token = checkAuth();
    
    const slotData = {
        day: document.getElementById('day').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        subject: document.getElementById('subject').value,
        teacher: document.getElementById('teacher').value,
        room: document.getElementById('room').value
    };

    // Validate all fields are filled
    if (!slotData.day || !slotData.startTime || !slotData.endTime || 
        !slotData.subject || !slotData.teacher || !slotData.room) {
        showError('All fields are required');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/admin/timetable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(slotData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add time slot');
        }

        closeModal('addSlotModal');
        loadTimetable();
        showSuccess('Time slot added successfully');
    } catch (error) {
        console.error('Error adding time slot:', error);
        showError(error.message || 'Failed to add time slot');
    }
}

// Load teachers for the form
async function loadTeachers() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3001/api/admin/teachers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to load teachers');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading teachers:', error);
        showError('Failed to load teachers');
        return [];
    }
}

// Update teacher options based on selected subject
function updateTeacherOptions() {
    const subjectSelect = document.getElementById('subject');
    const teacherSelect = document.getElementById('teacher');
    const selectedSubject = subjectSelect.value;

    Array.from(teacherSelect.options).forEach(option => {
        if (option.value === '') return; // Skip the placeholder option
        const teacherSubject = option.getAttribute('data-subject');
        option.style.display = !selectedSubject || teacherSubject === selectedSubject ? '' : 'none';
    });

    // Reset teacher selection if current selection doesn't match subject
    const currentTeacherOption = teacherSelect.selectedOptions[0];
    if (currentTeacherOption && currentTeacherOption.value !== '') {
        const currentTeacherSubject = currentTeacherOption.getAttribute('data-subject');
        if (currentTeacherSubject !== selectedSubject) {
            teacherSelect.value = '';
        }
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.container').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const addSlotBtn = document.querySelector('.add-slot-btn') || document.getElementById('addSlotBtn');
    if (addSlotBtn) {
        addSlotBtn.addEventListener('click', showAddSlotForm);
    }
}); 

// Edit Slot
async function handleEditSlot(slotId) {
    const token = checkAuth();
    try {
        // Fetch both the slot data and teachers list
        const [slotResponse, teachers] = await Promise.all([
            fetch(`http://localhost:3001/api/admin/timetable/${slotId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }),
            loadTeachers()
        ]);

        const slot = await slotResponse.json();

        const formHTML = `
            <div id="editSlotModal" class="modal">
                <div class="modal-content">
                    <h2>Edit Timeslot</h2>
                    <form id="editSlotForm">
                        <input type="hidden" id="slotId" value="${slotId}">
                        <div class="form-group">
                            <label for="editDay">Day:</label>
                            <select id="editDay" required>
                                <option value="Monday" ${slot.day === 'Monday' ? 'selected' : ''}>Monday</option>
                                <option value="Tuesday" ${slot.day === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
                                <option value="Wednesday" ${slot.day === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
                                <option value="Thursday" ${slot.day === 'Thursday' ? 'selected' : ''}>Thursday</option>
                                <option value="Friday" ${slot.day === 'Friday' ? 'selected' : ''}>Friday</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editStartTime">Start Time:</label>
                            <input type="time" id="editStartTime" value="${slot.startTime}" required>
                        </div>
                        <div class="form-group">
                            <label for="editEndTime">End Time:</label>
                            <input type="time" id="editEndTime" value="${slot.endTime}" required>
                        </div>
                        <div class="form-group">
                            <label for="editSubject">Subject:</label>
                            <select id="editSubject" required>
                                <option value="Mathematics" ${slot.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                <option value="Physics" ${slot.subject === 'Physics' ? 'selected' : ''}>Physics</option>
                                <option value="Computer Science" ${slot.subject === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editTeacher">Teacher:</label>
                            <select id="editTeacher" required>
                                <option value="">Select Teacher</option>
                                ${teachers.map(teacher => 
                                    `<option value="${teacher.name}" ${slot.teacher === teacher.name ? 'selected' : ''}>
                                        ${teacher.name} (${teacher.subject})
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editRoom">Room:</label>
                            <select id="editRoom" required>
                                <option value="Room 101" ${slot.room === 'Room 101' ? 'selected' : ''}>Room 101</option>
                                <option value="Room 102" ${slot.room === 'Room 102' ? 'selected' : ''}>Room 102</option>
                                <option value="Room 103" ${slot.room === 'Room 103' ? 'selected' : ''}>Room 103</option>
                            </select>
                        </div>
                        <div class="button-group">
                            <button type="submit">Update</button>
                            <button type="button" onclick="closeModal('editSlotModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        // Add submit handler
        document.getElementById('editSlotForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateSlot(slotId);
        });
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load slot details');
    }
}

// Update Timeslot function
async function updateSlot(slotId) {
    const token = checkAuth();
    const slotData = {
        day: document.getElementById('editDay').value,
        startTime: document.getElementById('editStartTime').value,
        endTime: document.getElementById('editEndTime').value,
        subject: document.getElementById('editSubject').value,
        teacher: document.getElementById('editTeacher').value,
        room: document.getElementById('editRoom').value
    };

    try {
        const response = await fetch(`http://localhost:3001/api/admin/timetable/${slotId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(slotData)
        });

        if (!response.ok) {
            throw new Error('Failed to update timeslot');
        }

        closeModal('editSlotModal');
        loadTimetable(); // Refresh the timetable
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to update timeslot');
    }
}