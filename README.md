# 🎙️ MemoAI

**MemoAI** is an AI-powered meeting notes app that records audio, transcribes it in real-time, and generates smart summaries — so you never miss a thing.

Built with React, Firebase, and Google Gemini AI.

---

## ✨ Features

- 🎤 **Audio Recording** — Record meetings directly in the browser
- 🤖 **AI Transcription** — Powered by Google Gemini API
- 📝 **Smart Summaries** — Auto-generated meeting summaries
- 🌐 **Multi-language Support** — English, Chinese, Japanese, Korean, and more
- 🔐 **Authentication** — Email/Password, Google, and GitHub sign-in via Firebase Auth
- ☁️ **Cloud Sync** — All notes saved to Firestore in real-time
- 🔗 **Shareable Notes** — Share public meeting notes via link
- 📚 **Meeting Library** — Browse and manage all past recordings

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Build Tool | Vite |
| Auth & DB | Firebase Auth, Firestore |
| AI | Google Gemini API (`@google/genai`) |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A Firebase project ([create one here](https://console.firebase.google.com))
- A Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/memoai.git
cd memoai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create/update `firebase-applet-config.json` in the root:

```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "your-sender-id",
  "appId": "your-app-id"
}
```

### 4. Set up environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Enable Firebase services

In your Firebase Console:
- **Authentication** → Enable Email/Password, Google, GitHub
- **Firestore** → Create database → Apply rules from `firestore.rules`

### 6. Run the app

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## 📁 Project Structure

```
memoai/
├── src/
│   ├── components/
│   │   ├── AudioRecorder.tsx      # Recording UI & logic
│   │   ├── AuthPage.tsx           # Login / Signup / OAuth
│   │   ├── LandingPage.tsx        # Marketing landing page
│   │   ├── MeetingDetail.tsx      # Note viewer
│   │   ├── MeetingLibrary.tsx     # All notes list
│   │   └── MeetingNotesList.tsx   # Sidebar notes list
│   ├── lib/
│   │   └── firebase.ts            # Firebase init
│   ├── services/
│   │   └── geminiService.ts       # Gemini AI calls
│   ├── types.ts                   # TypeScript types
│   ├── App.tsx                    # Root component
│   └── main.tsx                   # Entry point
├── firebase-applet-config.json    # Firebase config
├── firestore.rules                # Firestore security rules
└── index.html
```

---

## 🔒 Firestore Security Rules

Rules are in `firestore.rules`. Key points:
- Users can only read/write their own notes
- Public notes are readable by anyone with the link
- All writes are validated server-side

Deploy rules with:
```bash
firebase deploy --only firestore:rules
```

---

## 📦 Available Scripts

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # TypeScript type check
npm run clean     # Remove dist folder
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT
