import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * Composant d'affichage d'un message d'erreur
 * @param {Object} props - Propriétés du composant
 * @param {string} props.message - Message d'erreur à afficher
 * @param {string} props.className - Classes CSS additionnelles
 */
const ErrorMessage = ({ message, className = '' }) => {
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded-md ${className}`}>
      <div className="flex items-center">
        <FiAlertCircle className="text-red-500 mr-3" size={24} />
        <div>
          <p className="text-red-700 font-medium">Erreur</p>
          <p className="text-red-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;