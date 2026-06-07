# 🎬 Movie Watchlist — Backend

שרת Express + MongoDB (Mongoose) לניהול סרטים. פרוס על Railway.

## 🔗 קישורים

- **Backend (live):** https://svexam-backend-production-cd91.up.railway.app
- **Frontend (live):** https://frontend-eight-taupe-82d9lpmm3i.vercel.app
- **Frontend repo:** https://github.com/talstilkol/svexam-frontend

## 📡 Endpoints

| Method | Route | תיאור |
|--------|-------|-------|
| GET | `/movies` | כל הסרטים |
| POST | `/movies` | הוספת סרט (`title`, `genre`, `description`) |
| DELETE | `/movies/:id` | מחיקת סרט |
| GET | `/movies/search?name=` | חיפוש לפי כותרת |
| POST | `/movies/generate` | יצירת תיאור ע"י AI (Vercel AI Gateway) |
| GET | `/api/health` | בדיקת חיבור + סטטוס Mongo |

## 🛠️ הרצה מקומית

```bash
cp .env.example .env   # ולמלא MONGO_URI
npm install
npm run dev
```

### משתני סביבה
```
PORT=4000
MONGO_URI=<mongodb atlas connection string>
CLIENT_ORIGIN=*
AI_GATEWAY_API_KEY=<vercel ai gateway key>   # ל-/movies/generate
```

## 🤖 שימוש ב-AI

נעזרתי ב-AI לבניית שלד הקבצים (Mongoose model, ה-router, חיבור ה-Vercel AI Gateway) והבנתי והתאמתי את הקוד.

## 🧱 Stack

Express · Mongoose · MongoDB Atlas · CORS
