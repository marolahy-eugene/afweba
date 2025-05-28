import React from 'react';
import Layout from '@/components/layout/Layout';
import DynamicTable from '@/components/common/DynamicTable';
import { useAuth } from '@/hooks/useAuth';

/**
 * Page de liste des examens utilisant le composant DynamicTable
 */
const ExamensListePage = () => {
  const { user } = useAuth();

  // Définition des colonnes pour le tableau des examens
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'patientNom', label: 'Patient' },
    { key: 'type', label: 'Type' },
    { key: 'dateCreation', label: 'Date' },
    { key: 'etat', label: 'État' },
    // Vous pouvez ajouter d'autres colonnes selon vos besoins
  ];

  // Configuration des contrôles d'accès
  const accessControl = {
    view: true, // Tous les utilisateurs peuvent voir les détails
    edit: true, // L'accès à la modification sera vérifié par le composant
    delete: true, // L'accès à la suppression sera vérifié par le composant
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-300 dark:text-white">
            Liste des examens
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
            Gestion des examens EEG
          </p>
        </div>

        {/* Utilisation du composant DynamicTable */}
        <DynamicTable
          collectionName="examens"
          columns={columns}
          accessControl={accessControl}
          title="Liste des examens"
        />
      </div>
    </Layout>
  );
};

export default ExamensListePage;