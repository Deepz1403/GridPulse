import mongoose from 'mongoose';

const attendantSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  substation: {
    type: String
  },
  role:{
    type: String,
    enum: ['manager', 'attendant'],
    default: 'attendant',
  },
  mobileNumber: {
    type: Number,
  }
});

const Attendant = mongoose.model('Attendant', attendantSchema);

export default Attendant;
