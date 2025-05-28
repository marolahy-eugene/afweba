import React from 'react';
import { useRouter } from 'next/router';
import ExamensTable from '@/components/examens/ExamensTable';

/**
 * Composant réutilisable pour afficher le tableau des examens en attente
 * Peut être utilisé dans tous les tableaux de bord des utilisateurs
 */
const ExamensEnAttente = ({ examens, loading, typeExamen = null, title = "Examens à traiter" }) => {
  return (
    <div className="bg-custom-3 rounded-lg shadow-md overflow-hidden">
      <ExamensTable 
        examens={examens} 
        loading={loading} 
        typeExamen={typeExamen} 
      />
    </div>
  );
};

export default ExamensEnAttente;