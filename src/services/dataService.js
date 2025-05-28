import mockData from '../data/mock-data.json';

/**
 * Service pour gérer les données des patients et des analyses
 */
const dataService = {
  /**
   * Récupère tous les patients
   * @returns {Promise<Array>} Liste des patients
   */
  getAllPatients: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData.patients);
      }, 300); // Simule un délai réseau
    });
  },

  /**
   * Récupère un patient par son ID
   * @param {number} id - ID du patient
   * @returns {Promise<Object|null>} Patient trouvé ou null
   */
  getPatientById: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = mockData.patients.find(p => p.id === id);
        resolve(patient || null);
      }, 300);
    });
  },

  /**
   * Récupère toutes les analyses
   * @returns {Promise<Array>} Liste des analyses
   */
  getAllAnalyses: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData.analyses);
      }, 300);
    });
  },

  /**
   * Récupère les analyses d'un patient spécifique
   * @param {number} patientId - ID du patient
   * @returns {Promise<Array>} Liste des analyses du patient
   */
  getAnalysesByPatientId: (patientId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analyses = mockData.analyses.filter(a => a.id_patient === patientId);
        resolve(analyses);
      }, 300);
    });
  },

  /**
   * Récupère une analyse par son ID
   * @param {number} id - ID de l'analyse
   * @returns {Promise<Object|null>} Analyse trouvée ou null
   */
  getAnalysisById: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = mockData.analyses.find(a => a.id_analyse === id);
        resolve(analysis || null);
      }, 300);
    });
  },

  /**
   * Récupère les données d'une analyse avec les informations du patient
   * @param {number} analysisId - ID de l'analyse
   * @returns {Promise<Object|null>} Données complètes ou null
   */
  getAnalysisWithPatientData: (analysisId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = mockData.analyses.find(a => a.id_analyse === analysisId);
        if (!analysis) {
          resolve(null);
          return;
        }

        const patient = mockData.patients.find(p => p.id === analysis.id_patient);
        resolve({
          ...analysis,
          patient
        });
      }, 300);
    });
  },

  /**
   * Récupère les analyses par statut
   * @param {string} status - Statut recherché (Complété, En cours, Planifié)
   * @returns {Promise<Array>} Liste des analyses avec ce statut
   */
  getAnalysesByStatus: (status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analyses = mockData.analyses.filter(a => a.status === status);
        resolve(analyses);
      }, 300);
    });
  },

  /**
   * Recherche des patients par nom ou prénom
   * @param {string} query - Terme de recherche
   * @returns {Promise<Array>} Liste des patients correspondants
   */
  searchPatients: (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowercaseQuery = query.toLowerCase();
        const patients = mockData.patients.filter(
          p => p.nom.toLowerCase().includes(lowercaseQuery) || 
               p.prenom.toLowerCase().includes(lowercaseQuery)
        );
        resolve(patients);
      }, 300);
    });
  }
};

export default dataService; 