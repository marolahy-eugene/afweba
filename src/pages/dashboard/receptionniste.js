import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiUsers, FiPlus, FiEdit, FiEye, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiUserPlus } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/hooks/useAuth';
import firebaseService from '@/services/firebaseService';
import SearchBar from '@/components/search/SearchBar';
import { sanitizeFirestoreData, formatFirebaseDate, calculateAge } from '@/utils/firebaseUtils';
import AdmissionModal from '@/components/admission/AdmissionModal';
import PatientEditModal from '@/components/patients/PatientEditModal';
import PatientModal from '@/components/patients/PatientModal';
import algoliaService from '@/services/algoliaService';

/**
 * Tableau de bord pour les réceptionnistes
 */
const ReceptionnistePanel = () => {
  const { ROLES } = useAuth();
  const router = useRouter();

  // États pour les données et la pagination
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [useAlgolia, setUseAlgolia] = useState(false);
  
  // États pour les modals
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Vérifier si Algolia est disponible
  useEffect(() => {
    const checkAlgolia = async () => {
      const isAvailable = await algoliaService.isAlgoliaAvailable();
      setUseAlgolia(isAvailable);
      console.log("Algolia disponible:", isAvailable);
    };
    
    checkAlgolia();
  }, []);

  // Chargement des données des patients depuis Firebase
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await firebaseService.getAllPatients();
        
        if (patientsData && Array.isArray(patientsData)) {
          const cleanPatientsData = sanitizeFirestoreData(patientsData);
          
          // Formater les données des patients
          const formattedPatients = cleanPatientsData.map(patient => ({
            id: patient.id || 'Unknown',
            nom: patient.nom || 'Sans nom',
            prenom: patient.prenom || '',
            age: calculateAge(patient.dateDeNaissance) || 'N/A',
            sexe: patient.genre?.charAt(0) || 'N/A',
            dateCreation: formatFirebaseDate(patient.createdAt, { withTime: true }) || 'N/A',
            phone: patient.phone || 'N/A',
            domicile: patient.domicile || 'N/A'
          })).filter(Boolean);
          
          setPatients(formattedPatients);
          setFilteredPatients(formattedPatients);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
        // Utiliser des données mock en cas d'erreur
        // setPatients(mockPatientsData);
        // setFilteredPatients(mockPatientsData);
      } finally {
        // setLoading(false);
      }
    };

    fetchPatients();
  }, []); // Exécuter une seule fois au montage

  // Fonction de recherche
  const handleSearch = async (term) => {
    setSearchTerm(term);
    // setSearchLoading(true);

    if (term.trim() === '') {
      setFilteredPatients(patients);
      // setSearchLoading(false);
      return;
    }

    if (useAlgolia) {
      try {
        const searchResults = await algoliaService.searchPatients(term);
        const formattedResults = searchResults.map(hit => ({
          id: hit.objectID,
          nom: hit.nom || 'Sans nom',
          prenom: hit.prenom || '',
          age: calculateAge(hit.dateDeNaissance) || 'N/A',
          sexe: hit.genre?.charAt(0) || 'N/A',
          dateCreation: formatFirebaseDate(hit.createdAt, { withTime: true }) || 'N/A',
          phone: hit.phone || 'N/A',
          domicile: hit.domicile || 'N/A'
        }));
        setFilteredPatients(formattedResults);
      } catch (error) {
        console.error('Erreur lors de la recherche Algolia:', error);
        // Fallback to local search if Algolia search fails
        const localResults = patients.filter(patient =>
          Object.values(patient).some(value =>
            String(value).toLowerCase().includes(term.toLowerCase())
          )
        );
        setFilteredPatients(localResults);
      } finally {
        // setSearchLoading(false);
      }
    } else {
      // Recherche locale si Algolia n'est pas disponible
      const localResults = patients.filter(patient =>
        Object.values(patient).some(value =>
          String(value).toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredPatients(localResults);
      // setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredPatients(patients);
  };
  
  // Calcul des patients à afficher sur la page courante
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Fonction pour gérer le clic sur le bouton "Modifier"
  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setIsPatientEditModalOpen(true);
  };

  // Fonction pour gérer le clic sur le bouton "Admission"
  const handleAdmissionClick = (patient) => {
    setSelectedPatient(patient);
    setIsAdmissionModalOpen(true);
  };
  
  // Fonction pour recharger les patients après modification
  const reloadPatients = async () => {
    try {
      // setLoading(true);
      const patientsData = await firebaseService.getAllPatients();
      
      if (patientsData && Array.isArray(patientsData)) {
        const cleanPatientsData = sanitizeFirestoreData(patientsData);
        
        // Formater les données des patients
        const formattedPatients = cleanPatientsData.map(patient => ({
          id: patient.id || 'Unknown',
          nom: patient.nom || 'Sans nom',
          prenom: patient.prenom || '',
          age: calculateAge(patient.dateDeNaissance) || 'N/A',
          sexe: patient.genre?.charAt(0) || 'N/A',
          dateCreation: formatFirebaseDate(patient.createdAt, { withTime: true }) || 'N/A',
          phone: patient.phone || 'N/A',
          domicile: patient.domicile || 'N/A'
        })).filter(Boolean);
        
        setPatients(formattedPatients);
        setFilteredPatients(formattedPatients);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des patients:', error);
    } finally {
        // setLoading(false);
        setCurrentPage(1); // Réinitialiser la page à 1 après le rechargement
      }
    };

  // Fonction pour créer un dossier d'examen pour un patient
  const handleCreateDossier = (patientId) => {
    router.push(`/examens/new?patientId=${patientId}`);
  };

  // Fonction pour gérer le clic sur le bouton "Nouveau patient"
  const handleAddPatient = () => {
    setIsPatientModalOpen(true);
  };

  // Rendu du tableau de bord du réceptionniste
  return (
    <RoleBasedRoute roles={ROLES.RECEPTIONNISTE}>
      <Layout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-green-100 dark:text-white">
              Tableau de bord du Réceptionniste
            </h1>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-400">
              Gestion des patients et création de dossiers d'examen
            </p>
          </div>

          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-500 dark:bg-blue-900 text-blue-300 dark:text-blue-300 mr-4">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-300 dark:text-gray-400">Total des patients</p>
                  <p className="text-2xl font-semibold text-cyan-400 dark:text-white">{patients.length}</p>
                </div>
              </div>
            </div>

            {/* ============  ICI pour les statistiques des patients en Admission ============ */}

            <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 mr-4">
                  <FiPlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-md font-medium text-gray-300 dark:text-gray-400">Examens en cours</p>
                  <p className="text-2xl font-semibold text-green-400 dark:text-white">
                    {patients.filter(p => p.status === 'En attente').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-custom dark:bg-gray-800 rounded-lg shadow p-6">
              <button
                onClick={handleAddPatient}
                className="w-full flex items-center justify-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white btn-bleu hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiUserPlus className="h-5 w-5 mr-2" />
                Nouveau patient
              </button>
            </div>
          </div>

          {/* Tableau des patients */}
          <div className="bg-custom dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-200 dark:text-white mb-4 md:mb-0">
                  Liste des patients {useAlgolia ? "(Recherche Algolia)" : "(Recherche locale)"}
                </h2>
                <div className="w-full md:w-64">
                  <SearchBar 
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    placeholder="Rechercher un patient..."
                    className="w-full bg-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {/* loading || searchLoading ? ( */}
                {/* <div className="text-center py-10"> */}
                  {/* <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div> */}
                  {/* <p className="mt-2 text-gray-400 dark:text-gray-400"> */}
                    {/* {loading ? "Chargement des patients..." : "Recherche en cours..."} */}
                  {/* </p> */}
                {/* </div> */}
              {/* ) : */}
               {currentPatients.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 dark:text-gray-400">
                    {searchTerm ? "Aucun patient ne correspond à votre recherche." : "Aucun patient trouvé."}
                  </p>
                </div>
              ) : (
                <table className="bg-custom-3 min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-custom-3 dark:bg-gray-700  text-gray-300 text-semibold">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-md dark:text-gray-300 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-md dark:text-gray-300 uppercase tracking-wider">
                        Nom et Prénom
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-md dark:text-gray-300 uppercase tracking-wider">
                        Âge
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-md dark:text-gray-300 uppercase tracking-wider">
                        Sexe
                      </th>
                      
                      <th scope="col" className="px-3 py-3 text-left text-xs font-md dark:text-gray-300 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-md  dark:text-gray-300 uppercase tracking-wider">
                        Adresse
                      </th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-md  dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-custom dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentPatients.map((patient) => (
                      <tr key={patient.id} className=" text-gray-200 hover:text-gray-100 hover:bg-gray-500 dark:hover:bg-gray-700">
                        <td className="px-3 py-4 whitespace-nowrap text-md dark:text-gray-300">
                          {patient.dateCreation}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-md dark:text-gray-300">
                          {patient.nom} <span className='pl-2'> {patient.prenom} </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-md dark:text-gray-300">
                          {patient.age} ans
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-md dark:text-gray-300">
                          {patient.sexe}
                        </td>
                        
                        <td className="px-3 py-4 whitespace-nowrap text-md dark:text-gray-300">
                          {patient.phone}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-md dark:text-gray-300">
                          {patient.domicile}
                        </td>                        
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => router.push(`/patients/view?id=${patient.id}`)}
                              className="text-blue-300 hover:text-blue-400 hover:font-semibold dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded border border-gray-500 bg-blue-400 bg-opacity-20 dark:bg-blue-900/30 dark:border-blue-700 shadow hover:shadow-md hover:shadow-gray-700 flex items-center gap-1"
                              title="Afficher"
                            >Afficher
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditClick(patient)}
                              className="text-orange-300 hover:text-yellow-300 hover:font-semibold dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded border border-gray-500 bg-orange-400 bg-opacity-20 dark:bg-blue-900/30 dark:border-blue-700 shadow hover:shadow-md hover:shadow-gray-700 flex items-center gap-1" 
                                title="Modifier"
                              >Editer
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAdmissionClick(patient)}
                              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                              title="Admission"
                            >
                              Admission
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredPatients.length > patientsPerPage && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Affichage de <span className="font-medium">{indexOfFirstPatient + 1}</span> à{' '}
                      <span className="font-medium">
                        {indexOfLastPatient > filteredPatients.length ? filteredPatients.length : indexOfLastPatient}
                      </span>{' '}
                      sur <span className="font-medium">{filteredPatients.length}</span> patients
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
                      {Array.from({ length: Math.ceil(filteredPatients.length / patientsPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === index + 1
                              ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-300'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === Math.ceil(filteredPatients.length / patientsPerPage)
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
        
        {/* Modals */}
        <AdmissionModal
            open={isAdmissionModalOpen}
            onClose={() => setIsAdmissionModalOpen(false)}
            patient={selectedPatient}
            initialData={null} // Pour la création, pas de données initiales
            // Ajoutez les props size et positionClasses ici pour contrôler la taille et la position
            size="" // Exemple: 'max-w-xl', 'max-w-2xl', etc.
            positionClasses="items-center justify-center " // Exemple: 'items-center justify-center', 'items-start justify-end mt-10'
          />
        
        <PatientEditModal
            open={isPatientEditModalOpen}
            onClose={() => setIsPatientEditModalOpen(false)}
            patient={selectedPatient}
            onSuccess={reloadPatients}
            // Ajoutez les props size et positionClasses ici pour contrôler la taille et la position
            size="max-w-3xl" // Exemple: 'max-w-xl', 'max-w-2xl', etc.
            positionClasses="items-center justify-center" // Exemple: 'items-center justify-center', 'items-start justify-end mt-10'
          />
        
        <PatientModal
          open={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={reloadPatients}
        />
      </Layout>
    </RoleBasedRoute>
  );
};

export default ReceptionnistePanel;