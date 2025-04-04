/**
 * Script d'installation des paquets pour le dashboard FoxTic
 * Ce script installe tous les paquets nécessaires pour le dashboard
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Paquets principaux pour le dashboard
const dashboardPackages = {
  // Paquets frontend
  frontend: [
    // Vue.js et écosystème
    { name: 'vue', version: '~3.4.2' },
    { name: 'vue-router', version: '~4.2.5' },
    { name: 'vue-i18n', version: '~9.14.3' },
    { name: 'vue-chartjs', version: '~5.2.0' },
    { name: 'vue-confirm-dialog', version: '~1.0.2' },
    { name: 'vue-contenteditable', version: '~3.0.4' },
    { name: 'vue-multiselect', version: '~3.0.0-alpha.2' },
    { name: 'vue-toastification', version: '~2.0.0-rc.5' },
    { name: 'vuedraggable', version: '~4.1.0' },
    
    // UI et composants
    { name: 'bootstrap', version: '5.1.3' },
    { name: '@popperjs/core', version: '~2.10.2' },
    { name: '@fortawesome/fontawesome-svg-core', version: '~1.2.36' },
    { name: '@fortawesome/free-solid-svg-icons', version: '~5.15.4' },
    { name: '@fortawesome/free-regular-svg-icons', version: '~5.15.4' },
    { name: '@fortawesome/vue-fontawesome', version: '~3.0.0-5' },
    { name: '@vuepic/vue-datepicker', version: '~3.4.8' },
    
    // Graphiques et visualisation
    { name: 'chart.js', version: '~4.2.1' },
    { name: 'chartjs-adapter-dayjs-4', version: '~1.0.4' },
    { name: 'chroma-js', version: '~2.4.2' },
    
    // Utilitaires
    { name: 'dayjs', version: '~1.11.5' },
    { name: 'axios', version: '~0.29.0' },
    { name: 'socket.io-client', version: '~4.8.0' }
  ],
  
  // Paquets backend
  backend: [
    // Serveur et API
    { name: 'express', version: '~4.21.0' },
    { name: 'socket.io', version: '~4.8.0' },
    { name: 'compression', version: '~1.7.4' },
    { name: 'express-static-gzip', version: '~2.1.7' },
    
    // Base de données
    { name: 'knex', version: '~3.1.0' },
    { name: '@louislam/sqlite3', version: '15.1.6' },
    { name: 'mongodb', version: '~4.17.1' },
    { name: 'mysql2', version: '~3.11.3' },
    { name: 'pg', version: '~8.11.3' },
    
    // Authentification et sécurité
    { name: 'jsonwebtoken', version: '~9.0.0' },
    { name: 'bcryptjs', version: '~2.4.3' },
    { name: 'password-hash', version: '~1.2.2' },
    
    // Utilitaires
    { name: 'dotenv', version: '~16.0.3' },
    { name: 'croner', version: '~8.1.0' },
    { name: 'nanoid', version: '~3.3.4' }
  ],
  
  // Outils de développement
  devTools: [
    // Build et bundling
    { name: 'vite', version: '~5.4.15' },
    { name: '@vitejs/plugin-vue', version: '~5.0.1' },
    { name: 'vite-plugin-compression', version: '~0.5.1' },
    
    // CSS et styles
    { name: 'sass', version: '~1.42.1' },
    { name: 'postcss-scss', version: '~4.0.4' },
    { name: 'postcss-rtlcss', version: '~3.7.2' },
    
    // TypeScript
    { name: 'typescript', version: '~4.4.4' },
    { name: '@types/node', version: '^20.8.6' },
    
    // Linting et qualité
    { name: 'eslint', version: '~8.14.0' },
    { name: 'eslint-plugin-vue', version: '~8.7.1' },
    { name: 'stylelint', version: '^15.10.1' },
    
    // Utilitaires de développement
    { name: 'cross-env', version: '~7.0.3' },
    { name: 'concurrently', version: '^7.1.0' },
    { name: 'wait-on', version: '^7.2.0' }
  ]
};

/**
 * Installe un groupe de paquets
 * @param {Array} packages - Liste des paquets à installer
 * @param {String} type - Type de paquets (frontend, backend, devTools)
 */
function installPackages(packages, type) {
  console.log(`${colors.blue}Installation des paquets ${type}...${colors.reset}`);
  
  // Création de la chaîne de commande pour npm
  const packagesString = packages.map(pkg => `${pkg.name}@${pkg.version}`).join(' ');
  const isDev = type === 'devTools' ? '--save-dev' : '--save';
  
  try {
    console.log(`${colors.yellow}npm install ${isDev} ${packagesString}${colors.reset}`);
    execSync(`npm install ${isDev} ${packagesString}`, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Paquets ${type} installés avec succès${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Erreur lors de l'installation des paquets ${type}:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log(`${colors.green}=== Installation des paquets pour le dashboard FoxTic ===${colors.reset}`);
  
  // Vérification de l'existence de package.json
  if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.log(`${colors.yellow}Initialisation d'un nouveau package.json...${colors.reset}`);
    execSync('npm init -y', { stdio: 'inherit' });
  }
  
  // Installation des paquets par groupe
  installPackages(dashboardPackages.frontend, 'frontend');
  installPackages(dashboardPackages.backend, 'backend');
  installPackages(dashboardPackages.devTools, 'devTools');
  
  // Ajout des scripts npm utiles
  console.log(`${colors.blue}Mise à jour des scripts npm...${colors.reset}`);
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    
    // Ajout des scripts si non existants
    packageJson.scripts = packageJson.scripts || {};
    
    if (!packageJson.scripts.dev) {
      packageJson.scripts.dev = "concurrently -k -r \"wait-on tcp:3000 && npm run start-server-dev \" \"npm run start-frontend-dev\"";
    }
    
    if (!packageJson.scripts['start-frontend-dev']) {
      packageJson.scripts['start-frontend-dev'] = "cross-env NODE_ENV=development vite --host --config ./config/vite.config.js";
    }
    
    if (!packageJson.scripts['start-server-dev']) {
      packageJson.scripts['start-server-dev'] = "cross-env NODE_ENV=development node server/server.js";
    }
    
    if (!packageJson.scripts.build) {
      packageJson.scripts.build = "vite build --config ./config/vite.config.js";
    }
    
    // Écriture du fichier package.json mis à jour
    fs.writeFileSync(
      path.join(process.cwd(), 'package.json'),
      JSON.stringify(packageJson, null, 4),
      'utf8'
    );
    
    console.log(`${colors.green}✓ Scripts npm mis à jour avec succès${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Erreur lors de la mise à jour des scripts npm:${colors.reset}`, error.message);
  }
  
  console.log(`${colors.green}=== Installation terminée avec succès ===${colors.reset}`);
  console.log(`${colors.blue}Pour démarrer le dashboard en mode développement, exécutez:${colors.reset} npm run dev`);
}

// Exécution du script
main();
