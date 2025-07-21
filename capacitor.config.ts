// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'P9FS.app',
//   appName: 'futsal-score',
//   webDir: 'public'
// };

// export default config;
const config = {
  appId: 'com.yourname.futsalmanager',
  appName: 'futsal-score',
  webDir: 'out',  // 상대 경로여야 함
  server: {
    androidScheme: 'https'
  }
};

export default config;