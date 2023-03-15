import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.v3.quantum',
  appName: 'tellU',
  webDir: 'build',
  bundledWebRuntime: false,
  // server : { url: 'http://10.0.0.71:3000/', },
  loggingBehavior: 'none', // change to debug to see console logs
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '552925208169-4aekc3uk4totonlccmv4j1ilvcmeo4um.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    "PushNotifications": {
      "presentationOptions": ["sound", "badge"]
    },
    "SplashScreen": {
      "launchAutoHide": false,
    }
  }
};

export default config;
