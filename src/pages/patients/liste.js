import React from 'react';
import Layout from '@/components/layout/Layout';
import DynamicTable from '@/components/common/DynamicTable';
import { useAuth } from '@/hooks/useAuth';

/**
 * Page de liste des patients utilisant le composant DynamicTable
 */
const PatientsListePage = () => {
  const { user } = useAuth();

  // Définition des colonnes pour le tableau des patients
  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'nom', 
      label: 'Nom complet',
      render: (patient) => `${patient.nom} ${patient.prenom}`
    },
    { key: 'dateNaissance', label: 'Date de naissance' },
    { key: 'genre', label: 'Genre' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'email', label: 'Email' },
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
            Liste des patients
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
            Gestion des dossiers patients
          </p>
        </div>

        {/* Utilisation du composant DynamicTable */}
        <DynamicTable
          collectionName="patients"
          columns={columns}
          accessControl={accessControl}
          title="Liste des patients"
        />
      </div>
    </Layout>
  );
};

export default PatientsListePage;