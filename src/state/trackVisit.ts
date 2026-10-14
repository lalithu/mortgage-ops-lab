let sent = false;
export function trackVisit(endpoint: string | undefined, allowLocal = false): void {
  if (sent || !endpoint || typeof window === 'undefined') return;
  if (!allowLocal && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) return;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' && !(allowLocal && url.protocol === 'http:')) return;
    sent = true;
    const body = JSON.stringify({path: window.location.pathname, referrer: document.referrer.slice(0,2048)});
    // text/plain is CORS-safelisted: no custom headers or OPTIONS preflight needed.
    let queued = false;
    try { queued = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(url.href, new Blob([body], {type:'text/plain;charset=UTF-8'})); } catch { /* fetch fallback */ }
    if (!queued) void fetch(url.href, {method:'POST', body, keepalive:true, credentials:'omit', headers:{'Content-Type':'text/plain;charset=UTF-8'}}).catch(()=>{});
  } catch { /* Tracking must never affect the application. */ }
}
