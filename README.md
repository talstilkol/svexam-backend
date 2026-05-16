# svExam backend

פרויקט Express בסיסי לפי ההוראות.

## מה יש כאן

- Express.
- MongoDB דרך `MONGO_URI`.
- CORS לפרונט.
- endpoint אחד בלבד: `GET /api/health`.
- אין endpoints נוספים.
- אין מימוש של פתרון מבחן מראש.

## פקודות

```bash
cp .env.example .env
npm install
npm run dev
```

בדיקה:

```bash
curl http://localhost:4000/api/health
```
