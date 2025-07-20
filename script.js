document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
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
    const projectLinks = document.querySelectorAll('.project-link');
    
    let hasScrolledForContact = false;

    // --- NOUVELLES FONCTIONS DE GESTION D'ÉTAT CENTRALISÉES ---
    // Ces fonctions deviennent la seule source de vérité pour ouvrir et fermer les panneaux.

    /**
     * Met à jour l'URL dans la barre d'adresse sans recharger la page.
     * @param {string} hash - Le fragment à ajouter (ex: 'techno', 'contact').
     */
    function updateURL(hash = '') {
        const path = window.location.pathname.split('#')[0];
        const newUrl = hash ? `${path}#${hash}` : path;
        // On utilise replaceState pour éviter de polluer l'historique du navigateur avec chaque ouverture/fermeture
        history.replaceState({path: newUrl}, '', newUrl);
    }

    /**
     * Ouvre un panneau spécifique (techno, video, contact).
     * @param {string} panelName - Le nom du panneau à ouvrir.
     */
    function openPanel(panelName) {
        if (mainContainer.classList.contains('view-active')) return;

        if (window.innerWidth > 992) { // Logique Desktop
            if (panelName === 'contact') {
                mainContainer.classList.add('contact-is-active');
            } else if (panelName === 'techno') {
                mainContainer.classList.add('left-is-active');
                languageSwitcher.classList.add('switcher-hidden');
            } else if (panelName === 'video') {
                mainContainer.classList.add('right-is-active');
                languageSwitcher.classList.add('switcher-hidden');
            }
        } else { // Logique Mobile
            mainContainer.classList.add(`mobile-${panelName}-active`);
        }
        mainContainer.classList.add('view-active');
        updateURL(panelName);
    }

    /**
     * Ferme tous les panneaux actifs. C'est la seule fonction pour fermer.
     */
    function closeAllPanels() {
        if (!mainContainer.classList.contains('view-active')) return;
        
        const classesToRemove = [
            'left-is-active', 'right-is-active', 'contact-is-active', // Desktop
            'mobile-techno-active', 'mobile-video-active', 'mobile-contact-active', // Mobile
            'view-active'
        ];
        mainContainer.classList.remove(...classesToRemove);
        languageSwitcher.classList.remove('switcher-hidden');
        updateURL(); // Efface le fragment de l'URL
        setTimeout(() => { hasScrolledForContact = false; }, 800);
    }


    // --- GESTION DE L'ÉTAT INITIAL AU CHARGEMENT DE LA PAGE ---
    function handleInitialLoadState() {
        const hash = window.location.hash.substring(1);
        if (['techno', 'video', 'contact'].includes(hash)) {
            // On attend un court instant pour s'assurer que le DOM est prêt pour les animations
            setTimeout(() => openPanel(hash), 100);
        }
    }
    handleInitialLoadState();


 // --- LIGHTBOX LOGIC (NOUVELLE VERSION CORRIGÉE) ---

    // Fonction qui ouvre la lightbox et charge le contenu.
    async function openLightbox(url) {
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
            
            // On met à jour l'URL seulement si elle n'est pas déjà correcte.
            if (window.location.pathname !== `/${url}`) {
                history.pushState({ page: url }, '', url);
            }
            
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

    // Fonction qui gère UNIQUEMENT la fermeture visuelle de la lightbox.
    function closeLightboxUI() {
        const videoFrame = lightboxContent.querySelector('iframe');
        if (videoFrame) videoFrame.src = '';
        lightboxContainer.classList.remove('is-visible');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
    }

    // Fonction appelée par les boutons "X" et "Retour" pour initier la fermeture.
    function closeLightbox() {
        // Demande au navigateur de revenir en arrière, ce qui déclenchera le 'popstate'.
        history.back();
    }


    // --- EVENT LISTENERS (RÉVISÉS POUR INTÉGRER LA NOUVELLE LOGIQUE) ---

    // Clics sur les panneaux principaux (desktop)
    function handleSplitClick(e, sideClicked) {
        if (e.target.closest('a:not(.back-arrow)')) return;
        const isViewActive = mainContainer.classList.contains('view-active');
        const isThisPanelActive = mainContainer.classList.contains(sideClicked === 'techno' ? 'left-is-active' : 'right-is-active');

        if (isViewActive && !isThisPanelActive) {
            closeAllPanels();
        } else if (!isViewActive) {
            openPanel(sideClicked);
        }
    }
    splitLeft.addEventListener('click', (e) => handleSplitClick(e, 'techno'));
    splitRight.addEventListener('click', (e) => handleSplitClick(e, 'video'));

    // Clic sur le logo central
    if (contactTrigger) {
        contactTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPanel('contact');
        });
    }
    
    // Scroll pour ouvrir ET fermer le contact (desktop)
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

    // Boutons de retour "X" des panneaux principaux
    document.querySelectorAll('.back-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAllPanels();
        });
    });

    // Clics sur les liens du footer
    document.querySelectorAll('.footer-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            closeAllPanels();
            setTimeout(() => { openPanel(targetId); }, 500);
        });
    });

    // Liens de projet pour ouvrir la lightbox
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(link.getAttribute('href'));
        });
    });

     // Écouteurs pour la fermeture de la lightbox
    lightboxClose.addEventListener('click', closeLightbox); // Pour desktop
    
    // CORRECTION POUR MOBILE
    lightboxBackButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Sur mobile, on ferme simplement l'UI sans toucher à l'historique,
        // car l'historique gère les panneaux principaux.
        if (window.innerWidth <= 992) {
            closeLightboxUI();
            // On s'assure que l'URL revient au fragment du panneau actif (#techno ou #video)
            const currentHash = window.location.hash;
            history.replaceState({ page: 'index' }, '', `${window.location.pathname.split('/').slice(0, -1).join('/')}/${currentHash}`);
        } else {
            // Comportement normal pour desktop
            closeLightbox();
        }
    });

    lightboxContainer.addEventListener('click', (e) => {
        if (e.target === lightboxContainer) {
            e.stopPropagation();
            closeLightbox();
        }
    });

    // Écouteur central pour l'historique du navigateur (gère le bouton Précédent/Suivant)
    window.addEventListener('popstate', (e) => {
        const hash = window.location.hash.substring(1);
        const isProjectPage = window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('/index.html');
        const isLightboxVisible = lightboxContainer.classList.contains('is-visible');

        if (isLightboxVisible && !isProjectPage) {
            // Cas : on était dans une lightbox et on a cliqué "précédent". L'URL est maintenant /#techno ou /#video.
            // On ferme la lightbox visuellement.
            closeLightboxUI();
        } else if (!isLightboxVisible && isProjectPage) {
            // Cas : on était sur /#video, on a cliqué "suivant" et l'URL est devenue /projet.html.
            // On doit ouvrir la lightbox correspondante.
            openLightbox(window.location.pathname);
        } else if (hash && ['techno', 'video', 'contact'].includes(hash) && !mainContainer.classList.contains('view-active')) {
            // Gère la navigation entre les panneaux via les boutons du navigateur.
            openPanel(hash);
        } else if (!hash && mainContainer.classList.contains('view-active')) {
            // Gère le retour à l'accueil depuis un panneau.
            closeAllPanels();
        }
    });
   // --- FORMULAIRE DE CONTACT ---
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const makeWebhookURL = 'https://hook.eu2.make.com/ru5fqndn94js8yp99ga8583u6arslogm';
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.btn-text');
        const spinner = submitButton.querySelector('.spinner-border');
        const successMessage = document.getElementById('success-message');

        // Début de l'envoi
        buttonText.textContent = 'Envoi en cours...';
        spinner.classList.remove('d-none');
        submitButton.disabled = true;

        fetch(makeWebhookURL, { method: 'POST', body: formData })
        .then(response => {
            if (!response.ok) {
                throw new Error('La soumission a échoué.');
            }
            return response.text();
        })
        .then(data => {
            // Succès
            contactForm.classList.add('d-none');
            successMessage.classList.remove('d-none');
            contactForm.reset();
        })
        .catch(error => {
            // Erreur
            console.error('Erreur:', error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        })
        .finally(() => {
            // Quoi qu'il arrive, on réinitialise le bouton
            buttonText.textContent = 'Envoyer'; // Ou récupérer via data-key si multilingue
            spinner.classList.add('d-none');
            submitButton.disabled = false;
        });
    });
}

    // Liens de projet pour la lightbox
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(link.getAttribute('href'));
        });
    });

    
// --- LOGIQUE D'INTERACTION DYNAMIQUE (Services Vidéo) ---
const featureButtons = document.querySelectorAll('.feature-button');
if (featureButtons.length > 0) {
    const serviceDetailContents = document.querySelectorAll('.service-detail-content');
    const serviceImage = document.getElementById('service-image');
    
    function switchServiceContent(serviceType) {
        // Cache tout
        featureButtons.forEach(fb => fb.classList.remove('active'));
        serviceDetailContents.forEach(sdc => sdc.classList.remove('active'));
        
        // Affiche la cible
        const activeButton = document.querySelector(`.feature-button[data-service="${serviceType}"]`);
        if (activeButton) activeButton.classList.add('active');
        
        const targetContent = document.getElementById(`${serviceType}-content`);
        if (targetContent) targetContent.classList.add('active');
        
        // Met à jour l'image
        if (serviceImage) {
            const imageMap = {
                'evenementiel': 'images/generique/video-event01.jpg',
                'creatif': 'images/generique/video-creatif01.jpg',
                'pedagogique': 'images/generique/video-pedagogique01.jpg',
                'corporatif': 'images/generique/video-corpo01.jpg',
            };
            serviceImage.src = imageMap[serviceType] || 'images/generique/video-bg01.jpg';
        }
    }
    
    featureButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            switchServiceContent(this.dataset.service);
        });
    });

    // Initialise avec le premier bouton comme actif par défaut
    if (featureButtons[0] && featureButtons[0].dataset.service) {
        switchServiceContent(featureButtons[0].dataset.service);
    }
}

// --- GESTION DES BOUTONS CTA (Call To Action) ---
document.querySelectorAll('.cta-button, .service-buttons .btn[href="#contact-section"]').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        closeAllPanels(); // Ferme le panneau actuel
        
        // Ouvre le panneau de contact après la transition
        setTimeout(() => {
            openPanel('contact');
        }, 500); 
    });
});

    // CORRIGÉ : Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (lightboxContainer.classList.contains('is-visible')) {
            if (e.key === 'Escape') closeLightbox();
            return;
        }

        const isViewActive = mainContainer.classList.contains('view-active');

        if (!isViewActive) {
            if (e.key === 'ArrowLeft') openPanel('techno');
            else if (e.key === 'ArrowRight') openPanel('video');
            else if (e.key === 'ArrowDown') openPanel('contact');
        } else {
            // Logique de fermeture
            if (e.key === 'Escape' ||
                (mainContainer.classList.contains('left-is-active') && e.key === 'ArrowRight') ||
                (mainContainer.classList.contains('right-is-active') && e.key === 'ArrowLeft') ||
                (mainContainer.classList.contains('contact-is-active') && e.key === 'ArrowUp')) {
                closeAllPanels();
            }
        }
    });

 // --- LOGIQUE MOBILE (VERSION FINALE CORRIGÉE ET FIABILISÉE) ---
    function initMobileInteractions() {
        if (window.innerWidth > 992) return;
        document.body.style.overflow = 'hidden';

        // --- GESTION DES CLICS/TAPS ---
        // On utilise des écouteurs 'click' dédiés, c'est beaucoup plus fiable.
        splitLeft.addEventListener('click', (e) => {
            // On s'assure que le panneau n'est pas déjà actif pour éviter de le rouvrir
            if (!mainContainer.classList.contains('view-active')) {
                openPanel('techno');
            }
        });

        splitRight.addEventListener('click', (e) => {
            if (!mainContainer.classList.contains('view-active')) {
                openPanel('video');
            }
        });

        // Le listener pour contactTrigger reste séparé et fonctionne déjà bien.

        // --- GESTION DES SWIPES D'OUVERTURE ---
        let touchStartX = 0, touchStartY = 0;
        const swipeThreshold = 50;

        mainContainer.addEventListener('touchstart', e => {
            if (mainContainer.classList.contains('view-active')) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        mainContainer.addEventListener('touchend', e => {
            if (mainContainer.classList.contains('view-active')) return;
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Cet écouteur ne traite QUE les swipes. Les clics sont ignorés ici.
            if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
                return; // Ce n'est pas un swipe, on ne fait rien.
            }

            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
                if (deltaY < -swipeThreshold) openPanel('contact');
            } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < -swipeThreshold) openPanel('video');
                else if (deltaX > swipeThreshold) openPanel('techno');
            }
        });

        // --- GESTION DES SWIPES DE FERMETURE ---
        function addSwipeBackListener(element, direction) {
            if (!element) return;
            let startX = 0, startY = 0;
            element.addEventListener('touchstart', e => {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            element.addEventListener('touchend', e => {
                const endX = e.changedTouches[0].screenX;
                const endY = e.changedTouches[0].screenY;
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                let swipeHandled = false;

                if (direction === 'left' && deltaX < -swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                    closeAllPanels();
                    swipeHandled = true;
                } else if (direction === 'right' && deltaX > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                    closeAllPanels();
                    swipeHandled = true;
                } else if (direction === 'down' && deltaY > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX) && element.scrollTop === 0) {
                    closeAllPanels();
                    swipeHandled = true;
                }

                if (swipeHandled) {
                    e.stopPropagation();
                }
            });
        }
        
        addSwipeBackListener(document.querySelector('#techno .portfolio-content'), 'left');
        addSwipeBackListener(document.querySelector('#video .portfolio-content'), 'right');
        addSwipeBackListener(contactSection, 'down');
    }
    initMobileInteractions();

    // --- UTILS ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

// --- ANIMATION DU PANNEAU DE CRÉDIBILITÉ ---
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
}