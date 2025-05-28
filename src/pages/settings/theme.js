import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/common/Card';
import { FiSun, FiMoon, FiSettings } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

// Définition des thèmes
const themes = {
  light: {
    name: 'Clair',
    icon: FiSun,
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      background: '#f9fafb',
      text: '#1f2937',
      card: '#ffffff'
    }
  },
  dark: {
    name: 'Sombre',
    icon: FiMoon,
    colors: {
      primary: '#2563eb',
      secondary: '#94a3b8',
      background: '#111827',
      text: '#f9fafb',
      card: '#1f2937'
    }
  },
  custom: {
    name: 'Personnalisé',
    icon: FiSettings,
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      background: '#f9fafb',
      text: '#1f2937',
      card: '#ffffff'
    }
  }
};

export default function ThemePage() {
  const { 
    theme, 
    customColors, 
    defaultThemes,
    pendingChanges,
    changeTheme, 
    updateCustomColors,
    applyTheme
  } = useTheme();
  
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [localCustomColors, setLocalCustomColors] = useState(customColors);
  
  // Synchroniser avec le contexte de thème global
  useEffect(() => {
    setSelectedTheme(theme);
    setLocalCustomColors(customColors);
  }, [theme, customColors]);
  
  // Gérer le changement de thème
  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey);
    changeTheme(themeKey);
  };

  // Gérer les changements de couleurs personnalisées
  const handleCustomColorChange = (colorKey, value) => {
    const newColors = {
      ...localCustomColors,
      [colorKey]: value
    };
    setLocalCustomColors(newColors);
    updateCustomColors(newColors);
  };

  const handleApplyTheme = () => {
    applyTheme();
  };
  
  const previewTheme = (themeKey) => {
    if (!defaultThemes[themeKey]) {
      return {};
    }

    const themeColors = themeKey === 'custom' ? localCustomColors : defaultThemes[themeKey].colors;
    if (!themeColors) {
      return {};
    }

    return {
      backgroundColor: themeColors.background || '#ffffff',
      color: themeColors.text || '#000000',
      borderColor: themeColors.primary || '#1e40af',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    };
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Paramètres de thème</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Personnalisez l'apparence de la plateforme EEG selon vos préférences.
              </p>
            </div>
            {pendingChanges && (
              <button
                onClick={handleApplyTheme}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Appliquer les changements
              </button>
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Options de thème prédéfinis */}
            <Card title="Thèmes prédéfinis">
              <div className="space-y-4">
                {Object.entries(defaultThemes).map(([themeKey, themeData]) => {
                  const ThemeIcon = themeKey === 'dark' ? FiMoon : 
                                  themeKey === 'custom' ? FiSettings : FiSun;
                  return (
                    <div 
                      key={themeKey}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all
                        ${selectedTheme === themeKey ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'}`}
                      onClick={() => handleThemeChange(themeKey)}
                      style={themeKey === selectedTheme ? {} : previewTheme(themeKey)}
                    >
                      <div className={`p-2 rounded-full ${
                        themeKey === 'dark' ? 'bg-gray-800 text-white' : 
                        themeKey === 'custom' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        <ThemeIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium dark:text-white">{themeData.name}</h3>
                        <p className="text-sm opacity-75 dark:text-gray-300">
                          {themeKey === 'light' && 'Interface claire avec contraste optimal'}
                          {themeKey === 'dark' && 'Mode sombre pour réduire la fatigue oculaire'}
                          {themeKey === 'custom' && 'Personnalisez vos propres couleurs'}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className={`h-6 w-6 rounded-full border-2 border-white dark:border-gray-600 ${
                          selectedTheme === themeKey ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {selectedTheme === themeKey && (
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            {/* Personnalisation des couleurs */}
            <Card title="Personnalisation des couleurs" 
              className={selectedTheme !== 'custom' ? 'opacity-50' : ''}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {selectedTheme === 'custom' 
                    ? 'Personnalisez les couleurs de votre thème. Les changements s\'appliqueront après avoir cliqué sur Appliquer.' 
                    : 'Sélectionnez le thème personnalisé pour modifier ces couleurs.'}
                </p>
                
                <div className="space-y-3">
                  {Object.entries(localCustomColors).map(([colorKey, colorValue]) => (
                    <div key={colorKey}>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 capitalize">
                        {colorKey === 'sidebar' ? 'Couleur de la barre latérale' : colorKey}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={colorValue}
                          onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                          disabled={selectedTheme !== 'custom'}
                          className="h-10 w-10 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorValue}
                          onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                          disabled={selectedTheme !== 'custom'}
                          className="ml-2 flex-1 px-3 py-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Prévisualisation */}
          <Card title="Prévisualisation" className="mt-8">
            <div className="space-y-6">
              <div 
                className="p-6 rounded-lg border"
                style={previewTheme(selectedTheme)}
              >
                <h3 className="text-lg font-semibold mb-4" style={{
                  color: selectedTheme === 'custom' ? localCustomColors.primary : defaultThemes[selectedTheme].colors.primary
                }}>
                  Exemple de titre
                </h3>
                <p className="mb-4">
                  Voici à quoi ressemblera votre texte avec le thème sélectionné. 
                  Cet exemple montre les couleurs de base, le texte et les éléments d'interface.
                </p>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 rounded-md text-white"
                    style={{
                      backgroundColor: selectedTheme === 'custom' ? localCustomColors.primary : defaultThemes[selectedTheme].colors.primary
                    }}
                  >
                    Bouton primaire
                  </button>
                  <button
                    className="px-4 py-2 rounded-md text-white"
                    style={{
                      backgroundColor: selectedTheme === 'custom' ? localCustomColors.secondary : defaultThemes[selectedTheme].colors.secondary
                    }}
                  >
                    Bouton secondaire
                  </button>
                </div>
              </div>

              {/* Prévisualisation de la sidebar */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Aperçu de la barre latérale
                </h4>
                <div 
                  className="h-20 rounded-lg border"
                  style={{
                    backgroundColor: selectedTheme === 'custom' ? localCustomColors.sidebar : defaultThemes[selectedTheme].colors.sidebar
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}