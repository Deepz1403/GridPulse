
import Attendant from '../models/attendant.js';
import { fetchTemperature } from '../utils/temperature.js';
import substation from '../models/substation.js';
import bcrypt from 'bcrypt'
import mongoose from 'mongoose';

export const addAttendant = async (req, res) => {
  const { name, email, password, substation,role, mobileNumber} = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await Attendant.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(409).json({ message: 'Attendant already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAttendant = new Attendant({
      name:name,
      email: email.toLowerCase(),
      password: hashedPassword,
      substation: substation ? substation.toLowerCase() : null,
      role:role,
      mobileNumber:mobileNumber?mobileNumber:null
    });

    await newAttendant.save();
    res.status(201).json({ message: 'Attendant added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// export const getAllSubstationsAndAttendants = async (req, res) => {
//   try {
//     const allSubstations = await substation.find({}, { substation: 1, attendantEmail: 1 });
//     const allAttendants = await Attendant.find({}, { name: 1, email: 1, substation: 1 });
//     const substations = await substation.find({ attendantEmail: null }, { _id: 0, substation: 1 });
//     const attendants = await Attendant.find({ substation: null }, { _id: 0, name: 1, email: 1 });

//     res.status(200).json({
//       allSubstations:allSubstations,
//       allAttendants:allAttendants,
//       unassignedSubstations: substations,
//       unassignedAttendants: attendants,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

export const createSubstation = async (req, res) => {
  try {
    const { substationName, location, attendantEmails, transformers } = req.body;

    if (!substationName || !location || !attendantEmails || !Array.isArray(attendantEmails) || !transformers || !Array.isArray(transformers)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    for (let transformer of transformers) {
      if (typeof transformer.areas !== "object" || Array.isArray(transformer.areas)) {
        return res.status(400).json({
          message: `Invalid format for areas in transformer ${transformer.id}. Expected an object.`,
        });
      }
    }
    const attendants = await Attendant.find({ email: { $in: attendantEmails } });
    const existingEmails = attendants.map(att => att.email);

    if (existingEmails.length !== attendantEmails.length) {
      return res.status(404).json({
        message: "One or more attendants not found.",
        missingEmails: attendantEmails.filter(email => !existingEmails.includes(email)),
      });
    }

    await Attendant.updateMany(
      { email: { $in: attendantEmails } },
      { $set: { substation: substationName } }
    );

    const sanitizedTransformers = transformers.map(transformer => ({
      id: transformer.id,
      voltage: null,
      current: null,
      consumption: null,
      areas: Object.fromEntries(Object.keys(transformer.areas).map(area => [area, null])),
    }));

    const newSubstation = new substation({
      substationName:substationName.toLowerCase(),
      location,
      attendantEmails,
      transformers: sanitizedTransformers,
      temperature: await fetchTemperature(location),
      totalUnitsConsumed: null,
    });

    await newSubstation.save();

    const collectionName = `${substationName.replace(/\s+/g, "_").toLowerCase()}`;
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    if (!collections.some(col => col.name === collectionName)) {
      await db.createCollection(collectionName);
    }

    return res.status(201).json({
      message: `Substation '${substationName}' created successfully.`,
      collection: collectionName,
    });

  } catch (error) {
    console.error("Error creating substation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const assignSubstationToAttendants = async (req, res) => {
  try {
    const { substationName, attendantEmails } = req.body;

    if (!substationName || !attendantEmails || !Array.isArray(attendantEmails)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const existingSubstation = await substation.findOne({ substationName: substationName.toLowerCase() });

    if (!existingSubstation) {
      return res.status(404).json({ message: "Substation not found." });
    }

    const attendants = await Attendant.find({ email: { $in: attendantEmails } });

    if (attendants.length !== attendantEmails.length) {
      return res.status(404).json({
        message: "One or more attendants not found.",
        missingEmails: attendantEmails.filter(email => !attendants.some(att => att.email === email))
      });
    }
    await Attendant.updateMany(
      { email: { $in: attendantEmails } },
      { $set: { substation: substationName } }
    );

    existingSubstation.attendantEmails = [...new Set([...existingSubstation.attendantEmails, ...attendantEmails])];
    await existingSubstation.save();

    return res.status(200).json({ message: "Attendants assigned successfully." });

  } catch (error) {
    console.error("Error assigning substation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSubstation = async (req, res) => {
  try {
    const substationName = req.params.name.toLowerCase();

    const deletedSubstation = await substation.findOneAndDelete({ substationName });
    if (!deletedSubstation) {
      return res.status(404).json({ message: "Substation not found." });
    }
    await Attendant.updateMany(
      { substation: substationName },
      {  $set: { substation: null } }
    );

    const db = mongoose.connection.db;
    const collectionName = substationName.replace(/\s+/g, "_").toLowerCase();
    const collections = await db.listCollections().toArray();

    if (collections.some(col => col.name === collectionName)) {
      await db.dropCollection(collectionName);
    }

    return res.status(200).json({ message: `Substation '${substationName}' deleted successfully.` });

  } catch (error) {
    console.error("Error deleting substation:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


