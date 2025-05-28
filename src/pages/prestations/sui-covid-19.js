import React from 'react';
import Layout from '../../components/layout/Layout';
import ExamensTable from '../../components/examens/ExamensTable';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const SuiCovid19Page = () => {

  const admissionType = 'Suivi covid 19'; // Filter type for this page
  const { user } = useAuth();
  const { activeColors } = useTheme(); // Get activeColors from theme context

  return (
    <Layout>
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-300 dark:text-white">
          {admissionType}
        </h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
          Gestion des examens de type {admissionType}
        </p>
      </div>

      {/* Utilisation du composant réutilisable avec filtre par type */}
      <ExamensTable examenType={admissionType} />
    </div>
  </Layout>
  );
};

export default SuiCovid19Page;