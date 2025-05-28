import React from 'react';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';

/**
 * Composant Wizard pour afficher les étapes du processus d'examen EEG
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.currentStep - L'étape actuelle ('Observation', 'Enregistrement', 'Analyse', 'Interpretation')
 */
const ExamWizard = ({ currentStep }) => {
  // Définir les étapes du processus
  const steps = [
    { id: 'Creation', label: 'Création' },
    { id: 'Observation', label: 'Observation' },
    { id: 'Enregistrement', label: 'Enregistrement' },
    { id: 'Analyse', label: 'Analyse' },
    { id: 'Interpretation', label: 'Interprétation' },
    { id: 'Terminé', label: 'Terminé' }
  ];

  // Déterminer l'index de l'étape actuelle
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  // L'étape de création est toujours considérée comme complétée
  const isCreationCompleted = true;

  return (
    <div className="mb-8">
      <div className="light:bg-secondary light:text-primary dark:bg-secondary rounded-sm shadow-md py-4 px-8">
        <h2 className="text-lg font-medium dark:text-primary dark:text-secondary mb-4">Progression de l'examen</h2>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            // Déterminer si l'étape est complétée, active ou à venir
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            
            return (
              <React.Fragment key={step.id}>
                {/* Étape */}
                <div className="flex flex-col items-center">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full 
                      ${isCompleted ? 'bg-green-500 text-white' : 
                        isActive ? 'bg-blue-500 text-white' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                  >
                    {isCompleted ? (
                      <FiCheckCircle className="w-6 h-6" />
                    ) : (
                      <FiCircle className="w-6 h-6" />
                    )}
                  </div>
                  <span 
                    className={`mt-2 text-sm font-medium 
                      ${isCompleted ? 'text-green-500' : 
                        isActive ? 'text-blue-500' : 
                        'text-gray-500 dark:text-gray-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
                
                {/* Ligne de connexion entre les étapes (sauf après la dernière) */}
                {index < steps.length - 1 && (
                  <div 
                    className={`flex-1 h-1 mx-2 
                      ${index < currentStepIndex ? 'bg-green-500' : 
                        'bg-gray-200 dark:bg-gray-700'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExamWizard;