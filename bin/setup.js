// setup.js
const chalk = require('chalk');
const ApiManager = require('./config/apiManager');

const runSetup = async () => {
  console.clear();
  console.log(chalk.cyan('======================================'));
  console.log(chalk.cyan('        PELAKOOR API SETUP            '));
  console.log(chalk.cyan('======================================'));
  console.log(chalk.yellow('\nSelamat datang di wizard penyiapan API Pelakoor.'));
  console.log('Wizard ini akan membantu Anda mengkonfigurasi kunci API untuk layanan geocoding.\n');
  
  const apiManager = new ApiManager();
  await apiManager.loadConfig();
  await apiManager.setupApiKeys();
  
  console.log(chalk.green('\n🎉 Penyiapan selesai!'));
  console.log('Anda sekarang dapat menjalankan aplikasi dengan fitur yang ditingkatkan.');
  console.log('Jalankan ' + chalk.cyan('npm start') + ' untuk memulai Pelakoor.');
  console.log(chalk.cyan('\n======================================\n'));
};

runSetup();