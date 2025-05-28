/**
 * Utilitaires pour Firebase et Firestore
 */

/**
 * Nettoie un objet Firestore pour le rendre sûr pour le rendu React
 * Résout l'erreur "Objects are not valid as a React child" avec les objets Firestore
 * 
 * @param {any} data - Données à nettoyer (peut être un objet, tableau ou valeur primitive)
 * @returns {any} Données nettoyées sans références Firestore
 */
export const sanitizeFirestoreData = (data) => {
  if (!data) return null;
  
  // Si c'est un tableau, on nettoie chaque élément
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  }
  
  // Si c'est un objet avec des propriétés Firestore spécifiques
  if (typeof data === 'object') {
    // Vérifier si c'est un objet qui ne devrait pas être rendu directement
    if (data.converter || data._key || data.type === 'document' || data.firestore) {
      console.warn('Objet Firestore détecté et sécurisé avant rendu:', data);
      return '[Objet Document Firestore]'; // Remplacer par une valeur sécurisée
    }
    
    // Nettoyer récursivement chaque propriété de l'objet
    const cleanedObject = {};
    Object.keys(data).forEach(key => {
      // Ignorer les propriétés qui commencent par '_' (internes à Firebase)
      if (!key.startsWith('_')) {
        cleanedObject[key] = sanitizeFirestoreData(data[key]);
      }
    });
    return cleanedObject;
  }
  
  // Pour les valeurs primitives, on les retourne telles quelles
  return data;
};

/**
 * Formate une date Firebase Timestamp en chaîne locale
 * 
 * @param {Object} timestamp - Timestamp Firebase (avec seconds)
 * @param {Object} options - Options de formatage
 * @param {boolean} options.withTime - Inclure l'heure dans le format
 * @param {string} options.locale - Code de la locale (par défaut: 'fr-FR')
 * @returns {string} Date formatée ou 'N/A'
 */
export const formatFirebaseDate = (timestamp, options = {}) => {
  if (!timestamp) return 'N/A';
  
  const { withTime = false, locale = 'fr-FR' } = options;
  
  try {
    let date;
    
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      // Pour les timestamps Firebase
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      // Pour les objets Date
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // Pour les chaînes de date
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      // Pour les timestamps Unix en millisecondes
      date = new Date(timestamp);
    } else {
      return 'Format inconnu';
    }
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Date invalide:', timestamp);
      return 'Date invalide';
    }
    
    // Options de formatage pour Intl.DateTimeFormat
    const dateOptions = withTime 
      ? { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      : { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        };
    
    return new Intl.DateTimeFormat(locale, dateOptions).format(date);
  } catch (error) {
    console.error('Erreur de formatage de date:', error, timestamp);
    return 'N/A';
  }
};

/**
 * Calcule l'âge à partir d'une date de naissance
 * 
 * @param {Object|string} dateDeNaissance - Date de naissance (Timestamp Firebase ou chaîne)
 * @returns {number|null} Âge calculé ou null
 */
export const calculateAge = (dateDeNaissance) => {
  if (!dateDeNaissance) return null;
  
  try {
    let birthDate;
    if (typeof dateDeNaissance === 'object' && 'seconds' in dateDeNaissance) {
      // Si c'est un timestamp Firebase
      birthDate = new Date(dateDeNaissance.seconds * 1000);
    } else if (typeof dateDeNaissance === 'string') {
      // Si c'est une chaîne de date
      birthDate = new Date(dateDeNaissance);
    } else if (dateDeNaissance instanceof Date) {
      // Si c'est déjà un objet Date
      birthDate = dateDeNaissance;
    } else {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Erreur de calcul d\'âge:', error);
    return null;
  }
}; 