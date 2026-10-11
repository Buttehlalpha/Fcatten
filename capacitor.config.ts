import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ng.edu.atbu.attenscan",
  appName: "ATBU AttenScan",
  webDir: "dist",
  server: {
    // For live-reload against Lovable preview during dev, uncomment and use your preview URL:
    // url: "https://id-preview--63287da1-859b-4d6c-9d0c-eee1c09c860d.lovable.app",
    // cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0A2540",
      showSpinner: false,
    },
  },
};

export default config;
