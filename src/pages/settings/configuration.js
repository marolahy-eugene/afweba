import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import { FiSave, FiServer, FiDatabase, FiShield, FiGlobe, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function ConfigurationPage() {
  // Paramètres de configuration
  const [config, setConfig] = useState({
    general: {
      siteName: 'Plateforme EEG',
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
    },
    system: {
      maxUploadSize: 50,
      storageLimit: 5000,
      sessionTimeout: 30,
      enableCache: true,
      debugMode: false,
    },
    security: {
      enableTwoFactor: false,
      passwordExpiryDays: 90,
      passwordMinLength: 8,
      requireSpecialChars: true,
      maxLoginAttempts: 5,
    },
    notifications: {
      enableEmailNotifications: true,
      enableBrowserNotifications: false,
      enableSmsNotifications: false,
      dailyReportTime: '08:00',
    }
  });
  
  // État pour afficher la notification de sauvegarde
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Charger la configuration depuis le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('eeg_platform_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error('Erreur lors du chargement de la configuration:', e);
        }
      }
    }
  }, []);
  
  // Gérer les changements de configuration
  const handleConfigChange = (section, key, value) => {
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    };
    
    setConfig(newConfig);
    
    // Sauvegarder immédiatement dans le localStorage
    localStorage.setItem('eeg_platform_config', JSON.stringify(newConfig));
    
    // Afficher la notification de sauvegarde
    setShowSaveNotification(true);
    setTimeout(() => {
      setShowSaveNotification(false);
    }, 2000);
  };
  
  // Sauvegarder la configuration
  const saveConfiguration = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eeg_platform_config', JSON.stringify(config));
      alert('Configuration sauvegardée avec succès');
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Configurations</h1>
              <p className="mt-1 text-sm text-gray-500">
                Paramétrez la plateforme EEG selon les besoins de votre organisation. Les modifications sont sauvegardées automatiquement.
              </p>
            </div>
            
            {/* Notification de sauvegarde */}
            {showSaveNotification && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center">
                <FiCheckCircle className="mr-2" />
                Sauvegardé
              </div>
            )}
          </div>
          
          <div className="mt-8 space-y-8">
            {/* Paramètres généraux */}
            <Card>
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <div className="bg-blue-100 p-2 rounded-md">
                  <FiGlobe className="h-6 w-6 text-blue-700" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Paramètres généraux</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                    Nom de la plateforme
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    value={config.general.siteName}
                    onChange={(e) => handleConfigChange('general', 'siteName', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Langue par défaut
                  </label>
                  <select
                    id="language"
                    value={config.general.language}
                    onChange={(e) => handleConfigChange('general', 'language', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Fuseau horaire
                  </label>
                  <select
                    id="timezone"
                    value={config.general.timezone}
                    onChange={(e) => handleConfigChange('general', 'timezone', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                    Format de date
                  </label>
                  <select
                    id="dateFormat"
                    value={config.general.dateFormat}
                    onChange={(e) => handleConfigChange('general', 'dateFormat', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </Card>
            
            {/* Paramètres système */}
            <Card>
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <div className="bg-green-100 p-2 rounded-md">
                  <FiServer className="h-6 w-6 text-green-700" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Paramètres système</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700">
                    Taille maximale de téléchargement (MB)
                  </label>
                  <input
                    type="number"
                    id="maxUploadSize"
                    value={config.system.maxUploadSize}
                    onChange={(e) => handleConfigChange('system', 'maxUploadSize', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="storageLimit" className="block text-sm font-medium text-gray-700">
                    Limite de stockage (MB)
                  </label>
                  <input
                    type="number"
                    id="storageLimit"
                    value={config.system.storageLimit}
                    onChange={(e) => handleConfigChange('system', 'storageLimit', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                    Délai d'expiration de session (minutes)
                  </label>
                  <input
                    type="number"
                    id="sessionTimeout"
                    value={config.system.sessionTimeout}
                    onChange={(e) => handleConfigChange('system', 'sessionTimeout', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCache"
                      checked={config.system.enableCache}
                      onChange={(e) => handleConfigChange('system', 'enableCache', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableCache" className="ml-2 block text-sm text-gray-700">
                      Activer le cache
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="debugMode"
                      checked={config.system.debugMode}
                      onChange={(e) => handleConfigChange('system', 'debugMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700">
                      Mode debug
                    </label>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Paramètres de sécurité */}
            <Card>
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <div className="bg-red-100 p-2 rounded-md">
                  <FiShield className="h-6 w-6 text-red-700" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Paramètres de sécurité</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={config.security.enableTwoFactor}
                    onChange={(e) => handleConfigChange('security', 'enableTwoFactor', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-700">
                    Activer l'authentification à deux facteurs
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    checked={config.security.requireSpecialChars}
                    onChange={(e) => handleConfigChange('security', 'requireSpecialChars', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-700">
                    Exiger des caractères spéciaux pour les mots de passe
                  </label>
                </div>
                
                <div>
                  <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-gray-700">
                    Expiration du mot de passe (jours)
                  </label>
                  <input
                    type="number"
                    id="passwordExpiryDays"
                    value={config.security.passwordExpiryDays}
                    onChange={(e) => handleConfigChange('security', 'passwordExpiryDays', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                    Longueur minimale du mot de passe
                  </label>
                  <input
                    type="number"
                    id="passwordMinLength"
                    value={config.security.passwordMinLength}
                    onChange={(e) => handleConfigChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                    Nombre maximal de tentatives de connexion
                  </label>
                  <input
                    type="number"
                    id="maxLoginAttempts"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </Card>
            
            {/* Paramètres de notification */}
            <Card>
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <div className="bg-purple-100 p-2 rounded-md">
                  <FiClock className="h-6 w-6 text-purple-700" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Paramètres de notification</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEmailNotifications"
                    checked={config.notifications.enableEmailNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'enableEmailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-700">
                    Activer les notifications par e-mail
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableBrowserNotifications"
                    checked={config.notifications.enableBrowserNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'enableBrowserNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableBrowserNotifications" className="ml-2 block text-sm text-gray-700">
                    Activer les notifications du navigateur
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSmsNotifications"
                    checked={config.notifications.enableSmsNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'enableSmsNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableSmsNotifications" className="ml-2 block text-sm text-gray-700">
                    Activer les notifications par SMS
                  </label>
                </div>
                
                <div>
                  <label htmlFor="dailyReportTime" className="block text-sm font-medium text-gray-700">
                    Heure du rapport quotidien
                  </label>
                  <input
                    type="time"
                    id="dailyReportTime"
                    value={config.notifications.dailyReportTime}
                    onChange={(e) => handleConfigChange('notifications', 'dailyReportTime', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 