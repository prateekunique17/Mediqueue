import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAiForm, analyzeTriage, saveTriageRequest } from '../lib/ai';
import { 
  Stethoscope, 
  ChevronRight, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck,
  Send,
  User,
  HeartPulse
} from 'lucide-react';

const AppointmentRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // States
  const [step, setStep] = useState<'input' | 'ai_form' | 'result'>('input');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiForm, setAiForm] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [triageResult, setTriageResult] = useState<any>(null);

  // Handle quick check from dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSymptoms(q);
    }
  }, [location.search]);

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
        
        await saveTriageRequest({
          patient_id: user?.id || 'guest_user',
          symptoms,
          answers: newAnswers,
          urgency: result.urgency,
          doctor_type: result.doctorType,
          summary: result.summary,
          status: 'PENDING'
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return 'bg-error-container text-on-error-container border-error/20';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-secondary-container text-on-secondary-container border-secondary/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          <div className="text-xl font-headline font-extrabold text-primary">MEDIQUEUE</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-on-surface">{user?.displayName || 'Guest Patient'}</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Verified Session</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <User className="w-4 h-4 text-on-primary-container" />
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto py-12 px-6">
        
        {/* Progress Stepper */}
        <div className="mb-12 w-full">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant -z-10"></div>
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10"
              style={{ width: step === 'input' ? '0%' : step === 'ai_form' ? '50%' : '100%' }}
            ></div>
            
            {[
              { id: 'input', label: 'Symptoms', icon: HeartPulse },
              { id: 'ai_form', label: 'Assessment', icon: Activity },
              { id: 'result', label: 'Report', icon: ShieldCheck }
            ].map((s, i) => {
              const isActive = step === s.id;
              const isDone = (step === 'ai_form' && i === 0) || (step === 'result' && i < 2);
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-primary text-on-primary ring-4 ring-primary-fixed scale-110' : 
                    isDone ? 'bg-primary text-on-primary' : 'bg-white border-2 border-outline-variant text-outline'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-outline'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="animate-fade">
          
          {step === 'input' && (
            <div className="w-full bg-white rounded-[2rem] border border-outline-variant p-8 md:p-12 shadow-ambient-card">
              <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-4">How are you feeling?</h2>
              <p className="font-body text-on-surface-variant mb-8 text-lg">Describe your symptoms in your own words. Our clinical AI will analyze the details to prioritize your care.</p>
              
              <div className="relative group mb-8">
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="E.g. I've had a sharp pain in my left knee for 2 days, it's worse when climbing stairs..."
                  className="w-full h-48 bg-surface border-2 border-outline-variant rounded-2xl p-6 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-outline/60"
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-outline uppercase tracking-widest">
                  AI-Ready Input
                </div>
              </div>
              
              <button 
                onClick={startAnalysis}
                disabled={loading || !symptoms.trim()}
                className="w-full py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_4px_0_0_#003ea8] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>Start Clinical Triage</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'ai_form' && aiForm && (
            <div className="space-y-8">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-primary font-bold">Refining Diagnosis</h3>
                  <p className="text-xs text-primary/70 font-semibold uppercase tracking-widest mt-1">AI Symptom Analysis</p>
                </div>
                <div className="text-primary font-bold text-lg">
                  {currentQuestionIndex + 1} <span className="text-primary/30">/ {aiForm.questions.length}</span>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-outline-variant p-10 shadow-ambient-elevated relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-surface-container">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / aiForm.questions.length) * 100}%` }}
                  ></div>
                </div>

                <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-10 leading-tight">
                  {aiForm.questions[currentQuestionIndex].text}
                </h2>

                <div className="grid gap-4">
                  {aiForm.questions[currentQuestionIndex].type === 'yesno' && (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleAnswer('Yes')} className="flex items-center justify-center py-6 rounded-2xl border-2 border-outline-variant hover:border-primary hover:bg-primary/5 font-bold text-xl transition-all group">
                        Yes <ChevronRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                      <button onClick={() => handleAnswer('No')} className="flex items-center justify-center py-6 rounded-2xl border-2 border-outline-variant hover:border-error/30 hover:bg-error/5 font-bold text-xl transition-all">
                        No
                      </button>
                    </div>
                  )}

                  {aiForm.questions[currentQuestionIndex].type === 'severity' && (
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button 
                          key={num}
                          onClick={() => handleAnswer(num)}
                          className="aspect-square rounded-xl border-2 border-outline-variant hover:border-primary hover:bg-primary text-on-surface hover:text-on-primary transition-all font-bold text-lg"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}

                  {(aiForm.questions[currentQuestionIndex].type === 'checkbox' || aiForm.questions[currentQuestionIndex].type === 'radio') && (
                    <div className="grid gap-3">
                      {aiForm.questions[currentQuestionIndex].options?.map((opt: string) => (
                        <button 
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className="w-full p-5 rounded-2xl border-2 border-outline-variant hover:border-primary hover:bg-primary/5 text-left font-bold transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'result' && triageResult && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-outline-variant shadow-ambient-elevated overflow-hidden">
                <div className="bg-primary p-8 text-on-primary">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="font-headline text-2xl font-bold">Clinical Triage Report</h2>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Verified by Mediqueue AI Engine</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Priority Level</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold ${getUrgencyStyles(triageResult.urgency)}`}>
                        <AlertCircle className="w-4 h-4" />
                        {triageResult.urgency}
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Target Specialist</p>
                      <div className="flex items-center gap-2 text-xl font-bold">
                        <Stethoscope className="w-5 h-5 text-white" />
                        {triageResult.doctorType}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="space-y-6">
                    <p className="text-outline text-xs font-black uppercase tracking-widest">Assessment Summary</p>
                    <div className="grid gap-4">
                      {(triageResult.summary || []).map((point: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/50">
                          <CheckCircle2 className="text-primary w-5 h-5 shrink-0" />
                          <p className="font-body text-on-surface leading-relaxed font-medium">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-outline-variant flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-[2] py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-[0_4px_0_0_#003ea8] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                      Confirm & Queue Up
                    </button>
                    <button 
                      onClick={() => setStep('input')}
                      className="flex-1 py-5 rounded-2xl border-2 border-outline-variant hover:bg-surface-container font-bold text-outline transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="text-primary w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-on-surface">Transmission Complete</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                    Your diagnostic data has been securely transmitted to the {triageResult.doctorType} department at City General Hospital. You will be notified via SMS/Push when your node is next in line.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Analysis Overlay */}
      {loading && step !== 'input' && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-fade">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="mt-8 font-headline text-2xl font-bold text-on-surface">Clinical Intelligence Processing</h3>
          <p className="mt-2 text-outline font-bold uppercase tracking-[0.2em] text-xs">Analyzing Symptom Correlations</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentRequest;
