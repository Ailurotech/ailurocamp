import mongoose from 'mongoose';

export interface ILevel extends mongoose.Document {
  level: string[];
}

const levelSchema = new mongoose.Schema({
  level: { type: [String], required: true },
});

export default mongoose.models.Level || mongoose.model('Level', levelSchema);
