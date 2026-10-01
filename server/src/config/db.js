const mongoose = require('mongoose');
const seedDB = require('../seed');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agency_crm';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}). Launching In-Memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected at ${mongoUri}`);
      await seedDB(false);
      console.log('In-Memory Database Seeded with Sample Users and Projects.');
    } catch (memErr) {
      console.error('Failed to initialize In-Memory MongoDB:', memErr.message);
    }
  }
};

module.exports = connectDB;

