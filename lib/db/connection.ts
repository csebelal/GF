import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/afrin_portfolio";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  failedAt?: number;
}

const DB_FAILURE_COOLDOWN_MS = 15_000;

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache || { conn: null, promise: null };

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/** Sanitize URI for safe logging without exposing database credentials */
function sanitizeMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
  } catch {
    return "[hidden uri]";
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    // Reset stale/disconnected connection so we can reconnect cleanly
    cached.conn = null;
  }

  if (cached.failedAt && Date.now() - cached.failedAt < DB_FAILURE_COOLDOWN_MS) {
    throw new Error("Database connection error (cooldown)");
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxIdleTimeMS: 60000,
      autoIndex: process.env.NODE_ENV !== "production",
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      cached.failedAt = undefined;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    cached.failedAt = Date.now();
    const safeErrorMsg = `Failed to connect to database at ${sanitizeMongoUri(MONGODB_URI)}`;
    console.error(safeErrorMsg, e?.message ? `(${e.message})` : "");
    throw new Error("Database connection error");
  }

  return cached.conn;
}
