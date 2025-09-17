import mongoose from "mongoose";
import Substation from "../models/substation.js";

export const submitPowerData = async (req, res) => {
  try {

    if (!req.session.attendant) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const email = req.session.attendant.email;
    const substationName = req.session.attendant.substation;

    if (!substationName) {
        return res.status(400).json({ message: "Substation not assigned to this attendant." });
    }

      const {transformers,totalUnitsConsumed,temperature } = req.body;

      const substation = await Substation.findOne({ substationName });
      if (!substation) return res.status(404).json({ message: "Substation not found." });

      const schemaTransformerIds = substation.transformers.map(t => t.id).sort();
      const submittedTransformerIds = transformers.map(t => t.id).sort();

      if (JSON.stringify(schemaTransformerIds) !== JSON.stringify(submittedTransformerIds)) {
          return res.status(400).json({ message: "All transformers in the schema must be submitted." });
      }

      for (const submittedTransformer of transformers) {
          const storedTransformer = substation.transformers.find(t => t.id === submittedTransformer.id);
          if (!storedTransformer) return res.status(400).json({ message: `Transformer ${submittedTransformer.id} not found in schema.` });

          const storedAreasKeys = Object.keys(storedTransformer.areas).sort();
          const submittedAreasKeys = Object.keys(submittedTransformer.areas).sort();

          if (JSON.stringify(storedAreasKeys) !== JSON.stringify(submittedAreasKeys)) {
              return res.status(400).json({ message: `Areas do not match for transformer ${submittedTransformer.id}.` });
          }
      }

      const substationCollection = mongoose.connection.collection(substationName);

      await substationCollection.insertOne({
          transformers,
          Date: new Date().toLocaleDateString(),
          Time: new Date().toLocaleTimeString(),
          totalUnitsConsumed,
          temperature,
          submittedBy: email
      });

      return res.status(200).json({ message: "Power data submitted successfully." });

  } catch (error) {
      return res.status(500).json({ message: "Internal server error." });
  }
};
