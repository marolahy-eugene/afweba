import React from 'react';
import { useRouter } from 'next/router';
import { FiEye, FiEdit, FiClipboard, FiActivity, FiBarChart2, FiFileText } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

/**
 * Composant pour afficher les boutons d'action pour un examen
 * @param {Object} examen - L'examen concerné
 * @param {boolean} showAllButtons - Afficher tous les boutons ou seulement le bouton Afficher
 */
const ExamenActionButtons = ({ examen, showAllButtons = false }) => {
  const router = useRouter();
  const { user, hasRole, hasPermission } = useAuth();

  // Fonction pour gérer l'affichage des détails de l'examen
  const handleView = () => {
    router.push(`/examens/details/${examen.id}`);
  };

  // Fonction pour gérer l'observation de l'examen
  const handleObservation = () => {
    router.push(`/examens/observation/${examen.id}`);
  };

  // Fonction pour gérer l'enregistrement de l'examen
  const handleEnregistrement = () => {
    router.push(`/examens/enregistrement/${examen.id}`);
  };

  // Fonction pour gérer l'analyse de l'examen
  const handleAnalyse = () => {
    router.push(`/examens/analyse/${examen.id}`);
  };

  // Fonction pour gérer l'interprétation de l'examen
  const handleInterpretation = () => {
    router.push(`/examens/interpretation/${examen.id}`);
  };

  // Vérifier si l'utilisateur a la permission d'observer
  const canObserve = hasPermission('observer');
  
  // Vérifier si l'utilisateur a la permission d'enregistrer
  const canRecord = hasPermission('enregistrer');
  
  // Vérifier si l'utilisateur a la permission d'analyser
  const canAnalyze = hasPermission('analyser');
  
  // Vérifier si l'utilisateur a la permission d'interpréter
  const canInterpret = hasPermission('interpreter');

  return (
    <div className="flex space-x-2 justify-end">
      {/* Bouton Afficher - toujours visible */}
      <button
        onClick={handleView}
        className="flex items-center justify-center px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        title="Afficher les détails"
      >
        <FiEye className="mr-1 h-4 w-4" />
        <span>Afficher</span>
      </button>

      {/* Boutons supplémentaires conditionnels */}
      {showAllButtons && (
        <>
          {/* Bouton Observation - visible si l'utilisateur a la permission */}
          {canObserve && (
            <button
              onClick={handleObservation}
              className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Observation"
            >
              <FiClipboard className="mr-1 h-4 w-4" />
              <span>Observer</span>
            </button>
          )}

          {/* Bouton Enregistrement - visible si l'utilisateur a la permission */}
          {canRecord && (
            <button
              onClick={handleEnregistrement}
              className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              title="Enregistrement"
            >
              <FiActivity className="mr-1 h-4 w-4" />
              <span>Enregistrer</span>
            </button>
          )}

          {/* Bouton Analyse - visible si l'utilisateur a la permission */}
          {canAnalyze && (
            <button
              onClick={handleAnalyse}
              className="flex items-center justify-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              title="Analyse"
            >
              <FiBarChart2 className="mr-1 h-4 w-4" />
              <span>Analyser</span>
            </button>
          )}

          {/* Bouton Interprétation - visible si l'utilisateur a la permission */}
          {canInterpret && (
            <button
              onClick={handleInterpretation}
              className="flex items-center justify-center px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              title="Interprétation"
            >
              <FiFileText className="mr-1 h-4 w-4" />
              <span>Interpréter</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ExamenActionButtons;