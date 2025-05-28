import React, { useState, useEffect } from 'react';
import ReusableModal from '@/components/common/ReusableModal'; // Importer le composant ReusableModal
import AdmissionForm from '@/components/admission/AdmissionForm'; // Importer le nouveau composant de formulaire

export default function AdmissionModal({ open, onClose, patient, initialData }) {
  const [message, setMessage] = useState(null);

  if (!open || !patient) return null;

  const handleFormSubmit = (admissionId, error) => {
    if (error) {
      setMessage("Erreur lors de l'enregistrement de l'admission : " + error.message);
    } else {
      setMessage('Admission enregistrée avec succès !');
      // Fermer le modal après un délai
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 2000);
    }
  };

  const handleFormCancel = () => {
    onClose();
  };

  const modalTitle = initialData ? `Modifier Admission de ${patient.prenom} ${patient.nom}` : `Nouvelle Admission de ${patient.prenom} ${patient.nom}`;

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      // Utilisez la prop modalClasses pour ajuster la taille et la position du modal (classes Tailwind CSS)
      // Exemple: modalClasses="max-w-2xl mt-10"
      modalClasses="max-w-[100vh] bg-custom-5"
    >
      {message && (
        <div className={`mb-4 p-3 ${message.includes('succès') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 rounded`}>
          {message}
        </div>
      )}

      {/* Utiliser le composant AdmissionForm */}
      <AdmissionForm
        initialData={initialData}
        patient={patient}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </ReusableModal>
  );
}
