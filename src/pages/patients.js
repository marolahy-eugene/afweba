import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * Redirection vers la liste des patients
 * Cette page évite le conflit avec patients/index.js
 */
const PatientsRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patients/list');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirection - Patients</title>
      </Head>
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-xl mb-4">Redirection...</h1>
          <p>Vous êtes redirigé vers la liste des patients</p>
        </div>
      </div>
    </>
  );
};

export default PatientsRedirect; 