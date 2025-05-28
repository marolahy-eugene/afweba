import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiUser, FiMapPin, FiAward, FiFilter } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import { useRouter } from 'next/router';
import firebaseService from '@/services/firebaseService';
import algoliaService from '@/services/algoliaService';
import { sanitizeFirestoreData } from '@/utils/firebaseUtils';

const MedecinsList = () => {
  const router = useRouter();
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingAlgolia, setIsUsingAlgolia] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        setLoading(true);
        const data = await firebaseService.getAllMedecins();
        // Nettoyer les données de Firebase
        const cleanData = sanitizeFirestoreData(data);
        setMedecins(cleanData);
        setFilteredMedecins(cleanData);
        
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
        console.error("Erreur lors du chargement des médecins :", err);
        setError("Impossible de charger les médecins. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedecins();
  }, []);

  const handleEdit = (id) => {
    router.push(`/medecins/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médecin ?")) {
      try {
        await firebaseService.deleteMedecin(id);
        setMedecins(medecins.filter(medecin => medecin.id !== id));
      } catch (err) {
        console.error("Erreur lors de la suppression :", err);
        setError("Impossible de supprimer le médecin. Veuillez réessayer plus tard.");
      }
    }
  };

  // Recherche avec Algolia ou locale
  const handleSearch = (searchInfo) => {
    if (!searchInfo || !searchInfo.query) {
      setFilteredMedecins(medecins);
      return;
    }

    console.log('Recherche avec:', searchInfo.query);
    const query = searchInfo.query.toLowerCase().trim();
    
    if (query === '') {
      setFilteredMedecins(medecins);
      return;
    }
    
    // Si nous avons des résultats d'Algolia, les utiliser
    if (searchInfo.hits) {
      setSearchResults(searchInfo);
      return;
    }
    
    // Sinon, faire une recherche locale
    const results = medecins.filter(medecin => {
      if (!medecin) return false;
      
      // Recherche simplifiée dans tous les champs textuels
      const searchIn = (field) => {
        return medecin[field] && String(medecin[field]).toLowerCase().includes(query);
      };
      
      return (
        searchIn('nom') || 
        searchIn('specialite') ||
        searchIn('numONM') ||
        searchIn('lieuDeTravail')
      );
    });
    
    console.log(`Trouvé ${results.length} résultats`);
    setFilteredMedecins(results);
  };

  // Effacer la recherche
  const handleClearSearch = () => {
    setFilteredMedecins(medecins);
    setSearchResults(null);
  };

  // Déterminer quels médecins afficher
  const displayedMedecins = searchResults && searchResults.hits ? searchResults.hits : filteredMedecins;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Liste des médecins</h1>
          <button
            onClick={() => router.push('/medecins/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Nouveau médecin
          </button>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            placeholder="Rechercher un médecin par nom, spécialité ou lieu de travail..."
            onSearch={handleSearch}
            onClear={handleClearSearch}
            collection="medecins"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMedecins.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                Aucun médecin trouvé
              </div>
            ) : (
              displayedMedecins.map((medecin) => (
                <div key={medecin.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {medecin.nom}
                      </h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(medecin.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(medecin.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <FiAward className="mr-2" />
                        <span className="text-sm">
                          <span className="font-medium">Spécialité:</span> {medecin.specialite}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <FiUser className="mr-2" />
                        <span className="text-sm">
                          <span className="font-medium">N° ONM:</span> {medecin.numONM}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <FiMapPin className="mr-2" />
                        <span className="text-sm">
                          <span className="font-medium">Lieu:</span> {medecin.lieuDeTravail}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MedecinsList;