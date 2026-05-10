<div align="center">
  <h1>🏥 Mediqueue PRO</h1>
  <p><strong>Production-Grade AI Medical Triage & Smart Queue Management Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite&logoColor=white)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?logo=fastapi&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?logo=supabase&logoColor=white)](#)
  [![LM Studio](https://img.shields.io/badge/Local_AI-LM_Studio-61DAFB?logo=openai&logoColor=white)](#)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](#)
</div>

<br />

## 📖 Overview

**Mediqueue PRO** is a production-hardened healthcare platform that transforms patient intake using a fault-tolerant AI workflow. By integrating **Local Large Language Models (LLMs)** via LM Studio, Mediqueue provides high-privacy clinical triage, dynamic urgency classification, and intelligent routing—all while keeping sensitive medical data within your local infrastructure.

The platform orchestrates three critical medical nodes:
1. **Patients:** AI-driven diagnostic assessments and secure facility routing.
2. **Hospital Staff:** Specialist availability management and real-time triage queueing.
3. **Platform Administrators:** Global facility verification and operational oversight.

---

## ✨ Production-Grade AI Features

- **🤖 Fault-Tolerant Clinical Triage:** Orchestrated AI workflow with **Automated Retries** and **Exponential Backoff** for local LLM connectivity.
- **🛡️ Medical Safety Engine:** Deterministic rule-based override that detects high-risk symptoms (Chest pain, Stroke indicators) to force immediate **EMERGENCY** prioritization, bypassing AI inference for safety.
- **🚦 Structured AI Validation:** Full **Pydantic** integration ensures every AI response follows a strict clinical schema. Malformed JSON is automatically sanitized and repaired.
- **📊 Observability & Tracing:** Every assessment generates a unique **Request ID**, allowing full tracing across structured logs, AI prompts, and database records.
- **🏥 Specialist Scheduling:** Advanced doctor availability management with operative time-slot configuration and precise appointment routing.
- **⚡ Real-time Synchronization:** Sub-second UI updates across all portals via Supabase Realtime.

---

## 🏗️ Technical Architecture

### Modular Backend Structure
```text
backend/
├── main.py             # FastAPI entry point & startup orchestration
├── config.py           # Centralized Pydantic Settings & Env management
├── database.py         # Lightweight Supabase client
├── schemas/            # Pydantic models for Triage, Forms, and API
├── services/           # AI Orchestration, Triage Logic, and LM Studio Client
├── utils/              # Structured Logging, JSON Parser, and Safety Rules
├── prompts/            # Centralized Clinical Prompt Management
└── routers/            # API Route definitions (AI, Hospital)
```

### Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend:** FastAPI, Pydantic v2, HTTPX, Python Logging.
- **AI Infrastructure:** LM Studio (Local LLM), structured prompt engineering.
- **Cloud Infrastructure:** Supabase (PostgreSQL, Auth, Realtime).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **[LM Studio](https://lmstudio.ai/)** (Running a model like Gemma-2-9b or Llama-3)
- **Supabase Account**

### 2. LM Studio Setup
1. Open LM Studio and download a clinical-capable model (e.g., `gemma-2-9b`).
2. Navigate to the **Local Server** tab.
3. Set Port to `1234`.
4. Click **Start Server**.
5. Ensure the model is loaded in the top selection bar.

### 3. Environment Configuration

#### Frontend (`Frontend/.env`)
```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

#### Backend (`backend/.env`)
```env
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_service_role_key"
LM_STUDIO_URL="http://127.0.0.1:1234"
LM_STUDIO_MODEL="your-model-identifier"
```

### 4. Running the Backend
```bash
cd backend
# Absolute imports are used; run directly from the backend folder
py main.py
```
*The server will start on `http://localhost:8000`. You will see structured, colored logs confirming model connectivity.*

### 5. Running the Frontend
```bash
cd Frontend
npm install
npm run dev
```

---

## 🛡️ Reliability & Security

- **Local AI Privacy:** All medical triage is processed locally via LM Studio. No patient data leaves your infrastructure for AI processing.
- **Deterministic Safety:** Safety rules override AI decisions in high-risk scenarios, ensuring medical-grade reliability.
- **Structured Error Handling:** Standardized API responses ensure the frontend never crashes due to AI "hallucinations" or connectivity issues.

---

<div align="center">
  <p>Built for the future of reliable, private healthcare AI. 🏥✨</p>
</div>
