
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  theme: 'light' | 'dark';
  accentColor: string;
  baseCurrency: string;
  reminderEnabled: boolean;
  reminderTime: string;
  cloudBackupEnabled: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  setBaseCurrency: (currency: string) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setCloudBackupEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setTheme(settings.theme || 'light');
      setAccentColor(settings.accentColor || '#3B82F6');
      setBaseCurrency(settings.baseCurrency || 'USD');
      setReminderEnabled(settings.reminderEnabled || false);
      setReminderTime(settings.reminderTime || '18:00');
      setCloudBackupEnabled(settings.cloudBackupEnabled || false);
    }
  }, []);

  const saveSettings = (newSettings: any) => {
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    saveSettings({ theme: newTheme, accentColor, baseCurrency, reminderEnabled, reminderTime, cloudBackupEnabled });
  };

  const handleSetAccentColor = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent-color', color);
    saveSettings({ theme, accentColor: color, baseCurrency, reminderEnabled, reminderTime, cloudBackupEnabled });
  };

  const handleSetBaseCurrency = (currency: string) => {
    setBaseCurrency(currency);
    saveSettings({ theme, accentColor, baseCurrency: currency, reminderEnabled, reminderTime, cloudBackupEnabled });
  };

  const handleSetReminderEnabled = (enabled: boolean) => {
    setReminderEnabled(enabled);
    saveSettings({ theme, accentColor, baseCurrency, reminderEnabled: enabled, reminderTime, cloudBackupEnabled });
  };

  const handleSetReminderTime = (time: string) => {
    setReminderTime(time);
    saveSettings({ theme, accentColor, baseCurrency, reminderEnabled, reminderTime: time, cloudBackupEnabled });
  };

  const handleSetCloudBackupEnabled = (enabled: boolean) => {
    setCloudBackupEnabled(enabled);
    saveSettings({ theme, accentColor, baseCurrency, reminderEnabled, reminderTime, cloudBackupEnabled: enabled });
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      accentColor,
      baseCurrency,
      reminderEnabled,
      reminderTime,
      cloudBackupEnabled,
      setTheme: handleSetTheme,
      setAccentColor: handleSetAccentColor,
      setBaseCurrency: handleSetBaseCurrency,
      setReminderEnabled: handleSetReminderEnabled,
      setReminderTime: handleSetReminderTime,
      setCloudBackupEnabled: handleSetCloudBackupEnabled
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
