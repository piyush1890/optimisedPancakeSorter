import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fliplets.app',
  appName: 'fliplets',
  webDir: 'dist/public',
  plugins: {
    CapacitorGeckoview: {
      enabled: true
    }
  },
};

export default config;
