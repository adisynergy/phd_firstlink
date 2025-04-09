import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const validateMongoURI = (uri) => {
  if (!uri) {
    throw new Error("❌ Missing MONGO_URI in .env file");
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error("❌ Invalid MongoDB URI format. URI must start with 'mongodb://' or 'mongodb+srv://'");
  }

  return true;
};

const connectDB = async () => {
  try {
    validateMongoURI(process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // Exit process on failure
  }
};

// Call the function to connect to MongoDB
connectDB();

export default mongoose;
