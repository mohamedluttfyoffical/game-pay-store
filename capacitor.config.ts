import type { CapacitorConfig } from "@capacitor/cli";

const storeUrl = process.env.CAPACITOR_SERVER_URL ?? "https://gamepayshop-3m9w2yls.manus.space";
const appId = process.env.CAPACITOR_APP_ID ?? "com.gamepay.store";

const config: CapacitorConfig = {
  appId,
  appName: "Game Pay",
  webDir: "dist/public",
  server: {
    url: storeUrl,
    cleartext: false,
    allowNavigation: [new URL(storeUrl).host],
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
