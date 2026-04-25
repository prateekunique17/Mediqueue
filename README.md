# ✚ MEDIQUEUE – AI Medical Triage & Queue Platform

Mediqueue is a modern, responsive, and robust healthcare platform designed to streamline the patient intake process using AI-powered triage. Leveraging **Google Gemini AI**, the system instantly analyzes patient symptoms, assigns appropriate urgency levels (triage), and intelligently routes patients to the appropriate medical specialists within the hospital.

The platform provides a unified experience across multiple portals (Patient, Hospital Dashboard, and Admin Command Center), ensuring seamless synchronization via Supabase Realtime.

---

## 🚀 Key Features

- **🤖 AI Assessment:** Real-time symptom analysis and intelligent follow-up questioning powered by Google Gemini.
- **🚦 Dynamic Triage:** Automatic urgency classification (Emergency, Moderate, Routine) to prioritize critical cases.
- **🏥 Hospital Dashboard:** A live queue management system for healthcare facilities with real-time patient data displays and staff management (doctor CRUD operations).
- **👔 Admin Command Center:** Administrative portal for facility verification, hospital application approval/rejection, and license management.
- **⚡ Live Sync:** Instant updates across all interfaces, keeping doctors, admins, and patients aligned using Supabase Realtime.
- **✨ Premium UI/UX:** A high-fidelity, dynamic interface built with React, Vite, and Tailwind CSS v4.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM, Framer Motion
- **Backend:** FastAPI, Python, Uvicorn
- **Database & Authentication:** Supabase (PostgreSQL)
- **AI Integration:** Google Gemini SDK

---

## 🚦 Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)
- **Supabase Project** (for Database + Auth)
- **Google Gemini API Key**

### 2. Environment Setup

You will need to set up environment variables for both the frontend and backend.

**Frontend (`Frontend/.env`):**
Create a `.env` file inside the `Frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_gemini_key
```

**Backend (`backend/.env`):**
Create a `.env` file inside the `backend` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_key
```

### 3. Database Setup

Run the SQL scripts provided in the Supabase SQL Editor to create the necessary tables. Make sure your schema includes:
- `users`
- `triage_requests`
- `hospitals`
- `hospital_doctors`
- `appointments`

### 4. Running the Backend

The backend is built with FastAPI. To run it locally:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
# (Or alternatively: uvicorn main:app --reload)
```
*The backend API will be running on `http://localhost:8000`*

### 5. Running the Frontend

The frontend is a React application built with Vite.

```bash
# Navigate to the Frontend directory
cd Frontend

# Install the Node.js dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will be running on `http://localhost:5173` (or `http://localhost:5174` depending on availability)*

---

## 🛡️ Security
- All sensitive Gemini API calls can be routed strictly server-side (FastAPI) to protect API keys.
- Robust Role-Based Access Control (RBAC) is enforced via Supabase authentication profiles (differentiating Patients, Hospital Staff, and Admins).
