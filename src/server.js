import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// חיבור MongoDB — cached כדי שיעבוד גם ב-serverless (Vercel) וגם מקומית/Render
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { promise: null };
function connectDB() {
  if (!cached.promise && process.env.MONGO_URI) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((m) => { console.log('MongoDB connected'); return m; })
      .catch((err) => { console.error('MongoDB error:', err.message); cached.promise = null; });
  }
  return cached.promise;
}
connectDB();

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'svExam backend',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

// 🔴 במבחן: app.use('/api/books', booksRouter);

// מקומית/Render — מאזין. על Vercel (serverless) — רק מייצא את ה-app.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`svExam backend on http://localhost:${port}`));
}

export default app;
