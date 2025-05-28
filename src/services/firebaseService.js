// Service pour interagir avec Firebase
import { db, storage, auth } from '@/config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  deleteField,
  onSnapshot
} from 'firebase/firestore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Normalise une chaîne de caractères en supprimant les accents
 * Utile pour les comparaisons insensibles aux accents
 * @param {string} str - Chaîne à normaliser
 * @returns {string} Chaîne normalisée
 */
const normalizeString = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Service pour gérer les interactions avec Firebase
 */
const firebaseService = {
  // Utilitaire pour supprimer un champ
  deleteField: () => deleteField(),
  /**
   * Récupère tous les patients
   * @returns {Promise<Array>} Liste des patients
   */
  getAllPatients: async () => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération des patients depuis la collection "patients"');
      
      // Utilisation de la collection 'patients' (au pluriel)
      const patientsCollection = collection(db, 'patients');
      const patientsSnapshot = await getDocs(patientsCollection);
      
      if (patientsSnapshot.empty) {
        console.log('Aucun patient trouvé dans Firebase');
        return [];
      }
      
      const patients = patientsSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${patients.length} patients récupérés avec succès depuis Firebase`);
      return patients;
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      throw error;
    }
  },

  /**
   * Récupère un patient par son ID
   * @param {string} id - ID du patient
   * @returns {Promise<Object|null>} Patient trouvé ou null
   */
  getPatientById: async (id) => {
    try {
      const patientDoc = await getDoc(doc(db, 'patients', id));
      
      if (patientDoc.exists()) {
        return {
          id: patientDoc.id,
          ...patientDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du patient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un nouveau patient
   * @param {Object} patientData - Données du patient
   * @returns {Promise<Object>} Patient créé avec son ID
   */
  addPatient: async (patientData) => {
    try {
      const docRef = await addDoc(collection(db, 'patients'), patientData);
      
      return {
        id: docRef.id,
        ...patientData
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du patient:', error);
      throw error;
    }
  },

  /**
   * Met à jour un patient
   * @param {string} id - ID du patient
   * @param {Object} patientData - Données à mettre à jour
   * @returns {Promise<Object>} Patient mis à jour
   */
  updatePatient: async (id, patientData) => {
    try {
      const patientRef = doc(db, 'patients', id);
      await updateDoc(patientRef, patientData);
      
      return {
        id,
        ...patientData
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du patient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un patient
   * @param {string} id - ID du patient
   * @returns {Promise<void>}
   */
  deletePatient: async (id) => {
    try {
      await deleteDoc(doc(db, 'patients', id));
    } catch (error) {
      console.error(`Erreur lors de la suppression du patient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère toutes les analyses
   * @returns {Promise<Array>} Liste des analyses
   */
  getAllAnalyses: async () => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération des analyses depuis la collection "analyses"');
      
      // Utilisation de la collection 'analyses'
      const analysesCollection = collection(db, 'analyses');
      const analysesSnapshot = await getDocs(analysesCollection);
      
      if (analysesSnapshot.empty) {
        console.log('Aucune analyse trouvée dans Firebase');
        return [];
      }
      
      const analyses = analysesSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${analyses.length} analyses récupérées avec succès depuis Firebase`);
      return analyses;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      throw error;
    }
  },

  /**
   * Récupère les analyses d'un patient
   * @param {string} patientId - ID du patient
   * @returns {Promise<Array>} Liste des analyses du patient
   */
  getAnalysesByPatientId: async (patientId) => {
    try {
      const q = query(
        collection(db, 'analyses'),
        where('id_patient', '==', patientId),
        orderBy('date_enregistrement', 'desc')
      );
      
      const analysesSnapshot = await getDocs(q);
      const analyses = [];
      
      analysesSnapshot.forEach((doc) => {
        analyses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return analyses;
    } catch (error) {
      console.error(`Erreur lors de la récupération des analyses pour le patient ${patientId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère une analyse par son ID
   * @param {string} id - ID de l'analyse
   * @returns {Promise<Object|null>} Analyse trouvée ou null
   */
  getAnalysisById: async (id) => {
    try {
      const analysisDoc = await getDoc(doc(db, 'analyses', id));
      
      if (analysisDoc.exists()) {
        return {
          id: analysisDoc.id,
          ...analysisDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'analyse ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute une nouvelle analyse
   * @param {Object} analysisData - Données de l'analyse
   * @returns {Promise<Object>} Analyse créée avec son ID
   */
  addAnalysis: async (analysisData) => {
    try {
      const docRef = await addDoc(collection(db, 'analyses'), analysisData);
      
      return {
        id: docRef.id,
        ...analysisData
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'analyse:', error);
      throw error;
    }
  },
  
  /**
   * Ajoute une nouvelle analyse (version française)
   * @param {Object} analyseData - Données de l'analyse
   * @returns {Promise<Object>} Analyse créée avec son ID
   */
  addAnalyse: async (analyseData) => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative d\'ajout d\'une analyse');
      
      // Ajouter la date de création si elle n'existe pas déjà
      const dataWithTimestamp = {
        ...analyseData,
        dateCreation: analyseData.dateCreation || serverTimestamp()
      };
      
      // Utilisation de la collection 'analyses'
      const analysesCollection = collection(db, 'analyses');
      const docRef = await addDoc(analysesCollection, dataWithTimestamp);
      
      console.log(`Analyse ajoutée avec succès, ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...dataWithTimestamp
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'analyse:', error);
      throw error;
    }
  },

  /**
   * Met à jour une analyse
   * @param {string} id - ID de l'analyse
   * @param {Object} analysisData - Données à mettre à jour
   * @returns {Promise<Object>} Analyse mise à jour
   */
  updateAnalysis: async (id, analysisData) => {
    try {
      const analysisRef = doc(db, 'analyses', id);
      await updateDoc(analysisRef, analysisData);
      
      return {
        id,
        ...analysisData
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'analyse ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une analyse
   * @param {string} id - ID de l'analyse
   * @returns {Promise<void>}
   */
  deleteAnalysis: async (id) => {
    try {
      await deleteDoc(doc(db, 'analyses', id));
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'analyse ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les examens
   * @returns {Promise<Array>} Liste des examens
   */
  getAllExamens: async () => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération des examens depuis la collection "examens"');
      
      const examensCollection = collection(db, 'examens');
      const examensSnapshot = await getDocs(examensCollection);
      
      if (examensSnapshot.empty) {
        console.log('Aucun examen trouvé dans Firebase');
        return [];
      }
      
      const examens = examensSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${examens.length} examens récupérés avec succès depuis Firebase`);
      return examens;
    } catch (error) {
      console.error('Erreur lors de la récupération des examens:', error);
      throw error;
    }
  },

  /**
   * Récupère un examen par son ID
   * @param {string} id - ID de l'examen
   * @returns {Promise<Object|null>} Examen trouvé ou null
   */
  getExamenById: async (id) => {
    try {
      // Dans cette application, les examens sont stockés dans la collection 'admissions'
      const admissionRef = doc(db, 'admissions', id);
      const admissionSnap = await getDoc(admissionRef);
      
      if (admissionSnap.exists()) {
        return { id: admissionSnap.id, ...admissionSnap.data() };
      } else {
        console.log(`Aucun examen trouvé avec l'ID ${id}`);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'examen ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un nouvel examen
   * @param {Object} examenData - Données de l'examen
   * @returns {Promise<Object>} Examen créé avec son ID
   */
  addExamen: async (examenData) => {
    try {
      // Préparer les données pour l'admission
      const admissionData = {
        codeExamen: examenData.codeExamen,
        dateExamen: examenData.dateExamen,
        tarification: examenData.tarification,
        medecinId: examenData.medecinId,
        typeAdmission: 'EEG', // Type par défaut
        etat: 'En attente',
        // Autres champs nécessaires pour une admission
        idPatient: examenData.patientId || '',
        patientNom: examenData.patientNom || '',
        patientPrenom: examenData.patientPrenom || ''
      };
      
      // Utiliser la méthode addAdmission pour créer l'examen
      return await firebaseService.addAdmission(admissionData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'examen:', error);
      throw error;
    }
  },



  /**
   * Met à jour un examen
   * @param {string} id - ID de l'examen
   * @param {Object} examenData - Données à mettre à jour
   * @returns {Promise<Object>} Examen mis à jour
   */
  updateExamen: async (id, examenData) => {
    try {
      const examenRef = doc(db, 'examens', id);
      await updateDoc(examenRef, examenData);
      
      return {
        id,
        ...examenData
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'examen ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un examen
   * @param {string} id - ID de l'examen
   * @returns {Promise<void>}
   */
  deleteExamen: async (id) => {
    try {
      await deleteDoc(doc(db, 'examens', id));
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'examen ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les médecins
   * @returns {Promise<Array>} Liste des médecins
   */
  getAllMedecins: async () => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération des médecins depuis la collection "medecins"');
      
      const medecinsCollection = collection(db, 'medecins');
      const medecinsSnapshot = await getDocs(medecinsCollection);
      
      if (medecinsSnapshot.empty) {
        console.log('Aucun médecin trouvé dans Firebase');
        return [];
      }
      
      const medecins = medecinsSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${medecins.length} médecins récupérés avec succès depuis Firebase`);
      return medecins;
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      throw error;
    }
  },

  /**
   * Récupère un médecin par son ID
   * @param {string} id - ID du médecin
   * @returns {Promise<Object|null>} Médecin trouvé ou null
   */
  getMedecinById: async (id) => {
    try {
      const medecinDoc = await getDoc(doc(db, 'medecins', id));
      
      if (medecinDoc.exists()) {
        return {
          id: medecinDoc.id,
          ...medecinDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du médecin ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute un nouveau médecin
   * @param {Object} medecinData - Données du médecin
   * @returns {Promise<Object>} Médecin créé avec son ID
   */
  addMedecin: async (medecinData) => {
    try {
      const docRef = await addDoc(collection(db, 'medecins'), medecinData);
      
      return {
        id: docRef.id,
        ...medecinData
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médecin:', error);
      throw error;
    }
  },

  /**
   * Met à jour un médecin
   * @param {string} id - ID du médecin
   * @param {Object} medecinData - Données à mettre à jour
   * @returns {Promise<Object>} Médecin mis à jour
   */
  updateMedecin: async (id, medecinData) => {
    try {
      const medecinRef = doc(db, 'medecins', id);
      await updateDoc(medecinRef, medecinData);
      
      return {
        id,
        ...medecinData
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du médecin ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un médecin
   * @param {string} id - ID du médecin
   * @returns {Promise<void>}
   */
  deleteMedecin: async (id) => {
    try {
      await deleteDoc(doc(db, 'medecins', id));
    } catch (error) {
      console.error(`Erreur lors de la suppression du médecin ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère toutes les admissions
   * @returns {Promise<Array>} Liste des admissions
   */
  getAllAdmissions: async () => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération des admissions depuis la collection "admissions"');
      
      const admissionsCollection = collection(db, 'admissions');
      const admissionsSnapshot = await getDocs(admissionsCollection);
      
      if (admissionsSnapshot.empty) {
        console.log('Aucune admission trouvée dans Firebase');
        return [];
      }
      
      const admissions = admissionsSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${admissions.length} admissions récupérées avec succès depuis Firebase`);
      return admissions;
    } catch (error) {
      console.error('Erreur lors de la récupération des admissions:', error);
      throw error;
    }
  },

  /**
   * Récupère les admissions avec un état spécifique
   * @param {string} etat - L'état des admissions à récupérer
   * @returns {Promise<Array>} Liste des admissions avec l'état spécifié
   */
  getAdmissionsByStatus: async (etat) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Tentative de récupération des admissions avec l'état "${etat}"`);
      
      // Option 1: Sans tri (pas besoin d'index)
      const admissionsQuery = query(
        collection(db, 'admissions'),
        where('etat', '==', etat)
      );
      
      // Option 2: Tri après récupération (dans le code JavaScript)
      const admissionsSnapshot = await getDocs(admissionsQuery);
      const admissions = admissionsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.dateCreation - a.dateCreation); // Tri manuel
      
      if (admissions.length === 0) {
        console.log(`Aucune admission avec l'état "${etat}" trouvée dans Firebase`);
        return [];
      }
      
      console.log(`${admissions.length} admissions avec l'état "${etat}" récupérées avec succès`);
      return admissions;
    } catch (error) {
      console.error(`Erreur lors de la récupération des admissions avec l'état "${etat}":`, error);
      throw error;
    }
  },

  /**
   * Met à jour l'état d'une admission
   * @param {string} id - ID de l'admission
   * @param {string} newEtat - Nouvel état
   * @returns {Promise<Object>} Admission mise à jour
   */
  updateAdmissionStatus: async (id, newEtat) => {
    try {
      const admissionRef = doc(db, 'admissions', id);
      await updateDoc(admissionRef, { etat: newEtat });
      
      console.log(`État de l'admission ${id} mis à jour vers "${newEtat}"`);
      
      // Récupérer l'admission mise à jour
      const updatedAdmission = await getDoc(admissionRef);
      
      return {
        id,
        ...updatedAdmission.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'état de l'admission ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute une nouvelle observation
   * @param {Object} observationData - Données de l'observation
   * @returns {Promise<Object>} Observation créée avec son ID
   */
  addObservation: async (observationData) => {
    try {
      // Ajouter la date de création
      const dataWithTimestamp = {
        ...observationData,
        dateCreation: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'observations'), dataWithTimestamp);
      
      console.log(`Observation ajoutée avec succès, ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...dataWithTimestamp
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'observation:', error);
      throw error;
    }
  },

  /**
   * Ajoute un nouvel enregistrement EEG
   * @param {Object} enregistrementData - Données de l'enregistrement EEG
   * @returns {Promise<Object>} Enregistrement créé avec son ID
   */
  addEnregistrement: async (enregistrementData) => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative d\'ajout d\'un enregistrement EEG');
      
      // Ajouter la date de création si elle n'existe pas déjà
      const dataWithTimestamp = {
        ...enregistrementData,
        dateCreation: enregistrementData.dateCreation || serverTimestamp()
      };
      
      // Utilisation de la collection 'enregistrements'
      const enregistrementsCollection = collection(db, 'enregistrements');
      const docRef = await addDoc(enregistrementsCollection, dataWithTimestamp);
      
      console.log(`Enregistrement EEG ajouté avec succès, ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...dataWithTimestamp
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'enregistrement EEG:', error);
      throw error;
    }
  },

  /**
   * Récupère les observations d'une admission
   * @param {string} admissionId - ID de l'admission
   * @returns {Promise<Array>} Liste des observations pour cette admission
   */
  getObservationsByAdmissionId: async (admissionId) => {
    try {
      const observationsQuery = query(
        collection(db, 'observations'),
        where('admissionId', '==', admissionId),
        orderBy('dateCreation', 'desc')
      );
      
      const observationsSnapshot = await getDocs(observationsQuery);
      
      if (observationsSnapshot.empty) {
        console.log(`Aucune observation trouvée pour l'admission ${admissionId}`);
        return [];
      }
      
      const observations = observationsSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${observations.length} observations récupérées pour l'admission ${admissionId}`);
      return observations;
    } catch (error) {
      console.error(`Erreur lors de la récupération des observations pour l'admission ${admissionId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les utilisateurs
   * @returns {Promise<Array>} Liste des utilisateurs
   */
  getAllUsers: async () => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération des utilisateurs depuis la collection "users"');
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      if (usersSnapshot.empty) {
        console.log('Aucun utilisateur trouvé dans Firebase');
        return [];
      }
      
      const users = usersSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${users.length} utilisateurs récupérés avec succès depuis Firebase`);
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  /**
   * Récupère un utilisateur par son ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null
   */
  getUserById: async (id) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null
   */
  getUserByEmail: async (email) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Tentative de récupération de l'utilisateur avec l'email ${email}`);
      
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`Aucun utilisateur trouvé avec l'email ${email}`);
        return null;
      }
      
      // Retourner le premier utilisateur trouvé avec cet email
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur par email ${email}:`, error);
      throw error;
    }
  },

  /**
   * Écoute les changements d'un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @param {Function} callback - Fonction à appeler lorsque les données changent
   * @returns {Function} Fonction pour arrêter l'écoute
   */
  listenToUserChanges: (email, callback) => {
    try {
      if (!email) return () => {};
      
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', email));
      
      // Configurer l'écouteur
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          // Appeler le callback lorsque les données changent
          callback();
        }
      }, (error) => {
        console.error('Erreur lors de l\'écoute des changements utilisateur:', error);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'écoute des changements utilisateur:', error);
      return () => {};
    }
  },

  /**
   * Ajoute un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} Utilisateur créé avec son ID
   */
  addUser: async (userData) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative d\'ajout d\'un utilisateur');
      
      // Vérifier si l'email existe déjà
      const existingUser = await firebaseService.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      // Ajouter la date de création
      const dataWithTimestamp = {
        ...userData,
        dateCreation: serverTimestamp(),
        // Stocker le mot de passe en clair pour la démo (dans un système réel, il faudrait le hasher)
        // Dans un système réel, on utiliserait Firebase Auth
      };
      
      const usersCollection = collection(db, 'users');
      const docRef = await addDoc(usersCollection, dataWithTimestamp);
      
      console.log(`Utilisateur ajouté avec succès, ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...dataWithTimestamp
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour un utilisateur
   * @param {string} id - ID de l'utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Promise<Object>} Utilisateur mis à jour
   */
  updateUser: async (id, userData) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Tentative de mise à jour de l'utilisateur ${id}`);
      
      const userRef = doc(db, 'users', id);
      
      // Vérifier si l'utilisateur existe
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`);
      }
      
      // Mettre à jour les données
      await updateDoc(userRef, userData);
      
      console.log(`Utilisateur ${id} mis à jour avec succès`);
      
      // Récupérer l'utilisateur mis à jour
      const updatedUserDoc = await getDoc(userRef);
      
      return {
        id,
        ...updatedUserDoc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime un utilisateur
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Tentative de suppression de l'utilisateur ${id}`);
      
      const userRef = doc(db, 'users', id);
      
      // Vérifier si l'utilisateur existe
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`);
      }
      
      // Supprimer l'utilisateur
      await deleteDoc(userRef);
      
      console.log(`Utilisateur ${id} supprimé avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajoute une interprétation
   * @param {Object} interpretationData - Données de l'interprétation
   * @returns {Promise<Object>} Interprétation créée avec son ID
   */
  addInterpretation: async (interpretationData) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative d\'ajout d\'une interprétation');
      
      // Formater les dates pour éviter les erreurs d'affichage
      const formattedData = {};
      
      // Parcourir toutes les propriétés et convertir les objets Date en chaînes
      Object.keys(interpretationData).forEach(key => {
        const value = interpretationData[key];
        if (value instanceof Date) {
          formattedData[key] = value.toISOString();
        } else if (value && typeof value === 'object' && value.seconds) {
          // Convertir les Timestamp Firebase en chaînes
          formattedData[key] = new Date(value.seconds * 1000).toISOString();
        } else {
          formattedData[key] = value;
        }
      });
      
      // Ajouter la date de création si elle n'existe pas déjà
      const dataToSave = {
        ...formattedData,
        dateCreation: formattedData.dateCreation || new Date().toISOString()
      };
      
      // Utilisation de la collection 'interpretations'
      const interpretationsCollection = collection(db, 'interpretations');
      const docRef = await addDoc(interpretationsCollection, dataToSave);
      
      console.log(`Interprétation ajoutée avec succès, ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...dataToSave
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'interprétation:', error);
      throw error;
    }
  },
  
  /**
   * Récupère les interprétations d'une analyse
   * @param {string} analyseId - ID de l'analyse
   * @returns {Promise<Array>} Liste des interprétations de l'analyse
   */
  getInterpretationsByAnalyseId: async (analyseId) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Tentative de récupération des interprétations pour l'analyse ${analyseId}`);
      
      const q = query(
        collection(db, 'interpretations'),
        where('analyseId', '==', analyseId),
        orderBy('dateCreation', 'desc')
      );
      
      const interpretationsSnapshot = await getDocs(q);
      const interpretations = [];
      
      interpretationsSnapshot.forEach((doc) => {
        interpretations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`${interpretations.length} interprétations récupérées pour l'analyse ${analyseId}`);
      return interpretations;
    } catch (error) {
      console.error(`Erreur lors de la récupération des interprétations pour l'analyse ${analyseId}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour un utilisateur
   * @param {string} id - ID de l'utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Promise<Object>} Utilisateur mis à jour
   */
  updateUser: async (id, userData) => {
    try {
      const userRef = doc(db, 'users', id);
      
      // Si une mise à jour de mot de passe est demandée
      if (userData.updatePassword) {
        const { currentPassword, newPassword } = userData;
        
        // Supprimer les champs liés au mot de passe pour ne pas les stocker dans Firestore
        delete userData.currentPassword;
        delete userData.newPassword;
        delete userData.updatePassword;
        
        // Récupérer l'email de l'utilisateur pour la réauthentification
        const userDoc = await getDoc(userRef);
        const userEmail = userDoc.data().email;
        
        // Vérifier que l'utilisateur est connecté
        if (!auth.currentUser) {
          throw new Error('Utilisateur non connecté. Veuillez vous reconnecter pour changer votre mot de passe.');
        }
        
        try {
          // Réauthentifier l'utilisateur avec son mot de passe actuel
          const credential = EmailAuthProvider.credential(userEmail, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          
          // Mettre à jour le mot de passe
          await updatePassword(auth.currentUser, newPassword);
          console.log('Mot de passe mis à jour avec succès');
        } catch (authError) {
          console.error('Erreur d\'authentification:', authError);
          if (authError.code === 'auth/wrong-password') {
            throw new Error('Le mot de passe actuel est incorrect.');
          } else {
            throw new Error(`Erreur lors de la mise à jour du mot de passe: ${authError.message}`);
          }
        }
      }
      
      // Si une image de profil est fournie, la téléverser
      if (userData.profileImage) {
        const imageUrl = await firebaseService.uploadUserProfileImage(userData.profileImage, id);
        userData.photoURL = imageUrl;
        // Supprimer l'objet File pour ne pas l'enregistrer dans Firestore
        delete userData.profileImage;
      }
      
      await updateDoc(userRef, userData);
      
      return {
        id,
        ...userData
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Télécharger une image de profil pour un utilisateur
  uploadProfileImage: async (userId, imageFile) => {
    try {
      // Créer une référence pour l'image dans le stockage Firebase
      const storageRef = ref(storage, `profile_images/${userId}`);
      
      // Télécharger l'image
      const uploadResult = await uploadBytes(storageRef, imageFile);
      
      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image de profil:', error);
      throw error;
    }
  },
  
  /**
   * Téléverse la photo de profil d'un utilisateur et retourne l'URL
   * @param {File} imageFile - Fichier image à téléverser
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<string>} URL de l'image téléversée
   */
  uploadUserProfileImage: async (imageFile, userId) => {
    try {
      // Créer une référence pour l'image dans le stockage Firebase avec un timestamp pour éviter les problèmes de cache
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `users/profile_images/${userId}_${timestamp}`);
      
      // Télécharger l'image
      const uploadResult = await uploadBytes(storageRef, imageFile);
      
      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Mettre à jour l'utilisateur avec la nouvelle URL de photo de profil
      if (userId && !userId.startsWith('new_user_')) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { photoURL: downloadURL });
      }
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors du téléversement de la photo de profil:', error);
      throw error;
    }
  },

  /**
   * Supprime un utilisateur
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      console.log(`Utilisateur ${id} supprimé avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Ajoute une nouvelle interprétation
   * @param {Object} interpretationData - Données de l'interprétation
   * @returns {Promise<Object>} Interprétation créée avec son ID
   */
  addInterpretation: async (interpretationData) => {
    try {
      // Vérifier que db est bien défini
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative d\'ajout d\'une interprétation');
      
      // Ajouter la date de création si elle n'existe pas déjà
      const dataWithTimestamp = {
        ...interpretationData,
        dateCreation: interpretationData.dateCreation || serverTimestamp()
      };
      
      // Utilisation de la collection 'interpretations'
      const interpretationsCollection = collection(db, 'interpretations');
      const docRef = await addDoc(interpretationsCollection, dataWithTimestamp);
      
      console.log(`Interprétation ajoutée avec succès, ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...dataWithTimestamp
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'interprétation:', error);
      throw error;
    }
  },

  /**
   * Récupère un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object|null>} Utilisateur trouvé ou null
   */
  getUserByEmail: async (email) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      // Normaliser l'email pour éviter les problèmes avec les caractères accentués
      const normalizedEmail = normalizeString(email);
      
      // Récupérer tous les utilisateurs pour faire une comparaison insensible aux accents
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      if (usersSnapshot.empty) {
        console.log('Aucun utilisateur trouvé dans la base de données');
        return null;
      }
      
      // Rechercher l'utilisateur avec l'email correspondant (insensible aux accents)
      const userDoc = usersSnapshot.docs.find(doc => {
        const userData = doc.data();
        return normalizeString(userData.email) === normalizedEmail;
      });
      
      if (!userDoc) {
        console.log(`Aucun utilisateur trouvé avec l'email ${email}`);
        return null;
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur par email ${email}:`, error);
      throw error;
    }
  },
// };

  updateUserRoles: async (userId, roles) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Tentative de mise à jour des rôles pour l'utilisateur ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      
      // Vérifier si l'utilisateur existe
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error(`L'utilisateur avec l'ID ${userId} n'existe pas`);
      }
      
      // Mettre à jour les rôles
      await updateDoc(userRef, { roles });
      
      console.log(`Rôles de l'utilisateur ${userId} mis à jour avec succès`);
      
      // Récupérer l'utilisateur mis à jour
      const updatedUserDoc = await getDoc(userRef);
      
      return {
        id: userId,
        ...updatedUserDoc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des rôles de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère tous les utilisateurs
   * @returns {Promise<Array>} Liste des utilisateurs
   */
  getAllUsers: async () => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log('Tentative de récupération de tous les utilisateurs');
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      if (usersSnapshot.empty) {
        console.log('Aucun utilisateur trouvé dans Firebase');
        return [];
      }
      
      const users = usersSnapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() };
      });
      
      console.log(`${users.length} utilisateurs récupérés avec succès`);
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie si un utilisateur a une permission spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {string} permission - Permission à vérifier
   * @returns {Promise<boolean>} True si l'utilisateur a la permission, false sinon
   */
  checkUserPermission: async (userId, permission) => {
    try {
      if (!db) {
        console.error('La base de données Firebase n\'est pas initialisée');
        throw new Error('Firebase DB not initialized');
      }
      
      console.log(`Vérification de la permission ${permission} pour l'utilisateur ${userId}`);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        console.log(`L'utilisateur avec l'ID ${userId} n'existe pas`);
        return false;
      }
      
      const userData = userDoc.data();
      
      // Vérifier si l'utilisateur a des rôles définis
      if (!userData.roles) {
        console.log(`L'utilisateur ${userId} n'a pas de rôles définis`);
        return false;
      }
      
      // Vérifier si l'utilisateur a la permission spécifique
      const hasPermission = userData.roles[permission] === true;
      
      console.log(`L'utilisateur ${userId} ${hasPermission ? 'a' : 'n\'a pas'} la permission ${permission}`);
      return hasPermission;
    } catch (error) {
      console.error(`Erreur lors de la vérification de la permission ${permission} pour l'utilisateur ${userId}:`, error);
      return false;
    }
  }
};

export default firebaseService;