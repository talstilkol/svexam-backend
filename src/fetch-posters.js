// ממלא פוסטר אמיתי לכל סרט ב-DB, דרך Wikipedia REST API (ללא מפתח).
// הרצה: node src/fetch-posters.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = 'svExam-exam-project/1.0 (https://github.com/talstilkol/svexam-backend)';

async function trySummary(pageTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const d = await res.json();
  if (d.type === 'disambiguation') return null;
  return d.thumbnail?.source || d.originalimage?.source || null;
}

async function posterFor(title, year) {
  for (const t of [`${title} (${year} film)`, `${title} (film)`, title]) {
    try {
      const p = await trySummary(t);
      if (p) return p;
    } catch { /* try next variant */ }
    await sleep(120);
  }
  return '';
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const movies = await Movie.find({ $or: [{ poster: { $exists: false } }, { poster: '' }] });
  console.log(`Filling ${movies.length} movies without a poster...`);
  let ok = 0;
  for (const m of movies) {
    try {
      const poster = await posterFor(m.title, m.year);
      if (poster) {
        m.poster = poster;
        await m.save();
        ok++;
        console.log(`✅ ${m.title}`);
      } else {
        console.log(`⚠️  no poster: ${m.title}`);
      }
    } catch (err) {
      console.log(`❌ ${m.title} — ${err.message}`);
    }
    await sleep(150);
  }
  console.log(`\nDone: ${ok}/${movies.length} new posters set`);
  await mongoose.disconnect();
}

run();
