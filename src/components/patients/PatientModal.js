import React, { useState } from 'react';
import ReusableModal from '@/components/common/ReusableModal'; // Importer le composant ReusableModal
import PatientForm from '@/components/patients/PatientForm'; // Importer le nouveau composant de formulaire

export default function PatientModal({ open, onClose, onSuccess }) {
  const [message, setMessage] = useState(null);

  if (!open) return null;

  const handleFormSubmit = (patientId) => {
    // Gérer la soumission réussie du formulaire (création)
    setMessage('Patient ajouté avec succès !');
    if (onSuccess) onSuccess();
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1000);
  };

  const handleFormCancel = () => {
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Nouveau patient"
      size="max-w-3xl" // Adapter la taille
      bgColor="bg-white" // Adapter la couleur de fond
      textColor="text-gray-900" // Adapter la couleur du texte
    >
      {message && (
        <div className={`mb-4 p-3 ${message.includes('succès') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 rounded`}>
          {message}
        </div>
      )}
      {/* Utiliser le composant PatientForm */}
      <PatientForm
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </ReusableModal>
  );
}