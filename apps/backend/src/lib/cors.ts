export function createOriginChecker(allowedOrigins: string[]) {
  const allowed = new Set(allowedOrigins);

  return function originChecker(origin: string | undefined, callback: (error: Error | null, allow: boolean) => void) {
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, allowed.has(origin));
  };
}
