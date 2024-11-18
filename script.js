document.addEventListener('DOMContentLoaded', () => {
    // Check for signup success message
    const successMessage = localStorage.getItem('signupSuccess');
    if (successMessage) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.style.backgroundColor = '#d4edda';
        errorDiv.style.color = '#155724';
        errorDiv.textContent = successMessage;
        localStorage.removeItem('signupSuccess');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        console.log('Attempting login with:', email);

        const response = await fetch('https://timetablebackend-a7n9.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Server response:', data);
        console.log('Response status:', response.status);
        console.log('JWT Token:', data.token);
        console.log('User data:', data.user);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on user role
        const user = parseJwt(data.token);
        
        // Redirect based on role
        switch (user.role) {
            case 'admin':
                window.location.href = 'admin.html';
                break;
            case 'teacher':
                window.location.href = 'teacher-dashboard.html';
                break;
            case 'student':
                window.location.href = 'student-dashboard.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Detailed error:', error);
        errorMessage.textContent = 'Connection error. Please check if the server is running.';
    }
});

// Helper function to parse JWT (optional, for debugging)
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}
