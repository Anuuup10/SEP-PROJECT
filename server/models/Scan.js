import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  analysis: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }
}, { minimize: false });

export default mongoose.model('Scan', scanSchema);
