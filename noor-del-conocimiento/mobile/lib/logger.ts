type Context = Record<string, unknown>;

function reportToCrashService(_error: unknown, _context?: Context): void {}

function normalize(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : JSON.stringify(error));
}

export function logError(scope: string, error: unknown, context?: Context): void {
  const err = normalize(error);
  if (__DEV__) {
    console.error(`[${scope}]`, err.message, context ?? "");
  }
  reportToCrashService(err, { scope, ...context });
}

export function logFatal(scope: string, error: unknown, context?: Context): void {
  const err = normalize(error);
  if (__DEV__) {
    console.error(`[FATAL ${scope}]`, err.message, context ?? "");
  }
  reportToCrashService(err, { scope, fatal: true, ...context });
}
