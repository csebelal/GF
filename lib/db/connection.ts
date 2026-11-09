import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/afrin_portfolio";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

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
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== "production",
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    const safeErrorMsg = `Failed to connect to database at ${sanitizeMongoUri(MONGODB_URI)}`;
    console.error(safeErrorMsg, e?.message ? `(${e.message})` : "");
    throw new Error("Database connection error");
  }

  return cached.conn;
}
