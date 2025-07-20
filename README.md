# 🧼 10000 Seals – Power Washing Services App

A full-stack app for managing jobs, uploading before/after photos, and displaying reviews for a power washing company.

---

## ⚙️ Environment Setup

### 🔧 Backend (.env)

Create a `.env` file inside the `powerwash/backend` directory:

```
DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
ACCESS_KEY=your_access_secret
REFRESH_KEY=your_refresh_secret
DOMAIN=localhost
```

**Explanation:**
- `DB_URL`: MongoDB connection string
- `ACCESS_KEY`: Used to sign access JWT tokens
- `REFRESH_KEY`: Used to sign refresh JWT tokens
- `DOMAIN`: Used for cookie scoping (usually `localhost` during dev)

---

### 🔧 Frontend (.env.local)

Create a `.env.local` file inside the `powerwash/frontend` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Running the App

### 📦 Backend

```bash
cd powerwash/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 💻 Frontend

```bash
cd powerwash/frontend
npm install
npm run dev
```

---

## ✅ Features

- 🔐 Admin login (JWT auth)
- 📸 Upload before & after work photos
- 🖼️ Display photo gallery to public
- ✍️ Manage customer reviews
- 🌐 Full API and frontend integration

---

## 📁 Uploads

- Uploaded images go into: `backend/uploads`
- Files are served via: `${NEXT_PUBLIC_API_URL}/uploads/<filename>`

---

Let me know if you want deployment instructions too.
