import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Hook personnalisé pour utiliser le contexte de thème
 * @returns {Object} - Contexte de thème avec theme, toggleTheme et isDarkTheme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  
  return context;
}

export default useTheme; 