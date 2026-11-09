import crypto from "node:crypto";
import path from "node:path";

/**
 * Secure File Upload Validation
 * Enforces magic-byte file signature validation, strict MIME and extension whitelisting,
 * file size constraints, and prevents directory traversal / Stored XSS.
 */

export interface AllowedFileType {
  mime: string;
  extensions: string[];
  maxSizeBytes: number;
  checkSignature: (buffer: Buffer) => boolean;
}

const ALLOWED_TYPES: AllowedFileType[] = [
  {
    mime: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    checkSignature: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: "image/png",
    extensions: [".png"],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    checkSignature: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  {
    mime: "image/webp",
    extensions: [".webp"],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    checkSignature: (buf) =>
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP",
  },
  {
    mime: "application/pdf",
    extensions: [".pdf"],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    checkSignature: (buf) => buf.length >= 5 && buf.toString("ascii", 0, 5) === "%PDF-",
  },
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  matchedType?: AllowedFileType;
}

export function validateUploadedFile(
  file: File,
  buffer: Buffer
): FileValidationResult {
  // 1. Basic size sanity check
  if (buffer.length === 0) {
    return { valid: false, error: "The uploaded file is empty." };
  }

  // 2. Extract and normalize extension
  const rawName = file.name || "upload";
  const ext = path.extname(rawName).toLowerCase();

  if (!ext) {
    return { valid: false, error: "File must have a valid file extension." };
  }

  // Block dangerous extensions explicitly (defense-in-depth)
  const DANGEROUS_EXTENSIONS = new Set([
    ".html",
    ".htm",
    ".svg",
    ".xml",
    ".xhtml",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".php",
    ".phtml",
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".ps1",
    ".jar",
    ".py",
    ".pl",
    ".cgi",
    ".shtml",
    ".jsp",
    ".asp",
    ".aspx",
  ]);

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type "${ext}" is not permitted for security reasons.` };
  }

  // 3. Find matching allowed config
  const matchedType = ALLOWED_TYPES.find(
    (t) => t.extensions.includes(ext) || t.mime === file.type
  );

  if (!matchedType) {
    return {
      valid: false,
      error: `Unsupported file format (${ext}). Only JPG, PNG, WebP images and PDF documents are allowed.`,
    };
  }

  // 4. Check max size
  if (buffer.length > matchedType.maxSizeBytes) {
    const maxMb = matchedType.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the maximum allowed limit of ${maxMb}MB.`,
    };
  }

  // 5. Verify magic bytes / signature against actual buffer content
  if (!matchedType.checkSignature(buffer)) {
    return {
      valid: false,
      error: "File signature does not match the claimed file extension (corrupt or spoofed file).",
    };
  }

  // 6. Generate cryptographically random secure filename to eliminate directory traversal & collisions
  const safeBase = rawName
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 32);

  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const sanitizedFilename = `${Date.now()}-${safeBase || "file"}-${randomSuffix}${ext}`;

  return {
    valid: true,
    sanitizedFilename,
    matchedType,
  };
}
