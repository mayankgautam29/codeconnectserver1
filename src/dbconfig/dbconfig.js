import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load .env variables

export async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("✅ Database connected in db config");
    });
    connection.on("error", () => {
      console.log("❌ Error in db config connection to database/server");
    });
  } catch (error) {
    console.log("❌ Error connecting database:", error.message);
  }
}
