import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.optimatech.app',
  appName: 'Optima Tech',
  webDir: 'dist/public',
  server: {
    url: 'https://optimatech-qreie.ondigitalocean.app/admin-dashboard',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
