import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export default mongoose.models.Level || mongoose.model('Level', levelSchema);
