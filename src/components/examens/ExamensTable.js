import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiEye, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import firebaseService from '@/services/firebaseService';
import { sanitizeFirestoreData, formatFirebaseDate } from '@/utils/firebaseUtils';

/**
 * Composant de tableau des examens réutilisable pour toutes les pages
 * @param {string} examenType - Type d'examen à filtrer (optionnel)
 */
const ExamensTable = ({ examenType }) => {
  const router = useRouter();
  
  // États pour les données et la pagination
  const [examens, setExamens] = useState([]);
  const [filteredExamens, setFilteredExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [examensPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // États des statistiques
  const [statsObservation, setStatsObservation] = useState(0);
  const [statsEnregistrement, setStatsEnregistrement] = useState(0);
  const [statsAnalyse, setStatsAnalyse] = useState(0);

  // Fonction pour formater les données d'examen
  const formatExamenData = async (admission) => {
    // Récupérer les données du patient si nécessaire
    let patientInfo = { nom: "Inconnu", prenom: "", phone: "Non disponible" };
    
    if (admission.idPatient) {
      try {
        const patient = await firebaseService.getPatientById(admission.idPatient);
        if (patient) {
          patientInfo = {
            nom: patient.nom || "Inconnu",
            prenom: patient.prenom || "",
            phone: patient.phone || "Non disponible"
          };
        }
      } catch (err) {
        console.error(`Erreur lors de la récupération du patient ${admission.idPatient}:`, err);
      }
    }
    
    return {
      id: admission.id || 'Unknown',
      idExamen: admission.id || 'Unknown',
      patientId: admission.idPatient || 'Unknown',
      patientNom: patientInfo.nom,
      patientPrenom: patientInfo.prenom,
      patientPhone: patientInfo.phone,
      type: admission.typeAdmission || 'Standard',
      dateCreation: formatFirebaseDate(admission.dateCreation),
      etat: admission.etat || 'En attente',
      medecinPrescripteur: admission.medecinPrescripteur || 'Non spécifié',
      medecinReference: admission.medecinReference || 'Non spécifié',
      motifAdmission: admission.motifAdmission || 'Non spécifié',
      modePayement: admission.modePayement || 'Non spécifié',
      admission: admission
    };
  };

  // Chargement des données des examens depuis Firebase en temps réel
  useEffect(() => {
    setLoading(true);
    
    // Créer une requête pour écouter toutes les admissions ou filtrées par type
    const admissionsRef = collection(db, 'admissions');
    let admissionsQuery;
    
    if (examenType) {
      // Si un type d'examen est spécifié, filtrer par ce type
      admissionsQuery = query(admissionsRef, where('typeAdmission', '==', examenType));
    } else {
      // Sinon, récupérer toutes les admissions
      admissionsQuery = admissionsRef;
    }
    
    // Mettre en place l'écouteur pour les mises à jour en temps réel
    const unsubscribe = onSnapshot(admissionsQuery, async (snapshot) => {
      try {
        // Traiter les admissions
        const allAdmissions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const cleanAdmissionsData = sanitizeFirestoreData(allAdmissions);
        
        // Formater les données des examens
        const formattedExamens = await Promise.all(
          cleanAdmissionsData.map(formatExamenData)
        );
        
        setExamens(formattedExamens);
        
        // Calculer les statistiques
        setStatsObservation(formattedExamens.filter(e => e.etat === 'Observation').length);
        setStatsEnregistrement(formattedExamens.filter(e => e.etat === 'Enregistrement').length);
        setStatsAnalyse(formattedExamens.filter(e => e.etat === 'Analyse').length);
      } catch (error) {
        console.error('Erreur lors du traitement des données en temps réel:', error);
        setExamens([]);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Erreur lors de l\'écoute des données:', error);
      setLoading(false);
      setExamens([]);
    });
    
    // Nettoyage lors du démontage du composant
    return () => unsubscribe();
  }, [examenType]);

  // Filtrer les examens en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExamens(examens);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = examens.filter(examen => {
        return (
          examen.patientNom.toLowerCase().includes(lowercasedFilter) ||
          examen.patientPrenom.toLowerCase().includes(lowercasedFilter) ||
          examen.id.toLowerCase().includes(lowercasedFilter) ||
          examen.patientId.toLowerCase().includes(lowercasedFilter)
        );
      });
      setFilteredExamens(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, examens]);

  // Calculer les examens à afficher sur la page actuelle
  const indexOfLastExamen = currentPage * examensPerPage;
  const indexOfFirstExamen = indexOfLastExamen - examensPerPage;
  const currentExamens = filteredExamens.slice(indexOfFirstExamen, indexOfLastExamen);

  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour rediriger vers la page appropriée selon l'état de l'examen
  const handleObservation = (examen) => {
    switch(examen.etat) {
      case 'Observation':
        router.push(`/examens/observation/${examen.id}`);
        break;
      case 'Enregistrement':
        router.push(`/examens/enregistrement/${examen.id}`);
        break;
      case 'Analyse':
        router.push(`/examens/analyse/${examen.id}`);
        break;
      default:
        router.push(`/examens/details/${examen.id}`);
        break;
    }
  };

  // Obtenir la couleur de statut pour l'affichage
  const getStatusColor = (etat) => {
    switch (etat) {
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

  return (
    <div>
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 mr-4">
              <FiEye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-md font-medium text-gray-300 dark:text-gray-400">Total des examens</p>
              <p className="text-2xl font-semibold text-purple-300 dark:text-white">{examens.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 mr-4">
              <FiEye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 dark:text-gray-400">En observation</p>
              <p className="text-2xl font-semibold text-cyan-200 dark:text-white">{statsObservation}</p>
            </div>
          </div>
        </div>

        <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-500 dark:text-indigo-300 mr-4">
              <FiEye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 dark:text-gray-400">En enregistrement</p>
              <p className="text-2xl font-semibold text-pink-300 dark:text-white">{statsEnregistrement}</p>
            </div>
          </div>
        </div>

        <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 mr-4">
              <FiEye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 dark:text-gray-400">En analyse</p>
              <p className="text-2xl font-semibold text-green-300 dark:text-white">{statsAnalyse}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des examens */}
      <div className="bg-custom dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-lg font-bold text-gray-300 dark:text-white mb-4 md:mb-0">
              Liste des examens à traiter
            </h2>
            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-700 dark:bg-gray-700 border border-gray-500 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
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
              <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des examens...</p>
            </div>
          ) : currentExamens.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-300 text-md dark:text-gray-400">Aucun examen trouvé.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-custom-3 text-sm text-gray-200 font-bold dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                    CRÉÉ LE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                    PATIENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                    ÉTAT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                    TYPE D'EXAMEN
                  </th>
                  <th scope="col" className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                    TÉLÉPHONE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider">
                    PAIEMENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-right dark:text-gray-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-custom dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentExamens.map((examen) => (
                  <tr key={examen.id} className="text-gray-200 hover:bg-gray-500 hover:text-gray-200 dark:hover:bg-gray-700">                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {examen.dateCreation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {examen.patientNom} {examen.patientPrenom}
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        ID: {examen.patientId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(examen.etat)}`}>
                        {examen.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {examen.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {examen.patientPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {examen.modePayement}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleObservation(examen)}
                        className="flex items-center justify-center px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                      >
                        <FiEye className="mr-1 h-4 w-4" />
                        Afficher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredExamens.length > examensPerPage && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Affichage de <span className="font-medium">{indexOfFirstExamen + 1}</span> à{' '}
                  <span className="font-medium">
                    {indexOfLastExamen > filteredExamens.length ? filteredExamens.length : indexOfLastExamen}
                  </span>{' '}
                  sur <span className="font-medium">{filteredExamens.length}</span> examens
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Précédent</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Numéros de page */}
                  {Array.from({ length: Math.ceil(filteredExamens.length / examensPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === index + 1
                          ? 'z-10 bg-primary-500 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } text-sm font-medium`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredExamens.length / examensPerPage)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      currentPage === Math.ceil(filteredExamens.length / examensPerPage)
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
  );
};

export default ExamensTable;