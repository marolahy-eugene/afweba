import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiUsers, FiDatabase, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';

const SyncTriggerPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ type: 'info', message: 'La synchronisation est maintenant opérationnelle.' });

  const triggerSync = async (type = 'all') => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch(`/api/sync-algolia?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la synchronisation');
      }

      setResult(data);
    } catch (err) {
      console.error('Erreur de synchronisation:', err);
      setError(err.message || 'Une erreur est survenue lors de la synchronisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Synchronisation avec Algolia</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="mb-4 text-gray-700">
            Cette page vous permet de synchroniser manuellement les données de Firebase vers Algolia pour améliorer les fonctionnalités de recherche.
          </p>
          
          {status && (
            <div className={`p-4 ${status.type === 'info' ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'} border-l-4 rounded-md mb-4`}>
              <p className={`${status.type === 'info' ? 'text-blue-700' : 'text-green-700'}`}>{status.message}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => triggerSync('all')}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-md ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {loading ? (
                <span className="animate-spin mr-2">
                  <FiRefreshCw />
                </span>
              ) : (
                <FiDatabase className="mr-2" />
              )}
              Synchroniser toutes les données
            </button>
            
            <button
              onClick={() => triggerSync('patients')}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-md ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white transition-colors`}
            >
              {loading ? (
                <span className="animate-spin mr-2">
                  <FiRefreshCw />
                </span>
              ) : (
                <FiUsers className="mr-2" />
              )}
              Synchroniser les patients uniquement
            </button>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-md mb-4">
              <div className="animate-spin mr-3">
                <FiRefreshCw className="text-blue-600" />
              </div>
              <span className="text-blue-600">Synchronisation en cours...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md mb-4">
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-500 mr-2" />
                <h3 className="text-red-800 font-medium">Erreur</h3>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                <h3 className="text-green-800 font-medium">Synchronisation réussie</h3>
              </div>
              <p className="text-green-700 mt-2">{result.message}</p>
              {result.result && (
                <div className="mt-2 text-sm text-green-600">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(result.result, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">À propos de la synchronisation</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Pourquoi synchroniser ?</strong> La synchronisation est nécessaire pour que les données de Firebase soient disponibles dans Algolia pour les recherches avancées.
            </p>
            <p>
              <strong>Fréquence :</strong> La synchronisation devrait être effectuée après des modifications importantes de données ou périodiquement pour maintenir l'index de recherche à jour.
            </p>
            <p>
              <strong>Données synchronisées :</strong> Les patients et leurs informations associées sont synchronisés pour permettre une recherche rapide et efficace.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SyncTriggerPage;