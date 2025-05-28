import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiUserPlus, FiSave, FiCalendar, FiHome, FiBriefcase, FiX, FiPlus, FiFilter, FiUser } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/search/SearchBar';
import firebaseService from '@/services/firebaseService';
import { useRouter } from 'next/router';
import algoliaService from '@/services/algoliaService';
import { db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

// Fonction utilitaire pour formater les dates Firebase Timestamp
const formatFirebaseDate = (dateValue) => {
  // Vérifier si la date est un objet Firebase Timestamp (avec seconds et nanoseconds)
  if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
    // Convertir en objet Date JavaScript
    const date = new Date(dateValue.seconds * 1000);
    // Formater la date en chaîne lisible
    return date.toLocaleDateString();
  }
  // Sinon, retourner la valeur d'origine ou N/A
  return dateValue || 'N/A';
};

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isUsingAlgolia, setIsUsingAlgolia] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [availableGenres, setAvailableGenres] = useState([]);
  const router = useRouter();

  // const searchType="patients"
  
  // État pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateDeNaissance: '',
    genre: '',
    profession: '',
    domicile: ''
  });
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState({});
  
  // État pour la soumission du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fonction pour charger les patients depuis Firebase
  const loadPatientsFromFirebase = async () => {
    try {
      console.log('Chargement des patients depuis Firebase...');
      const patientsData = await firebaseService.getAllPatients();
      console.log('Données de Firebase chargées:', JSON.stringify(patientsData, null, 2));
      
      // Filtrer les données invalides
      const validData = patientsData.filter(item => item !== null && item !== undefined);
      
      // Vérifier si nous avons des données valides
      if (validData.length > 0) {
        setPatients(validData);
        setFilteredPatients(validData);
        console.log('Patients chargés avec succès depuis Firebase:', validData.length);
        return true;
      } else {
        console.warn('Aucune donnée valide récupérée depuis Firebase');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des patients depuis Firebase:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        
        // Charger les données depuis Firebase
        const firebaseSuccess = await loadPatientsFromFirebase();
        
        if (!firebaseSuccess) {
          console.error('Échec du chargement des patients depuis Firebase');
          setPatients([]);
          setFilteredPatients([]);
          setSubmitError('Impossible de charger les patients depuis Firebase. Veuillez réessayer plus tard.');
        }
        
        // Vérifier la connexion à Algolia
        try {
          const algoliaConnected = await algoliaService.checkConnection();
          console.log('État de la connexion Algolia:', algoliaConnected);
          setIsUsingAlgolia(algoliaConnected);
          
          if (algoliaConnected) {
            console.log('Algolia est connecté et prêt à être utilisé');
            const genres = await algoliaService.getGenreFacets();
            setAvailableGenres(genres);
          }
        } catch (algoliaError) {
          console.warn('Impossible de se connecter à Algolia:', algoliaError);
          setIsUsingAlgolia(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
        setLoading(false);
        setSubmitError('Une erreur est survenue lors du chargement des données.');
      }
    };

    loadPatients();
  }, []);

  // Recherche locale simplifiée
  const handleSearch = (searchInfo) => {
    if (!searchInfo || !searchInfo.query) {
      setFilteredPatients(patients);
      return;
    }

    console.log('Recherche avec:', searchInfo.query);
    const query = searchInfo.query.toLowerCase().trim();
    
    if (query === '') {
      setFilteredPatients(patients);
      return;
    }
    
    const results = patients.filter(patient => {
      if (!patient) return false;
      
      // Recherche simplifiée dans tous les champs textuels
      const searchIn = (field) => {
        return patient[field] && String(patient[field]).toLowerCase().includes(query);
      };
      
      return (
        searchIn('nom') || 
        searchIn('prenom') || 
        searchIn('genre') || 
        searchIn('profession') || 
        searchIn('domicile') || 
        searchIn('phone') || 
        searchIn('email')
      );
    });
    
    console.log(`Trouvé ${results.length} résultats`);
    setFilteredPatients(results);
  };

  // Effacer la recherche
  const handleClearSearch = () => {
    setFilteredPatients(patients);
  };

  const handleEdit = (patient) => {
    console.log('Modifier le patient:', patient.id);
    router.push(`/patients/edit?id=${patient.id}`);
  };

  const handleDelete = async (id) => {
    try {
      console.log('Tentative de suppression du patient:', id);
      await firebaseService.deletePatient(id);
      
      // Mettre à jour la liste après suppression
      setPatients(patients.filter(patient => patient && patient.id !== id));
      setFilteredPatients(filteredPatients.filter(patient => patient && patient.id !== id));
      console.log('Patient supprimé avec succès:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleAddPatient = () => {
    router.push('/patients/nouveau-patient');
  };
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Supprimer l'erreur lorsque l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs obligatoires
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.dateDeNaissance) newErrors.dateDeNaissance = 'La date de naissance est requise';
    if (!formData.genre) newErrors.genre = 'Le genre est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        console.log('Tentative d\'ajout du patient avec les données:', formData);
        // Enregistrer le patient dans Firebase
        const newPatient = await firebaseService.addPatient(formData);
        console.log('Patient ajouté avec succès:', newPatient);
        
        setIsSubmitting(false);
        setSubmitSuccess(true);
        
        // Ajouter le nouveau patient à la liste
        setPatients([...patients, newPatient]);
        setFilteredPatients([...filteredPatients, newPatient]);
        
        // Fermer le modal après un court délai
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors de la création du patient:', error);
        setIsSubmitting(false);
        setSubmitError(`Erreur lors de la création du patient: ${error.message}`);
      }
    } else {
      // Faire défiler jusqu'à la première erreur
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  };

  // Fonction pour recharger les patients après ajout

  const handleGenreFilter = async (genre) => {
    try {
      setLoading(true);
      setSelectedGenre(genre);
      
      const results = await algoliaService.searchPatientsByGenre(genre);
      setSearchResults(results);
      setLoading(false);
    } catch (err) {
      console.error(`Erreur lors de la recherche par genre ${genre}:`, err);
      setLoading(false);
    }
  };

  const handleAdmissionClick = (patient) => {
    router.push(`/patients/admission?id=${patient.id}`);
  };

  const displayedPatients = searchResults && searchResults.hits ? searchResults.hits : filteredPatients;

  // Fonction pour recharger les patients après ajout
  const reloadPatients = async () => {
    await loadPatientsFromFirebase();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="grow">
              <h1 className="text-2xl font-semibold text-gray-300">Liste des patients</h1>
            <p className="mt-1 text-sm text-secondary">
              Gérer les patients enregistrés dans le système.
            </p>
          </div>
        </div>
            

        {isUsingAlgolia && availableGenres.length > 0 && (
          <div className="mb-6 flex justify-between gap-20">
            <div className="mb-6">            
              <h2 className="text-lg text-gray-300 font-semibold mb-2 flex items-center">
                <FiFilter className="mr-2" /> Filtrer par genre
              </h2>
              <div className="flex flex-wrap gap-3">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreFilter(genre)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedGenre === genre
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
                {selectedGenre && (
                  <button
                    onClick={() => handleClearSearch()}
                    className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Effacer le filtre
                  </button>
                )}
              </div>
            </div>
            <div className="flex grow items-end gap-5 mb-4 ml-10">
              <div className="flex grow px-15">
              <SearchBar 
                  placeholder="Rechercher un patient par nom, prénom, email ou téléphone..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                  className="w-full text-md text-gray-200"
              />
              </div>
              <button
                onClick={handleAddPatient}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center whitespace-nowrap"
              >
                  <FiUserPlus className="inline mr-2" />
                  Nouveau patient
              </button>
            </div>
          
          </div>
        )}

        {submitError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-custom dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-h-[70vh]">
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-custom-3 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-300">Nom et Prénom</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-300">Date de naissance</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-300">Genre</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-300">Téléphone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-300">Domicile</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 ">
                  {displayedPatients.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-3 py-4 text-center text-md text-gray-300 dark:text-gray-400">
                        Aucun patient trouvé
                      </td>
                    </tr>
                  ) : (
                    displayedPatients
                      .filter(patient => patient !== null && patient !== undefined)
                      .map((patient) => (
                        <tr key={patient.id || patient.objectID || `patient-${Math.random()}`} className="hover:bg-gray-500 hover:bg-opacity-20 dark:hover:bg-gray-600 text-gray-300 dark:text-gray-200">
                          <td className="px-2 py-2 whitespace-nowrap font-regular">{patient.nom || 'Sans nom'} <span className='pl-2'> {patient.prenom || ''} </span></td>
                          <td className="px-2 py-2 whitespace-nowrap font-regular">{formatFirebaseDate(patient.dateDeNaissance)}</td>
                          <td className="px-2 py-2 whitespace-nowrap font-regular">{patient.genre === 'Masculin' ? 'M' : (patient.genre === 'Féminin' ? 'F' : patient.genre || 'N/A')}</td>
                          <td className="px-2 py-2 font-regular">{patient.phone || 'N/A'}</td>
                          <td className="px-2 py-2 font-regular">{patient.domicile || 'N/A'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(patient)}
                                className="text-orange-300 hover:text-yellow-300 hover:font-semibold dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded border border-gray-600 bg-orange-400 bg-opacity-20 dark:bg-blue-900/30 dark:border-blue-700 shadow hover:shadow-md hover:shadow-gray-700 flex items-center gap-1" 
                                title="Modifier"
                              >Editer
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => router.push(`/patients/view?id=${patient.id}`)}
                                className="text-blue-300 hover:text-blue-400 hover:font-semibold dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded border border-gray-600 bg-blue-400 bg-opacity-20 dark:bg-blue-900/30 dark:border-blue-700 shadow hover:shadow-md hover:shadow-gray-700 flex items-center gap-1"
                                title="Afficher"
                              >Afficher
                                <FiUser size={16} />
                              </button>
                              <button
                                onClick={() => handleAdmissionClick(patient)}
                                className="text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 px-2 py-1 rounded flex items-center gap-1"
                                title="Admission"
                              >Admission
                                <FiCalendar size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Les modales ont été remplacées par des pages complètes */}
      </div>
    </Layout>
  );
};

export default PatientsList;

