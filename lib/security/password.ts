import bcrypt from "bcryptjs";

/**
 * Password Security Policy & Hashing Utility
 * Enforces OWASP administrative account complexity rules and secure bcrypt hashing.
 */

const BCRYPT_SALT_ROUNDS = 12;

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "admin",
  "admin123",
  "administrator",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "welcome",
  "welcome123",
  "portfolio",
  "portfolio123",
  "adminpassword",
  "adminpassword123",
  "adminpassword123!",
  "changeme",
  "letmein",
]);

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordStrength(password: unknown): PasswordValidationResult {
  const errors: string[] = [];

  if (typeof password !== "string") {
    return { valid: false, errors: ["Password must be a text string."] };
  }

  if (password.length < 10) {
    errors.push("Password must be at least 10 characters long.");
  }

  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9).");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push("Password must contain at least one special character (e.g. !@#$%^&*).");
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase().trim())) {
    errors.push("Password is too common or easily guessable. Please choose a unique passphrase.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
