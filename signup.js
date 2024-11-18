async function handleSignup(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const subject = document.getElementById('subject').value;

    // Clear previous error messages
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';

    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return;
    }

    try {
        const response = await fetch('https://timetablebackend-a7n9.onrender.com/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                subject,
                role: 'student' // Hardcoded as student
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Redirect to login page with success message
            localStorage.setItem('signupSuccess', 'Registration successful! Please login.');
            window.location.href = 'index.html';
        } else {
            errorDiv.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorDiv.textContent = 'Registration failed. Please try again.';
    }
}

// Add password validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const errorDiv = document.getElementById('error-message');
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
    } else {
        errorDiv.textContent = '';
    }
}); 
