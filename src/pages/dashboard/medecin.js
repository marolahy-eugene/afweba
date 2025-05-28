import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiFileText, FiEye, FiSearch, FiChevronLeft, FiChevronRight, FiActivity, FiCheckCircle } from 'react-icons/fi';
import Layout from '@/components/layout/Layout.jsx';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/hooks/useAuth';
import firebaseService from '@/services/firebaseService';
import SearchBar from '@/components/search/SearchBar';
import { sanitizeFirestoreData, formatFirebaseDate } from '@/utils/firebaseUtils';

/**
 * Tableau de bord pour les médecins
 */
const MedecinPanel = () => {
  const { ROLES } = useAuth();
  const router = useRouter();

  // États pour les données et la pagination
  const [dossiers, setDossiers] = useState([]);
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dossiersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // États des statistiques
  const [statsAnalyse, setStatsAnalyse] = useState(0);
  const [statsPending, setStatsPending] = useState(0);

  // Chargement des données des dossiers depuis Firebase
  useEffect(() => {
    const loadDossiers = async () => {
      try {
        setLoading(true);
        const examsData = await firebaseService.getAllExamens();
        
        if (examsData && Array.isArray(examsData)) {
          const cleanExamsData = sanitizeFirestoreData(examsData);
          
          // Formater les données des dossiers
          const formattedDossiers = cleanExamsData.map(exam => ({
            id: exam.id || 'Unknown',
            patientId: exam.patientId || 'Unknown',
            patientNom: exam.patientNom || 'Inconnu',
            patientPrenom: exam.patientPrenom || '',
            type: exam.type || 'Standard',
            dateCreation: formatFirebaseDate(exam.dateCreation),
            status: exam.status || 'En attente',
            createdBy: exam.createdBy || 'Système',
            lastUpdated: formatFirebaseDate(exam.lastUpdated)
          })).filter(Boolean);
          
          // Filtrer les dossiers pertinents pour le médecin (seulement les dossiers déjà enregistrés et en attente d'analyse)
          const relevantDossiers = formattedDossiers.filter(
            d => ['Enregistrement', 'Analyse'].includes(d.status)
          );
          
          setDossiers(relevantDossiers);
          setFilteredDossiers(relevantDossiers);
          
          // Calculer les statistiques
          setStatsAnalyse(formattedDossiers.filter(d => d.status === 'Analyse').length);
          setStatsPending(formattedDossiers.filter(d => d.status === 'Enregistrement').length);
        } else {
          // Utiliser des données fictives en cas d'erreur ou pour le développement
          const mockDossiers = [
            { id: 'E-001', patientId: 'P-001', patientNom: 'Dupont', patientPrenom: 'Jean', type: 'EEG Standard', dateCreation: '12/01/2023', status: 'Enregistrement', createdBy: 'Dr. Smith', lastUpdated: '15/01/2023' },
            { id: 'E-002', patientId: 'P-002', patientNom: 'Martin', patientPrenom: 'Sophie', type: 'EEG Prolongé', dateCreation: '15/01/2023', status: 'Analyse', createdBy: 'Dr. Johnson', lastUpdated: '18/01/2023' },
            { id: 'E-003', patientId: 'P-003', patientNom: 'Petit', patientPrenom: 'Pierre', type: 'EEG Standard', dateCreation: '20/01/2023', status: 'Enregistrement', createdBy: 'Dr. Brown', lastUpdated: '22/01/2023' },
            { id: 'E-004', patientId: 'P-004', patientNom: 'Durand', patientPrenom: 'Marie', type: 'EEG Vidéo', dateCreation: '25/01/2023', status: 'Analyse', createdBy: 'Dr. Davis', lastUpdated: '27/01/2023' },
            { id: 'E-005', patientId: 'P-005', patientNom: 'Leroy', patientPrenom: 'Patrick', type: 'EEG Standard', dateCreation: '01/02/2023', status: 'Enregistrement', createdBy: 'Dr. Wilson', lastUpdated: '03/02/2023' },
          ];
          setDossiers(mockDossiers);
          setFilteredDossiers(mockDossiers);
          
          // Statistiques pour les données fictives
          setStatsAnalyse(mockDossiers.filter(d => d.status === 'Analyse').length);
          setStatsPending(mockDossiers.filter(d => d.status === 'Enregistrement').length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des dossiers:', error);
        // Données fictives en cas d'erreur
        const mockDossiers = [
          { id: 'E-001', patientId: 'P-001', patientNom: 'Dupont', patientPrenom: 'Jean', type: 'EEG Standard', dateCreation: '12/01/2023', status: 'Enregistrement', createdBy: 'Dr. Smith', lastUpdated: '15/01/2023' },
          { id: 'E-002', patientId: 'P-002', patientNom: 'Martin', patientPrenom: 'Sophie', type: 'EEG Prolongé', dateCreation: '15/01/2023', status: 'Analyse', createdBy: 'Dr. Johnson', lastUpdated: '18/01/2023' },
          { id: 'E-003', patientId: 'P-003', patientNom: 'Petit', patientPrenom: 'Pierre', type: 'EEG Standard', dateCreation: '20/01/2023', status: 'Enregistrement', createdBy: 'Dr. Brown', lastUpdated: '22/01/2023' },
          { id: 'E-004', patientId: 'P-004', patientNom: 'Durand', patientPrenom: 'Marie', type: 'EEG Vidéo', dateCreation: '25/01/2023', status: 'Analyse', createdBy: 'Dr. Davis', lastUpdated: '27/01/2023' },
          { id: 'E-005', patientId: 'P-005', patientNom: 'Leroy', patientPrenom: 'Patrick', type: 'EEG Standard', dateCreation: '01/02/2023', status: 'Enregistrement', createdBy: 'Dr. Wilson', lastUpdated: '03/02/2023' },
        ];
        setDossiers(mockDossiers);
        setFilteredDossiers(mockDossiers);
        
        // Statistiques pour les données fictives
        setStatsAnalyse(mockDossiers.filter(d => d.status === 'Analyse').length);
        setStatsPending(mockDossiers.filter(d => d.status === 'Enregistrement').length);
      } finally {
        setLoading(false);
      }
    };

    loadDossiers();
  }, []);

  // Filtrer les dossiers en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDossiers(dossiers);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = dossiers.filter(dossier => {
        return (
          dossier.patientNom.toLowerCase().includes(lowercasedFilter) ||
          dossier.patientPrenom.toLowerCase().includes(lowercasedFilter) ||
          dossier.id.toLowerCase().includes(lowercasedFilter) ||
          dossier.patientId.toLowerCase().includes(lowercasedFilter)
        );
      });
      setFilteredDossiers(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, dossiers]);

  // Calculer les dossiers à afficher sur la page actuelle
  const indexOfLastDossier = currentPage * dossiersPerPage;
  const indexOfFirstDossier = indexOfLastDossier - dossiersPerPage;
  const currentDossiers = filteredDossiers.slice(indexOfFirstDossier, indexOfLastDossier);

  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour consulter un dossier
  const handleViewDossier = (dossierId) => {
    router.push(`/examens/${dossierId}`);
  };

  // Obtenir la couleur de statut pour l'affichage
  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Observation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Enregistrement':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Analyse':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Interprétation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Terminé':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Rendu du tableau de bord du médecin
  return (
    <RoleBasedRoute roles={ROLES.MEDECIN}>
      <Layout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-200 dark:text-white">
              Tableau de bord du Médecin
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Analyse des examens EEG
            </p>
          </div>

          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-20 dark:bg-blue-900 text-green-400 dark:text-blue-300 mr-4">
                  <FiFileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-200 dark:text-gray-400">Total des examens</p>
                  <p className="text-2xl font-semibold text-green-300 dark:text-white">{dossiers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-20 dark:bg-purple-900 text-cyan-400 dark:text-purple-300 mr-4">
                  <FiActivity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-200 dark:text-gray-400">En analyse</p>
                  <p className="text-2xl font-semibold text-cyan-400 dark:text-white">{statsAnalyse}</p>
                </div>
              </div>
            </div>

            <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-600 bg-opacity-20 dark:bg-indigo-900 text-yellow-400 dark:text-indigo-300 mr-4">
                  <FiCheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-200 dark:text-gray-400">En attente d'analyse</p>
                  <p className="text-2xl font-semibold text-yellow-300 dark:text-white">{statsPending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des dossiers */}
          <div className="bg-custom dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-lg font-medium text-gray-200 font-semibold dark:text-white mb-4 md:mb-0">
                  Examens à analyser
                </h2>
                <div className="w-full md:w-64">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-custom dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Rechercher un examen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  <p className="mt-2 text-gray-300 text-md dark:text-gray-400">Chargement des examens...</p>
                </div>
              ) : currentDossiers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-300 text-md dark:text-gray-400">Aucun examen trouvé.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type d'examen
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Dernière mise à jour
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-custom dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentDossiers.map((dossier) => (
                      <tr key={dossier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {dossier.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {dossier.patientNom} {dossier.patientPrenom}
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {dossier.patientId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {dossier.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {dossier.dateCreation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {dossier.lastUpdated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(dossier.status)}`}>
                            {dossier.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDossier(dossier.id)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            title="Analyser l'examen"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredDossiers.length > dossiersPerPage && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Affichage de <span className="font-medium">{indexOfFirstDossier + 1}</span> à{' '}
                      <span className="font-medium">
                        {indexOfLastDossier > filteredDossiers.length ? filteredDossiers.length : indexOfLastDossier}
                      </span>{' '}
                      sur <span className="font-medium">{filteredDossiers.length}</span> examens
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-custom dark:bg-gray-800 text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Précédent</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Numéros de page */}
                      {Array.from({ length: Math.ceil(filteredDossiers.length / dossiersPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === index + 1
                              ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-300'
                              : 'bg-custom dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredDossiers.length / dossiersPerPage)}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-custom dark:bg-gray-800 text-sm font-medium ${
                          currentPage === Math.ceil(filteredDossiers.length / dossiersPerPage)
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Suivant</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </RoleBasedRoute>
  );
};

export default MedecinPanel;