type LiffModule = typeof import("@line/liff").default;

let liffModule: LiffModule | null = null;
let initPromise: Promise<LiffModule> | null = null;

async function unloadServiceWorkers() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

export async function initLiff(liffId: string): Promise<LiffModule> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await unloadServiceWorkers();

    const { default: liff } = await import("@line/liff");
    await liff.init({ liffId });
    liffModule = liff;
    return liff;
  })().catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

export function getLiffOrNull() {
  return liffModule;
}
