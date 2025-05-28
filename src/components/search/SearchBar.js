import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import algoliaService from '../../services/algoliaService';

/**
 * Fonction pour débouncer les appels de recherche
 * Cela évite d'envoyer trop de requêtes pendant la frappe
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Barre de recherche optimisée avec Algolia
 */
const SearchBar = ({ onSearch, onClear, placeholder, className, collection }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction de recherche optimisée
  const performSearch = useCallback(async (searchQuery) => {
    // Ne pas rechercher si la requête est vide
    if (!searchQuery || searchQuery.trim() === '') {
      if (onClear) onClear();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let results;
      
      // Vérifier si Algolia est disponible
      const isAlgoliaAvailable = await algoliaService.checkConnection();
      
      if (isAlgoliaAvailable) {
        console.log('Recherche avec Algolia pour la collection:', collection);
        // Utiliser le service Algolia en fonction de la collection
        switch (collection) {
          case 'patients':
            results = await algoliaService.searchPatients(searchQuery);
            break;
          case 'analyses':
            results = await algoliaService.searchAnalyses(searchQuery);
            break;
          case 'admissions':
            results = await algoliaService.searchAdmissions(searchQuery);
            break;
          case 'examens':
            results = await algoliaService.searchExamens(searchQuery);
            break;
          case 'medecins':
            results = await algoliaService.searchMedecins(searchQuery);
            break;
          default:
            // Collection par défaut (patients)
            results = await algoliaService.searchPatients(searchQuery);
        }
        
        if (onSearch) onSearch(results);
      } else {
        console.log('Algolia non disponible, utilisation de la recherche locale');
        // Fallback : recherche locale
        if (onSearch) onSearch({ query: searchQuery, useLocalSearch: true });
      }
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError("Erreur lors de la recherche. Utilisation de la recherche locale.");
      // Fallback en cas d'erreur
      if (onSearch) onSearch({ query: searchQuery, useLocalSearch: true, error: err.message });
    } finally {
      setLoading(false);
    }
  }, [onSearch, onClear, collection]);

  // Créer la fonction debounced
  const debouncedSearch = useCallback(
    debounce((searchQuery) => performSearch(searchQuery), 300),
    [performSearch]
  );

  // Effet pour déclencher la recherche quand la requête change
  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else if (onClear) {
      onClear();
    }
  }, [query, debouncedSearch, onClear]);

  // Gérer le changement d'input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setQuery('');
    setError(null);
    if (onClear) onClear();
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin h-5 w-5 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          ) : (
            <FiSearch className="w-5 h-5 text-gray-500" />
          )}
        </div>

        <input
          type="text"
          className="bg-gray-600 dark:bg-gray-700 border border-gray-500 dark:border-gray-600 text-gray-100 dark:text-gray-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:placeholder-gray-400 dark:text-white"
          placeholder={placeholder || "Rechercher..."}
          value={query}
          onChange={handleInputChange}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            type="button"
          >
            <FiX className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-1 text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchBar;