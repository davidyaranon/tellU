import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.v3.quantum',
  appName: 'tellU',
  webDir: 'build',
  bundledWebRuntime: false,
  loggingBehavior: 'none',
  server : {
    url: 'http://137.150.220.24:3000',
  },
  plugins: {
    "PushNotifications": {
      "presentationOptions": ["sound", "badge"]
    },
    "SplashScreen": {
      "launchAutoHide": false
    }
  }
};

export default config;
