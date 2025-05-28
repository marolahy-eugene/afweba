// Script pour exporter les données JSON vers Firebase
import { db } from '../config/firebase';
import mockData from '../data/mock-data.json';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

/**
 * Fonction pour exporter toutes les données vers Firebase
 */
export const exportDataToFirebase = async () => {
  try {
    console.log('Début de l\'exportation des données vers Firebase...');
    
    // Utiliser des transactions par lots pour les performances
    const batch = writeBatch(db);
    
    // Exporter les patients
    console.log(`Exportation de ${mockData.patients.length} patients...`);
    for (const patient of mockData.patients) {
      const patientRef = doc(collection(db, 'patients'));
      batch.set(patientRef, patient);
    }
    
    // Exporter les analyses
    console.log(`Exportation de ${mockData.analyses.length} analyses...`);
    for (const analyse of mockData.analyses) {
      const analyseRef = doc(collection(db, 'analyses'));
      batch.set(analyseRef, analyse);
    }
    
    // Exécuter toutes les opérations en une seule transaction
    await batch.commit();
    
    console.log('Exportation terminée avec succès!');
    return { success: true, message: 'Données exportées avec succès' };
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Fonction pour exporter les patients vers Firebase
 */
export const exportPatientsToFirebase = async () => {
  try {
    console.log(`Exportation de ${mockData.patients.length} patients...`);
    
    const batch = writeBatch(db);
    
    for (const patient of mockData.patients) {
      const patientRef = doc(collection(db, 'patients'));
      batch.set(patientRef, patient);
    }
    
    await batch.commit();
    
    console.log('Exportation des patients terminée!');
    return { success: true, message: 'Patients exportés avec succès' };
  } catch (error) {
    console.error('Erreur lors de l\'exportation des patients:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Fonction pour exporter les analyses vers Firebase
 */
export const exportAnalysesToFirebase = async () => {
  try {
    console.log(`Exportation de ${mockData.analyses.length} analyses...`);
    
    const batch = writeBatch(db);
    
    for (const analyse of mockData.analyses) {
      const analyseRef = doc(collection(db, 'analyses'));
      batch.set(analyseRef, analyse);
    }
    
    await batch.commit();
    
    console.log('Exportation des analyses terminée!');
    return { success: true, message: 'Analyses exportées avec succès' };
  } catch (error) {
    console.error('Erreur lors de l\'exportation des analyses:', error);
    return { success: false, message: error.message };
  }
};

// Pour exécuter le script directement
if (typeof window !== 'undefined' && window.runExport) {
  exportDataToFirebase()
    .then(result => console.log(result))
    .catch(error => console.error(error));
}

export default {
  exportDataToFirebase,
  exportPatientsToFirebase,
  exportAnalysesToFirebase
}; 