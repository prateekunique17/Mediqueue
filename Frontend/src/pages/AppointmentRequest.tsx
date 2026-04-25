import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAiForm, analyzeTriage, saveTriageRequest } from '../lib/gemini';
import { 
  Activity, 
  ChevronRight, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Clock,
  ShieldCheck
} from 'lucide-react';

const AppointmentRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'ai_form' | 'result'>('input');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiForm, setAiForm] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [triageResult, setTriageResult] = useState<any>(null);

  const startAnalysis = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const form = await generateAiForm(symptoms);
      setAiForm(form);
      setStep('ai_form');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (value: any) => {
    const questionId = aiForm.questions[currentQuestionIndex].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < aiForm.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setLoading(true);
      try {
        const result = await analyzeTriage(symptoms, newAnswers);
        setTriageResult(result);
        setStep('result');
        
        // Save to Database
        await saveTriageRequest({
          patient_id: user?.id || 'guest_user',
          symptoms,
          answers: newAnswers,
          urgency: result.urgency,
          doctor_type: result.doctorType,
          summary: result.summary, // Added summary here!
          status: 'PENDING'
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MODERATE': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-12 animate-fade">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Stethoscope className="text-emerald-500 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Medi<span className="text-emerald-500">Queue</span></h1>
        </div>
        <div className="text-xs uppercase tracking-widest text-emerald-500/60 font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          AI Diagnostic System Live
        </div>
      </div>

      <main className="w-full max-w-2xl">
        {step === 'input' && (
          <div className="glass-card p-8 md:p-12 animate-fade">
            <h2 className="text-3xl font-bold mb-4">Hello. How can we help?</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">Describe your symptoms in detail. Our AI will analyze them and prioritize your care immediately.</p>
            
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I have a sharp pain in my lower back that started 2 hours ago..."
              className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-lg focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-600 mb-8"
            />
            
            <button 
              onClick={startAnalysis}
              disabled={loading || !symptoms.trim()}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Start AI Triage'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'ai_form' && aiForm && (
          <div className="animate-fade">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <span className="text-emerald-500 font-bold text-sm uppercase tracking-wider">Assessment in Progress</span>
                <h2 className="text-2xl font-bold">Diagnostic Question {currentQuestionIndex + 1}</h2>
              </div>
              <div className="text-zinc-500 text-sm font-medium">
                {currentQuestionIndex + 1} of {aiForm.questions.length}
              </div>
            </div>

            <div className="w-full bg-white/5 h-1.5 rounded-full mb-12 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${((currentQuestionIndex + 1) / aiForm.questions.length) * 100}%` }} 
              />
            </div>

            <div className="glass-card p-10 mb-8">
              <p className="text-xl md:text-2xl font-medium mb-10 leading-snug">
                {aiForm.questions[currentQuestionIndex].text}
              </p>

              <div className="grid gap-4">
                {aiForm.questions[currentQuestionIndex].type === 'yesno' && (
                  <>
                    <button onClick={() => handleAnswer('Yes')} className="w-full p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-left text-lg font-medium flex items-center justify-between group">
                      Yes <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button onClick={() => handleAnswer('No')} className="w-full p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left text-lg font-medium">
                      No
                    </button>
                  </>
                )}

                {aiForm.questions[currentQuestionIndex].type === 'severity' && (
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <button 
                        key={num}
                        onClick={() => handleAnswer(num)}
                        className="aspect-square rounded-xl bg-white/5 border border-white/5 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center font-bold"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {aiForm.questions[currentQuestionIndex].type === 'checkbox' && (
                  <div className="grid gap-3">
                    {aiForm.questions[currentQuestionIndex].options?.map((opt: string) => (
                      <button 
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-left"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {aiForm.questions[currentQuestionIndex].type === 'text' && (
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-emerald-500/50" 
                      placeholder="Type your answer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswer(e.currentTarget.value);
                      }}
                    />
                    <button 
                      onClick={(e) => handleAnswer('Done')}
                      className="btn-primary"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'result' && triageResult && (
          <div className="animate-fade space-y-6">
            <div className="glass-card overflow-hidden border-emerald-500/30">
              <div className="bg-emerald-500/10 p-8 border-b border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500 text-black rounded-2xl">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Clinical Triage Report</h2>
                    <p className="text-emerald-500/80 font-medium">Medically Verified by AI Engine</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest mb-2">Priority Level</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold ${getUrgencyColor(triageResult.urgency)}`}>
                      <AlertCircle className="w-4 h-4" />
                      {triageResult.urgency}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest mb-2">Recommended Specialist</p>
                    <div className="flex items-center gap-2 text-xl font-bold">
                      <Stethoscope className="text-emerald-500 w-5 h-5" />
                      {triageResult.doctorType}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest">Clinical Summary</p>
                  <ul className="space-y-4">
                    {triageResult.summary.map((point: string, i: number) => (
                      <li key={i} className="flex gap-4 text-zinc-300 leading-relaxed">
                        <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-primary flex-1 py-4"
                  >
                    Confirm & Queue Up
                  </button>
                  <button 
                    onClick={() => setStep('input')}
                    className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-zinc-400 font-medium"
                  >
                    Reset Assessment
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 flex gap-4">
              <Clock className="text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-500/80 leading-relaxed">
                <strong>Next Step:</strong> Your data has been transmitted to the hospital queue. You will be notified when the {triageResult.doctorType} is ready to see you.
              </p>
            </div>
          </div>
        )}
      </main>

      {loading && step !== 'input' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-emerald-500 font-bold tracking-widest uppercase">Analyzing Bio-Data...</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentRequest;
