// Service pour interagir avec Algolia 
import { algoliaSearchClient, INDICES } from '@/config/algolia';

// Variable pour suivre si nous sommes en mode connecté
let isConnected = false;

/**
 * Service pour gérer les recherches avec Algolia
 */
const algoliaService = {
  /**
   * Vérifie la connexion avec Algolia
   * @returns {Promise<boolean>} True si connecté, false sinon
   */
  checkConnection: async () => {
    try {
      if (!algoliaSearchClient) {
        console.error('Client Algolia non initialisé');
        return false;
      }

      const index = algoliaSearchClient.initIndex(INDICES.PATIENTS);
      const testResult = await index.search('', { hitsPerPage: 1 });
      
      isConnected = true;
      console.log('Test de connexion Algolia réussi, nombre de hits:', testResult.nbHits);
      return true;
    } catch (error) {
      console.error('Erreur de connexion Algolia:', error);
      isConnected = false;
      return false;
    }
  },

  /**
   * Initialise le service et vérifie la connexion
   * Méthode maintenue pour la compatibilité avec _app.js
   * @returns {Promise<boolean>} True si connecté, false sinon
   */
  init: async () => {
    try {
      return await algoliaService.checkConnection();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service Algolia:', error);
      return false;
    }
  },

  /**
   * Vérifier si Algolia est disponible
   * @returns {boolean} True si Algolia est disponible, false sinon
   */
  isAlgoliaAvailable() {
    try {
      // Vérifier si le client Algolia est initialisé
      return !!algoliaSearchClient && !!algoliaSearchClient.initIndex;
    } catch (error) {
      console.log('Algolia indisponible, utilisation de la recherche locale uniquement');
      return false;
    }
  },

  /**
   * Recherche des patients
   * @param {string} query - Texte de recherche
   * @returns {Promise<Object>} Résultats de recherche
   */
  searchPatients: async (query) => {
    // Si la requête est vide, retourner un résultat vide
    if (!query) {
      return { 
        query: '',
        hits: [],
        message: 'Requête vide'
      };
    }
    
    // Assurer que query est une chaîne
    const searchQuery = typeof query === 'string' ? query.trim() : String(query).trim();
    
    // Si la requête est vide après nettoyage, retourner un résultat vide
    if (searchQuery === '') {
      return { 
        query: '',
        hits: [],
        message: 'Requête vide après nettoyage'
      };
    }

    // Si Algolia n'est pas disponible, retourner un résultat indiquant qu'une recherche locale est nécessaire
    if (!algoliaService.isAlgoliaAvailable()) {
      return {
        query: searchQuery,
        hits: [],
        message: 'Recherche locale uniquement'
      };
    }

    // Essayer d'utiliser Algolia si disponible
    try {
      const index = algoliaSearchClient.initIndex(INDICES.PATIENTS);
      const results = await index.search(searchQuery, {
        hitsPerPage: 20
      });
      
      console.log(`Algolia a trouvé ${results.hits.length} résultats pour "${searchQuery}"`);
      
      return {
        query: searchQuery,
        hits: results.hits,
        message: 'Recherche Algolia réussie'
      };
    } catch (error) {
      console.error(`Erreur Algolia lors de la recherche de "${searchQuery}":`, error);
      
      // En cas d'erreur, indiquer qu'une recherche locale est nécessaire
      return {
        query: searchQuery,
        hits: [],
        error: error.message,
        message: 'Erreur Algolia, utiliser recherche locale'
      };
    }
  },

  /**
   * Recherche des analyses
   * @param {string} query - Texte de recherche
   * @param {Object} options - Options de recherche supplémentaires
   * @returns {Promise<Object>} Résultats de recherche
   */
  searchAnalyses: async (query, options = {}) => {
    try {
      if (!algoliaSearchClient) {
        throw new Error('Client Algolia non initialisé');
      }
      
      const index = algoliaSearchClient.initIndex(INDICES.ANALYSES);
      const searchOptions = {
        ...options,
        hitsPerPage: options.hitsPerPage || 50
      };
      return await index.search(query, searchOptions);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'analyses:', error);
      
      throw new Error('Erreur lors de la recherche d\'analyses: ' + error.message);
    }
  },

  /**
   * Recherche des patients par genre
   * @param {string} genreFilter - Genre à filtrer
   * @param {string} query - Texte de recherche (optionnel)
   * @returns {Promise<Object>} Résultats de recherche
   */
  searchPatientsByGenre: async (genreFilter, query = '') => {
    try {
      return await algoliaService.searchPatients(query, {
        facetFilters: [`genre:${genreFilter}`]
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche de patients par genre '${genreFilter}':`, error);
      throw error;
    }
  },

  /**
   * Récupère les facettes de genre disponibles
   * @returns {Promise<Array>} Liste des genres
   */
  getGenreFacets: async () => {
    try {
      if (isConnected && algoliaSearchClient) {
        const index = algoliaSearchClient.initIndex(INDICES.PATIENTS);
        const { facets } = await index.search('', {
          facets: ['genre'],
          maxValuesPerFacet: 10
        });
        
        return facets?.genre ? Object.keys(facets.genre) : [];
      } else {
        throw new Error('Impossible de récupérer les facettes de genre sans connexion Algolia');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes de genre:', error);
      isConnected = false;
      throw new Error('Impossible de récupérer les facettes de genre sans connexion Algolia');
    }
  },

  /**
   * Recherche des patients par raison de visite
   * @param {string} reasonFilter - Raison de visite à filtrer
   * @param {string} query - Texte de recherche (optionnel)
   * @returns {Promise<Object>} Résultats de recherche
   */
  searchPatientsByReason: async (reasonFilter, query = '') => {
    try {
      return await algoliaService.searchPatients(query, {
        facetFilters: [`raison_visite:${reasonFilter}`]
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche de patients par raison '${reasonFilter}':`, error);
      throw error;
    }
  },

  /**
   * Recherche des analyses par type
   * @param {string} typeFilter - Type d'analyse à filtrer
   * @param {string} query - Texte de recherche (optionnel)
   * @returns {Promise<Object>} Résultats de recherche
   */
  searchAnalysesByType: async (typeFilter, query = '') => {
    try {
      return await algoliaService.searchAnalyses(query, {
        facetFilters: [`type_analyse:${typeFilter}`]
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche d'analyses par type '${typeFilter}':`, error);
      throw error;
    }
  },

  /**
   * Recherche des analyses par statut
   * @param {string} statusFilter - Statut à filtrer
   * @param {string} query - Texte de recherche (optionnel)
   * @returns {Promise<Object>} Résultats de recherche
   */
  searchAnalysesByStatus: async (statusFilter, query = '') => {
    try {
      return await algoliaService.searchAnalyses(query, {
        facetFilters: [`status:${statusFilter}`]
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche d'analyses par statut '${statusFilter}':`, error);
      throw error;
    }
  },

  /**
   * Récupère les facettes de raisons de visite disponibles
   * @returns {Promise<Array>} Liste des raisons de visite
   */
  getVisitReasonFacets: async () => {
    try {
      if (isConnected) {
        const index = algoliaSearchClient.initIndex(INDICES.PATIENTS);
        const { facets } = await index.search('', {
          facets: ['raison_visite'],
          maxValuesPerFacet: 100
        });
        
        return facets?.raison_visite ? Object.keys(facets.raison_visite) : [];
      } else {
        throw new Error('Impossible de récupérer les facettes de raisons de visite sans connexion Algolia');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes de raisons de visite:', error);
      isConnected = false;
      throw new Error('Impossible de récupérer les facettes de raisons de visite sans connexion Algolia');
    }
  },

  /**
   * Récupère les facettes de types d'analyse disponibles
   * @returns {Promise<Array>} Liste des types d'analyse
   */
  getAnalysisTypeFacets: async () => {
    try {
      if (isConnected) {
        const index = algoliaSearchClient.initIndex(INDICES.ANALYSES);
        const { facets } = await index.search('', {
          facets: ['type_analyse'],
          maxValuesPerFacet: 100
        });
        
        return facets?.type_analyse ? Object.keys(facets.type_analyse) : [];
      } else {
        throw new Error('Impossible de récupérer les facettes de types d\'analyse sans connexion Algolia');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des facettes de types d\'analyse:', error);
      isConnected = false;
      throw new Error('Impossible de récupérer les facettes de types d\'analyse sans connexion Algolia');
    }
  },
};

// Initialiser la connexion au démarrage
(async () => {
  try {
    await algoliaService.checkConnection();
  } catch (error) {
    console.error('Erreur d\'initialisation Algolia:', error);
  }
})();

export default algoliaService;