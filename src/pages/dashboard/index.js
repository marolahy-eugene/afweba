import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/common/Card.jsx';
import SearchBar from '@/components/search/SearchBar';
const { 
  FiUsers, FiActivity, FiFileText, FiCalendar, FiAlertCircle, 
  FiDownload, FiFileText: FiPdf, FiImage, FiEdit, FiEye, FiTrash, FiSearch,
  FiUserPlus, FiPlusCircle, FiClock, FiUpload
} = require('react-icons/fi');
const { RiFileExcel2Line } = require('react-icons/ri');
const { SiMicrosoftexcel } = require('react-icons/si');
import firebaseService from '@/services/firebaseService';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'next/link';
import { sanitizeFirestoreData, formatFirebaseDate, calculateAge } from '@/utils/firebaseUtils';

/**
 * Page de redirection du tableau de bord en fonction du rôle
 */
export default function DashboardRouter() {
  const { user, isAuthenticated, loading, ROLES } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        router.replace('/login');
        return;
      }

      // Rediriger vers le tableau de bord spécifique en fonction du rôle
      if (user && user.role) {
        switch (user.role) {
          case ROLES.RECEPTIONNISTE:
            router.replace('/dashboard/receptionniste');
            break;
          case ROLES.INFIRMIER:
            router.replace('/dashboard/infirmier');
            break;
          case ROLES.MEDECIN:
            router.replace('/dashboard/medecin');
            break;
          case ROLES.PROFESSEUR:
            router.replace('/dashboard/professeur');
            break;
          default:
            // Rediriger vers un tableau de bord par défaut si le rôle n'est pas reconnu
            router.replace('/dashboard/receptionniste');
        }
      } else {
        // Rediriger vers le tableau de bord du réceptionniste par défaut
        router.replace('/dashboard/receptionniste');
      }
    }
  }, [loading, isAuthenticated, user, router, ROLES]);

  // Afficher un simple message sans animation pendant la redirection
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">Chargement du tableau de bord...</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();
  // États pour les tableaux
  const [patientsCurrentPage, setPatientsCurrentPage] = useState(1);
  const [analysesCurrentPage, setAnalysesCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [analysesPerPage] = useState(5);
  const [isUsingAlgolia, setIsUsingAlgolia] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientCount, setPatientCount] = useState(0);
  const [analysesCount, setAnalysesCount] = useState(0);
  
  // Données fictives pour le tableau des patients
  const patients = [
    { id: 'P-001', nom: 'Dupont', prenom: 'Jean', age: 45, sexe: 'M', dateCreation: '12/01/2023', statut: 'Actif' },
    { id: 'P-002', nom: 'Martin', prenom: 'Sophie', age: 32, sexe: 'F', dateCreation: '15/01/2023', statut: 'Actif' },
    { id: 'P-003', nom: 'Petit', prenom: 'Pierre', age: 58, sexe: 'M', dateCreation: '20/01/2023', statut: 'Inactif' },
    { id: 'P-004', nom: 'Durand', prenom: 'Marie', age: 27, sexe: 'F', dateCreation: '25/01/2023', statut: 'Actif' },
    { id: 'P-005', nom: 'Leroy', prenom: 'Patrick', age: 64, sexe: 'M', dateCreation: '01/02/2023', statut: 'Actif' },
  ];
  
  // Données fictives pour le tableau des analyses
  const analyses = [
    { id: 'A-001', patientId: 'P-001', type: 'EEG Standard', date: '15/01/2023', statut: 'Terminé', resultat: 'Normal' },
    { id: 'A-002', patientId: 'P-002', type: 'EEG Prolongé', date: '18/01/2023', statut: 'Terminé', resultat: 'Anomalie détectée' },
    { id: 'A-003', patientId: 'P-003', type: 'EEG Standard', date: '22/01/2023', statut: 'Terminé', resultat: 'Normal' },
    { id: 'A-004', patientId: 'P-001', type: 'EEG Vidéo', date: '30/01/2023', statut: 'En cours', resultat: 'En attente' },
    { id: 'A-005', patientId: 'P-005', type: 'EEG Standard', date: '02/02/2023', statut: 'Terminé', resultat: 'Normal' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        try {
          // Utiliser des données fictives immédiatement pour un affichage rapide
          setAllPatients(patients);
          setFilteredPatients(patients);
          setPatientCount(patients.length);
          
          setAllAnalyses(analyses);
          setFilteredAnalyses(analyses);
          setAnalysesCount(analyses.length);
          
          // Charger les vraies données en arrière-plan
          const patientsData = await firebaseService.getAllPatients();
          
          if (patientsData && Array.isArray(patientsData)) {
            const cleanPatientsData = sanitizeFirestoreData(patientsData);
            
            const formattedPatients = cleanPatientsData.map(patient => {
              if (!patient) return null;
              return {
                id: patient.id || 'Unknown',
                nom: patient.nom || 'Sans nom',
                prenom: patient.prenom || '',
                age: calculateAge(patient.dateDeNaissance) || 'N/A',
                sexe: patient.genre?.charAt(0) || 'N/A',
                dateCreation: formatFirebaseDate(patient.createdAt),
                statut: 'Actif'
              };
            }).filter(p => p !== null);
            
            setAllPatients(formattedPatients);
            setFilteredPatients(formattedPatients);
            setPatientCount(formattedPatients.length);
          }
          
          const analysesData = await firebaseService.getAllAnalyses();
          
          if (analysesData && Array.isArray(analysesData)) {
            const cleanAnalysesData = sanitizeFirestoreData(analysesData);
            
            const formattedAnalyses = cleanAnalysesData.map(analyse => {
              if (!analyse) return null;
              return {
                id: analyse.id || 'Unknown',
                patientId: analyse.id_patient || 'N/A',
                type: analyse.type_analyse || 'Standard',
                date: formatFirebaseDate(analyse.date_enregistrement),
                statut: analyse.status || 'Terminé',
                resultat: analyse.resultat || 'En attente'
              };
            }).filter(a => a !== null);
            
            setAllAnalyses(formattedAnalyses);
            setFilteredAnalyses(formattedAnalyses);
            setAnalysesCount(formattedAnalyses.length);
            
            setIsUsingAlgolia(true);
          }
        } catch (error) {
          console.error('Erreur lors du chargement depuis Firebase:', error);
          // Les données fictives sont déjà chargées, donc pas besoin de les recharger
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur globale lors du chargement des données:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Calcul de la pagination
  const indexOfLastPatient = patientsCurrentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.length > 0 
    ? filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient) 
    : patients.slice(indexOfFirstPatient, indexOfLastPatient);
  
  const indexOfLastAnalysis = analysesCurrentPage * analysesPerPage;
  const indexOfFirstAnalysis = indexOfLastAnalysis - analysesPerPage;
  const currentAnalyses = filteredAnalyses.length > 0 
    ? filteredAnalyses.slice(indexOfFirstAnalysis, indexOfLastAnalysis) 
    : analyses.slice(indexOfFirstAnalysis, indexOfLastAnalysis);
  
  // Fonction pour changer de page
  const paginate = (pageNumber, setPage) => setPage(pageNumber);
  
  // Simuler l'exportation des données
  const handleExport = (type, dataType) => {
    alert(`Export des données ${dataType} au format ${type} en cours...`);
  };

  // Gestionnaire pour les résultats de recherche de patients
  const handlePatientSearchResults = (results) => {
    if (results && results.hits && results.hits.length > 0) {
      // Nettoyer les objets Firestore dans les résultats
      const cleanResults = sanitizeFirestoreData(results.hits);
      
      // Adapter les résultats d'Algolia au format attendu
      const adaptedResults = cleanResults.map(result => ({
        id: result.id || result.objectID,
        nom: result.nom,
        prenom: result.prenom,
        age: calculateAge(result.dateDeNaissance) || 'N/A',
        sexe: result.genre?.charAt(0) || 'N/A',
        dateCreation: formatFirebaseDate(result.createdAt),
        statut: 'Actif' // Valeur par défaut
      }));
      
      setFilteredPatients(adaptedResults);
      setPatientsCurrentPage(1); // Revenir à la première page
    } else if (results && results.hits && results.hits.length === 0) {
      setFilteredPatients([]);
    } else {
      setFilteredPatients(allPatients.length > 0 ? allPatients : patients);
    }
  };

  // Gestionnaire pour les résultats de recherche d'analyses
  const handleAnalysisSearchResults = (results) => {
    if (results && results.hits && results.hits.length > 0) {
      // Nettoyer les objets Firestore dans les résultats
      const cleanResults = sanitizeFirestoreData(results.hits);
      
      // Adapter les résultats d'Algolia au format attendu
      const adaptedResults = cleanResults.map(result => ({
        id: result.id || result.objectID,
        patientId: result.id_patient || 'N/A',
        type: result.type_analyse || result.type || 'N/A',
        date: formatFirebaseDate(result.date_enregistrement) || result.date || 'N/A',
        statut: result.status || 'N/A',
        resultat: result.resultat || 'En attente' // Valeur par défaut
      }));
      
      setFilteredAnalyses(adaptedResults);
      setAnalysesCurrentPage(1); // Revenir à la première page
    } else if (results && results.hits && results.hits.length === 0) {
      setFilteredAnalyses([]);
    } else {
      setFilteredAnalyses(allAnalyses.length > 0 ? allAnalyses : analyses);
    }
  };

  // Données fictives pour les rendez-vous récents
  const recentAppointments = [
    { id: 1, patient: 'Martin Sophie', type: 'EEG Standard', date: '15/04/2023', status: 'Prévu' },
    { id: 2, patient: 'Dubois Robert', type: 'EEG Prolongé', date: '16/04/2023', status: 'Prévu' },
    { id: 3, patient: 'Richard Emma', type: 'EEG Standard', date: '18/04/2023', status: 'Prévu' },
  ];
  
  // Données fictives pour les activités récentes
  const recentActivities = [
    { id: 1, text: 'Analyse EEG #A-234 terminée', time: 'Il y a 2 heures' },
    { id: 2, text: 'Nouveau patient ajouté: Thomas Laurent', time: 'Il y a 4 heures' },
    { id: 3, text: 'Rapport généré pour le patient ID P-178', time: 'Il y a 1 jour' },
    { id: 4, text: 'Mise à jour du logiciel d\'analyse', time: 'Il y a 2 jours' },
  ];

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bienvenue, Dr. John Doe. Voici un résumé de votre activité.
        </p>
        
        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={<FiUsers className="h-6 w-6 text-blue-600" />}
            title="Patients"
            value={patientCount.toString()}
            color="blue"
          />
          
          <StatCard 
            icon={<FiActivity className="h-6 w-6 text-green-600" />}
            title="EEGs réalisés"
            value={analysesCount.toString()}
            color="green"
          />
          
          <StatCard 
            icon={<FiCalendar className="h-6 w-6 text-purple-600" />}
            title="Rendez-vous"
            value="12"
            color="purple"
          />
          
          <StatCard 
            icon={<FiAlertCircle className="h-6 w-6 text-amber-600" />}
            title="En attente d'analyse"
            value="7"
            color="amber"
          />
        </div>

        {/* Actions rapides */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <button 
              onClick={() => router.push('/patients/new')}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                <FiUserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Nouveau patient</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ajouter un patient</span>
            </button>
            
            <button 
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3">
                <FiPlusCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Nouvelle analyse</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enregistrer une analyse</span>
            </button>
            
            <button 
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
                <FiClock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Rendez-vous</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Planifier un RDV</span>
            </button>
            
            <Link href="/sync-trigger">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-3">
                  <FiUpload className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Synchronisation</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mettre à jour Algolia</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Activités et rendez-vous */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Rendez-vous récents */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Rendez-vous à venir</h2>
            </div>
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentAppointments.map((appointment) => (
                  <li key={appointment.id} className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-800 font-medium">
                            {appointment.patient.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {appointment.patient}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {appointment.type} - {appointment.date}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'Terminé' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Activités récentes */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Activités récentes</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <FiActivity className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.text}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Tableau des patients */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Liste des patients
            </h2>
            
            {true && (
              <div className="mt-2 md:mt-0 md:ml-4 w-full md:w-auto">
                <SearchBar 
                  placeholder="Rechercher un patient..." 
                  searchType="patients"
                  onResults={handlePatientSearchResults}
                  className="w-full md:w-64"
                />
              </div>
            )}
          </div>
          
          <Card>
            <div className="mb-4 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-medium">Patients</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleExport('pdf', 'patients')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm flex items-center hover:bg-red-200 transition-colors"
                >
                  <FiPdf className="mr-1" /> PDF
                </button>
                <button 
                  onClick={() => handleExport('excel', 'patients')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm flex items-center hover:bg-green-200 transition-colors"
                >
                  <SiMicrosoftexcel className="mr-1" /> Excel
                </button>
                <button 
                  onClick={() => handleExport('csv', 'patients')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center hover:bg-blue-200 transition-colors"
                >
                  <FiFileText className="mr-1" /> CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Prénom
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Âge
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sexe
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {currentPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {patient.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {patient.nom}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {patient.prenom}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {patient.age}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {patient.sexe}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.statut === 'Actif'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {patient.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <FiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        {/* Tableau des analyses */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Liste des analyses
            </h2>
            
            {true && (
              <div className="mt-2 md:mt-0 md:ml-4 w-full md:w-auto">
                <SearchBar 
                  placeholder="Rechercher une analyse..." 
                  searchType="analyses"
                  onResults={handleAnalysisSearchResults}
                  className="w-full md:w-64"
                />
              </div>
            )}
          </div>
          
          <Card>
            <div className="mb-4 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-medium">Analyses EEG</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleExport('pdf', 'analyses')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm flex items-center hover:bg-red-200 transition-colors"
                >
                  <FiPdf className="mr-1" /> PDF
                </button>
                <button 
                  onClick={() => handleExport('excel', 'analyses')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm flex items-center hover:bg-green-200 transition-colors"
                >
                  <SiMicrosoftexcel className="mr-1" /> Excel
                </button>
                <button 
                  onClick={() => handleExport('csv', 'analyses')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center hover:bg-blue-200 transition-colors"
                >
                  <FiFileText className="mr-1" /> CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Résultat
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {currentAnalyses.map((analyse) => (
                    <tr key={analyse.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {analyse.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {analyse.patientId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {analyse.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {analyse.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          analyse.statut === 'Terminé'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : analyse.statut === 'En cours'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                        }`}>
                          {analyse.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {analyse.resultat === 'Normal' 
                          ? <span className="text-green-600 dark:text-green-400">Normal</span> 
                          : analyse.resultat === 'Anomalie détectée'
                          ? <span className="text-red-600 dark:text-red-400">Anomalie détectée</span>
                          : <span className="text-gray-500 dark:text-gray-400">En attente</span>
                        }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <FiTrash className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            <FiDownload className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// Composant pour afficher une carte de statistique
function StatCard({ icon, title, value, color }) {
  const bgColorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30',
    amber: 'bg-amber-50 dark:bg-amber-900/30',
    red: 'bg-red-50 dark:bg-red-900/30'
  };

  return (
    <Card>
      <div className="p-4 flex items-center">
        <div className={`flex-shrink-0 ${bgColorClasses[color] || bgColorClasses.blue} rounded-md p-3`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {value}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>
        </div>
      </div>
    </Card>
  );
}