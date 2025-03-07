import mongoose from 'mongoose';

export interface ICategory extends mongoose.Document {
  category: string[];
}

const categorySchema = new mongoose.Schema({
  category: { type: [String], required: true },
});

export default mongoose.models.Category ||
  mongoose.model('Category', categorySchema);
