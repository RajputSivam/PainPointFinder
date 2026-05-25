import mongoose from 'mongoose';
import { enableFileStore, fileStoreEnabled } from '../store/fileStore.js';

export const isFileStore = () => fileStoreEnabled.value;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/painpointfinder';

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn(`MongoDB unavailable (${error.message}). Using local JSON file store.`);
    enableFileStore();
  }
};

export default connectDB;
