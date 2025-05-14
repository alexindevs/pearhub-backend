# 🍐 PearHub

**PearHub** is a backend-powered SaaS platform that enables businesses to publish content and engage members through personalized feeds, tracked interactions, and detailed analytics. Built for scalability and smart engagement, it blends RESTful API structure with AI-lite ranking logic, ready for future evolution into a full-fledged recommendation engine.

---

## 🔗 Live Documentation

- 📘 **API Docs:** [https://pearhub.mooo.com/docs](https://pearhub.mooo.com/docs)
- 🗂 **Database Schema (DBML):** [View on dbdocs.io](https://dbdocs.io/alexindevs/PearHub-Pearmonie-Assessment)

---

## 🛠 Tech Stack

- **Node.js** + **Express**
- **Prisma ORM** + **PostgreSQL**
- **JWT Auth** with Role-based Access Control
- **Zod** for schema validation
- **Swagger** for API documentation
- **Docker-ready** via InfraBuddy

---

## 📦 Features

- 🧾 **Authentication** (MEMBER / BUSINESS roles)
- 🏢 **Business & User Management**
- ✍️ **Content Publishing** (Text, Image, Link, Longform)
- 💬 **User Interactions** (View, Like, Comment, Share, Dislike)
- 🧠 **Smart Feed Module** (Personalized content ranking per business)
- 📈 **Analytics** (Memberships, Engagement, Trends)
- 🔐 **RBAC Middleware**
- 🧪 Fully Validated with Zod
- 🔍 Swagger UI for testing

---

## 🧠 Recommendation Engine (AI Logic)

The feed engine currently uses a **hybrid ranking system** that blends user-specific preferences with content popularity. This allows every user to see *all content from a business* ranked by relevance, rather than filtered.

### 🎯 Current Scoring Strategy

If a user has no prior interactions (cold start), content is ranked by popularity and interaction:

```ts
score = views * 0.5 + likes * 1.5 + comments * 1.0 + shares * 2.0
````

If a user has interaction history, the engine:

1. Builds a **tag affinity vector** from past likes/comments/shares
2. Scores content based on **tag overlap**
3. Applies a **freshness boost** (decays over time)
4. Applies a **penalty** for content the user has already viewed

```ts
finalScore = tagScore + popularityScore + freshnessBoost - viewedPenalty
```

This ensures every user sees the most engaging, contextually relevant content with recency and novelty baked in.

---

### 🔮 Future Improvement Plan: Vector Embedding & Semantic Similarity

PearHub’s AI logic is designed to evolve. In future versions, we plan to replace tag-based ranking with **semantic vector embeddings**, allowing much smarter, ML-powered feed personalization.

#### 🧬 How it will work

- Each piece of content (title, tags, description) will be embedded using a model like OpenAI’s `text-embedding-ada`
- Each user’s interaction history will form a **“taste vector”**
- Content will be scored using **cosine similarity** between vectors
- Resulting in deep contextual matching between **users and content**, far beyond exact tag overlap

This system will unlock:

- 🧠 Smarter recommendations
- 📈 Better scaling as data grows
- 🧬 ML/AI-integrated personalization

---

## 🚀 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/alexindevs/pearhub-backend.git
cd pearhub-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

```env
DATABASE_URL=postgresql://youruser:yourpass@localhost:5432/pearhub
JWT_SECRET=your_secret_key
```

### 4. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Dev Server

```bash
npm run dev
```

---

## 📮 API Entry Points

| Module         | Base Route            |
| -------------- | --------------------- |
| Auth           | `/auth`               |
| Business       | `/business`           |
| Content        | `/content`            |
| Interactions   | `/interactions`       |
| Memberships    | `/memberships`        |
| Feed           | `/feed`               |
| Analytics      | `/analytics`          |

---

## 👩🏾‍💻 Author

Built by [@alexindevs](https://github.com/alexindevs) for the Pearmonie technical assessment, but also as a real, shippable product engine.

---

## 📝 License

MIT: Use it, fork it, build on it 🍐
