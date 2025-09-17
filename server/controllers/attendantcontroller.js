import Substation from "../models/substation.js";
import mongoose from "mongoose";

export const getAssignedSubstation = async (req, res) => {
    try {
            const email = req.session.attendant.email; 

            const substations = await Substation.find({ attendantEmails: email.toLowerCase() }).select("substationName");
    
            if (substations.length === 0) {
                return res.status(404).json({ message: "No assigned substations found." });
            }
            const substationNames = substations.map(substation => substation.substationName);
            
            res.status(200).json({ substationNames });
    

    } catch (err) {
        console.error("Error fetching assigned substations:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllSubstationData = async (req, res) => {
    try {
      if (!req.session.attendant) {
        return res.status(401).json({ message: "Unauthorized: Please login." });
      }
  
      const { substation } = req.session.attendant;
  
      if (!substation) {
        return res.status(400).json({ message: "Substation not assigned." });
      }
  
      const collectionName = substation.toLowerCase().replace(/\s+/g, "_");
      const substationCollection = mongoose.connection.collection(collectionName);
  
      const allEntries = await substationCollection.find().sort({ Date: 1 }).toArray();
  
      return res.status(200).json({ data: allEntries });
  
    } catch (error) {
      console.error("Error fetching substation data:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  
  const parseCustomDate = (str) => {
    const [day, monthStr, year] = str.split("-");
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const month = monthMap[monthStr];
    return new Date(parseInt(year), month, parseInt(day));
  };
  
  
  export const getVoltageCurrentByDate = async (req, res) => {
    try {
      if (!req.session.attendant) {
        return res.status(401).json({ message: "Unauthorized: Please login." });
      }
  
      const { substation } = req.session.attendant;
      if (!substation) {
        return res.status(400).json({ message: "Substation not assigned." });
      }
  
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
  
      const collectionName = substation.toLowerCase().replace(/\s+/g, "_");
      const substationCollection = mongoose.connection.collection(collectionName);
  
      const allData = await substationCollection.find().toArray();
  
      const filtered = allData
        .filter(entry => {
          const entryDate = parseCustomDate(entry.Date);
          return (
            (!start || entryDate >= start) &&
            (!end || entryDate <= end)
          );
        })
        .map(entry => ({
          Date: entry.Date,
          transformers: entry.transformers.map(t => ({
            id: t.id,
            voltage: t.voltage,
            current: t.current,
            areas: t.areas
          }))
        }));
  
      return res.status(200).json({ data: filtered });
  
    } catch (error) {
      console.error("Error fetching voltage/current by date:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };