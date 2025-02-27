import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  level: { type: [String], required: true },
});

export default mongoose.models.Level || mongoose.model('Level', levelSchema);
