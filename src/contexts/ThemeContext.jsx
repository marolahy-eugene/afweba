import { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte de thème
export const ThemeContext = createContext();

const defaultThemes = {
  light: {
    name: 'Clair',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      background: '#f9fafb',
      text: '#1f2937',
      card: '#ffffff',
      sidebar: '#1e1e1e'
    }
  },
  dark: {
    name: 'Sombre',
    colors: {
      primary: '#6b46c1', // Purple color for active items
      secondary: '#94a3b8',
      background: '#1a202c', // Dark blue background
      text: '#f9fafb',
      card: '#1f2937',
      sidebar: '#172e45' // Dark blue sidebar
    }
  },
  custom: {
    name: 'Personnalisé',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      background: '#f9fafb',
      text: '#1f2937',
      card: '#ffffff',
      sidebar: '#1e1e1e'
    }
  }
};

/**
 * Fournisseur du contexte de thème
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [customColors, setCustomColors] = useState(defaultThemes.custom.colors);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [activeColors, setActiveColors] = useState(defaultThemes.light.colors);
  
  // Charger les préférences au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('eeg_theme');
    const savedColors = localStorage.getItem('eeg_custom_colors');
    
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      if (savedTheme === 'custom' && savedColors) {
        try {
          const parsedColors = JSON.parse(savedColors);
          setCustomColors(parsedColors);
          setActiveColors(parsedColors);
        } catch (e) {
          console.error('Erreur lors du chargement des couleurs personnalisées:', e);
        }
      } else {
        setActiveColors(defaultThemes[savedTheme].colors);
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setCurrentTheme('dark');
      setActiveColors(defaultThemes.dark.colors);
    }
  }, []);

  // Appliquer les couleurs du thème
  const applyTheme = () => {
    const colors = currentTheme === 'custom' ? customColors : defaultThemes[currentTheme].colors;
    
    // Appliquer les variables CSS
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });

    // Sauvegarder les préférences
    localStorage.setItem('eeg_theme', currentTheme);
    if (currentTheme === 'custom') {
      localStorage.setItem('eeg_custom_colors', JSON.stringify(customColors));
    }

    // Mettre à jour l'attribut data-theme pour Tailwind
    document.documentElement.setAttribute('data-theme', currentTheme === 'custom' ? 'light' : currentTheme);
    
    setActiveColors(colors);
    setPendingChanges(false);
  };

  const changeTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    setPendingChanges(true);
  };

  const updateCustomColors = (colors) => {
    setCustomColors(colors);
    setPendingChanges(true);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setPendingChanges(true);
  };
  
  const contextValue = {
    theme: currentTheme,
    customColors,
    activeColors,
    defaultThemes,
    pendingChanges,
    changeTheme,
    updateCustomColors,
    toggleTheme,
    applyTheme,
    isDarkTheme: currentTheme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte de thème
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  
  return context;
};