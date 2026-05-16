import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT || 4000);
let mongoStatus = process.env.MONGO_URI ? 'connecting' : 'not-configured';

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      mongoStatus = 'connected';
      console.log('MongoDB connected');
    })
    .catch(error => {
      mongoStatus = 'error';
      console.error('MongoDB connection error:', error.message);
    });
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'svExam backend',
    mongo: mongoStatus
  });
});

app.listen(port, () => {
  console.log(`svExam backend listening on http://localhost:${port}`);
});
