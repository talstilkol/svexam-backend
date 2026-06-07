import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

// GET /movies/search?name= — סרטים שהכותרת מכילה את הערך (חייב לפני /:id)
router.get('/search', async (req, res) => {
  const movies = await Movie.find({
    title: { $regex: req.query.name || '', $options: 'i' },
  });
  res.json(movies);
});

// GET /movies — כל הסרטים
router.get('/', async (_req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

// POST /movies — הוספת סרט
router.post('/', async (req, res) => {
  const { title, genre, description } = req.body;
  if (!title || !genre || !description) {
    return res.status(400).json({ error: 'title, genre and description are required' });
  }
  const movie = await Movie.create({ title, genre, description });
  res.status(201).json(movie);
});

// DELETE /movies/:id — מחיקת סרט
router.delete('/:id', async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// POST /movies/generate — יצירת תיאור ע"י AI דרך Vercel AI Gateway
router.post('/generate', async (req, res) => {
  const { title, genre } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ error: 'title and genre are required' });
  }
  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: `Movie title: "${title}", genre: "${genre}". Return ONLY JSON in the format {"description": "a short movie description"}.`,
          },
        ],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);
    res.json({ description: parsed.description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
