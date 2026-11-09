/**
 * Security Configuration Module
 * Manages environment secrets, enforcing minimum entropy and eliminating
 * hardcoded fallback secrets. Compatible with Edge and Node.js runtimes.
 */

let cachedSecretKey: Uint8Array | null = null;
let devRandomSecret: Uint8Array | null = null;

export function getAuthSecret(): Uint8Array {
  if (cachedSecretKey) {
    return cachedSecretKey;
  }

  const rawSecret = process.env.AUTH_SECRET?.trim();

  if (!rawSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY ERROR: AUTH_SECRET environment variable is missing. The application cannot start securely."
      );
    }

    // In development/test only: generate an ephemeral cryptographic key per process if none set
    if (!devRandomSecret) {
      devRandomSecret = new Uint8Array(32);
      if (typeof globalThis.crypto?.getRandomValues === "function") {
        globalThis.crypto.getRandomValues(devRandomSecret);
      } else {
        for (let i = 0; i < 32; i++) {
          devRandomSecret[i] = Math.floor(Math.random() * 256);
        }
      }
      console.warn(
        "⚠️ [SECURITY WARNING] AUTH_SECRET is not set in your environment. Using a generated ephemeral session key for development. Set AUTH_SECRET in .env.local to persist sessions."
      );
    }
    cachedSecretKey = devRandomSecret;
    return cachedSecretKey;
  }

  if (rawSecret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY ERROR: AUTH_SECRET must be at least 32 characters long to ensure cryptographic resilience."
      );
    }
    console.warn(
      "⚠️ [SECURITY WARNING] AUTH_SECRET is shorter than 32 characters. Please use a stronger random secret in production."
    );
  }

  cachedSecretKey = new TextEncoder().encode(rawSecret);
  return cachedSecretKey;
}
