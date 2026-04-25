# NovaBank AI

A personal banking dashboard prototype with an AI-powered chatbot and frontend-only authentication flow. This project is built as a showcase for a Sem 7 project and demonstrates a modern React + Vite UI for banking features.

## 🚀 Project Overview

NovaBank AI is a React application that simulates:
- user login and session state
- account overview and transaction statements
- profile management and KYC updates
- an AI banking chatbot powered by Gemini API integration

The app uses a mock data service for banking operations, so it is primarily a frontend demo rather than a production backend system.

## 🧩 Features

- Login screen with simulated authentication
- Dashboard with account balances and quick insights
- Accounts list and transaction statements
- Profile page with editable user details and KYC status
- AI chatbot assistant for banking questions
- Mock backend logic in `services/mockDatabase.ts`

## 💻 Tech Stack

- React 19
- TypeScript
- Vite
- Gemini AI (`@google/genai`)

## 📁 Project Structure

- `App.tsx` — main app shell with auth provider and navigation
- `context/AuthContext.tsx` — app auth state management
- `services/mockDatabase.ts` — mock banking backend logic
- `services/geminiService.ts` — AI chatbot integration
- `services/otpService.ts` — OTP service client wrapper
- `components/` — UI pages and widgets

## ⚙️ Get Started

### Prerequisites

- Node.js installed
- `npm` available

### Install and run

```bash
npm install
npm run dev
```

Open the app in your browser at `http://localhost:5173`.

## 🔐 Environment Variables

Create a `.env.local` file and add the following values:

```env
VITE_Chatbot_API_KEY=your_api_key_here
VITE_OTP_API_URL=https://your-otp-backend-url
```

> Note: `VITE_OTP_API_URL` is optional and only used if you wire up an external OTP backend.

## 📌 Important Notes

- There is no real backend included in this repository.
- The authentication flow is simulated via mock services.
- The app is ideal for demo, prototype, or portfolio use.

## 👤 Author

This is my project, developed as a personal GitHub repository demo for a banking AI dashboard.

---

Thank you for checking out NovaBank AI!
