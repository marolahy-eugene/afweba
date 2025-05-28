import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Plateforme EEG pour la gestion des analyses électroencéphalographiques" />
        {/* Le favicon sera généré automatiquement par Next.js */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 