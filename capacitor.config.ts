
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6aabcfb2965c4e7f88f6279788758e15',
  appName: 'expense-zen-travel-tracker',
  webDir: 'dist',
  server: {
    url: 'https://6aabcfb2-965c4e7f-88f6-279788758e15.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
