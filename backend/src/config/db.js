import mongoose from 'mongoose';
import dns from 'dns';

// Ensure robust SRV resolution for MongoDB Atlas across Windows DNS configurations
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback to system default if restricted
}

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placepro_evaluate';
    await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error.message);
    process.exit(1);
  }
}
