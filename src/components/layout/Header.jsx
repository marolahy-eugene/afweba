import React from 'react';
import { FiMenu, FiBell, FiUser, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSelector from '@/components/common/LanguageSelector';

/**
 * Composant d'en-tête de l'application
 */
const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <header 
      className={`white:bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 fixed top-0 right-0 z-20 flex items-center transition-all duration-300 ${
        sidebarOpen ? 'left-64' : 'left-20'
      }`}
    >
      <div className="px-4 flex-1 flex items-center justify-between">
        {/* Bouton de bascule du menu latéral */}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={sidebarOpen ? t('actions.close') : t('actions.open')}
        >
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Zone de recherche */}
        <div className="max-w-xl w-full mx-4 hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-700 dark:bg-gray-700 border border-gray-500 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
              placeholder={t('actions.search') + '...'}
            />
          </div>
        </div>

        {/* Zone droite avec sélecteur de langue, notifications et profil */}
        <div className="flex items-center space-x-3">
          {/* Sélecteur de langue */}
          <LanguageSelector className="mr-2" />
          
          <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <FiBell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
          </button>
          
          <div className="flex items-center m-2">
            <div className="hidden md:flex flex-col items-end mr-3">
              <span className="text-sm font-medium text-gray-300 dark:text-gray-100">
                {user?.displayName || user?.name || t('auth.login')}
              </span>
              {user?.email && (
                <span className="text-xs text-gray-400 dark:text-gray-400">
                  {user.email}
                </span>
              )}
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-primary-500">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || user.name} className="h-full w-full object-cover" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt={user.displayName || user.name} className="h-full w-full object-cover" />
              ) : (
                <FiUser className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;