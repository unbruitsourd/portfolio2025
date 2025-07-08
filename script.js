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
         mainContainer.classList.add('contact-is-active', 'view-active');
     }

    /**
     * Handles clicks on the split panels to expand/collapse.
     * @param {Event} e - The click event.
     * @param {string} sideClicked - 'left' or 'right' indicating which split was clicked.
     */
    function handleSplitClick(e, sideClicked) {
        if (e.target.closest('a.project-link, [data-bs-toggle="modal"], .cta-button, .service-buttons .btn') || contactSection.contains(e.target)) {
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

        // If lightbox is already visible and content is changing, add fade-out class
        if (lightboxContainer.classList.contains('is-visible') && lightboxContent.innerHTML !== '') {
            lightboxContent.classList.add('fading-out');
            // Wait for fade-out transition to complete before loading new content
            await new Promise(resolve => setTimeout(resolve, 200)); // Match CSS transition duration
        }

        lightboxContainer.classList.add('is-visible');
        document.body.classList.add('lightbox-open');

        // Show spinner while loading
        lightboxContent.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        lightboxContent.classList.remove('fading-out'); // Remove fade-out if it was there
        lightboxContent.classList.add('fading-in'); // Prepare for fade-in

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            // Set content and remove fading-in after a short delay to allow transition
            lightboxContent.innerHTML = html;
            setTimeout(() => {
                lightboxContent.classList.remove('fading-in');
            }, 10); // Small delay to ensure class is applied before removal

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
            lightboxContent.classList.remove('fading-in');
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

    // --- Event Delegation for Lightbox Content ---
    lightboxContent.addEventListener('click', function(e) {
        // Check if the click is on an example button within the lightbox
        const exampleButton = e.target.closest('.example-button');
        if (exampleButton) {
            e.preventDefault();
            const projectFile = exampleButton.dataset.project;
            openLightbox(projectFile, 'project');
        }
    });

    // --- Event Listeners ---
    splitLeft.addEventListener('click', (e) => handleSplitClick(e, 'left'));
    splitRight.addEventListener('click', (e) => handleSplitClick(e, 'right'));

    if (contactTrigger) {
        contactTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
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

    // Handle clicks outside the active contact section to close it
    document.addEventListener('click', (e) => {
        // Check if the contact section is active and the click is outside of it
        if (mainContainer.classList.contains('contact-is-active') && !contactSection.contains(e.target) && e.target !== contactTrigger) {
            closeActiveView();
        }
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

    // Video Services Section Functionality - Nouvelle structure avec feature buttons
    const featureButtons = document.querySelectorAll('.feature-button');
    const serviceDetailContents = document.querySelectorAll('.service-detail-content');
    const defaultVideoContent = document.getElementById('default-video-content');

    // Function to show default content
    function showDefaultVideoContent() {
        featureButtons.forEach(fb => fb.classList.remove('active')); // Deactivate all buttons
        serviceDetailContents.forEach(sdc => {
            sdc.classList.remove('active');
        });
        if (defaultVideoContent) {
            defaultVideoContent.classList.add('active');
        }
        // Set first button as active by default
        if (featureButtons.length > 0) {
            featureButtons[0].classList.add('active');
        }
    }

    // Function to switch service content
    function switchServiceContent(serviceType) {
        // Remove active class from all feature buttons and detail contents
        featureButtons.forEach(fb => fb.classList.remove('active'));
        serviceDetailContents.forEach(sdc => {
            sdc.classList.remove('active');
        });

        // Add active class to clicked feature button
        const activeButton = document.querySelector(`[data-service="${serviceType}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Show corresponding detail content
        const targetContent = document.getElementById(`${serviceType}-content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Change the service image based on the selected service
        const serviceImage = document.getElementById('service-image');
        if (serviceImage) {
            let imageSrc = 'images/generique/video-bg01.jpg'; // Image par défaut
            
            switch(serviceType) {
                case 'evenementiel':
                    imageSrc = 'images/generique/video-event01.jpg';
                    break;
                case 'creatif':
                    imageSrc = 'images/generique/video-gen02.png';
                    break;
                case 'pedagogique':
                    imageSrc = 'images/generique/video-pedagogique01.jpg';
                    break;
                case 'corporatif':
                    imageSrc = 'images/generique/video-corpo01.png';
                    break;
            }
            
            serviceImage.src = imageSrc;
        }
    }

    // Initialize with first service (evenementiel) active
    if (featureButtons.length > 0) {
        const firstService = featureButtons[0].dataset.service;
        switchServiceContent(firstService);
    }

    // Add event listeners to feature buttons
    featureButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const serviceType = this.dataset.service;
            switchServiceContent(serviceType);
        });
    });

    // --- CTA Buttons Logic ---
    const ctaContactButtons = document.querySelectorAll('.cta-button');
    const serviceContactButtons = document.querySelectorAll('.service-buttons .btn[href="#contact-section"]');

    // Function to handle contact button clicks
    function handleContactButtonClick(e) {
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
    }

    // Apply to CTA buttons
    ctaContactButtons.forEach(button => {
        button.addEventListener('click', handleContactButtonClick);
    });

    // Apply to service contact buttons
    serviceContactButtons.forEach(button => {
        button.addEventListener('click', handleContactButtonClick);
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
// --- ANIMATION DU PANNEAU DE CRÉDIBILITÉ ---
document.addEventListener('DOMContentLoaded', () => {
    const credibilityPanel = document.getElementById('credibility-panel');

    // S'assure que le panneau existe avant de continuer
    if (!credibilityPanel) return;

    const animateCountUp = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000; // Durée de l'animation en ms
        let startTime = null;

        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            let currentValue = Math.floor(progress * target);
            
            // Ajoute le signe '+' et formate le nombre si nécessaire
            el.textContent = `+${currentValue.toLocaleString('fr-FR')}`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                 el.textContent = `+${target.toLocaleString('fr-FR')}`;
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajoute la classe pour l'animation de fondu/translation
                entry.target.classList.add('is-visible');
                
                // Lance l'animation de comptage pour chaque chiffre
                const counters = entry.target.querySelectorAll('.stat-value');
                counters.forEach(counter => animateCountUp(counter));
                
                // Arrête d'observer une fois l'animation lancée
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2 // Déclenche quand 20% du panneau est visible
    });

    observer.observe(credibilityPanel);
});