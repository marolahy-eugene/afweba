import React from 'react';
import { FiX } from 'react-icons/fi';
import ExamenForm from './ExamenForm';

/**
 * Composant Modal pour afficher le formulaire d'examen
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - Si le modal est ouvert ou non
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du modal
 * @param {Object} props.initialData - Données initiales de l'examen
 * @param {Function} props.onSubmit - Fonction appelée à la soumission du formulaire
 */
const ExamenFormModal = ({ open, onClose, initialData = {}, onSubmit, size = 'max-w-lg', positionClasses = 'items-center justify-center' }) => {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto flex ${positionClasses}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
        </div>

        {/* Modal */}
        <div 
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:${size} sm:w-full`}
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-headline"
        >
          {/* En-tête du modal */}
          <div className="flex justify-between items-center px-6 pt-5 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-headline">
              {initialData.id ? 'Modifier l\'examen' : 'Nouvel examen'}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          {/* Corps du modal */}
          <div className="px-6 py-4 bg-custom">
            <ExamenForm 
              initialData={initialData} 
              onSubmit={(formData) => {
                onSubmit(formData);
                onClose();
              }} 
              onCancel={onClose} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamenFormModal;