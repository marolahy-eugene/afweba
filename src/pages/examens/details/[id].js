import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import firebaseService from '@/services/firebaseService';
import { useRouter } from 'next/router';
import ExamenFormModal from '@/components/examen/ExamenFormModal';
import { formatFirebaseDate } from '@/utils/firebaseUtils';

export default function ExamenDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [examen, setExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadExamenData = async () => {
      if (id) {
        try {
          setLoading(true);
          const examenData = await firebaseService.getExamenById(id);
          if (examenData) {
            setExamen(examenData);
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

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Fonction pour gérer la soumission du formulaire d'examen
  const handleSubmitExamen = async (formData) => {
    try {
      // Ici, vous pouvez ajouter la logique pour enregistrer l'examen
      console.log('Données du formulaire soumises:', formData);
      await firebaseService.addExamen(formData);
      
      // Rediriger vers le tableau de bord après la création
      router.push('/dashboard/infirmier');
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'examen:', err);
      alert('Une erreur est survenue lors de l\'enregistrement de l\'examen.');
    }
  };

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

          <div className="w-[85%] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 min-h-[70vh] flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                L'examen que vous recherchez n'a pas été trouvé. Vous pouvez créer un nouvel examen en cliquant sur le bouton ci-dessous.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center mx-auto"
              >
                <FiPlus className="mr-2" />
                Créer un nouvel examen
              </button>
            </div>
          </div>

          {/* Modal pour le formulaire d'examen */}
          <ExamenFormModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitExamen}
            initialData={{}}
            // Ajoutez les props size et positionClasses ici pour contrôler la taille et la position
            size="max-w-2xl" // Exemple: 'max-w-xl', 'max-w-2xl', etc.
            positionClasses="items-start justify-center mt-10" // Exemple: 'items-center justify-center', 'items-start justify-end mt-10'
          />
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
    <Layout>
      <div className="p-6">
        <div className="flex items-center mt-7 mb-10">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-200 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white bg-sutom p-2 rounded-md shadow-md"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-semibold text-gray-200 dark:text-white">
            Détails de l'examen {examen.id}
          </h1>
        </div>

        <div className="w-[85%] mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 min-h-[70vh]">
          {/* Afficher les détails de l'examen ici */}
          <div className="space-y-6 text-xl">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">ID Examen</label>
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl flex items-center">{examen.id}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Patient</label>
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl flex items-center">{examen.patientNom} {examen.patientPrenom} (ID: {examen.patientId})</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'examen</label>
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl flex items-center">{examen.type}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Date de création</label>
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl flex items-center">{formatFirebaseDate(examen.dateCreation)}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white h-[45px] text-xl flex items-center">{examen.etat}</p>
            </div>
            {/* Ajoutez d'autres champs pertinents de l'examen ici */}
          </div>
        </div>
      </div>
    </Layout>
  );
}