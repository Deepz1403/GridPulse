import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    insertSampleEntry();  // Call the function after connection
  })
  .catch(err => console.log(err));

// Define Schema
const transformerSchema = new mongoose.Schema({
  transformers: [
    {
      id: String,
      voltage: Number,
      current: Number,
      Consumption: Number,
      areas: mongoose.Schema.Types.Mixed
    }
  ],
  Date: String,
  Time: String,
  totalUnitsConsumed: Number,
  temperature: Number,
  submittedBy: String
});

// Create Model
const Sample = mongoose.model("ss-4", transformerSchema);

// Insert Sample Data
async function insertSampleEntry() {
  const newSampleEntry = new Sample({
    transformers: [
      {
        id: "TR1",
        voltage: 560,
        current: 200,
        Consumption: 10745.32,
        areas: {
          "Hostel-L AC": 364025,
          "Hostel-K AC Right Side": 127714,
          "Hostel-K AC Centre Side": 174650,
          "Hostel-K AC Left Side": 164536,
          "Hostel-K Normal Left": 124350,
          "Hostel-K Normal Centre": 160720,
          "Hostel-K Normal Right": 142890,
          "Hostel-L Normal": 85910,
          "Substation Supply": 32700,
          "W Supply Pump": 91900,
          "Type-3 New": 153114
        }
      }
    ],
    Date: "13-Apr-2025",
    Time: "05:00 PM",
    totalUnitsConsumed: 3120,
    temperature: 28,
    submittedBy: "gurpreet836052@gmail.com"
  });

  try {
    const result = await newSampleEntry.save();
    console.log("Successfully inserted new sample entry with ID:", result._id);
  } catch (err) {
    console.error("Error inserting new entry:", err);
  }
}
