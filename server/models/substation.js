import mongoose from 'mongoose';

const substationSchema = new mongoose.Schema({
    substationName: { type: String, required: true},
    location: { type: String, required: true },
    attendantEmails: [{ type: String ,required:true}],
    temperature:{type:Number},
    transformers: [
        {
            id: { type: String, required: true },
            voltage: { type: Number, default: null },
            current: { type: Number, default: null },
            consumption: { type: Number, default: null },
            areas: { type: mongoose.Schema.Types.Mixed, required: true } 
        }
    ],
    Date: { type: String, },
    Time: { type: String, },
    totalUnitsConsumed:{type:Number}
});



export default mongoose.model("Substation", substationSchema);

