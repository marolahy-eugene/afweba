import React, { useState, useEffect } from 'react';
import { FiServer, FiDatabase, FiActivity, FiClipboard, FiChevronLeft, FiChevronRight, FiDownload, FiRefreshCw } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';

/**
 * Tableau de bord pour les techniciens
 */
const TechnicienPanel = () => {
  const { ROLES, user } = useAuth();
  
  // États pour les statistiques du système
  const [stats, setStats] = useState({
    systemeStatus: 'Opérationnel',
    serveurUptime: '99.8%',
    stockageDispo: '78%',
    derniereSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), // Il y a 2 heures
    examensRecents: 8,
    maintenancePlanifiee: 'Aucune'
  });
  
  // États pour les tâches
  const [taches, setTaches] = useState([
    { id: 1, titre: 'Maintenance du serveur EEG', priorite: 'Haute', echeance: '28/11/2023', statut: 'En cours' },
    { id: 2, titre: 'Sauvegarde mensuelle', priorite: 'Moyenne', echeance: '30/11/2023', statut: 'Planifiée' },
    { id: 3, titre: 'Mise à jour du logiciel d\'analyse', priorite: 'Basse', echeance: '05/12/2023', statut: 'Planifiée' },
    { id: 4, titre: 'Vérification des capteurs', priorite: 'Haute', echeance: '25/11/2023', statut: 'Terminée' },
    { id: 5, titre: 'Contrôle qualité des données', priorite: 'Moyenne', echeance: '27/11/2023', statut: 'Terminée' }
  ]);
  
  // États pour la pagination des tâches
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(3);
  
  // Simule une mise à jour des données système
  const updateSystemStatus = () => {
    // Mise à jour simulée des statistiques
    setStats({
      ...stats,
      derniereSync: new Date().toLocaleString(),
      stockageDispo: `${Math.floor(70 + Math.random() * 20)}%`
    });
  };
  
  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = taches.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(taches.length / tasksPerPage);
  
  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Pour créer une nouvelle tâche
  const handleCreateTask = () => {
    const newTask = {
      id: taches.length + 1,
      titre: 'Nouvelle tâche',
      priorite: 'Moyenne',
      echeance: new Date().toLocaleDateString(),
      statut: 'Planifiée'
    };
    
    setTaches([...taches, newTask]);
  };
  
  // Pour obtenir la couleur de priorité
  const getPriorityColor = (priorite) => {
    switch (priorite.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'basse':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  // Pour obtenir la couleur de statut
  const getStatusColor = (statut) => {
    switch (statut.toLowerCase()) {
      case 'en cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planifiée':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'terminée':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <RoleBasedRoute roles={ROLES.TECHNICIEN}>
      <Layout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FiServer className="mr-2" /> 
              Tableau de bord Technicien
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gestion technique de la plateforme EEG
            </p>
          </div>
          
          {/* Rangée de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 mr-4">
                  <FiServer className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut du système</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{stats.systemeStatus}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uptime: {stats.serveurUptime}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 mr-4">
                  <FiDatabase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stockage disponible</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{stats.stockageDispo}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 dark:bg-gray-700">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full dark:bg-green-500" 
                      style={{ width: stats.stockageDispo }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 mr-4">
                  <FiActivity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Examens récents</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{stats.examensRecents}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">7 jours précédents</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 mr-4">
                  <FiClipboard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance planifiée</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{stats.maintenancePlanifiee}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dernière sync: {stats.derniereSync}</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Actions rapides */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions rapides</h2>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={updateSystemStatus} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <FiRefreshCw className="mr-2" /> Rafraîchir les statuts
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
                <FiDownload className="mr-2" /> Sauvegarde manuelle
              </button>
              <button 
                onClick={handleCreateTask}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <FiClipboard className="mr-2" /> Nouvelle tâche
              </button>
            </div>
          </div>
          
          {/* Liste des tâches */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-0">
                  Tâches et maintenance
                </h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tâche
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentTasks.map((tache) => (
                    <tr key={tache.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {tache.titre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(tache.priorite)}`}>
                          {tache.priorite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {tache.echeance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tache.statut)}`}>
                          {tache.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FiChevronLeft className="mr-1 h-5 w-5" />
                    Précédent
                  </button>
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Suivant
                    <FiChevronRight className="ml-1 h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Guide rapide */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Guide rapide du technicien
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Maintenance du système</h3>
                <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Vérification quotidienne des serveurs</li>
                  <li>Sauvegarde hebdomadaire complète</li>
                  <li>Optimisation mensuelle de la base de données</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
                <h3 className="font-medium text-green-700 dark:text-green-300 mb-2">Support matériel</h3>
                <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Calibrage des appareils EEG</li>
                  <li>Vérification des connexions</li>
                  <li>Tests de qualité des électrodes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RoleBasedRoute>
  );
};

// Implémentation de getInitialProps pour résoudre l'erreur
TechnicienPanel.getInitialProps = async () => {
  return {
    props: {}
  };
};

export default TechnicienPanel;