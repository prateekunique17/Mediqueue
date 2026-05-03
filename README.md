<div align="center">
  <h1>🏥 Mediqueue</h1>
  <p><strong>AI-Powered Medical Triage & Smart Queue Management Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite&logoColor=white)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?logo=supabase&logoColor=white)](#)
  [![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-orange?logo=google&logoColor=white)](#)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](#)
</div>

<br />

## 📖 Overview

**Mediqueue** is a modern, full-stack healthcare platform designed to streamline patient intake and prioritize care using Artificial Intelligence. By integrating **Google's Gemini AI**, Mediqueue instantly analyzes patient symptoms, assigns dynamic clinical urgency levels, and intelligently routes patients to appropriate medical specialists. 

The platform connects three distinct user bases:
1. **Patients:** Pre-diagnosis and appointment booking.
2. **Hospital Staff:** Live queue management and doctor assignments.
3. **Platform Administrators:** Global oversight and facility verification.

All portals are synchronized in real-time utilizing **Supabase Realtime** capabilities.

---

## ✨ Key Features

- **🤖 AI-Powered Clinical Triage:** Real-time symptom analysis and intelligent follow-up questioning via Google Gemini SDK.
- **🚦 Dynamic Urgency Classification:** Automatically categorizes patient conditions (Emergency, Moderate, Routine) to prioritize critical and time-sensitive cases.
- **🏥 Hospital Dashboard & Queue Management:** A live queue management system for healthcare facilities. Includes features for managing medical staff, registering doctors, and routing incoming triage requests.
- **👔 Admin Command Center:** Global administrative portal for verifying healthcare facilities, approving/rejecting hospital applications, and license management.
- **⚡ Live Data Synchronization:** Instant updates across all user interfaces, keeping doctors, admins, and patients perfectly aligned.
- **🎨 Premium UI/UX:** A high-fidelity, highly-responsive interface built with React, Vite, Framer Motion, and Tailwind CSS v4.

---

## 🛠️ Architecture & Tech Stack

Mediqueue utilizes a decoupled architecture with a modern React frontend and a robust Python backend API.

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM
- **Animations:** Framer Motion
- **State & Data:** Supabase Client

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Server:** Uvicorn
- **AI Integration:** Google Gemini Generative AI SDK
- **Database & Auth:** Supabase (PostgreSQL)

---

## 🚀 Getting Started

Follow these instructions to set up and run the Mediqueue platform locally.

### 1. Prerequisites

Ensure you have the following installed and configured:
- **[Node.js](https://nodejs.org/)** (v18 or higher)
- **[Python](https://www.python.org/)** (v3.9 or higher)
- **[Supabase](https://supabase.com/)** Project (for PostgreSQL Database and Authentication)
- **[Google Gemini API Key](https://aistudio.google.com/)**

### 2. Environment Configuration

You must configure environment variables for both the frontend and backend services.

#### Frontend (`Frontend/.env`)
Create a `.env` file inside the `Frontend` directory:
```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_GEMINI_API_KEY="your_google_gemini_key"
```

#### Backend (`backend/.env`)
Create a `.env` file inside the `backend` directory:
```env
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_service_role_key"
GEMINI_API_KEY="your_google_gemini_key"
```

### 3. Database Initialization

Execute your SQL schema scripts in the Supabase SQL Editor. Ensure your database contains the following core tables:
- `users` (Profiles linked to Supabase Auth)
- `triage_requests`
- `hospitals`
- `hospital_doctors`
- `appointments`

### 4. Running the Backend Service

The backend powers the secure AI integration and data processing.

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

# Install required Python dependencies
pip install -r requirements.txt

# Start the FastAPI development server
uvicorn main:app --reload
# Or alternatively: python main.py
```
> **Note:** The backend API will be available at `http://localhost:8000`.

### 5. Running the Frontend Service

The frontend provides the interactive user interfaces.

```bash
# Navigate to the Frontend directory
cd Frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```
> **Note:** The frontend application will be available at `http://localhost:5173` (or `5174` depending on availability).

---

## 🛡️ Security & Access Control

- **AI Security:** Sensitive Gemini API calls are securely routed through the server-side FastAPI backend to protect API keys from exposure.
- **RBAC (Role-Based Access Control):** Robust permissions are enforced via Supabase Auth. Distinct user profiles (Patients, Hospital Staff, Admins) ensure data privacy and authorized access to appropriate dashboard portals.
- **Environment Isolation:** Secrets are isolated in `.env` files and securely excluded from version control.

---

<div align="center">
  <p>Built with ❤️ for modern healthcare.</p>
</div>
