const API_BASE_URL = "https://timetable-backend-48h4.onrender.com";

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

// Helper function to parse JWT
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        console.log('Attempting login with:', email);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on user role
        const user = parseJwt(data.token);
        
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
        console.error('Login error:', error);
        errorMessage.textContent = error.message || 'Server error';
    }
}

// Add event listener to the form
document.getElementById('loginForm').addEventListener('submit', handleLogin);
