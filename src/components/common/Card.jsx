import React from 'react';

/**
 * Composant Card
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Le contenu de la carte
 * @param {string} props.className - Classes CSS additionnelles
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Composant pour le titre de la carte
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du titre
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-medium text-gray-800 mb-4 ${className}`}>
    {children}
  </h3>
);

/**
 * Composant pour le sous-titre de la carte
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du sous-titre
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
Card.Subtitle = ({ children, className = '' }) => (
  <h4 className={`text-sm font-medium text-gray-500 mb-4 ${className}`}>
    {children}
  </h4>
);

/**
 * Composant pour le contenu de la carte
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
Card.Content = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

/**
 * Composant pour le pied de la carte
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du pied
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
Card.Footer = ({ children, className = '' }) => (
  <div className={`pt-4 mt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
); 