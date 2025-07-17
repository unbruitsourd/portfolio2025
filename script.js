document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const mainContainer = document.getElementById('main-container');
    const languageSwitcher = document.getElementById('language-switcher');
    const splitLeft = document.querySelector('#techno');
    const splitRight = document.querySelector('#video');
    const contactTrigger = document.getElementById('contact-trigger');
    const contactSection = document.getElementById('contact-section');
    const contactForm = document.getElementById('contact-form');
    const lightboxContainer = document.getElementById('lightbox-container');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxBackButton = document.getElementById('lightbox-back-button');
    const projectLinks = document.querySelectorAll('.project-link');
    const serviceButtons = document.querySelectorAll('.service-button');
    
    // Flag to prevent re-triggering contact panel on quick scrolls
    let hasScrolledForContact = false;

    // --- Fonctions de gestion des panneaux mobiles ---
    function openMobileView(viewName) {
        if (mainContainer.classList.contains('view-active')) return;
        mainContainer.classList.add(`mobile-${viewName}-active`, 'view-active');
    }

    function closeMobileView() {
        mainContainer.classList.remove('mobile-techno-active', 'mobile-video-active', 'mobile-contact-active', 'view-active');
    }

    // --- Mobile Interaction Logic ---
    function initMobileInteractions() {
        if (window.innerWidth > 992) return;

        document.body.style.overflow = 'hidden';

        const technoTrigger = document.getElementById('techno');
        const videoTrigger = document.getElementById('video');
        const contactTriggerContainer = document.getElementById('contact-trigger');
        const backArrows = document.querySelectorAll('.back-arrow');
        const technoContent = document.querySelector('#techno .portfolio-content');
        const videoContent = document.querySelector('#video .portfolio-content');

        let touchStartX = 0;
        let touchStartY = 0;
        const swipeThreshold = 50;

        technoTrigger.addEventListener('click', () => openMobileView('techno'));
        videoTrigger.addEventListener('click', () => openMobileView('video'));
        contactTriggerContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMobileView('contact');
        });

        backArrows.forEach(arrow => {
            arrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMobileView();
            });
        });

        mainContainer.addEventListener('touchstart', e => {
            if (mainContainer.classList.contains('view-active')) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        mainContainer.addEventListener('touchend', e => {
            if (mainContainer.classList.contains('view-active')) return;
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            handleSwipeOpen(touchEndX, touchEndY);
        });

        function handleSwipeOpen(endX, endY) {
            const deltaX = endX - touchStartX;
            const deltaY = endY - touchStartY;
            if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) return;
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                if (deltaY < 0) openMobileView('contact');
            } else {
                if (deltaX > 0) openMobileView('techno');
                else openMobileView('video');
            }
        }

        function addSwipeBackListener(element, closeDirection) {
            if (!element) return;
            let startX = 0;
            let startY = 0;

            element.addEventListener('touchstart', e => {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });

            element.addEventListener('touchend', e => {
                const endX = e.changedTouches[0].screenX;
                const endY = e.changedTouches[0].screenY;
                const deltaX = endX - startX;
                const deltaY = Math.abs(endY - startY);

                // On vérifie que le mouvement est bien plus horizontal que vertical
                if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > deltaY) {
                    let swipeHandled = false;
                    // Si on doit swiper vers la GAUCHE pour fermer
                    if (closeDirection === 'left' && deltaX < 0) {
                        closeMobileView();
                        swipeHandled = true;
                    } 
                    // Si on doit swiper vers la DROITE pour fermer
                    else if (closeDirection === 'right' && deltaX > 0) {
                        closeMobileView();
                        swipeHandled = true;
                    }
                    
                    // Si le swipe back a été géré, on arrête sa propagation
                    // pour ne pas déclencher le swipe d'ouverture par erreur.
                    if (swipeHandled) {
                        e.stopPropagation();
                    }
                }
            });
        }
        
        // Pour fermer Techno (panneau de gauche), il faut swiper vers la GAUCHE.
        addSwipeBackListener(technoContent, 'left');
        // Pour fermer Vidéo (panneau de droite), il faut swiper vers la DROITE.
        addSwipeBackListener(videoContent, 'right');
    }

    // --- Helper Functions ---
    function closeActiveView() {
        mainContainer.classList.remove('left-is-active', 'right-is-active', 'contact-is-active', 'view-active');
        languageSwitcher.classList.remove('switcher-hidden');
        setTimeout(() => { hasScrolledForContact = false; }, 800);
    }

    function openContactPanel() {
        mainContainer.classList.add('contact-is-active', 'view-active');
    }

    function handleSplitClick(e, sideClicked) {
        if (e.target.closest('a:not(.back-arrow)')) return;
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
                languageSwitcher.classList.add('switcher-hidden');
            }
        }
    }

    async function openLightbox(contentId, type) {
        if (!contentId) return;
        let url = type === 'project' ? contentId : `lightbox-${contentId}.html`;
        if (lightboxContainer.classList.contains('is-visible') && lightboxContent.innerHTML !== '') {
            lightboxContent.classList.add('fading-out');
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        lightboxContainer.classList.add('is-visible');
        document.body.classList.add('lightbox-open');
        lightboxContent.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        lightboxContent.classList.remove('fading-out');
        lightboxContent.classList.add('fading-in');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            lightboxContent.innerHTML = html;
            if (typeof translateDynamicContent === 'function') {
                translateDynamicContent(lightboxContent);
            }
            setTimeout(() => { lightboxContent.classList.remove('fading-in'); }, 10);
            const carouselElement = lightboxContent.querySelector('#project-carousel');
            if (carouselElement) {
                const carousel = new bootstrap.Carousel(carouselElement);
                const videoFrame = carouselElement.querySelector('iframe');
                const manageVideo = (slideIndex) => { if (videoFrame) videoFrame.src = slideIndex === 0 ? videoFrame.dataset.src : ''; };
                manageVideo(0);
                carouselElement.addEventListener('slid.bs.carousel', (event) => manageVideo(event.to));
            }
        } catch (error) {
            console.error("Could not load lightbox content:", error);
            lightboxContent.innerHTML = '<p class="text-center text-danger">Désolé, une erreur est survenue lors du chargement du contenu.</p>';
            lightboxContent.classList.remove('fading-in');
        }
    }

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
            e.stopPropagation();
            if (window.innerWidth > 992) openContactPanel();
        });
    }

    window.addEventListener('wheel', (e) => { 
        if (window.innerWidth <= 992) return;
        if (!mainContainer.classList.contains('view-active') && !hasScrolledForContact && e.deltaY > 0) { 
            openContactPanel(); 
            hasScrolledForContact = true; 
        } else if (mainContainer.classList.contains('contact-is-active') && e.deltaY < 0) {
            closeActiveView();
        }
    });

    document.querySelectorAll('.back-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.innerWidth > 992) closeActiveView();
        });
    });

    document.addEventListener('click', (e) => {
        if (mainContainer.classList.contains('contact-is-active') && !contactSection.contains(e.target) && e.target !== contactTrigger && window.innerWidth > 992) {
            closeActiveView();
        }
    });
    
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
            .then(response => { if (!response.ok) throw new Error('La soumission a échoué.'); return response.text(); })
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

    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(link.getAttribute('href'), 'project');
        });
    });

    const featureButtons = document.querySelectorAll('.feature-button');
    const serviceDetailContents = document.querySelectorAll('.service-detail-content');
    function switchServiceContent(serviceType) {
        featureButtons.forEach(fb => fb.classList.remove('active'));
        serviceDetailContents.forEach(sdc => sdc.classList.remove('active'));
        const activeButton = document.querySelector(`[data-service="${serviceType}"]`);
        if (activeButton) activeButton.classList.add('active');
        const targetContent = document.getElementById(`${serviceType}-content`);
        if (targetContent) targetContent.classList.add('active');
        const serviceImage = document.getElementById('service-image');
        if (serviceImage) {
            let imageMap = {
                'evenementiel': 'images/generique/video-event01.jpg',
                'creatif': 'images/generique/video-creatif01.jpg',
                'pedagogique': 'images/generique/video-pedagogique01.jpg',
                'corporatif': 'images/generique/video-corpo01.jpg',
            };
            serviceImage.src = imageMap[serviceType] || 'images/generique/video-bg01.jpg';
        }
    }
    if (featureButtons.length > 0) {
        switchServiceContent(featureButtons[0].dataset.service);
    }
    featureButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            switchServiceContent(this.dataset.service);
        });
    });

    const ctaContactButtons = document.querySelectorAll('.cta-button, .service-buttons .btn[href="#contact-section"]');
    function handleContactButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.innerWidth > 992) {
            closeActiveView();
            setTimeout(() => { openContactPanel(); }, 800);
        } else {
            closeMobileView();
            setTimeout(() => { openMobileView('contact'); }, 600);
        }
    }
    ctaContactButtons.forEach(button => {
        button.addEventListener('click', handleContactButtonClick);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackButton.addEventListener('click', closeLightbox);
    lightboxContainer.addEventListener('click', (e) => { if (e.target === lightboxContainer) closeLightbox(); });
    
    document.addEventListener('keydown', (e) => {
        if (lightboxContainer.classList.contains('is-visible')) {
            if (e.key === 'Escape') closeLightbox();
            return;
        }
        const isViewActive = mainContainer.classList.contains('view-active');
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Escape'].includes(e.key)) e.preventDefault();
        if (!isViewActive) {
            if (e.key === 'ArrowLeft') mainContainer.classList.add('left-is-active', 'view-active');
            else if (e.key === 'ArrowRight') mainContainer.classList.add('right-is-active', 'view-active');
            else if (e.key === 'ArrowDown') openContactPanel();
        } else {
            if (e.key === 'Escape') closeActiveView();
            else if (mainContainer.classList.contains('left-is-active') && e.key === 'ArrowRight') closeActiveView();
            else if (mainContainer.classList.contains('right-is-active') && e.key === 'ArrowLeft') closeActiveView();
            else if (mainContainer.classList.contains('contact-is-active') && e.key === 'ArrowUp') closeActiveView();
        }
    });
    
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    initMobileInteractions();
});

// --- ANIMATION DU PANNEAU DE CRÉDIBILITÉ ---
document.addEventListener('DOMContentLoaded', () => {
    const credibilityPanel = document.getElementById('credibility-panel');
    if (!credibilityPanel) return;
    const animateCountUp = (el) => {
        const target = parseInt(el.dataset.target, 10);
        let startTime = null;
        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / 2000, 1);
            el.textContent = `+${Math.floor(progress * target).toLocaleString('fr-FR')}`;
            if (progress < 1) window.requestAnimationFrame(step);
            else el.textContent = `+${target.toLocaleString('fr-FR')}`;
        };
        window.requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                entry.target.querySelectorAll('.stat-value').forEach(animateCountUp);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    observer.observe(credibilityPanel);
});