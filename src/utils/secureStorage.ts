// Secure storage wrapper for trips and expenses
import { SecureStorage, InputValidator } from './security';

export interface SecureStorageData {
  trips?: any[];
  expenses?: any[];
  settings?: any;
}

export class SecureExpenseStorage {
  private static readonly STORAGE_KEYS = {
    trips: 'expense-tracker-trips',
    expenses: 'expense-tracker-expenses', 
    settings: 'app-settings'
  };

  // Secure trip storage
  static async saveTrips(trips: any[]): Promise<void> {
    try {
      // Validate and sanitize trip data
      const validatedTrips = trips.map(trip => ({
        ...trip,
        name: InputValidator.sanitizeText(trip.name || ''),
        description: InputValidator.sanitizeText(trip.description || ''),
        startDate: InputValidator.validateDate(trip.startDate),
        endDate: InputValidator.validateDate(trip.endDate),
        budget: InputValidator.validateAmount(trip.budget || 0)
      }));

      await SecureStorage.setItem(
        this.STORAGE_KEYS.trips,
        JSON.stringify(validatedTrips)
      );
    } catch (error) {
      console.error('Failed to save trips:', error);
      // Fallback to regular localStorage
      localStorage.setItem(this.STORAGE_KEYS.trips, JSON.stringify(trips));
    }
  }

  static async getTrips(): Promise<any[]> {
    try {
      const data = await SecureStorage.getItem(this.STORAGE_KEYS.trips);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load trips:', error);
      // Fallback to regular localStorage
      const fallback = localStorage.getItem(this.STORAGE_KEYS.trips);
      return fallback ? JSON.parse(fallback) : [];
    }
  }

  // Secure expense storage
  static async saveExpenses(expenses: any[]): Promise<void> {
    try {
      // Validate and sanitize expense data
      const validatedExpenses = expenses.map(expense => ({
        ...expense,
        merchant: InputValidator.validateMerchant(expense.merchant || ''),
        amount: InputValidator.validateAmount(expense.amount || 0),
        category: InputValidator.validateCategory(expense.category || ''),
        date: InputValidator.validateDate(expense.date),
        notes: InputValidator.sanitizeText(expense.notes || ''),
        tags: InputValidator.validateTags(expense.tags || []),
        originalAmount: expense.originalAmount ? InputValidator.validateAmount(expense.originalAmount) : undefined,
        originalCurrency: expense.originalCurrency ? InputValidator.validateCurrency(expense.originalCurrency) : undefined
      }));

      await SecureStorage.setItem(
        this.STORAGE_KEYS.expenses,
        JSON.stringify(validatedExpenses)
      );
    } catch (error) {
      console.error('Failed to save expenses:', error);
      // Fallback to regular localStorage
      localStorage.setItem(this.STORAGE_KEYS.expenses, JSON.stringify(expenses));
    }
  }

  static async getExpenses(): Promise<any[]> {
    try {
      const data = await SecureStorage.getItem(this.STORAGE_KEYS.expenses);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load expenses:', error);
      // Fallback to regular localStorage
      const fallback = localStorage.getItem(this.STORAGE_KEYS.expenses);
      return fallback ? JSON.parse(fallback) : [];
    }
  }

  // Secure settings storage
  static async saveSettings(settings: any): Promise<void> {
    try {
      // Validate settings
      const validatedSettings = {
        theme: ['light', 'dark'].includes(settings.theme) ? settings.theme : 'light',
        accentColor: InputValidator.sanitizeText(settings.accentColor || '#3B82F6'),
        baseCurrency: InputValidator.validateCurrency(settings.baseCurrency || 'USD'),
        reminderEnabled: Boolean(settings.reminderEnabled),
        reminderTime: InputValidator.sanitizeText(settings.reminderTime || '18:00'),
        cloudBackupEnabled: Boolean(settings.cloudBackupEnabled)
      };

      await SecureStorage.setItem(
        this.STORAGE_KEYS.settings,
        JSON.stringify(validatedSettings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Fallback to regular localStorage
      localStorage.setItem(this.STORAGE_KEYS.settings, JSON.stringify(settings));
    }
  }

  static async getSettings(): Promise<any> {
    try {
      const data = await SecureStorage.getItem(this.STORAGE_KEYS.settings);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fallback to regular localStorage
      const fallback = localStorage.getItem(this.STORAGE_KEYS.settings);
      return fallback ? JSON.parse(fallback) : null;
    }
  }

  // Clean up old/insecure data
  static async migrateToSecureStorage(): Promise<void> {
    console.log('Migrating to secure storage...');
    
    // Migrate existing data to secure storage
    const existingTrips = localStorage.getItem(this.STORAGE_KEYS.trips);
    if (existingTrips) {
      try {
        await this.saveTrips(JSON.parse(existingTrips));
      } catch (error) {
        console.error('Failed to migrate trips:', error);
      }
    }

    const existingExpenses = localStorage.getItem(this.STORAGE_KEYS.expenses);
    if (existingExpenses) {
      try {
        await this.saveExpenses(JSON.parse(existingExpenses));
      } catch (error) {
        console.error('Failed to migrate expenses:', error);
      }
    }

    const existingSettings = localStorage.getItem(this.STORAGE_KEYS.settings);
    if (existingSettings) {
      try {
        await this.saveSettings(JSON.parse(existingSettings));
      } catch (error) {
        console.error('Failed to migrate settings:', error);
      }
    }
  }
}