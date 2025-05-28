import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { FiArrowLeft, FiUser, FiCalendar, FiHome, FiPhone, FiMail, FiBriefcase, FiLoader } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';

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

export default function ViewPatientPage() {
  const router = useRouter();
  const { id } = router.query;
  
  // États
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Charger les données du patient
  useEffect(() => {
    const loadPatient = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const patientData = await firebaseService.getPatientById(id);
        
        if (patientData) {
          setPatient(patientData);
        } else {
          // Patient non trouvé
          setError('Patient non trouvé');
          setTimeout(() => {
            router.push('/patients/list');
          }, 2000);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du patient:', error);
        setError('Impossible de charger les données du patient.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPatient();
  }, [id, router]);

  const handleEdit = () => {
    router.push(`/patients/edit?id=${id}`);
  };

  const handleAdmission = () => {
    router.push(`/patients/admission?id=${id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiLoader className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement des données du patient...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()} 
              className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Détails du patient</h1>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-300">Détails du patient</h1>
        </div>

        {patient && (
          <div className="bg-custom dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-300 mb-2 flex items-center">
                    <FiUser className="mr-2" /> 
                    {patient.nom} {patient.prenom}
                  </h2>
                  <p className="text-gray-400">
                    {patient.genre === 'Masculin' ? 'M' : (patient.genre === 'Féminin' ? 'F' : patient.genre || 'N/A')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="text-orange-300 hover:text-yellow-300 hover:font-semibold dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 rounded border border-gray-600 bg-orange-400 bg-opacity-20 dark:bg-blue-900/30 dark:border-blue-700 shadow hover:shadow-md hover:shadow-gray-700 flex items-center gap-1"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleAdmission}
                    className="text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 px-3 py-2 rounded flex items-center gap-1"
                  >
                    Admission
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-custom-2 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">Informations personnelles</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FiCalendar className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Date de naissance</p>
                        <p className="text-gray-300">{formatFirebaseDate(patient.dateDeNaissance)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiBriefcase className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Profession</p>
                        <p className="text-gray-300">{patient.profession || 'Non spécifiée'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiHome className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Domicile</p>
                        <p className="text-gray-300">{patient.domicile || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-custom-2 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">Coordonnées</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FiPhone className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Téléphone</p>
                        <p className="text-gray-300">{patient.phone || 'Non spécifié'}</p>
                      </div>
                    </div>
                    
                    {patient.phoneAssurance && (
                      <div className="flex items-start">
                        <FiPhone className="mt-1 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Téléphone assurance</p>
                          <p className="text-gray-300">{patient.phoneAssurance}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <FiMail className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">E-mail</p>
                        <p className="text-gray-300">{patient.email || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {patient.assuranceMaladie && (
                  <div className="bg-custom-2 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-300 mb-4">Assurance maladie</h3>
                    <p className="text-gray-300">{patient.assuranceMaladie}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}