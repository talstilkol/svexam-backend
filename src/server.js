import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import moviesRouter from './routes/movies.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// חיבור MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err.message));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'svExam backend',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

app.use('/movies', moviesRouter);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`svExam backend on http://localhost:${port}`));
