import React from 'react';
import { useAuth } from '@/hooks/useAuth';

// Liste des champs d'informations utilisateur à masquer si l'utilisateur n'a pas les permissions
const userInfoFields = [
  'technicienExaminateur',
  'technicienEnregistreur',
  'analysteNom',
  'numeroInscriptionOrdre',
  'utilisateurNom',
  'utilisateurEmail',
  'utilisateurRole',
  'utilisateurId'
];

/**
 * Composant pour contrôler l'accès aux formulaires en fonction des permissions de l'utilisateur
 * Ce composant permet d'afficher les formulaires à tous les utilisateurs mais de masquer
 * complètement les champs d'informations utilisateur pour ceux qui n'ont pas les permissions nécessaires
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les enfants du composant (le formulaire)
 * @param {string} props.requiredPermission - La permission requise pour accéder au formulaire
 * @param {string} props.formType - Le type de formulaire (observation, enregistrement, analyse, interpretation)
 * @param {Object} props.examen - L'examen concerné
 */
const FormPermissionControl = ({ children, requiredPermission, formType, examen }) => {
  const { user, checkUserPermission } = useAuth();
  
  // Vérifier si l'utilisateur a la permission requise
  const hasAccess = checkUserPermission ? checkUserPermission(requiredPermission) : false;
  
  // Vérifier si l'état de l'examen correspond au type de formulaire
  const isCorrectState = () => {
    switch (formType) {
      case 'observation':
        return examen?.etat === 'Observation';
      case 'enregistrement':
        return examen?.etat === 'Enregistrement';
      case 'analyse':
        return examen?.etat === 'Analyse';
      case 'interpretation':
        return examen?.etat === 'Interprétation';
      default:
        return examen?.etat === 'Terminer';
    }
  };

  // Convertir les objets date Firestore en chaînes de caractères lisibles
  const formatFirestoreDate = (date) => {
    if (date && date.seconds !== undefined && date.nanoseconds !== undefined) {
      const jsDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
      return jsDate.toLocaleString();
    }
    return date;
  };

  // Mise à jour de l'état de l'examen pour le type 'interpretation'
  if (formType === 'interpretation' && examen?.etat === 'Interprété') {
    examen.dateInterpretation = formatFirestoreDate(examen.dateInterpretation);
  }
  
  // Ajout de la vérification des rôles de l'utilisateur
  const hasRoleAccess = Array.isArray(user?.roles) && user.roles.includes(requiredPermission);
  
  // Déterminer si les champs doivent être désactivés
  const isDisabled = !(hasAccess || hasRoleAccess) || !isCorrectState();
  
  // Message d'information pour l'utilisateur
  const getAccessMessage = () => {
    if (!hasAccess && !hasRoleAccess) {
      return "Vous n'avez pas les permissions nécessaires pour modifier ce formulaire.";
    }
    if (!isCorrectState()) {
      return `Ce formulaire ne peut être modifié que lorsque l'examen est à l'état '${getRequiredState()}'.`;
    }
    return null;
  };
  
  // Obtenir l'état requis pour le type de formulaire
  const getRequiredState = () => {
    switch (formType) {
      case 'observation':
        return 'En attente';
      case 'enregistrement':
        return 'Observé';
      case 'analyse':
        return 'Enregistré';
      case 'interpretation':
        return 'Analysé';
      default:
        return '';
    }
  };
  
  // Fonction pour vérifier si un champ est un champ d'information utilisateur
  const isUserInfoField = (name) => {
    return userInfoFields.includes(name);
  };
  
  // Fonction pour cloner récursivement les éléments enfants
  const cloneChildrenWithProps = (children, disabled) => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }
  
      // Si l'enfant a des enfants, les cloner récursivement
      if (child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: cloneChildrenWithProps(child.props.children, disabled),
        });
      }
  
      // Si c'est un champ de formulaire avec un nom
      if (child.props.name) {
        // Si c'est un champ d'information utilisateur et que le formulaire est désactivé
        if (isUserInfoField(child.props.name) && disabled) {
          // Masquer complètement le champ en retournant null
          return null;
        }
  
        // Pour les autres champs, les désactiver si nécessaire
        return React.cloneElement(child, {
          ...child.props,
          disabled: disabled || child.props.disabled,
          className: `${child.props.className || ''} ${disabled ? 'cursor-not-allowed opacity-75' : ''}`.trim(),
        });
      }
  
      // Pour les autres éléments, les cloner sans modification
      return child;
    });
  };
  
  return (
    <div className="form-permission-control">
      {getAccessMessage() && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p>{getAccessMessage()}</p>
        </div>
      )}
      {cloneChildrenWithProps(children, isDisabled)}
    </div>
  );
};

export default FormPermissionControl;
