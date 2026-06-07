import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.model('Movie', movieSchema);
