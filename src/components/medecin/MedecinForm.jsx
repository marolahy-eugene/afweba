import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

/**
 * Composant de formulaire pour les médecins
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.initialData - Données initiales du médecin
 * @param {Function} props.onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} props.onCancel - Fonction appelée à l'annulation
 */
const MedecinForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // État du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    lieuDeTravail: '',
    numONM: '',
    specialite: '',
  });

  // Liste des spécialités médicales
  const specialites = [
    'Anesthésiologie',
    'Cardiologie',
    'Dermatologie',
    'Endocrinologie',
    'Gastro-entérologie',
    'Gériatrie',
    'Gynécologie',
    'Hématologie',
    'Médecine générale',
    'Médecine interne',
    'Neurologie',
    'Oncologie',
    'Ophtalmologie',
    'Orthopédie',
    'Oto-rhino-laryngologie',
    'Pédiatrie',
    'Pneumologie',
    'Psychiatrie',
    'Radiologie',
    'Rhumatologie',
    'Urologie'
  ];

  // Mettre à jour le formulaire avec les données initiales une seule fois au chargement
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        nom: initialData.nom || '',
        lieuDeTravail: initialData.lieuDeTravail || '',
        numONM: initialData.numONM || '',
        specialite: initialData.specialite || ''
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
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nom complet
        </label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Dr. Dupont Jean"
        />
      </div>

      <div>
        <label htmlFor="lieuDeTravail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Lieu de travail
        </label>
        <input
          type="text"
          id="lieuDeTravail"
          name="lieuDeTravail"
          value={formData.lieuDeTravail}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Hôpital Central, Paris"
        />
      </div>

      <div>
        <label htmlFor="numONM" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Numéro Ordre National des Médecins
        </label>
        <input
          type="text"
          id="numONM"
          name="numONM"
          value={formData.numONM}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="12345678"
        />
      </div>

      <div>
        <label htmlFor="specialite" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Spécialité
        </label>
        <select
          id="specialite"
          name="specialite"
          value={formData.specialite}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">-- Sélectionner une spécialité --</option>
          {specialites.map(specialite => (
            <option key={specialite} value={specialite}>{specialite}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <FiX className="inline-block mr-2" />
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <FiSave className="inline-block mr-2" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default MedecinForm; 