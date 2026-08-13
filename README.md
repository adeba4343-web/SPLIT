# SPLIT

### AI-Powered Information Intelligence & Scam Analysis

SPLIT is an AI-powered information intelligence tool designed to help people **pause, analyze, and verify information before acting on it**.

It analyzes suspicious messages, screenshots, and claims to identify potential risk signals, manipulation tactics, and unverifiable claims — while giving users practical steps to independently verify the information.

> **Don't just ask AI if something is fake. Understand why it might be suspicious.**

---

## 🚨 The Problem

People receive potentially misleading information every day through:

* SMS and messaging apps
* Emails
* Social media
* Screenshots
* Online advertisements
* Fake offers and job messages
* Impersonation attempts

Many scams rely on **urgency, fear, authority, financial pressure, or requests for sensitive information**.

The problem isn't simply that people can't identify "fake" information — it's that they often **don't know what signals to look for or how to verify a claim safely.**

---

## 💡 The Solution

SPLIT acts as an information intelligence layer between the user and potentially suspicious content.

Instead of simply returning **"Fake"** or **"Real"**, SPLIT breaks the content down into understandable signals.

It can:

1. Analyze the submitted content.
2. Identify potentially suspicious claims.
3. Detect manipulation techniques.
4. Detect risk signals such as urgency, threats, payment requests, OTP requests, and suspicious links.
5. Extract and analyze text from screenshots.
6. Generate a practical verification plan.
7. Recommend what the user should do before taking action.

---

## ✨ Features

### 🔍 Text Analysis

Paste a suspicious message or piece of content and SPLIT analyzes it for:

* Suspicious claims
* Urgency
* Threats
* Financial requests
* Credential requests
* Suspicious links
* Authority impersonation
* Too-good-to-be-true offers

---

### 🖼️ Screenshot Analysis

Users can upload screenshots of suspicious messages.

SPLIT uses Gemini to:

* Extract important text
* Identify claims
* Detect manipulation
* Detect requests for money or credentials
* Identify suspicious links or pressure tactics
* Generate a risk assessment

---

### 🧠 Manipulation Detection

SPLIT looks beyond keywords and identifies psychological techniques commonly used in deceptive communication.

Examples include:

* Fear
* Urgency
* Authority
* Pressure
* Social proof
* Financial pressure
* Credential harvesting

---

### 🔎 Claim Verification

SPLIT doesn't blindly declare something true or false.

Instead, it generates a **verification plan** that helps users determine what to check and where to check it.

This encourages users to independently verify important information using trustworthy sources.

---

### 📊 Deterministic Risk Scoring

SPLIT combines AI analysis with deterministic rules.

Risk signals are assigned points based on patterns such as:

| Signal                  | Example                        |
| ----------------------- | ------------------------------ |
| Urgency                 | "Act immediately"              |
| Threat                  | "Your account will be blocked" |
| Financial request       | "Pay the registration fee"     |
| Credential request      | "Send your OTP"                |
| Suspicious link         | Shortened or suspicious URLs   |
| Authority impersonation | "Bank security department"     |
| Unrealistic offer       | "You have won ₹50,000"         |

The final score is converted into:

* 🟢 **LOW**
* 🟡 **MEDIUM**
* 🔴 **HIGH**

This provides a more explainable result rather than relying entirely on an AI-generated score.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │ Message / Screenshot│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   SPLIT Frontend    │
                    │    React + Vite     │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │   SPLIT Backend     │
                    │   Node + Express    │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
          ┌──────────────────┐   ┌──────────────────┐
          │ Deterministic    │   │ Gemini 2.5 Flash │
          │ Risk Analysis    │   │   AI Analysis    │
          └─────────┬────────┘   └─────────┬────────┘
                    │                      │
                    └──────────┬───────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Explainable Result  │
                    │ Risk + Claims +     │
                    │ Manipulation +      │
                    │ Verification Steps  │
                    └─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Lucide React

### Backend

* Node.js
* Express.js
* Multer
* CORS
* dotenv

### AI

* Google Gemini 2.5 Flash

### Deployment

* Vercel — Frontend
* Render — Backend
* GitHub — Source Code

---

## 📁 Project Structure

```text
SPLIT/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── LICENSE
```

> `.env` contains private API credentials and should never be committed to GitHub.

---

## ⚙️ Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/adeba4343-web/SPLIT.git
cd SPLIT
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 4. Configure the Gemini API key

Create:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Start the backend

```bash
cd backend
node server.js
```

The backend runs locally on:

```text
http://localhost:3001
```

### 6. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Vite will provide the local development URL.

---

## 🔐 Security

SPLIT is designed to avoid exposing API credentials in the frontend.

The Gemini API key is stored as an environment variable on the backend:

```text
GEMINI_API_KEY
```

The key should **never be committed to GitHub or exposed in client-side code**.

---

## 🌐 Deployment

SPLIT uses separate deployments for the frontend and backend.

```text
Frontend → Vercel
Backend  → Render
Source   → GitHub
```

The frontend communicates with the deployed Express backend through REST API endpoints.

---

## 🔌 API Endpoints

### Health Check

```http
GET /api/health
```

Checks whether the backend is running.

### Text Analysis

```http
POST /api/analyze
```

Analyzes submitted text for risk, claims, and manipulation.

### Screenshot Analysis

```http
POST /api/analyze-image
```

Accepts an uploaded image and analyzes its contents.

### Claim Verification

```http
POST /api/verify
```

Generates a practical verification plan for a claim.

---

## 🎯 Design Philosophy

SPLIT is built around one principle:

> **AI should help people think, not replace their judgment.**

Instead of presenting an unexplained AI verdict, SPLIT shows users:

* What was detected
* Why it may be suspicious
* Which manipulation techniques are present
* What cannot be verified
* What the user should check before acting

This makes the system more **transparent, explainable, and useful in real-world situations.**

---

## 🚀 Future Improvements

Potential future additions include:

* Browser extension for real-time analysis
* WhatsApp/Telegram integration
* URL reputation analysis
* Trusted-source lookup
* Multilingual analysis
* Voice-message analysis
* Email analysis
* Historical scam pattern detection
* Personalized safety recommendations
* Community-driven threat intelligence

---

## 👥 Built For

SPLIT is designed for anyone who wants a quick way to understand potentially suspicious information before clicking, paying, sharing credentials, or forwarding it to others.

---

## 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you find SPLIT useful, consider giving the repository a ⭐ on GitHub.

**Built with React, Node.js, and Gemini.**



check it out here :
https://split-eehj-j87c2kg7u-shaf4.vercel.app
