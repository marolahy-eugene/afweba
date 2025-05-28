const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCuhCctEAL5W5ZpOtaPEgQdrqecNnS6s0I",
  authDomain: "afweba-plateforme.firebaseapp.com",
  projectId: "afweba-plateforme",
  storageBucket: "afweba-plateforme.appspot.com",
  messagingSenderId: "875901067748",
  appId: "1:875901067748:web:882c1043e3f4e4838727f1"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour lire le fichier JSON et l'importer dans Firebase
async function importPatientsData() {
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'patients.json');
    console.log('Lecture du fichier:', dataPath);
    
    // Lire le fichier JSON
    const patientsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`${patientsData.length} patients trouvés dans le fichier JSON`);
    
    // Référence à la collection "patients"
    const patientsCollection = collection(db, 'patients');
    
    // Ajouter chaque patient à Firebase
    let importCount = 0;
    for (const patient of patientsData) {
      try {
        // Convertir la date de naissance en objet Date si nécessaire
        if (patient.dateDeNaissance && typeof patient.dateDeNaissance === 'string') {
          const dateParts = patient.dateDeNaissance.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Les mois JavaScript commencent à 0
            const day = parseInt(dateParts[2]);
            
            // Créer un nouvel objet Date
            const dateObj = new Date(year, month, day);
            
            // Remplacer la chaîne par l'objet Date
            patient.dateDeNaissance = dateObj;
          }
        }
        
        // Ajouter le document à Firebase
        await addDoc(patientsCollection, patient);
        console.log(`Patient importé: ${patient.prenom} ${patient.nom}`);
        importCount++;
      } catch (err) {
        console.error(`Erreur lors de l'import du patient ${patient.prenom} ${patient.nom}:`, err);
      }
    }
    
    console.log(`Import terminé. ${importCount} patients importés sur ${patientsData.length}.`);
  } catch (error) {
    console.error('Erreur lors de l\'import des données:', error);
  }
}

// Exécuter la fonction d'import
importPatientsData()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });