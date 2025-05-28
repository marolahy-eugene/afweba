import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';
import firebaseService from '@/services/firebaseService';
import ExamenForm from '@/components/examen/ExamenForm';
import { sanitizeFirestoreData } from '@/utils/firebaseUtils';

const EditExamen = () => {
  const router = useRouter();
  const { id } = router.query;
  const [examen, setExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamen = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await firebaseService.getExamenById(id);
        if (!data) {
          setError("Examen non trouvé");
          return;
        }
        
        // Nettoyer les données de Firebase
        const cleanData = sanitizeFirestoreData(data);
        setExamen(cleanData);
      } catch (err) {
        console.error("Erreur lors du chargement de l'examen :", err);
        setError("Impossible de charger l'examen. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamen();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      
      // Convertir la date au format Timestamp de Firebase
      const examenData = {
        ...formData,
        dateExamen: new Date(formData.dateExamen),
        updatedAt: new Date()
      };
      
      await firebaseService.updateExamen(id, examenData);
      router.push('/examens');
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'examen :", err);
      setError("Impossible de mettre à jour l'examen. Veuillez réessayer plus tard.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error && !examen) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.push('/examens')} 
              className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Erreur</h1>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Modifier l'examen</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <ExamenForm 
            initialData={examen}
            onSubmit={handleSubmit} 
            onCancel={() => router.back()}
          />
        </div>
        
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditExamen; 