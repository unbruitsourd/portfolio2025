// translation.js

// Objet pour stocker les traductions chargées
let currentTranslations = {};

/**
 * Applique les traductions au DOM, en gérant le contenu ET les attributs.
 * @param {object} translations - L'objet JSON de la langue active.
 */
function applyTranslations(translations) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.dataset.key;
        const translation = translations[key];

        if (translation !== undefined) {
            const attribute = element.dataset.attr || 'innerHTML';
            switch (attribute) {
                case 'innerHTML': element.innerHTML = translation; break;
                case 'placeholder': element.placeholder = translation; break;
                case 'alt': element.alt = translation; break;
                case 'title': element.setAttribute('title', translation); break;
                default: element.setAttribute(attribute, translation); break;
            }
        }
    });

    const titleElement = document.querySelector('title[data-key]');
    if (titleElement && translations[titleElement.dataset.key]) {
        document.title = translations[titleElement.dataset.key];
    }
}

/**
 * Charge un fichier de langue, l'applique et met à jour l'état de l'interface.
 * @param {string} lang - Le code de la langue à charger ('fr' ou 'en').
 */
async function setLanguage(lang) {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) {
            console.error(`Could not load translation file for language: ${lang}`);
            return;
        }
        currentTranslations = await response.json();
        
        applyTranslations(currentTranslations);
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
        updateLanguageSwitcherUI(lang);

    } catch (error) {
        console.error('Error setting language:', error);
    }
}

/**
 * Met à jour le style (gras/normal) du sélecteur de langue.
 * @param {string} currentLang - La langue actuellement active.
 */
function updateLanguageSwitcherUI(currentLang) {
    const btnFr = document.getElementById('btn-fr');
    const btnEn = document.getElementById('btn-en');
    
    if (!btnFr || !btnEn) return;

    btnFr.style.fontWeight = (currentLang === 'fr') ? 'bold' : 'normal';
    btnEn.style.fontWeight = (currentLang === 'en') ? 'bold' : 'normal';
}

/**
 * Traduit du contenu qui a été ajouté dynamiquement à la page (ex: lightbox).
 * @param {HTMLElement} element - L'élément conteneur du nouveau contenu.
 */
function translateDynamicContent(element) {
    if (!element || Object.keys(currentTranslations).length === 0) return;
    
    element.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        const translation = currentTranslations[key];
        if (translation) {
            const attribute = el.dataset.attr || 'innerHTML';
            if (attribute === 'innerHTML') {
                el.innerHTML = translation;
            } else {
                el.setAttribute(attribute, translation);
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // --- DÉTECTION DE LA LANGUE AMÉLIORÉE ---
    const savedLang = localStorage.getItem('language');
    // On lit la langue "native" de la page directement depuis la balise <html lang="...">
    const pageLang = document.documentElement.lang || 'fr'; 

    // Priorité 1: Langue sauvegardée par l'utilisateur lors d'une visite précédente.
    // Priorité 2: Langue de la page HTML actuelle.
    // Le navigateur n'est plus utilisé pour le chargement initial.
    const initialLang = savedLang || pageLang;
    
    // Définir la langue au chargement de la page.
    setLanguage(initialLang);

    // Ajouter les écouteurs d'événements aux boutons de langue.
    const btnFr = document.getElementById('btn-fr');
    const btnEn = document.getElementById('btn-en');

    if (btnFr) {
        btnFr.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('fr');
        });
    }

    if (btnEn) {
        btnEn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage('en');
        });
    }
});