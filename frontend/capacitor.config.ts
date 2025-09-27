import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farmora.app',
  appName: 'Farmora',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#667eea',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#667eea',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#667eea',
      sound: 'beep.wav',
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
    Geolocation: {
      permissions: ['location'],
    },
    Device: {
      permissions: ['camera', 'microphone'],
    },
    Network: {
      permissions: ['internet'],
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystorePassword: 'smartcrop2024',
      keystoreAlias: 'smartcrop',
      keystoreAliasPassword: 'smartcrop2024',
    }
  },
  ios: {
    scheme: 'Smart Crop Advisory',
    buildConfiguration: 'Release'
  }
};

export default config;