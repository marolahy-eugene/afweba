import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import ObservationForm from '@/components/observation/ObservationForm';
import firebaseService from '@/services/firebaseService';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

export default function ObservationPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [examen, setExamen] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExamenData = async () => {
      if (id) {
        try {
          setLoading(true);
          const examenData = await firebaseService.getExamenById(id);
          if (examenData) {
            setExamen(examenData);
            
            // Récupérer les informations du patient
            if (examenData.patientId) {
              const patientData = await firebaseService.getPatientById(examenData.patientId);
              if (patientData) {
                setPatient(patientData);
              }
            }
          } else {
            setError('Examen non trouvé');
          }
        } catch (err) {
          console.error('Erreur lors du chargement de l\'examen:', err);
          setError('Impossible de charger les données de l\'examen');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadExamenData();
  }, [id]);

  const handleSuccess = () => {
    // Rediriger vers le tableau de bord après l'enregistrement réussi
    router.push('/dashboard/infirmier');
  };

  const handleCancel = () => {
    // Retourner au tableau de bord sans enregistrer
    router.push('/dashboard/infirmier');
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center mt-7 mb-10">
            <button 
              onClick={() => router.back()} 
              className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              {error}
            </h1>
          </div>

          <div className="w-[85%] mx-auto bg-custom shadow shadow-md shadow-blue-400 bg-opacity-60 dark:bg-gray-800 rounded-lg shadow-md p-8 min-h-[70vh] flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <p className="text-2xl text-gray-300 dark:text-gray-400 mb-6">
                L'examen que vous recherchez n'a pas été trouvé ou vous n'avez pas les permissions nécessaires.
              </p>
              <button
                onClick={() => router.push('/dashboard/infirmier')}
                className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!examen) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-[80vh]">
          <div className="text-gray-500 dark:text-gray-400">Aucune donnée d'examen disponible.</div>
        </div>
      </Layout>
    );
  }

  return (

    <>
      <div className="fixed top-16 left-60 right-0 bg-custom-2 z-10 px-6 py-4 flex items-center shadow-md">
        <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-200 hover:text-gray-400 dark:text-gray-300 dark:hover:text-white rounded-md shadow-md bg-gray-600 hover:bg-gray-700 p-2"
          >
            <FiArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-200 dark:text-white ml-4">
        Observation de l'examen : {patient ? `${patient.nom} ${patient.prenom}` : examen.id}
        </h2>
      </div>
      <Layout>
      <div className="p-6">

          {/* Espace pour compenser l'en-tête fixe */}
          <div className="pt-20"></div>
          
          <div className="w-full mx-auto">
            <ObservationForm 
              examen={examen} 
              user={user} 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
              patient={patient}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}