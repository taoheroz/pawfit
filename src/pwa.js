// Ask the browser to keep this app's data (helps on iPhone), and register the offline service worker.
import { registerSW } from 'virtual:pwa-register';

// Android Chrome/Edge/Samsung offer a real install prompt; keep it so our own button can show it.
let deferred = null;

export function setupPWA(onChange = () => {}) {
  try { navigator.storage?.persist?.(); } catch (e) {}
  registerSW({ immediate: true });
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; onChange(); });
  addEventListener('appinstalled', () => { deferred = null; onChange(); });
}

export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isInstalled = () => window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
// Browsers inside LINE, Facebook, Messenger and Instagram cannot add to the home screen.
export const inAppBrowser = () => { const u = navigator.userAgent; return /\bLine\/|FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(u) ? (/\bLine\//i.test(u) ? 'LINE' : /Instagram/i.test(u) ? 'Instagram' : 'Facebook') : null; };
export const canPromptInstall = () => !!deferred;

// 'prompt' (one-tap button), 'inapp' (open in Safari/Chrome first), 'ios' (Safari share steps), or null
export function installMode() {
  if (isInstalled()) return null;
  if (inAppBrowser()) return 'inapp';
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return null;
}

export async function promptInstall() {
  if (!deferred) return 'unavailable';
  const e = deferred; deferred = null;
  e.prompt();
  const { outcome } = await e.userChoice;
  return outcome; // 'accepted' | 'dismissed'
}
