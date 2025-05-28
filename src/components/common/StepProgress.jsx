import React from 'react';
import { FiCheck } from 'react-icons/fi';

/**
 * Composant de progression par étapes pour suivre le flux de travail EEG
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.steps - Liste des étapes
 * @param {number} props.currentStep - Index de l'étape actuelle (0-based)
 * @param {Function} [props.onStepClick] - Fonction à appeler lors du clic sur une étape
 */
const StepProgress = ({ steps, currentStep, onStepClick }) => {
  const handleStepClick = (index) => {
    // Permettre uniquement de cliquer sur les étapes terminées ou l'étape actuelle
    if (index <= currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="flex items-center justify-between w-full my-8">
      {steps.map((step, index) => {
        // Déterminer l'état de l'étape (terminée, active, future)
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = index <= currentStep && onStepClick;
        
        return (
          <React.Fragment key={index}>
            {/* Cercle d'étape */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCompleted ? 'bg-green-500' : isActive ? 'bg-green-500 border-2 border-green-600' : 'bg-gray-200'}
                  ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                {isCompleted ? (
                  <FiCheck className="text-white" size={20} />
                ) : (
                  <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              {/* Nom de l'étape */}
              <span className={`mt-2 text-sm font-medium
                ${isCompleted ? 'text-green-500' : isActive ? 'text-green-500' : 'text-gray-400'}
                ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                {step}
              </span>
            </div>
            
            {/* Ligne de connexion (sauf après la dernière étape) */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgress; 