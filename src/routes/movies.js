import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

// שליפת מיפוי הז׳אנרים מ-TMDb פעם אחת (cache) — במקום רשימה ידנית
let genreMap = null;
async function getGenreMap() {
  if (genreMap) return genreMap;
  const r = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`);
  const d = await r.json();
  genreMap = Object.fromEntries((d.genres || []).map((g) => [g.id, g.name]));
  return genreMap;
}

// GET /movies/suggest?query= — סוכן השלמה: מציע סרטים אמיתיים מ-TMDb (כותרת, שנה, ז׳אנר, תיאור, תמונה)
router.get('/suggest', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);
  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${process.env.TMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const map = await getGenreMap();
    const results = (data.results || []).slice(0, 6).map((m) => ({
      title: m.title,
      year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
      genre: map[m.genre_ids?.[0]] || 'Unknown',
      description: m.overview || '',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : '',
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
  const { title, genre, description, year, poster } = req.body;
  if (!title || !genre || !description || !year) {
    return res.status(400).json({ error: 'title, genre, description and year are required' });
  }
  const movie = await Movie.create({ title, genre, description, year, poster });
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
  if (!process.env.AI_GATEWAY_API_KEY) {
    return res.status(500).json({ error: 'AI key is not configured' });
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
        messages: [
          {
            role: 'user',
            content: `Movie title: "${title}", genre: "${genre}". Return ONLY JSON in the format {"description": "a short movie description"}.`,
          },
        ],
      }),
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'AI request failed' });
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const match = text.match(/\{[\s\S]*\}/);
    const { description } = JSON.parse(match ? match[0] : '{}');
    res.json({ description: description || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

export default router;
