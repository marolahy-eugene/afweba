/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // i18n désactivé pour améliorer la stabilité de connexion et d'affichage
  /*i18n: {
    locales: ['fr'],
    defaultLocale: 'fr',
  },*/
  // Configuration pour assurer le support UTF-8
  webpack: (config) => {
    // Assurer que l'encodage UTF-8 est correctement géré
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig;