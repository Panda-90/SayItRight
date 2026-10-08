# SayRight

An AI Communication Coach that helps you translate rough thoughts into context-aware, polished messages that fit the relationship and situation perfectly.

## Problem

People often know what they mean but struggle to communicate it properly—especially in high-stakes or sensitive situations like emailing a professor, following up with a recruiter, or texting a romantic interest.

## Solution

SayRight converts your messy, unstructured thoughts into a ready-to-send message in the exact tone you need. It infers context, adjusts emotional intensity, and formats the message naturally, avoiding the robotic feel of generic AI writing tools.

## Features

- **Raw Thought Translation:** Just type what you're thinking; SayRight figures out the rest.
- **Tone Adjustments:** Quickly rewrite into Casual, Professional, Confident, Flirty, or Shorter versions.
- **Recipient Context:** Specify who you are talking to (Professor, Recruiter, Manager, Friend, etc.) to tailor the message perfectly.
- **Smart Formatting:** Uses appropriate spacing and natural language. Only uses emojis where appropriate.
- **Privacy-First:** Free to use, no sign-up required, and your messages are not stored.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS (Minimalist Split-Pane Design)
- **Backend:** FastAPI (Python)
- **AI Provider:** Groq (qwen-3.8-27b for ultra-fast, structured inference)

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment Variables

Both the frontend and backend require environment variables for configuration. See the `.env.example` file in each respective directory.

**Backend `.env`:**
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
FRONTEND_URL=http://localhost:5173
PORT=8000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000
```

## Production Deployment

- **Frontend (Vercel/Netlify):** Build command `npm run build`, publish directory `dist`. Set `VITE_API_URL` to your production backend URL.
- **Backend (Render/Railway):** Uses FastAPI with `uvicorn`. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Ensure `GROQ_API_KEY` and `FRONTEND_URL` (your deployed frontend URL) are set in the environment variables.
