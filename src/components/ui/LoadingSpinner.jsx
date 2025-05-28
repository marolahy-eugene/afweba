import React from 'react';
import { FiLoader } from 'react-icons/fi';

/**
 * Composant d'affichage d'un indicateur de chargement
 * @param {Object} props - Propriétés du composant
 * @param {string} props.message - Message à afficher pendant le chargement
 * @param {string} props.className - Classes CSS additionnelles
 */
const LoadingSpinner = ({ message = 'Chargement...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="animate-spin text-primary-600 mb-4">
        <FiLoader size={40} />
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-lg">{message}</p>
    </div>
  );
};

export default LoadingSpinner;