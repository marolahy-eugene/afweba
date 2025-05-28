import React from 'react';
import { FiSun, FiMoon, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

const Appbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-4 z-10">
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
      >
        {theme === 'dark' ? (
          <FiSun className="h-5 w-5 text-amber-400" />
        ) : (
          <FiMoon className="h-5 w-5 text-indigo-600" />
        )}
      </button>
      
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        <FiSettings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        <FiHelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        <FiLogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default Appbar;