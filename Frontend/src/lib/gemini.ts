// This file secure handles communication with our FastAPI Backend
const API_BASE = "http://localhost:8000";

export async function generateAiForm(symptoms: string) {
  const response = await fetch(`${API_BASE}/api/ai/generate-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });

  if (!response.ok) throw new Error('Failed to generate medical form');
  return response.json();
}

export async function analyzeTriage(primaryProblem: string, answers: any) {
  const response = await fetch(`${API_BASE}/api/ai/analyze-triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryProblem, answers }),
  });

  if (!response.ok) throw new Error('Failed to analyze triage');
  return response.json();
}

export async function saveTriageRequest(data: any) {
  const response = await fetch(`${API_BASE}/api/ai/save-triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to save triage');
  return response.json();
}
