// utils/historyManager.js
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';


class HistoryManager {
  constructor() {
    this.historyPath = path.join(process.cwd(), 'history.json');
    this.loadHistory();
  }

  async loadHistory() {
    try {
      if (await fs.pathExists(this.historyPath)) {
        this.history = await fs.readJson(this.historyPath);
      } else {
        this.history = [];
      }
    } catch (error) {
      this.history = [];
    }
  }

  async saveHistory() {
    await fs.writeJson(this.historyPath, this.history, { spaces: 2 });
  }

  async addEntry(type, input, output, provider) {
    const entry = {
      id: Date.now(),
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      type: type,
      input: input,
      output: output,
      provider: provider
    };

    this.history.unshift(entry);
    
    // Keep only last 100 entries
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }

    await this.saveHistory();
  }

  getHistory(limit = 10) {
    return this.history.slice(0, limit);
  }

  async clearHistory() {
    this.history = [];
    await this.saveHistory();
  }
}

export default HistoryManager;