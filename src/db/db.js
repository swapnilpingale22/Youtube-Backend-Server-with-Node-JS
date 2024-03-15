import mongoose from "mongoose";
import DB_NAME from "../constants.js";

const connectDB = async () => {
  try {
    const connInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    console.log(
      `MongoDB connected. DB Host: ${connInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
