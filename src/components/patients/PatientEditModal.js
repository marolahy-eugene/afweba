import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import PatientForm from '@/components/patients/PatientForm'; // Importer le composant PatientForm
import firebaseService from '@/services/firebaseService';

export default function PatientEditModal({ open, onClose, patient, onSuccess, size = 'max-w-5xl', positionClasses = 'items-center justify-center' }) {
  const [message, setMessage] = useState(null);
  const [fullPatientData, setFullPatientData] = useState(null);

  // Charger les données complètes du patient lorsque le modal s'ouvre
  useEffect(() => {
    const fetchFullPatientData = async () => {
      if (open && patient && patient.id) {
        try {
          const completePatient = await firebaseService.getPatientById(patient.id);
          if (completePatient) {
            setFullPatientData(completePatient);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données complètes du patient:', error);
          // Gérer l'erreur ou utiliser les données partielles si nécessaire
          setMessage("Erreur lors du chargement des données du patient.");
        }
      }
    };

    if (open && patient) {
      fetchFullPatientData();
    }
  }, [open, patient]);

  if (!open || !patient) return null;

  const handleFormSubmit = (patientId, error) => {
    if (error) {
      setMessage("Erreur lors de la modification du patient : " + error.message);
    } else {
      setMessage('Patient modifié avec succès !');
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex ${positionClasses} z-50 p-4 overflow-y-auto`}>
      <div className={`bg-custom-3 text-gray-400 text-md rounded-lg shadow-xl w-full ${size} max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Modifier le patient</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX size={24} />
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 ${message.includes('succès') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 rounded`}>
              {message}
            </div>
          )}

          {/* Utiliser le composant PatientForm et lui passer les données complètes */}
          {fullPatientData ? (
            <PatientForm
              initialData={fullPatientData}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
            // Afficher un message de chargement ou d'erreur si les données ne sont pas encore chargées
            <div>Chargement des données du patient...</div>
          )}
        </div>
      </div>
    </div>
  );
}