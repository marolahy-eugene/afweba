import { createContext, useContext } from 'react';

// Création du contexte de langue
export const LanguageContext = createContext();

/**
 * Version simplifiée du fournisseur de contexte de langue
 * Cette version ne charge pas de fichiers de traduction dynamiquement
 * et retourne directement la clé passée pour améliorer la stabilité
 */
export const LanguageProvider = ({ children }) => {
  /**
   * Fonction simplifiée qui retourne simplement la clé passée
   * @param {string} key - Clé de traduction
   * @returns {string} - La même clé (pas de traduction)
   */
  const t = (key) => {
    // Si la clé est une chaîne vide ou null/undefined, retourner une chaîne vide
    if (!key) return '';
    
    // Pour les clés de navigation, retourner des valeurs statiques en français
    // Cela évite d'avoir à charger des fichiers de traduction
    const staticTranslations = {
      'navigation.dashboard': 'Tableau de bord',
      'navigation.patients': 'Patients',
      'navigation.examens': 'Examens',
      'navigation.users': 'Utilisateurs',
      'navigation.services': 'Prestations',
      'navigation.analyses': 'Analyses',
      'navigation.settings': 'Paramètres',
      'navigation.help': 'Aide',
      'auth.logout': 'Déconnexion',
      'messages.confirm.logout': 'Êtes-vous sûr de vouloir vous déconnecter ?',
      'messages.error.logout': 'Erreur lors de la déconnexion',
      'patients.new': 'Nouveau patient',
      'patients.list': 'Liste des patients',
      'examens.list': 'Liste des examens',
      'users.new': 'Nouvel utilisateur',
      'users.list': 'Liste des utilisateurs',
      'users.profile': 'Profil',
      'services.hospitalizations': 'Hospitalisations',
      'services.eeg': 'EEG',
      'services.consultations': 'Consultations',
      'services.covid': 'Covid',
      'services.surveys': 'Enquêtes',
      'analyses.list': 'Liste des analyses',
      'settings.theme': 'Thème',
      'settings.platform': 'Plateforme'
    };
    
    // Si la clé existe dans notre dictionnaire statique, retourner la valeur correspondante
    if (staticTranslations[key]) {
      return staticTranslations[key];
    }
    
    // Sinon, retourner la clé elle-même (comportement par défaut)
    return key;
  };

  // Valeur simplifiée du contexte
  const contextValue = {
    currentLanguage: 'fr', // Langue fixée à français
    changeLanguage: () => {}, // Fonction vide qui ne fait rien
    t, // Fonction de traduction simplifiée
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte de langue
 * @returns {Object} - Contexte de langue
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};