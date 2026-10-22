// Ask the browser to keep this app's data (helps on iPhone), and register the offline service worker.
import { registerSW } from 'virtual:pwa-register';

export function setupPWA() {
  try { navigator.storage?.persist?.(); } catch (e) {}
  registerSW({ immediate: true });
}

export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
export const isInstalled = () => window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
