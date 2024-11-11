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

        const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
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
        console.error('Login error:', error);
        errorMessage.textContent = error.message || 'Server error';
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

// Add this helper function
async function handleApiRequest(url, options = {}) {
    try {
        console.log('Making request to:', `${config.API_BASE_URL}${url}`);
        const response = await fetch(`${config.API_BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Attempting login with:', email);
    
    try {
        const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        
        // Redirect based on user role
        window.location.href = data.role === 'admin' ? 'admin.html' : 'timetable.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('error-message').textContent = error.message;
    }
}

// Add event listener to the form
document.getElementById('loginForm').addEventListener('submit', handleLogin);
