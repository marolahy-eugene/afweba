import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@/styles/globals.css';
import algoliaService from '@/services/algoliaService';

function MyApp({ Component, pageProps }) {
  // Initialiser le service Algolia au démarrage de l'application
  useEffect(() => {
    const initServices = async () => {
      try {
        // Vérifier la connexion à Algolia
        const isConnected = await algoliaService.checkConnection();
        console.log(`Service Algolia initialisé, connexion: ${isConnected ? 'Établie' : 'Non établie'}`);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des services:', error);
      }
    };

    initServices();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Component {...pageProps} />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;