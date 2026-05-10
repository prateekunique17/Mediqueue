// This file handles communication with our local LM Studio Backend
const API_BASE = "";

export async function generateAiForm(symptoms: string) {
  const response = await fetch(`${API_BASE}/api/ai/generate-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });

  if (!response.ok) throw new Error('Failed to generate medical form');
  const result = await response.json();
  if (!result.success) throw new Error(result.error?.message || 'AI Generation failed');
  return result.data;
}

export async function analyzeTriage(primaryProblem: string, answers: any) {
  const response = await fetch(`${API_BASE}/api/ai/analyze-triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryProblem, answers }),
  });

  if (!response.ok) throw new Error('Failed to analyze triage');
  const result = await response.json();
  if (!result.success) throw new Error(result.error?.message || 'Triage analysis failed');
  return result.data;
}

export async function saveTriageRequest(data: any) {
  const response = await fetch(`${API_BASE}/api/ai/save-triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to save triage');
  const result = await response.json();
  if (!result.success) throw new Error(result.error?.message || 'Failed to save triage');
  return result;
}
