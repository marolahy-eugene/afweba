import React, { useState } from 'react';
import ReusableModal from '@/components/common/ReusableModal'; // Importer le composant ReusableModal
import PatientForm from '@/components/patients/PatientForm'; // Importer le composant PatientForm

export default function PatientAddModal({ open, onClose, onSuccess }) {
  const [message, setMessage] = useState(null);

  if (!open) return null;

  const handleFormSubmit = (patientId, error) => {
    if (error) {
      setMessage("Erreur lors de l'ajout du patient : " + error.message);
    } else {
      setMessage('Patient ajouté avec succès !');
      if (onSuccess) onSuccess(patientId);
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    }
  };

  const handleFormCancel = () => {
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Ajouter un nouveau patient"
      // Utilisez la prop modalClasses pour ajuster la taille et la position du modal (classes Tailwind CSS)
      // Exemple: modalClasses="max-w-2xl mt-10"
      modalClasses="max-w-2xl"
    >
      {message && (
        <div className={`mb-4 p-3 ${message.includes('succès') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 rounded`}>
          {message}
        </div>
      )}

      {/* Utiliser le composant PatientForm pour la création */}
      <PatientForm
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </ReusableModal>
  );
}