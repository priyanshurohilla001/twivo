import mongoose from "mongoose";

export default async function connectToDb() {
  try {
    const dbUrl = process.env.MONGODB_URL;

    if (!dbUrl) {
      console.error("Mongo DB url is not defined in env");
      process.exit(1);
    }

    await mongoose.connect(dbUrl);

    console.log("Connected to Mongoose db");
  } catch (error) {
    console.error("MongoDb connection error :", error.message);
    process.exit(1);
  }
}

