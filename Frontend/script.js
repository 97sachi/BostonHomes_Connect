document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        console.log('Form submitted:', userData);

        // Redirect to welcome page with the username
        window.location.href = `welcome.html?username=${userData.username}`;
    });
});
