// translation.js

// Objet pour stocker les traductions chargées
let currentTranslations = {};

// Fonction pour appliquer les traductions au DOM
function applyTranslations(translations) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.dataset.key;
        if (translations[key]) {
            // Gère les différents types d'éléments
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = translations[key];
                }
            } else if (element.tagName === 'IMG') {
                if (element.alt) {
                    element.alt = translations[key];
                }
            } else {
                // Utilise innerHTML pour interpréter les balises comme <strong>
                element.innerHTML = translations[key];
            }
        }
    });

    // Met à jour le titre de la page
    if (translations.doc_title) {
        document.title = translations.doc_title;
    }
}

// Fonction pour charger et définir la langue
async function setLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) {
            console.error(`Could not load translation file for language: ${lang}`);
            return;
        }
        currentTranslations = await response.json();
        
        applyTranslations(currentTranslations);

        // Mettre à jour l'attribut lang de la balise <html> pour l'accessibilité
        document.documentElement.lang = lang;

        // Mémoriser la langue
        localStorage.setItem('language', lang);

        // Mettre à jour l'interface du sélecteur de langue
        updateLanguageSwitcherUI(lang);

    } catch (error) {
        console.error('Error setting language:', error);
    }
}

// Fonction pour mettre à jour le style du sélecteur de langue
function updateLanguageSwitcherUI(currentLang) {
    const btnFr = document.getElementById('btn-fr');
    const btnEn = document.getElementById('btn-en');
    
    if (currentLang === 'fr') {
        btnFr.style.fontWeight = 'bold';
        btnFr.style.color = '#343a40';
        btnEn.style.fontWeight = 'normal';
        btnEn.style.color = '#6c757d';
    } else {
        btnEn.style.fontWeight = 'bold';
        btnEn.style.color = '#343a40';
        btnFr.style.fontWeight = 'normal';
        btnFr.style.color = '#6c757d';
    }
}


// Fonction globale pour traduire du contenu dynamique (comme la lightbox)
// Elle sera appelée depuis script.js
function translateDynamicContent(element) {
    if (!element) return;
    element.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (currentTranslations[key]) {
            el.innerHTML = currentTranslations[key];
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Détecter la langue (LocalStorage > Navigateur > 'fr' par défaut)
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang || (['fr', 'en'].includes(browserLang) ? browserLang : 'fr');
    
    // Définir la langue au chargement
    setLanguage(initialLang);

    // Ajouter les écouteurs d'événements aux boutons
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
/**
 * NOUVELLE FONCTION applyTranslations (plus puissante)
 * Applique les traductions au DOM, en gérant le contenu ET les attributs.
 */
function applyTranslations(translations) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.dataset.key;
        const translation = translations[key];

        if (translation !== undefined) {
            // Récupère l'attribut à modifier, par défaut 'innerHTML'
            const attribute = element.dataset.attr || 'innerHTML';

            switch (attribute) {
                case 'innerHTML':
                    element.innerHTML = translation;
                    break;
                case 'placeholder':
                    element.placeholder = translation;
                    break;
                case 'alt':
                    element.alt = translation;
                    break;
                case 'title':
                    element.title = translation;
                    break;
                // Cas générique pour tous les autres attributs (aria-label, etc.)
                default:
                    element.setAttribute(attribute, translation);
                    break;
            }
        }
    });

    // Met à jour le titre de la page
    if (translations.doc_title) {
        document.title = translations.doc_title;
    }
}