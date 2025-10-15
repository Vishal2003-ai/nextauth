import mongoose from "mongoose";

type ConnectionOptions = {
  isConnected?: number;
};

const connection: ConnectionOptions = {};

async function dbconnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState;

    console.log("Connected to the database Successfully");
  } catch (error) {
    console.log("Error connecting to the database");
    process.exit(1);
  }
}

export default dbconnect;
