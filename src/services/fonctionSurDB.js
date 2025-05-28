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
  deleteField
} from 'firebase/firestore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { error } from 'console';

const normalizeString = (str) =>{
    if (!str) {
        return '';
    }else{
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
};

 const fonctionSurDB = {

    deleteField : () => deleteField() ,

    /**
     * 
     * @param {string} tables Nom de la collection sible
     * @returns Retourne un Tableaux d'Objet de la collection sible
     */
    getAllData : async (tables) => {
        try {
            if (!db) {
                console.log("La base de données firebase n'est pas initialisé !");
                throw new error("Firebase DB is not initilized !");
            }

            console.log(`Tentative de récupération de donnée ${tables} !`);

            const dataCollected = collection(db, tables) ; // Récupération de données
            const dataSnapshot = await getDoc(dataCollected);

            if (dataSnapshot.empty) {
                console.log(`Aucun ${tables}`);
                return [];
            }

            const allData = dataSnapshot.doc.map(doc => {
                return {
                    id: doc.id,
                    nom: doc.nom,
                    ...doc.data()
                };
            });

            console.log(`${allData.length} ${tables} récupérés avec succès depuis firebase :) `);
            return allData ;

        } catch (error) {
            console.log('Eurrer lors de la récupération des données dans la BDD : ', error);
            throw error ;
        }
    },

    /**
     * 
     * @param {string} tables Nom de la collection sible
     * @param {*} id Identifiant de réference pour le filtre
     * @returns Retourne un Objet de la collection sible référé par l'identifiant [id]
     */
    getDataById : async (tables , id) => {
        try {
            const dataDoc = await getDoc(doc(db, tables, id));
            if (dataDoc.exists()) {
                return{
                    id: dataDoc.id,
                    ...dataDoc.data() 
                };
            }
            return null ;

        } catch (error) {
            console.log(`Echec de récupération de donnée pour l'identification ${id} dans la collection ${tables}`);
            throw error;
        }
    },

    /**
     * 
     * @param {string} tables Nom de la collection sible
     * @param {*} nouveauDonne Nouvelle données à inserer dans la base de données
     * @returns Retourne un objet
     */
    addData: async (tables, nouveauDonne) => {
        try {
            donneAjouter = await addDoc(collection(db, tables, nouveauDonne));
            return {
                id : donneAjouter.id,
                ...nouveauDonne
            };

        } catch (error) {
            console.log(`Echec d'enregistrement ${tables} dans la base données`);
            throw error;
        }
    },

    /**
     * 
     * @param {*} id Indentifiant d'élément à mettre à jour
     * @param {*} tables Nim de la  collection sible pour la mis à jour
     * @param {*} newData Nouveau données à metre à jour
     * @returns Retourne un Objet
     */
    updateData : async (id, tables, newData) => {
        try {
            if (!db) {
                console.error('La base de données Firebase n\'est pas initialisée');
                throw new Error('Firebase DB not initialized');
            }
              
            console.log(`Tentative de mise à jour de l'utilisateur ${id}`);
            
            
            const refData = doc(db, tables, id) ;
            const currentData = await getDoc(refData);

            if (!currentData.exists()) {
                throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`);
            }

            await updateDoc(refData, currentData);
            const dataUpdated = await getDoc(refData);
            
            return {
                id,
                ...dataUpdated.data()
            };            

        } catch (error) {
            console.log(`Echec de mis à jours pour l'identifiant : ${id} : `,error);
            throw error;
        }
    },

    /**
     * 
     * @param {*} id Indentifiant de la sible à supprimer
     * @param {*} tables Nom de la  collection sible
     */
    deleteData: async (id, tables) => {
        try {
            await deleteDoc(db, tables, id);
        } catch (error) {
            console.log(`Echec de suppression pour l'identifiant : ${id} : `,error);
            throw error;
        }
    },

    findByElement: async (element, tables) => {
        
    }
 }