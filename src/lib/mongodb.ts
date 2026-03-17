import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Enquiry Schema Definition
const EnquirySchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  customerName: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  machineTypes: { type: String },
  machineModel: { type: String },
  machineDia: { type: String },
  machineGauge: { type: String },
  machineFeeders: { type: String },
  machineQty: { type: Number },
  projectStatus: { type: String, enum: ['Active', 'Confirmed', 'Postponed', 'Dropped', 'Lost'], default: 'Active' },
  quoteStatus: { type: String, enum: ['Pending', 'Issued'], default: 'Pending' },
  quoteDate: { type: String },
  revisedQuote: { type: String },
  transferredTo: { type: String },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the 'updatedAt' timestamp before saving
EnquirySchema.pre('save', async function() {
  this.updatedAt = new Date();
});

// User Schema Definition
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError in Next.js dev environment
const Enquiry: mongoose.Model<any> = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
const User: mongoose.Model<any> = mongoose.models.User || mongoose.model('User', UserSchema);

export { connectToDatabase, Enquiry, User };
