import React from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Composant Modal réutilisable.
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - Si le modal est ouvert ou non
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du modal
 * @param {string} props.title - Titre du modal
 * @param {React.ReactNode} props.children - Contenu du modal (le formulaire)
 * @param {string} [props.size='max-w-lg'] - Taille maximale du modal (classes Tailwind CSS)
 * @param {string} [props.bgColor='bg-white'] - Couleur de fond du modal (classes Tailwind CSS)
 * @param {string} [props.textColor='text-gray-900'] - Couleur du texte du modal (classes Tailwind CSS)
 * @param {string} [props.modalClasses=''] - Classes CSS supplémentaires pour le conteneur du modal (taille, position, etc.)
 */
const ReusableModal = ({ open, onClose, title, children, size = '', bgColor = 'bg-custom', textColor = 'text-gray-300', modalClasses = '' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
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
          className={`inline-block align-bottom ${bgColor} ${textColor} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:${size} sm:w-full ${modalClasses}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* En-tête du modal */}
          <div className="flex justify-between items-center px-6 pt-5 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium" id="modal-headline">
              {title}
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
          <div className="p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;