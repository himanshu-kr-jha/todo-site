// index.js
document.addEventListener('DOMContentLoaded', function() {
    const logoutForm = document.getElementById('logout-form');
    if (logoutForm) {
        logoutForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            await logout(); // Call logout function
            location.reload(); // Reload the page after logout
        });
    }

    async function logout() {
        try {
            const response = await fetch('/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Handle logout error if necessary
        }
    }
});
