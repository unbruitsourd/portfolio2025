document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const mainContainer = document.getElementById('main-container');
    const languageSwitcher = document.getElementById('language-switcher');
    const splitLeft = document.getElementById('techno');
    const splitRight = document.getElementById('video');
    const contactTrigger = document.getElementById('contact-trigger');
    const contactSection = document.getElementById('contact-section');
    const contactForm = document.getElementById('contact-form');
    const lightboxContainer = document.getElementById('lightbox-container');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxBackButton = document.getElementById('lightbox-back-button');

    // Variables d'état
    let hasScrolledForContact = false;
    let lastPanelUrlBeforeLightbox = window.location.href;

    // Fonctions de gestion des panneaux

    function updateURL(hash = '') {
        const path = window.location.pathname;
        const newUrl = hash ? `${path}#${hash}` : path;
        history.replaceState({ path: newUrl }, '', newUrl);
    }

    function openPanel(panelName) {
        if (mainContainer.classList.contains('view-active')) return;
        const isDesktop = window.innerWidth > 992;
        if (isDesktop) {
            if (panelName === 'contact') {
                mainContainer.classList.add('contact-is-active');
            } else {
                mainContainer.classList.add(panelName === 'techno' ? 'left-is-active' : 'right-is-active');
                languageSwitcher.classList.add('switcher-hidden');
            }
        } else {
            mainContainer.classList.add(`mobile-${panelName}-active`);
        }
        mainContainer.classList.add('view-active');
        updateURL(panelName);
    }

    function closeAllPanels() {
        if (!mainContainer.classList.contains('view-active')) return;
        const classesToRemove = [
            'left-is-active', 'right-is-active', 'contact-is-active',
            'mobile-techno-active', 'mobile-video-active', 'mobile-contact-active',
            'view-active'
        ];
        mainContainer.classList.remove(...classesToRemove);
        languageSwitcher.classList.remove('switcher-hidden');
        updateURL();
        setTimeout(() => { hasScrolledForContact = false; }, 800);
    }

    // Fonctions de gestion de la lightbox

    async function openLightbox(url) {
        lightboxContainer.classList.add('is-visible');
        document.body.classList.add('lightbox-open');
        lightboxContent.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erreur HTTP! statut: ${response.status}`);
            const html = await response.text();
            lastPanelUrlBeforeLightbox = window.location.href;
            history.pushState({ page: url }, '', url);
            lightboxContent.innerHTML = html;
            if (typeof translateDynamicContent === 'function') {
                translateDynamicContent(lightboxContent);
            }
            const carouselElement = lightboxContent.querySelector('#project-carousel');
            if (carouselElement) {
                const carousel = new bootstrap.Carousel(carouselElement);
                const videoFrame = carouselElement.querySelector('iframe');
                const manageVideo = (slideIndex) => {
                    if (videoFrame) videoFrame.src = slideIndex === 0 ? videoFrame.dataset.src : '';
                };
                manageVideo(0);
                carouselElement.addEventListener('slid.bs.carousel', (event) => manageVideo(event.to));
            }
        } catch (error) {
            console.error("Impossible de charger le contenu de la lightbox :", error);
            lightboxContent.innerHTML = '<p class="text-center text-danger">Désolé, une erreur est survenue lors du chargement du contenu.</p>';
        }
    }

    function closeLightboxAndRestoreURL() {
        const videoFrame = lightboxContent.querySelector('iframe');
        if (videoFrame) videoFrame.src = '';
        lightboxContainer.classList.remove('is-visible');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
        history.replaceState({}, '', lastPanelUrlBeforeLightbox);
    }

    function closeLightboxUI() {
        const videoFrame = lightboxContent.querySelector('iframe');
        if (videoFrame) videoFrame.src = '';
        lightboxContainer.classList.remove('is-visible');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
    }

    // Gestion du chargement initial de la page

    function handleInitialLoadState() {
        const path = window.location.pathname;
        const hash = window.location.hash.substring(1);
        if (path.endsWith('.html') && !path.endsWith('index.html')) {
            lastPanelUrlBeforeLightbox = window.location.origin + '/index.html';
            openLightbox(path);
        } else if (['techno', 'video', 'contact'].includes(hash)) {
            setTimeout(() => openPanel(hash), 100);
        }
    }
    handleInitialLoadState();

    // Écouteurs d'événements

    document.body.addEventListener('click', function(e) {
        const projectLink = e.target.closest('.project-link');
        if (projectLink) {
            e.preventDefault();
            openLightbox(projectLink.getAttribute('href'));
        }
    });

    function handleSplitClick(e, sideClicked) {
        // Empêche l'ouverture du panneau si on clique sur un élément de contenu à l'intérieur.
        if (e.target.closest('.portfolio-content')) return;

        const isViewActive = mainContainer.classList.contains('view-active');
        const isThisPanelActive = mainContainer.classList.contains(sideClicked === 'techno' ? 'left-is-active' : 'right-is-active');
        if (isViewActive && !isThisPanelActive) closeAllPanels();
        else if (!isViewActive) openPanel(sideClicked);
    }
    splitLeft.addEventListener('click', (e) => handleSplitClick(e, 'techno'));
    splitRight.addEventListener('click', (e) => handleSplitClick(e, 'video'));

    if (contactTrigger) {
        contactTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPanel('contact');
        });
    }

    document.querySelectorAll('.back-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAllPanels();
        });
    });

    lightboxClose.addEventListener('click', (e) => { e.preventDefault(); closeLightboxAndRestoreURL(); });
    lightboxBackButton.addEventListener('click', (e) => { e.preventDefault(); closeLightboxAndRestoreURL(); });
    lightboxContainer.addEventListener('click', (e) => { if (e.target === lightboxContainer) closeLightboxAndRestoreURL(); });

    // Gestionnaire des boutons d'appel à l'action (CTA)
    document.querySelectorAll('.cta-button, .service-buttons .btn[href="#contact-section"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAllPanels();
            setTimeout(() => { openPanel('contact'); }, 500); 
        });
    });

    // Raccourcis clavier, défilement et historique du navigateur

    //
    document.addEventListener('keydown', (e) => {
        if (lightboxContainer.classList.contains('is-visible')) {
            if (e.key === 'Escape') closeLightboxAndRestoreURL();
            return;
        }
        const isViewActive = mainContainer.classList.contains('view-active');
        if (!isViewActive) {
            if (e.key === 'ArrowLeft') openPanel('techno');
            else if (e.key === 'ArrowRight') openPanel('video');
            else if (e.key === 'ArrowDown') openPanel('contact');
        } else {
            if (e.key === 'Escape' ||
                (mainContainer.classList.contains('left-is-active') && e.key === 'ArrowRight') ||
                (mainContainer.classList.contains('right-is-active') && e.key === 'ArrowLeft') ||
                (mainContainer.classList.contains('contact-is-active') && e.key === 'ArrowUp')) {
                closeAllPanels();
            }
        }
    });

    // Défilement pour la section de contact sur les ordinateurs de bureau
    window.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 992) return;
        if (!mainContainer.classList.contains('view-active') && !hasScrolledForContact && e.deltaY > 0) {
            openPanel('contact');
            hasScrolledForContact = true;
        } else if (mainContainer.classList.contains('contact-is-active') && e.deltaY < 0 && contactSection.scrollTop === 0) {
            e.preventDefault();
            closeAllPanels();
        }
    });
    
    window.addEventListener('popstate', (e) => {
        const isProjectPage = window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('index.html');
        const isLightboxVisible = lightboxContainer.classList.contains('is-visible');
        if (isLightboxVisible && !isProjectPage) {
            closeLightboxUI();
        } else if (!isLightboxVisible && isProjectPage) {
            openLightbox(window.location.pathname);
        } else {
            const hash = window.location.hash.substring(1);
            closeAllPanels();
            if (['techno', 'video', 'contact'].includes(hash)) {
                openPanel(hash);
            }
        }
    });

    // Interactions avec les formulaires et composants

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
                contactForm.classList.add('d-none');
                successMessage.classList.remove('d-none');
                contactForm.reset();
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert("Une erreur est survenue. Veuillez réessayer.");
            })
            .finally(() => {
                buttonText.textContent = 'Envoyer';
                spinner.classList.add('d-none');
                submitButton.disabled = false;
            });
        });
    }
    
    // Gestionnaire des boutons de fonctionnalité des services
    const featureButtons = document.querySelectorAll('.feature-button');
    if (featureButtons.length > 0) {
        const serviceDetailContents = document.querySelectorAll('.service-detail-content');
        const serviceImage = document.getElementById('service-image');
        featureButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const serviceType = this.dataset.service;
                featureButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                serviceDetailContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${serviceType}-content`).classList.add('active');
                if (serviceImage) {
                    const imageMap = {
                        'evenementiel': 'images/generique/video-event01.jpg',
                        'creatif': 'images/generique/video-creatif01.jpg',
                        'pedagogique': 'images/generique/video-pedagogique01.jpg',
                        'corporatif': 'images/generique/video-corpo01.jpg',
                    };
                    serviceImage.src = imageMap[serviceType];
                }
            });
        });
        if (featureButtons[0]) featureButtons[0].click();
    }
    
    // Animation de comptage pour le panneau de crédibilité
    const credibilityPanel = document.getElementById('credibility-panel');
    if (credibilityPanel) {
        const animateCountUp = (el) => {
            const target = parseInt(el.dataset.target, 10);
            let startTime = null;
            const step = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / 2000, 1);
                el.textContent = `+${Math.floor(progress * target).toLocaleString('fr-FR')}`;
                if (progress < 1) window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        };
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.querySelectorAll('.stat-value[data-target]').forEach(animateCountUp);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        observer.observe(credibilityPanel);
    }
    
    // Interactions mobiles et tactiles
    function initMobileInteractions() {
        if (window.innerWidth > 992) return;
        document.body.style.overflow = 'hidden';

        let touchStartX = 0, touchStartY = 0;
        const swipeThreshold = 50;
        mainContainer.addEventListener('touchstart', e => {
            if (mainContainer.classList.contains('view-active')) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        mainContainer.addEventListener('touchend', e => {
            if (mainContainer.classList.contains('view-active')) return;
            const deltaX = e.changedTouches[0].screenX - touchStartX;
            const deltaY = e.changedTouches[0].screenY - touchStartY;
            if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) return;
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
                if (deltaY < -swipeThreshold) openPanel('contact');
            } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < -swipeThreshold) openPanel('video');
                else if (deltaX > swipeThreshold) openPanel('techno');
            }
        });

        function addSwipeBackListener(element, direction) {
            if (!element) return;
            let startX = 0, startY = 0;
            element.addEventListener('touchstart', e => {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });
            element.addEventListener('touchend', e => {
                const deltaX = e.changedTouches[0].screenX - startX;
                const deltaY = e.changedTouches[0].screenY - startY;
                if ((direction === 'left' && deltaX < -swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) ||
                    (direction === 'right' && deltaX > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) ||
                    (direction === 'down' && deltaY > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX) && element.scrollTop === 0)) {
                    closeAllPanels();
                    e.stopPropagation();
                }
            });
        }
        addSwipeBackListener(document.querySelector('#techno .portfolio-content'), 'left');
        addSwipeBackListener(document.querySelector('#video .portfolio-content'), 'right');
        addSwipeBackListener(contactSection, 'down');
    }
    initMobileInteractions();

    // Fonctions utilitaires
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});