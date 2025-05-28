import React from 'react';
import Layout from '../../components/layout/Layout';
import ExamensTable from '../../components/examens/ExamensTable';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const ConsultationsPage = () => {
  const { user } = useAuth();
  const { activeColors } = useTheme(); // Get activeColors from theme context
  const admissionType = 'Consultation'; // Type d'examen pour cette page

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-300 dark:text-white">
            Consultations
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
            Gestion des examens de type consultation
          </p>
        </div>

        {/* Utilisation du composant réutilisable avec filtre par type */}
        <ExamensTable examenType={admissionType} />
      </div>
    </Layout>
  );
};

export default ConsultationsPage;