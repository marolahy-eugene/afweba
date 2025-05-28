import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';

/**
 * Hook pour utiliser le contexte de langue
 * @returns {Object} - Contexte de langue avec les fonctions t (traduction) et changeLanguage
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default useLanguage;