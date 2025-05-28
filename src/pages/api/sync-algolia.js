// API route pour synchroniser les données avec Algolia
const { syncAllToAlgolia, syncPatientsToAlgolia } = require('../../scripts/syncToAlgolia');

// Clé API simple pour sécuriser l'endpoint (à remplacer par une vraie authentification)
const API_KEY = process.env.SYNC_API_KEY || 'sync-secret-key';

/**
 * API route pour synchroniser les données Firebase avec Algolia
 * 
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
export default async function handler(req, res) {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée. Utilisez POST.' });
  }

  // Vérifier la clé API si elle est configurée
  const apiKey = req.headers['x-api-key'] || req.query.key;
  if (API_KEY !== 'sync-secret-key' && apiKey !== API_KEY) {
    console.error('Tentative de synchronisation non autorisée');
    return res.status(401).json({ success: false, message: 'Clé API invalide ou manquante.' });
  }

  try {
    // Déterminer le type de synchronisation à effectuer
    const syncType = req.query.type || 'all';
    console.log(`Démarrage de la synchronisation: ${syncType}`);

    let result;
    if (syncType === 'patients') {
      result = await syncPatientsToAlgolia();
    } else {
      result = await syncAllToAlgolia();
    }

    console.log('Synchronisation terminée avec succès');
    return res.status(200).json({
      success: true,
      message: 'Synchronisation terminée avec succès',
      result
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec Algolia:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la synchronisation avec Algolia',
      error: error.message
    });
  }
} 