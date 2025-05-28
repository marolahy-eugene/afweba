import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import firebaseService from '@/services/firebaseService';
import { sanitizeFirestoreData, formatFirebaseDate } from '@/utils/firebaseUtils';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant de tableau dynamique réutilisable pour afficher des données de différentes collections
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.collectionName - Nom de la collection Firebase à afficher (examens, patients, utilisateurs)
 * @param {Array} props.columns - Liste des colonnes à afficher (format: [{key: 'id', label: 'ID'}, ...])
 * @param {Object} props.accessControl - Contrôle d'accès pour les boutons d'action {view: true, edit: false, delete: false}
 * @param {Function} props.onView - Fonction appelée lors du clic sur le bouton Afficher
 * @param {Function} props.onEdit - Fonction appelée lors du clic sur le bouton Modifier
 * @param {Function} props.onDelete - Fonction appelée lors du clic sur le bouton Supprimer
 * @param {string} props.filterField - Champ sur lequel filtrer les données (optionnel)
 * @param {string} props.filterValue - Valeur du filtre (optionnel)
 * @param {string} props.title - Titre du tableau (optionnel)
 */
const DynamicTable = ({
  collectionName,
  columns = [],
  accessControl = { view: true, edit: false, delete: false },
  onView,
  onEdit,
  onDelete,
  filterField,
  filterValue,
  title = 'Liste des données'
}) => {
  const router = useRouter();
  const { user, checkUserPermission } = useAuth();
  
  // États pour les données et la pagination
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Vérifier les permissions de l'utilisateur
  const canView = accessControl.view;
  const canEdit = accessControl.edit && checkUserPermission('edit_' + collectionName);
  const canDelete = accessControl.delete && checkUserPermission('delete_' + collectionName);

  // Fonction pour formater les données en fonction de la collection
  const formatData = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    const cleanData = sanitizeFirestoreData(items);
    
    switch (collectionName) {
      case 'examens':
      case 'admissions':
        return cleanData.map(item => ({
          id: item.id,
          patientNom: item.patientNom || 'Inconnu',
          patientPrenom: item.patientPrenom || '',
          type: item.typeAdmission || item.type || 'Standard',
          dateCreation: formatFirebaseDate(item.dateCreation),
          etat: item.etat || item.status || 'En attente',
          ...item
        }));
      
      case 'patients':
        return cleanData.map(item => ({
          id: item.id,
          nom: item.nom || 'Sans nom',
          prenom: item.prenom || '',
          dateNaissance: formatFirebaseDate(item.dateDeNaissance),
          genre: item.genre || 'Non spécifié',
          phone: item.phone || 'Non disponible',
          email: item.email || 'Non disponible',
          ...item
        }));
      
      case 'utilisateurs':
      case 'users':
        return cleanData.map(item => ({
          id: item.id || item.uid,
          nom: item.nom || item.displayName || 'Sans nom',
          email: item.email || 'Non disponible',
          role: item.role || item.fonction || 'Non spécifié',
          dateCreation: formatFirebaseDate(item.createdAt),
          ...item
        }));
      
      default:
        return cleanData;
    }
  };

  // Chargement des données depuis Firebase en temps réel
  useEffect(() => {
    setLoading(true);
    
    // Déterminer la collection à interroger
    let collectionPath = collectionName;
    if (collectionName === 'examens') collectionPath = 'admissions';
    if (collectionName === 'utilisateurs') collectionPath = 'users';
    
    // Créer une requête pour écouter la collection
    const dataRef = collection(db, collectionPath);
    let dataQuery;
    
    if (filterField && filterValue) {
      // Si un filtre est spécifié
      dataQuery = query(dataRef, where(filterField, '==', filterValue));
    } else {
      // Sinon, récupérer toutes les données avec tri par date de création si disponible
      try {
        dataQuery = query(dataRef, orderBy('createdAt', 'desc'));
      } catch (error) {
        dataQuery = dataRef;
      }
    }
    
    // Mettre en place l'écouteur pour les mises à jour en temps réel
    const unsubscribe = onSnapshot(dataQuery, async (snapshot) => {
      try {
        // Traiter les données
        const allItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Formater les données selon la collection
        const formattedData = formatData(allItems);
        
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error(`Erreur lors du traitement des données de ${collectionName}:`, error);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error(`Erreur lors de l'écoute des données de ${collectionName}:`, error);
      setLoading(false);
      setData([]);
      setFilteredData([]);
    });
    
    // Nettoyage lors du démontage du composant
    return () => unsubscribe();
  }, [collectionName, filterField, filterValue]);

  // Filtrer les données en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = data.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(lowercasedFilter)
        );
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  // Calculer les éléments à afficher sur la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour gérer le clic sur le bouton Afficher
  const handleView = (item) => {
    if (onView) {
      onView(item);
    } else {
      // Comportement par défaut en fonction de la collection
      switch (collectionName) {
        case 'examens':
          router.push(`/examens/details/${item.id}`);
          break;
        case 'patients':
          router.push(`/patients/${item.id}`);
          break;
        case 'utilisateurs':
          router.push(`/utilisateurs/${item.id}`);
          break;
        default:
          console.log('Afficher:', item);
      }
    }
  };

  // Fonction pour gérer le clic sur le bouton Modifier
  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    } else {
      // Comportement par défaut en fonction de la collection
      switch (collectionName) {
        case 'examens':
          router.push(`/examens/edit/${item.id}`);
          break;
        case 'patients':
          router.push(`/patients/edit/${item.id}`);
          break;
        case 'utilisateurs':
          router.push(`/utilisateurs/edit/${item.id}`);
          break;
        default:
          console.log('Modifier:', item);
      }
    }
  };

  // Fonction pour gérer le clic sur le bouton Supprimer
  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item);
    } else {
      // Comportement par défaut: confirmation puis suppression
      if (confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
        switch (collectionName) {
          case 'examens':
            firebaseService.deleteExamen(item.id);
            break;
          case 'patients':
            firebaseService.deletePatient(item.id);
            break;
          case 'utilisateurs':
            firebaseService.deleteUser(item.id);
            break;
          default:
            console.log('Supprimer:', item);
        }
      }
    }
  };

  // Obtenir la couleur de statut pour l'affichage (pour les examens)
  const getStatusColor = (etat) => {
    if (!etat) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    
    switch (etat) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Observation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Enregistrement':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Analyse':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Interprétation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Terminé':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Fonction pour rendre la valeur d'une cellule en fonction du type de données
  const renderCellValue = (item, column) => {
    const value = item[column.key];
    
    // Si la colonne a un rendu personnalisé, l'utiliser
    if (column.render) {
      return column.render(item);
    }
    
    // Rendu par défaut en fonction du type de données
    if (column.key === 'etat' || column.key === 'status') {
      return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(value)}`}>
          {value}
        </span>
      );
    }
    
    // Rendu par défaut
    return value || '-';
  };

  return (
    <div className="bg-custom-3 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-lg font-bold text-gray-300 dark:text-white mb-4 md:mb-0">
            {title}
          </h2>
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-700 dark:bg-gray-700 border border-gray-500 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
                placeholder={`Rechercher...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des données...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-300 text-md dark:text-gray-400">
              {searchTerm ? 'Aucun résultat trouvé.' : 'Aucune donnée disponible.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-custom-3 text-sm text-gray-200 font-bold dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    scope="col" 
                    className="px-6 py-3 text-left dark:text-gray-300 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                {/* Colonne d'actions si au moins une action est activée */}
                {(accessControl.view || canEdit || canDelete) && (
                  <th scope="col" className="px-6 py-3 text-right dark:text-gray-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-custom dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((item) => (
                <tr key={item.id} className="text-gray-200 hover:bg-gray-500 hover:text-gray-200 dark:hover:bg-gray-700">
                  {columns.map((column) => (
                    <td key={`${item.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {renderCellValue(item, column)}
                    </td>
                  ))}
                  {/* Boutons d'action */}
                  {(accessControl.view || canEdit || canDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Bouton Afficher - visible pour tous */}
                        {canView && (
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Afficher"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                        )}
                        
                        {/* Bouton Modifier - visible selon les permissions */}
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Modifier"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                        )}
                        
                        {/* Bouton Supprimer - visible selon les permissions */}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > itemsPerPage && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                <span className="font-medium">
                  {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem}
                </span>{' '}
                sur <span className="font-medium">{filteredData.length}</span> éléments
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Précédent</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Numéros de page */}
                {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === index + 1
                        ? 'z-10 bg-primary-500 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-white dark:text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } text-sm font-medium`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === Math.ceil(filteredData.length / itemsPerPage)
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Suivant</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;