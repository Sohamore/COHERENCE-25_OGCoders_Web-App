// Global utility functions and shared logic
document.addEventListener('DOMContentLoaded', () => {
    // Add any global initialization logic here
    console.log('Smart City Platform Initialized');

    // Theme toggler (example)
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
    }

    // Potential global event listeners or utility functions
    const themeToggler = document.getElementById('themeToggler');
    if (themeToggler) {
        themeToggler.addEventListener('click', toggleTheme);
    }
});

// Smooth scroll function
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

// Add any other global utility functions