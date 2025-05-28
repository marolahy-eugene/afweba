import React, { useState, useEffect } from 'react';
import { FiDownload, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import SearchBar from '../../components/search/SearchBar';
import firebaseService from '../../services/firebaseService';
import dataService from '../../services/dataService';

const AnalysesList = () => {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingAlgolia, setIsUsingAlgolia] = useState(false);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        // Essayer de se connecter à Firebase
        setLoading(true);
        let data = [];
        
        try {
          // Essayer de récupérer les données de Firebase
          data = await firebaseService.getAllAnalyses();
          setIsUsingAlgolia(true); // Firebase fonctionne, alors Algolia peut être utilisé
        } catch (firebaseError) {
          console.warn('Impossible de charger depuis Firebase, retour aux données mockées:', firebaseError);
          // En cas d'échec, utiliser les données mockées
          setIsUsingAlgolia(false);
          data = await dataService.getAllAnalyses();
          
          // Transformer les données mockées pour correspondre au format attendu
          data = data.map(item => ({
            id: item.id_analyse,
            type: item.type_analyse,
            status: item.status,
            date: item.date_enregistrement,
            id_patient: item.id_patient,
          }));
        }
        
        // Enrichir les données avec les noms des patients (pour l'affichage)
        const enrichedData = [];
        for (const analyse of data) {
          let patientName = 'Inconnu';
          try {
            // Essayer de récupérer les informations du patient
            const patientId = analyse.id_patient;
            if (patientId) {
              let patient;
              if (isUsingAlgolia) {
                patient = await firebaseService.getPatientById(patientId);
              } else {
                patient = await dataService.getPatientById(parseInt(patientId));
              }
              if (patient) {
                patientName = `${patient.nom} ${patient.prenom}`;
              }
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des informations du patient:', error);
          }
          
          enrichedData.push({
            ...analyse,
            patientName,
            doctor: analyse.medecin || 'Dr. Martin', // Utiliser le médecin s'il existe, sinon valeur par défaut
          });
        }
        
        setAnalyses(enrichedData);
        setFilteredAnalyses(enrichedData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des analyses:', error);
        setLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  // Gestionnaire pour les résultats de recherche d'Algolia
  const handleSearchResults = (results) => {
    if (results && results.length > 0) {
      // Enrichir les résultats Algolia avec les noms des patients
      const enrichedResults = results.map(result => {
        // Conserver les données existantes du tableau filteredAnalyses qui correspondent à cet ID
        const existingData = filteredAnalyses.find(
          a => a.id === result.id || a.id === result.objectID
        );
        
        return {
          ...result,
          id: result.id || result.objectID || 'unknown-id',
          patientName: existingData ? existingData.patientName : 'Inconnu',
          doctor: existingData ? existingData.doctor : 'Dr. Martin',
          status: result.status || existingData?.status || 'En attente',
          type: result.type || result.type_analyse || existingData?.type || 'N/A',
        };
      });
      
      setFilteredAnalyses(enrichedResults);
    } else if (results && results.length === 0) {
      setFilteredAnalyses([]);
    } else {
      setFilteredAnalyses(analyses);
    }
  };

  const handleExport = () => {
    // Logique d'exportation à implémenter
    console.log('Exportation des données...');
  };

  const handleEdit = (id) => {
    // Logique de modification à implémenter
    console.log('Modification de l\'analyse:', id);
  };

  const handleDelete = (id) => {
    // Logique de suppression à implémenter
    console.log('Suppression de l\'analyse:', id);
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Liste des Analyses</h1>
            <p className="text-sm text-secondary">Consultez les analyses des patients</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            {isUsingAlgolia ? (
              <SearchBar 
                placeholder="Rechercher une analyse..." 
                searchType="analyses"
                onResults={handleSearchResults}
                className="w-64 sm:w-80"
              />
            ) : (
              <div className="text-yellow-600 text-sm px-4 py-2 bg-yellow-100 rounded-lg">
                La recherche avancée n'est pas disponible en mode démo. Les données affichées sont fictives.
              </div>
            )}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <FiDownload />
              Exporter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-md overflow-hidden max-h-[70vh]">
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Patient</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Date d'analyse</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Médecin</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAnalyses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Aucune analyse trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredAnalyses.map((analyse) => 
                      analyse ? (
                        <tr key={analyse.id || `analyse-${Math.random()}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {analyse.id || 'N/A'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{analyse.patientName || 'Inconnu'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{analyse.type || analyse.type_analyse || 'N/A'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {analyse.date_analyse || analyse.date || analyse.date_enregistrement || 'N/A'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                (analyse.status === 'Complété')
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              }`}
                            >
                              {analyse.status || 'En attente'}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{analyse.doctor || 'N/A'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(analyse.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Modifier"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(analyse.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Supprimer"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : null
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalysesList; 