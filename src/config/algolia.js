// Configuration Algolia
import algoliasearch from 'algoliasearch';

// Clés API Algolia - Utilisation directe des valeurs pour le développement
const ALGOLIA_APP_ID = 'TSMFC7MXLR';
const ALGOLIA_SEARCH_API_KEY = '1443697e432aaa541e531f914bd7be8f';
const ALGOLIA_ADMIN_API_KEY = 'b9766e104041856cd04571e4abad7baf'; // À remplir si nécessaire pour l'indexation

// Noms des indices Algolia
export const INDICES = {
  PATIENTS: 'patients',
  ADMISIONS: 'admissions',
  EXAMENS: 'examens',
  ANALYSES: 'analyses'
};

let algoliaSearchClient = null;
let algoliaAdminClient = null;

try {
  // Initialiser le client de recherche Algolia
  if (ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY) {
    // Initialiser le client de recherche (utilisé côté client et serveur)
    algoliaSearchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
    console.log('Client Algolia initialisé avec succès');
    
    // Initialiser et vérifier les indices
    try {
      const patientsIndex = algoliaSearchClient.initIndex(INDICES.PATIENTS);
      console.log('Index patients initialisé:', INDICES.PATIENTS);
      
      // Effectuer une recherche vide pour vérifier la connexion
      patientsIndex.search('', { hitsPerPage: 1 })
        .then(result => {
          console.log('Connexion à l\'index patients réussie. Hits:', result.nbHits);
          if (result.nbHits === 0) {
            console.warn('L\'index patients existe mais ne contient aucune donnée');
          }
        })
        .catch(err => {
          console.error('Erreur lors de la vérification de l\'index patients:', err);
        });
      
      // Initialiser le client admin si la clé admin est disponible (pour l'indexation)
      if (ALGOLIA_ADMIN_API_KEY) {
        algoliaAdminClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
        console.log('Client admin Algolia initialisé avec succès');
      }
    } catch (indexError) {
      console.error('Erreur lors de l\'initialisation des indices Algolia:', indexError);
    }
  } else {
    console.warn('Configuration Algolia incomplète - la recherche fonctionnera en mode local uniquement');
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation d\'Algolia:', error);
}

// Exports ES Modules
export { algoliaSearchClient, algoliaAdminClient };
export const APP_ID = ALGOLIA_APP_ID;
