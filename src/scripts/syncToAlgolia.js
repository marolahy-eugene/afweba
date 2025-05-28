// Script pour synchroniser les données Firebase avec Algolia
const { firestore: db } = require('../config/firebase');
const { algoliaAdminClient, INDICES } = require('../config/algolia');
const { collection, getDocs } = require('firebase/firestore');

/**
 * Formate une date Firebase en chaîne ISO
 * @param {Object} timestamp - Timestamp Firebase
 * @returns {string} Date formatée
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  return timestamp;
};

/**
 * Synchronise les patients de Firebase vers Algolia
 * @returns {Promise<Object>} Résultat de la synchronisation
 */
const syncPatientsToAlgolia = async () => {
  try {
    console.log('Démarrage de la synchronisation des patients vers Algolia...');
    
    // Vérifier que db est défini avant utilisation
    if (!db) {
      console.error("La base de données Firebase n'est pas initialisée");
      throw new Error("La base de données Firebase n'est pas initialisée");
    }
    
    // Récupérer les données depuis Firebase - utiliser 'patient' (au singulier)
    console.log("Tentative d'accès à la collection 'patients'");
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    if (snapshot.empty) {
      console.log('Aucun patient trouvé dans Firebase');
      return { success: true, message: 'Aucun patient à synchroniser', count: 0 };
    }
    
    console.log(`${snapshot.docs.length} patients trouvés dans Firebase`);
    
    // Préparer les données pour Algolia
    const records = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Formater les données pour Algolia
      return {
        objectID: doc.id,
        id: doc.id,
        nom: data.nom || '',
        prenom: data.prenom || '',
        dateDeNaissance: formatTimestamp(data.dateDeNaissance),
        genre: data.genre || '',
        profession: data.profession || '',
        domicile: data.domicile || '',
        // Ajouter d'autres champs pertinents ici
        _tags: ['patients'],
        _updated: new Date().getTime()
      };
    });
    
    // Envoyer les données à Algolia
    const index = algoliaAdminClient.initIndex(INDICES.PATIENTS);
    
    // Configurer les paramètres de recherche
    await index.setSettings({
      searchableAttributes: [
        'nom',
        'prenom',
        'profession',
        'domicile'
      ],
      attributesForFaceting: [
        'genre',
        'profession',
        '_tags'
      ],
      customRanking: ['desc(_updated)']
    });
    
    // Sauvegarder les objets dans l'index
    const result = await index.saveObjects(records);
    
    console.log(`${records.length} patients synchronisés avec succès vers Algolia`);
    return {
      success: true,
      message: `${records.length} patients synchronisés avec succès`,
      count: records.length,
      objectIDs: result.objectIDs
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des patients vers Algolia:', error);
    throw new Error(`Échec de la synchronisation des patients: ${error.message}`);
  }
};

/**
 * Synchronise les analyses de Firebase vers Algolia
 * @returns {Promise<Object>} Résultat de la synchronisation
 */
const syncAnalysesToAlgolia = async () => {
  try {
    console.log('Démarrage de la synchronisation des analyses vers Algolia...');
    
    // Récupérer les données depuis Firebase
    const analysesRef = collection(db, 'analyses');
    const snapshot = await getDocs(analysesRef);
    
    if (snapshot.empty) {
      console.log('Aucune analyse trouvée dans Firebase');
      return { success: true, message: 'Aucune analyse à synchroniser', count: 0 };
    }
    
    // Préparer les données pour Algolia
    const records = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Formater les données pour Algolia
      return {
        objectID: doc.id,
        id: doc.id,
        id_patient: data.id_patient || '',
        type_analyse: data.type_analyse || '',
        date_analyse: formatTimestamp(data.date_analyse),
        status: data.status || 'en_attente',
        resultat: data.resultat || '',
        commentaire: data.commentaire || '',
        // Ajouter d'autres champs pertinents ici
        _tags: ['analyse'],
        _updated: new Date().getTime()
      };
    });
    
    // Envoyer les données à Algolia
    const index = algoliaAdminClient.initIndex(INDICES.ANALYSES);
    
    // Configurer les paramètres de recherche
    await index.setSettings({
      searchableAttributes: [
        'id_patient',
        'type_analyse',
        'commentaire',
        'resultat'
      ],
      attributesForFaceting: [
        'type_analyse',
        'status',
        '_tags'
      ],
      customRanking: ['desc(date_analyse)', 'desc(_updated)']
    });
    
    // Sauvegarder les objets dans l'index
    const result = await index.saveObjects(records);
    
    console.log(`${records.length} analyses synchronisées avec succès vers Algolia`);
    return {
      success: true,
      message: `${records.length} analyses synchronisées avec succès`,
      count: records.length,
      objectIDs: result.objectIDs
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des analyses vers Algolia:', error);
    throw new Error(`Échec de la synchronisation des analyses: ${error.message}`);
  }
};

/**
 * Synchronise toutes les données de Firebase vers Algolia
 * @returns {Promise<Object>} Résultat de la synchronisation
 */
const syncAllToAlgolia = async () => {
  try {
    console.log('Démarrage de la synchronisation complète vers Algolia...');
    
    const patientsResult = await syncPatientsToAlgolia();
    const analysesResult = await syncAnalysesToAlgolia();
    
    return {
      success: true,
      message: 'Synchronisation complète terminée avec succès',
      patients: patientsResult,
      analyses: analysesResult
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation complète vers Algolia:', error);
    throw new Error(`Échec de la synchronisation complète: ${error.message}`);
  }
};

module.exports = {
  syncPatientsToAlgolia,
  syncAnalysesToAlgolia,
  syncAllDataToAlgolia: syncAllToAlgolia
};

// Pour exécuter le script directement
if (typeof window !== 'undefined' && window.runSync) {
  syncAllToAlgolia()
    .then(result => console.log(result))
    .catch(error => console.error(error));
} 