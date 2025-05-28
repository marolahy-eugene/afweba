import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiFileText, FiFilter } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import { useRouter } from 'next/router';
import firebaseService from '@/services/firebaseService';
import algoliaService from '@/services/algoliaService';
import { formatFirebaseDate, sanitizeFirestoreData } from '@/utils/firebaseUtils';

const ExamensList = () => {
  const router = useRouter();
  const [examens, setExamens] = useState([]);
  const [filteredExamens, setFilteredExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingAlgolia, setIsUsingAlgolia] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchExamens = async () => {
      try {
        setLoading(true);
        const data = await firebaseService.getAllExamens();
        // Nettoyer les données de Firebase
        const cleanData = sanitizeFirestoreData(data);
        setExamens(cleanData);
        setFilteredExamens(cleanData);
        
        // Vérifier la connexion à Algolia
        try {
          const algoliaConnected = await algoliaService.checkConnection();
          console.log('État de la connexion Algolia:', algoliaConnected);
          setIsUsingAlgolia(algoliaConnected);
        } catch (algoliaError) {
          console.warn('Impossible de se connecter à Algolia:', algoliaError);
          setIsUsingAlgolia(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des examens :", err);
        setError("Impossible de charger les examens. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamens();
  }, []);

  const handleEdit = (id) => {
    router.push(`/examens/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet examen ?")) {
      try {
        await firebaseService.deleteExamen(id);
        setExamens(examens.filter(examen => examen.id !== id));
      } catch (err) {
        console.error("Erreur lors de la suppression :", err);
        setError("Impossible de supprimer l'examen. Veuillez réessayer plus tard.");
      }
    }
  };

  const getTarificationClass = (tarification) => {
    if (tarification.includes('Réduction')) {
      return 'text-green-600 bg-green-100';
    } else if (tarification.includes('Majoration')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

  // Recherche avec Algolia ou locale
  const handleSearch = (searchInfo) => {
    if (!searchInfo || !searchInfo.query) {
      setFilteredExamens(examens);
      return;
    }

    console.log('Recherche avec:', searchInfo.query);
    const query = searchInfo.query.toLowerCase().trim();
    
    if (query === '') {
      setFilteredExamens(examens);
      return;
    }
    
    // Si nous avons des résultats d'Algolia, les utiliser
    if (searchInfo.hits) {
      setSearchResults(searchInfo);
      return;
    }
    
    // Sinon, faire une recherche locale
    const results = examens.filter(examen => {
      if (!examen) return false;
      
      // Recherche simplifiée dans tous les champs textuels
      const searchIn = (field) => {
        return examen[field] && String(examen[field]).toLowerCase().includes(query);
      };
      
      return (
        searchIn('codeExamen') || 
        searchIn('tarification') ||
        searchIn('description')
      );
    });
    
    console.log(`Trouvé ${results.length} résultats`);
    setFilteredExamens(results);
  };

  // Effacer la recherche
  const handleClearSearch = () => {
    setFilteredExamens(examens);
    setSearchResults(null);
  };

  // Déterminer quels examens afficher
  const displayedExamens = searchResults && searchResults.hits ? searchResults.hits : filteredExamens;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-cyan-100 dark:text-white">Liste des examens</h1>
          <button
            onClick={() => router.push('/examens/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Nouvel examen
          </button>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            placeholder="Rechercher un examen par code ou tarification..."
            onSearch={handleSearch}
            onClear={handleClearSearch}
            collection="examens"
            className="w-full text-md text-gray-200"
          />
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-custom-2 dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200 dark:divide-gray-200">
                <thead className="bg-custom-2 text-gray-200 text-xs font-md dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                      Tarification
                    </th>
                    <th className="px-6 py-3 text-right dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-custom dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedExamens.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Aucun examen trouvé
                      </td>
                    </tr>
                  ) : (
                    displayedExamens.map((examen) => (
                      <tr key={examen.id} className="hover:text-gray-100 hover:bg-gray-600 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                          {examen.codeExamen}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap dark:text-gray-400">
                          {formatFirebaseDate(examen.dateExamen)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex leading-5 font-semibold rounded-full ${getTarificationClass(examen.tarification)}`}>
                            {examen.tarification}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          <button
                            onClick={() => handleEdit(examen.id)}
                            className="text-yellow-400 hover:text-yellow-600 dark:text-indigo-400 dark:hover:text-indigo-300 mr-5"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(examen.id)}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
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

export default ExamensList;