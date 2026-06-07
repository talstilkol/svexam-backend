import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true },
  poster: { type: String },
});

export default mongoose.model('Movie', movieSchema);
