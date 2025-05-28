import React from 'react';

/**
 * Composant de bouton réutilisable
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {string} [props.variant='primary'] - Variante du bouton (primary, secondary, outline, success, danger)
 * @param {string} [props.size='md'] - Taille du bouton (sm, md, lg)
 * @param {boolean} [props.disabled=false] - Si le bouton est désactivé
 * @param {boolean} [props.fullWidth=false] - Si le bouton doit prendre toute la largeur
 * @param {React.ReactNode} [props.leftIcon] - Icône à gauche du texte
 * @param {React.ReactNode} [props.rightIcon] - Icône à droite du texte
 * @param {Function} props.onClick - Fonction appelée lors du clic
 * @param {string} [props.type='button'] - Type du bouton (button, submit, reset)
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  fullWidth = false, 
  leftIcon, 
  rightIcon, 
  onClick, 
  type = 'button',
  className = '',
  ...rest
}) => {
  // Base des classes CSS
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-all';
  
  // Classes spécifiques à la variante
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };
  
  // Classes spécifiques à la taille
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  // Classes spécifiques au statut désactivé
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Classes de largeur
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combinaison de toutes les classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `.trim();
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button; 