import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';
import firebaseService from '@/services/firebaseService';
import MedecinForm from '@/components/medecin/MedecinForm';

const NewMedecin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ajouter des champs supplémentaires
      const medecinData = {
        ...formData,
        createdAt: new Date()
      };
      
      await firebaseService.addMedecin(medecinData);
      router.push('/medecins');
    } catch (err) {
      console.error("Erreur lors de l'ajout du médecin :", err);
      setError("Impossible d'ajouter le médecin. Veuillez réessayer plus tard.");
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Nouveau médecin</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <MedecinForm 
            onSubmit={handleSubmit} 
            onCancel={() => router.back()}
          />
        </div>
        
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewMedecin; 