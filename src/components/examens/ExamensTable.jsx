import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiFileText, FiEye, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SearchBar from '@/search/SearchBar';
import { formatFirebaseDate } from '@/utils/firebaseUtils';

/**
 * Composant réutilisable pour afficher un tableau des examens à traiter
 * Peut être filtré par type d'examen
 */
const ExamensTable = ({ examens, /* loading, */ typeExamen = null }) => {
  const router = useRouter();
  
  // États pour la pagination et la recherche
  const [filteredExamens, setFilteredExamens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [examensPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les examens par type si spécifié
  useEffect(() => {
    let filtered = examens;
    
    // Filtrer par type d'examen si spécifié
    if (typeExamen) {
      filtered = examens.filter(examen => examen.type === typeExamen);
    }
    
    // Appliquer le filtre de recherche
    if (searchTerm.trim() === '') {
      setFilteredExamens(filtered);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(examen => {
        return (
          examen.patientNom?.toLowerCase().includes(lowercasedFilter) ||
          examen.patientPrenom?.toLowerCase().includes(lowercasedFilter) ||
          examen.id?.toLowerCase().includes(lowercasedFilter) ||
          examen.patientId?.toLowerCase().includes(lowercasedFilter)
        );
      });
      setFilteredExamens(filtered);
    }
    
    setCurrentPage(1);
  }, [searchTerm, examens, typeExamen]);

  // Calculer les examens à afficher sur la page actuelle
  const indexOfLastExamen = currentPage * examensPerPage;
  const indexOfFirstExamen = indexOfLastExamen - examensPerPage;
  const currentExamens = filteredExamens.slice(indexOfFirstExamen, indexOfLastExamen);

  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour rediriger vers la page appropriée selon l'état de l'examen
  const handleObservation = (examen) => {
    switch(examen.etat) {
      case 'Observation':
        router.push(`/examens/observation/${examen.id}`);
        break;
      case 'Enregistrement':
        router.push(`/examens/enregistrement/${examen.id}`);
        break;
      case 'Analyse':
        router.push(`/examens/analyse/${examen.id}`);
        break;
      case 'Interprétation':
        router.push(`/examens/interpretation/${examen.id}`);
        break;
      default:
        router.push(`/examens/details/${examen.id}`);
        break;
    }
  };

  // Obtenir la couleur de statut pour l'affichage
  const getStatusColor = (etat) => {
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

  return (
    <div className="bg-custom-3 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-200 mb-4 md:mb-0">
          Examens à traiter {typeExamen ? `(${typeExamen})` : ''}
        </h2>
        <div className="w-full md:w-1/3">
          <SearchBar 
            placeholder="Rechercher un patient ou un examen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
      </div>

      {/* loading ? ( */}
        {/* <div className="text-center py-4"> */}
          {/* <div className="spinner"></div> */}
          {/* <p className="mt-2 text-gray-300">Chargement des examens...</p> */}
        {/* </div> */}
      {/* ) : */}
       {currentExamens.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300">
            {searchTerm ? 'Aucun examen ne correspond à votre recherche.' : 'Aucun examen à traiter pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 tbl-custom">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  État
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-custom-2 divide-y divide-gray-700">
              {currentExamens.map((examen) => (
                <tr key={examen.id} className="hover:bg-custom">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {examen.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-200">
                      {examen.patientNom} {examen.patientPrenom}
                    </div>
                    <div className="text-sm text-gray-400">{examen.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {examen.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {examen.dateCreation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(examen.etat)}`}>
                      {examen.etat}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleObservation(examen)}
                      className="text-blue-400 hover:text-blue-300 mr-4 transition-colors duration-200"
                      title="Voir les détails"
                    >
                      <FiEye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredExamens.length > examensPerPage && (
        <div className="flex justify-between items-center mt-6 px-4">
          <div className="text-sm text-gray-400">
            Affichage de {indexOfFirstExamen + 1} à {Math.min(indexOfLastExamen, filteredExamens.length)} sur {filteredExamens.length} examens
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: Math.ceil(filteredExamens.length / examensPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredExamens.length / examensPerPage)}
              className={`px-3 py-1 rounded-md ${currentPage === Math.ceil(filteredExamens.length / examensPerPage) ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamensTable;