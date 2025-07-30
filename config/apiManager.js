// config/apiManager.js
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';


class ApiManager {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.configPath = path.join(process.cwd(), 'config.json');
    this.loadConfig();
  }

  async loadConfig() {
    // Load environment variables
    if (await fs.pathExists(this.envPath)) {
      require('dotenv').config();
    }

    // Load or create config file
    if (await fs.pathExists(this.configPath)) {
      try {
        this.config = await fs.readJson(this.configPath);
      } catch (error) {
        this.config = this.getDefaultConfig();
        await this.saveConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
      await this.saveConfig();
    }
  }

  getDefaultConfig() {
    return {
      defaultProvider: 'osm',
      providers: {
        osm: {
          name: 'OpenStreetMap (Nominatim)',
          requiresKey: false,
          active: true
        },
        google: {
          name: 'Google Maps API',
          requiresKey: true,
          active: false
        },
        mapbox: {
          name: 'Mapbox API',
          requiresKey: true,
          active: false
        },
        here: {
          name: 'HERE API',
          requiresKey: true,
          active: false
        }
      },
      features: {
        autoSave: true,
        showProgress: true,
        colorOutput: true,
        saveHistory: true
      }
    };
  }

  async saveConfig() {
    await fs.writeJson(this.configPath, this.config, { spaces: 2 });
  }

  async setupApiKeys() {
    console.log(chalk.blue('\n🔧 API Configuration Setup'));
    console.log(chalk.yellow('Configure your API providers for enhanced features\n'));

    const providers = Object.keys(this.config.providers);
    
    for (const provider of providers) {
      const providerConfig = this.config.providers[provider];
      
      if (providerConfig.requiresKey) {
        const currentKey = process.env[`${provider.toUpperCase()}_API_KEY`];
        
        console.log(chalk.cyan(`\n📡 ${providerConfig.name}`));
        
        if (currentKey) {
          console.log(chalk.green(`✅ API Key found: ${currentKey.substring(0, 8)}...`));
          
          const { updateKey } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'updateKey',
              message: 'Would you like to update this API key?',
              default: false
            }
          ]);

          if (!updateKey) continue;
        }

        const { apiKey, activate } = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: `Enter ${providerConfig.name} API key:`,
            mask: '*'
          },
          {
            type: 'confirm',
            name: 'activate',
            message: `Activate ${providerConfig.name}?`,
            default: true
          }
        ]);

        if (apiKey) {
          await this.setApiKey(provider, apiKey);
          this.config.providers[provider].active = activate;
        }
      }
    }

    await this.saveConfig();
    console.log(chalk.green('\n✅ API configuration saved!'));
  }

  async setApiKey(provider, key) {
    const envContent = await this.getEnvContent();
    const keyName = `${provider.toUpperCase()}_API_KEY`;
    
    const lines = envContent.split('\n');
    let keyUpdated = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${keyName}=`)) {
        lines[i] = `${keyName}=${key}`;
        keyUpdated = true;
        break;
      }
    }

    if (!keyUpdated) {
      lines.push(`${keyName}=${key}`);
    }

    await fs.writeFile(this.envPath, lines.join('\n'));
    process.env[keyName] = key;
  }

  async getEnvContent() {
    if (await fs.pathExists(this.envPath)) {
      return await fs.readFile(this.envPath, 'utf8');
    }
    return '';
  }

  getActiveProviders() {
    return Object.keys(this.config.providers).filter(
      provider => this.config.providers[provider].active
    );
  }

  async selectProvider() {
    const activeProviders = this.getActiveProviders();
    
    if (activeProviders.length === 1) {
      return activeProviders[0];
    }

    const choices = activeProviders.map(provider => ({
      name: this.config.providers[provider].name,
      value: provider
    }));

    const { selectedProvider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProvider',
        message: 'Select API provider:',
        choices: choices,
        default: this.config.defaultProvider
      }
    ]);

    return selectedProvider;
  }
}

export default ApiManager;