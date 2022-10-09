import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.v3.quantum',
  appName: 'tellU',
  webDir: 'build',
  bundledWebRuntime: false,
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
