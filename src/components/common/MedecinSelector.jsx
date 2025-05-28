import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import firebaseService from '@/services/firebaseService';
import { sanitizeFirestoreData } from '@/utils/firebaseUtils';

/**
 * Composant de sélection de médecin
 * @param {Object} props - Propriétés du composant
 * @param {string} props.value - ID du médecin sélectionné
 * @param {Function} props.onChange - Fonction appelée lors du changement de sélection
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.required - Si le champ est requis
 */
const MedecinSelector = ({ value, onChange, className = '', required = false }) => {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMedecins();
  }, []);

  const loadMedecins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await firebaseService.getAllMedecins();
      const cleanData = sanitizeFirestoreData(data);
      setMedecins(cleanData);
    } catch (err) {
      console.error("Erreur lors du chargement des médecins:", err);
      setError("Impossible de charger la liste des médecins");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      {loading ? (
        <div className="flex items-center">
          <select
            disabled
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${className}`}
          >
            <option>Chargement...</option>
          </select>
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <FiRefreshCw className="animate-spin h-5 w-5 text-gray-400" />
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <select
            value={value || ''}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${className}`}
            required={required}
          >
            <option value="">-- Sélectionner un médecin --</option>
            {medecins.map(medecin => (
              <option key={medecin.id} value={medecin.id}>
                {medecin.nom} - {medecin.specialite}
              </option>
            ))}
          </select>
          {error && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={loadMedecins} title="Réessayer">
              <FiRefreshCw className="h-5 w-5 text-red-500 hover:text-red-600" />
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MedecinSelector;