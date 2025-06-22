document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: true,
        offset: 20,
    });

    const sidebarLinks = document.querySelectorAll('.account-sidebar .list-group-item-action');
    const contentSections = document.querySelectorAll('.account-content .content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Prevent logout link from changing content
            if(link.href.includes('index.html')) {
                window.location.href = link.href;
                return;
            }

            const targetId = link.getAttribute('href').substring(1);

            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target content section
            contentSections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                    section.classList.add('active');
                } else {
                    section.style.display = 'none';
                    section.classList.remove('active');
                }
            });
        });
    });
}); 