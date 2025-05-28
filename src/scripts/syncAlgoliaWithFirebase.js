// Script pour synchroniser les données Firebase avec Algolia
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const algoliasearch = require('algoliasearch');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCuhCctEAL5W5ZpOtaPEgQdrqecNnS6s0I",
  authDomain: "afweba-plateforme.firebaseapp.com",
  projectId: "afweba-plateforme",
  storageBucket: "afweba-plateforme.appspot.com",
  messagingSenderId: "875901067748",
  appId: "1:875901067748:web:882c1043e3f4e4838727f1"
};

// Configuration Algolia
const ALGOLIA_APP_ID = 'TSMFC7MXLR';
const ALGOLIA_ADMIN_API_KEY = 'b9766e104041856cd04571e4abad7baf'; // Remplir avec votre clé API Admin Algolia
const ALGOLIA_INDEX_NAME = 'patients';

async function syncFirebaseToAlgolia() {
  if (!ALGOLIA_ADMIN_API_KEY) {
    console.error('Erreur: Clé API Admin Algolia manquante');
    return;
  }

  console.log('Début de la synchronisation Firebase -> Algolia');

  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('Firebase initialisé');

    // Initialiser Algolia
    const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
    const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);
    console.log('Algolia initialisé');

    // Récupérer les patients depuis Firebase
    const patientsCollection = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsCollection);
    
    if (patientsSnapshot.empty) {
      console.log('Aucun patient trouvé dans Firebase');
      return;
    }

    // Préparer les données pour Algolia
    const patients = [];
    patientsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Traitement du patient ${doc.id}:`, data);
      
      // Vérifie que les champs obligatoires existent
      if (!data.nom) {
        console.warn(`Patient ${doc.id} sans nom, ajout d'une valeur par défaut`);
        data.nom = 'Sans nom';
      }
      
      // Formater les dates si nécessaire
      if (data.dateDeNaissance && typeof data.dateDeNaissance === 'object' && data.dateDeNaissance.seconds) {
        const date = new Date(data.dateDeNaissance.seconds * 1000);
        console.log(`Date de naissance convertie pour ${doc.id}: ${date.toISOString().split('T')[0]}`);
        data.dateDeNaissanceFormatted = date.toISOString().split('T')[0];
      }
      
      // S'assurer que l'objet a un objectID (requis par Algolia)
      patients.push({
        objectID: doc.id,
        ...data
      });
    });

    console.log(`${patients.length} patients récupérés depuis Firebase`);
    
    // Afficher un échantillon des données pour vérification
    if (patients.length > 0) {
      console.log('Exemple de données à indexer:', JSON.stringify(patients[0], null, 2));
    }

    // Indexer les données dans Algolia
    const result = await index.saveObjects(patients);
    console.log(`Indexation réussie: ${result.objectIDs.length} objets indexés`);

    // Configurer les paramètres de recherche
    await index.setSettings({
      searchableAttributes: [
        'nom',
        'prenom',
        'email',
        'phone',
        'profession',
        'domicile',
        'genre',
        'assuranceMaladie'
      ],
      attributesForFaceting: ['genre', 'profession'],
      // Ces attributs seront utilisés pour filtrer
      customRanking: ['desc(dateCreation)']
      // Trier par date de création décroissante par défaut
    });

    console.log('Paramètres de recherche configurés avec succès');
    console.log('Synchronisation terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

// Exécuter le script
syncFirebaseToAlgolia()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });