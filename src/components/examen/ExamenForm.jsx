import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import MedecinSelector from '@/components/common/MedecinSelector';

/**
 * Composant de formulaire pour les examens
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.initialData - Données initiales de l'examen
 * @param {Function} props.onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} props.onCancel - Fonction appelée à l'annulation
 */
const ExamenForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // État du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState({
    codeExamen: '',
    dateExamen: new Date().toISOString().split('T')[0],
    tarification: 'Plein tarif',
    medecinId: '',
  });

  // Options de tarification
  const tarificationOptions = [
    'Plein tarif',
    'Réduction 20%',
    'Réduction 40%',
    'Majoration 20%',
    'Majoration 40%'
  ];

  // Mettre à jour le formulaire avec les données initiales une seule fois au chargement
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Formater la date pour l'input de type date
      let dateExamen = initialData.dateExamen;
      if (typeof dateExamen === 'object' && 'seconds' in dateExamen) {
        const date = new Date(dateExamen.seconds * 1000);
        dateExamen = date.toISOString().split('T')[0];
      }

      setFormData({
        codeExamen: initialData.codeExamen || '',
        dateExamen: dateExamen || new Date().toISOString().split('T')[0],
        tarification: initialData.tarification || 'Plein tarif',
        medecinId: initialData.medecinId || ''
      });
    }
  }, []); // Déclenchement unique au montage

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion du changement de médecin
  const handleMedecinChange = (medecinId) => {
    setFormData(prev => ({
      ...prev,
      medecinId
    }));
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="codeExamen" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Code de l'examen
        </label>
        <input
          type="text"
          id="codeExamen"
          name="codeExamen"
          value={formData.codeExamen}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="EX-001"
        />
      </div>

      <div>
        <label htmlFor="dateExamen" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date de l'examen
        </label>
        <input
          type="date"
          id="dateExamen"
          name="dateExamen"
          value={formData.dateExamen}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="tarification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tarification
        </label>
        <select
          id="tarification"
          name="tarification"
          value={formData.tarification}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          {tarificationOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="medecinId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Médecin
        </label>
        <MedecinSelector 
          value={formData.medecinId} 
          onChange={handleMedecinChange}
          required={true}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <FiX className="inline-block mr-2 w-150" />
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <FiSave className="inline-block mr-2 w-150" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default ExamenForm;