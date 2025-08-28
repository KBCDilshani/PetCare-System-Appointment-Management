const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed in Mongoose 6+, but added for clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);

    // Set up error handling for the connection
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err.message}`.red.bold);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(
        "MongoDB disconnected. Attempting to reconnect...".yellow.bold
      );
    });

    // Handle app termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination".cyan);
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
