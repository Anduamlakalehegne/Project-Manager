import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

declare global {
  var mongoose: { conn: Connection | null; promise: Promise<Connection> | null };
}

let cached = global.mongoose;

// Initialize the cache if it doesn't exist
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If there's already an existing connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // Otherwise, establish a new connection if there's no promise in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering of commands until the connection is established
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("connected to Db");
      return mongoose.connection;
    
      
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
