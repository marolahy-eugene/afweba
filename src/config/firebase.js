// Configuration Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// Importez getAnalytics mais ne l'initialisez pas immédiatement
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  
  apiKey: "AIzaSyBU0gPnJk9DHse2DiBAIgR9SaViLjHFB10",
  authDomain: "eeg-cmea.firebaseapp.com",
  projectId: "eeg-cmea",
  storageBucket: "eeg-cmea.appspot.com",
  messagingSenderId: "211014285866",
  appId: "1:211014285866:web:03e05494b2c9a76d13a153"

};

// Initialize Firebase
let app;
let db;
let auth;
let storage;
let analytics = null;

try {
  console.log('Initialisation de Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('App Firebase initialisée');
  
  // Utiliser initializeFirestore au lieu de getFirestore pour pouvoir configurer des options avancées
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Pour contourner les problèmes de connexion WebChannel
    cacheSizeBytes: 1048576 * 100, // Taille du cache de 100 MB
    ignoreUndefinedProperties: true, // Ignore les propriétés undefined
    useFetchStreams: false, // Améliore la compatibilité avec certains navigateurs
    // Assurer l'encodage UTF-8 pour les caractères accentués
    settings: {
      encoding: 'UTF-8'
    }
  });
  console.log('Firestore initialisé avec experimentalForceLongPolling');
  
  auth = getAuth(app);
  console.log('Auth initialisé');
  
  storage = getStorage(app);
  console.log('Storage initialisé');
  
  // Initialiser Analytics uniquement côté client
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('Analytics initialisé');
    } catch (error) {
      console.warn('Analytics non initialisé:', error.message);
    }
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Firebase:', error);
}

export { db, storage };
export default firebaseConfig;

