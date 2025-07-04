document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const mainContainer = document.getElementById('main-container');
    const splitLeft = document.querySelector('#techno');
    const splitRight = document.querySelector('#video');
    const contactTrigger = document.getElementById('contact-trigger');
    const contactSection = document.getElementById('contact-section');
    const contactForm = document.getElementById('contact-form');
    const lightboxContainer = document.getElementById('lightbox-container');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.getElementById('lightbox-close');
    const projectLinks = document.querySelectorAll('.project-link');
    const serviceButtons = document.querySelectorAll('.service-button');
    
    // Flag to prevent re-triggering contact panel on quick scrolls
    let hasScrolledForContact = false;

    // --- Helper Functions ---
    /**
     * Closes any currently active view (left, right, or contact).
     */
    function closeActiveView() {
        mainContainer.classList.remove('left-is-active', 'right-is-active', 'contact-is-active', 'view-active');
        // Reset scroll flag after transition completes
        setTimeout(() => { hasScrolledForContact = false; }, 800);
    }

    /**
     * Opens the contact panel (desktop only).
     */
    function openContactPanel() {
        if (window.innerWidth > 992) {
            mainContainer.classList.add('contact-is-active', 'view-active');
        }
    }

    /**
     * Handles clicks on the split panels to expand/collapse.
     * @param {Event} e - The click event.
     * @param {string} sideClicked - 'left' or 'right' indicating which split was clicked.
     */
    function handleSplitClick(e, sideClicked) {
        if (e.target.closest('a.project-link, [data-bs-toggle="modal"], .cta-button') || contactSection.contains(e.target)) {
            return;
        }

        const isViewActive = mainContainer.classList.contains('view-active');

        if (isViewActive) {
            const isLeftActive = mainContainer.classList.contains('left-is-active');
            const isRightActive = mainContainer.classList.contains('right-is-active');
            
            if ((isLeftActive && sideClicked === 'right') || (isRightActive && sideClicked === 'left')) {
                closeActiveView();
            }
        } else {
            if (window.innerWidth > 992) {
                mainContainer.classList.add(`${sideClicked}-is-active`, 'view-active');
            }
        }
    }

    /**
     * Opens the lightbox and loads content via Fetch API.
     * @param {string} contentId - The ID of the content to load (e.g., 'brainstorm', 'projet-espagne').
     * @param {string} type - 'service' for service lightboxes, 'project' for project lightboxes.
     */
    async function openLightbox(contentId, type) {
        if (!contentId) return;

        let url;
        if (type === 'service') {
            url = `lightbox-${contentId}.html`;
        } else if (type === 'project') {
            url = contentId; // contentId is already the URL for projects
        } else {
            console.error("Invalid lightbox type:", type);
            return;
        }

        lightboxContainer.classList.add('is-visible');
        document.body.classList.add('lightbox-open');

        lightboxContent.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            lightboxContent.innerHTML = html;

            // Specific logic for project carousels (if any)
            const carouselElement = lightboxContent.querySelector('#project-carousel');
            if (carouselElement) {
                const carousel = new bootstrap.Carousel(carouselElement);
                const videoFrame = carouselElement.querySelector('iframe');
                
                const manageVideo = (slideIndex) => {
                    if (videoFrame) {
                        videoFrame.src = slideIndex === 0 ? videoFrame.dataset.src : '';
                    }
                };

                manageVideo(0);
                carouselElement.addEventListener('slid.bs.carousel', (event) => manageVideo(event.to));
            }
        } catch (error) {
            console.error("Could not load lightbox content:", error);
            lightboxContent.innerHTML = '<p class="text-center text-danger">Désolé, une erreur est survenue lors du chargement du contenu.</p>';
        }
    }

    /**
     * Closes the lightbox.
     */
    function closeLightbox() {
        const videoFrame = lightboxContent.querySelector('iframe');
        if (videoFrame) videoFrame.src = '';
        
        lightboxContainer.classList.remove('is-visible');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
    }

    // --- Event Listeners ---
    splitLeft.addEventListener('click', (e) => handleSplitClick(e, 'left'));
    splitRight.addEventListener('click', (e) => handleSplitClick(e, 'right'));

    if (contactTrigger) {
        contactTrigger.addEventListener('click', (e) => { 
            e.preventDefault(); 
            openContactPanel(); 
        });
    }

    // --- MODIFICATION ICI ---
    // Gère le scroll pour ouvrir ET fermer la section contact
    window.addEventListener('wheel', (e) => { 
        if (window.innerWidth <= 992) return; // Ne rien faire sur mobile

        // Condition pour OUVRIR la section contact avec un scroll-down
        if (!mainContainer.classList.contains('view-active') && !hasScrolledForContact && e.deltaY > 0) { 
            openContactPanel(); 
            hasScrolledForContact = true; 
        } 
        // Condition pour FERMER la section contact avec un scroll-up
        else if (mainContainer.classList.contains('contact-is-active') && e.deltaY < 0) {
            closeActiveView();
        }
    });

    document.querySelectorAll('.back-arrow').forEach(arrow => { 
        arrow.addEventListener('click', (e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            closeActiveView(); 
        }); 
    });
    
    // --- Contact Form Logic ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const makeWebhookURL = 'https://hook.eu2.make.com/ru5fqndn94js8yp99ga8583u6arslogm';
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const buttonText = submitButton.querySelector('.btn-text');
            const spinner = submitButton.querySelector('.spinner-border');
            const successMessage = document.getElementById('success-message');

            buttonText.textContent = 'Envoi en cours...';
            spinner.classList.remove('d-none');
            submitButton.disabled = true;

            fetch(makeWebhookURL, { method: 'POST', body: formData })
            .then(response => { 
                if (!response.ok) throw new Error('La soumission a échoué.');
                return response.text();
            })
            .then(data => {
                contactForm.classList.add('d-none');
                successMessage.classList.remove('d-none');
                contactForm.reset();
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert("Une erreur est survenue. Veuillez réessayer.");
                buttonText.textContent = 'Envoyer';
                spinner.classList.add('d-none');
                submitButton.disabled = false;
            });
        });
    }

    // --- Project Links & Lightbox Logic ---
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                const projectFile = link.getAttribute('href');
                link.href = `project-viewer.html?project=${encodeURIComponent(projectFile)}`;
            } else {
                e.preventDefault();
                openLightbox(link.getAttribute('href'), 'project');
            }
        });
    });

    // --- Service Buttons & Lightbox Logic ---
    serviceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const lightboxId = button.dataset.lightbox;
            openLightbox(lightboxId, 'service');
        });
    });

    // --- CTA Buttons Logic ---
    const ctaContactButtons = document.querySelectorAll('.cta-button');

    ctaContactButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            if (window.innerWidth > 992) {
                closeActiveView();
                setTimeout(() => {
                    openContactPanel();
                }, 800);
            } else {
                const contactElem = document.getElementById('contact-section');
                if (contactElem) {
                    contactElem.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // --- Lightbox Close Logic ---
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxContainer.addEventListener('click', (e) => { 
        if (e.target === lightboxContainer) closeLightbox(); 
    });
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape' && lightboxContainer.classList.contains('is-visible')) closeLightbox(); 
    });
});
