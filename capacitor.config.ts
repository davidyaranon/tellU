import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.v1.quantum',
  appName: 'tellU',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    "PushNotifications" : {
      "presentationOptions" : ["alert", "sound", "badge"]
    },
  }
};

export default config;
