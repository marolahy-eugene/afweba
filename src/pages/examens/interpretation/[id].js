import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import InterpretationForm from '@/components/interpretation/InterpretationForm';
import firebaseService from '@/services/firebaseService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * Page d'interprétation d'un examen EEG
 */
export default function InterpretationPage({ examenInitial, patientInitial, errorInitial }) {
  const router = useRouter();
  const { id } = router.query;
  const { user, userRole } = useAuth();
  
  const [examen, setExamen] = useState(examenInitial || null);
  const [patient, setPatient] = useState(patientInitial || null);
  const [loading, setLoading] = useState(!examenInitial);
  const [error, setError] = useState(errorInitial || null);

  // Récupérer les données de l'examen côté client si nécessaire
  useEffect(() => {
    // Si nous avons déjà les données du rendu statique, ne pas refaire l'appel
    if (examenInitial || !id) return;
    
    const fetchExamen = async () => {
      try {
        setLoading(true);
        const examenData = await firebaseService.getExamenById(id);
        
        if (!examenData) {
          setError('Examen non trouvé');
          return;
        }
        
        setExamen(examenData);
        
        // Récupérer les informations du patient
        if (examenData.patientId) {
          const patientData = await firebaseService.getPatientById(examenData.patientId);
          if (patientData) {
            setPatient(patientData);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'examen:', err);
        setError(`Une erreur est survenue: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamen();
  }, [id, examenInitial]);

  // Vérifier si l'utilisateur est autorisé à accéder à cette page
  useEffect(() => {
    if (!user || !userRole) return;
    
    if (userRole !== 'medecin') {
      router.push('/dashboard');
    }
  }, [user, userRole, router]);

  // Gérer le retour à la page de détails
  const handleBack = () => {
    router.push(`/examens/details/${id}`);
  };

  // Gérer le succès de l'interprétation
  const handleSuccess = () => {
    router.push(`/examens/details/${id}`);
  };

  return (
    <div>
      <div className="fixed top-16 left-60 right-0 bg-custom-3 z-10 px-6 py-4 flex items-center shadow-md">
        <button 
          onClick={() => router.back()} 
          className="mr-4 text-gray-200 hover:text-gray-400 dark:text-gray-300 dark:hover:text-white rounded-md shadow-md bg-gray-600 hover:bg-gray-700 p-2"
        >
          <FiArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-200 dark:text-white ml-4">
        Interpretation de l'examen : {patient ? `${patient.nom} ${patient.prenom}` : (examen ? examen.id : 'Chargement...')}
        </h2>
      </div>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          
          {loading ? (
            <LoadingSpinner message="Chargement de l'examen..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            
            <div className="w-full mx-auto">
            <InterpretationForm 
            examen={examen} 
              medecin={user} 
              onSuccess={handleSuccess} 
              onCancel={handleBack} 
              patient={patient}
            />
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

// Générer les chemins statiques pour les pages d'interprétation
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

// Récupérer les données pour le rendu statique
export async function getStaticProps({ params }) {
  const { id } = params;
  
  try {
    const examenData = await firebaseService.getExamenById(id);
    let patientData = null;
    
    if (examenData?.patientId) {
      patientData = await firebaseService.getPatientById(examenData.patientId);
    }
    
    return {
      props: {
        examenInitial: examenData || null,
        patientInitial: patientData || null,
      },
      revalidate: 60 // Revalider les pages toutes les 60 secondes
    };
  } catch (error) {
    return {
      props: {
        examenInitial: null,
        patientInitial: null,
        errorInitial: error.message
      }
    };
  }
}