import React, { useState, useEffect } from 'react';

// import Header from '@/Header';
// import Sidebar from '@/Sidebar';

import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import { useRouter } from 'next/router';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Composant de mise en page principale de l'application
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const router = useRouter();
  const { activeColors } = useTheme(); // Get activeColors from theme context
  
  // Détecter le thème du système
  useEffect(() => {
    // Vérifier s'il y a une préférence enregistrée
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Sinon, utiliser la préférence du système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);
  
  // Pages qui devraient être rendues sans la mise en page complète
  const isFullPage = ['/login', '/register', '/forgot-password'].includes(router.pathname);
  
  if (isFullPage) {
    return <>{children}</>;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={`flex h-screen ${sidebarOpen ? 'sidebar-open' : ''}`} style={{ backgroundColor: activeColors.background }}>
      <Sidebar open={sidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto pt-16">
          {children}
        </main>
        
        <footer className="bg-custom-2 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} EEG Platform. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;