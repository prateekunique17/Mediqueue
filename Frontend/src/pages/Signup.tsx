import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, User, Building2, MapPin, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Signup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState({ name: '', email: '', password: '' });
  const [hospitalData, setHospitalData] = useState({ name: '', email: '', password: '', address: '' });

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData.name || !patientData.email || !patientData.password) {
      toast.error("Please fill all patient fields");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(patientData.email, patientData.password, patientData.name, 'patient');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalData.name || !hospitalData.email || !hospitalData.password || !hospitalData.address) {
      toast.error("Please fill all hospital fields");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(hospitalData.email, hospitalData.password, hospitalData.name, 'hospital');
      navigate('/hospital');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-6 lg:p-12 font-body text-on-surface antialiased">
      <header className="w-full max-w-[1200px] mb-12 text-center flex flex-col items-center animate-fade">
        <div className="flex items-center gap-3 text-primary mb-4">
          <ShieldCheck className="w-10 h-10" />
          <span className="font-headline text-3xl font-extrabold tracking-tight text-primary">MEDIQUEUE</span>
        </div>
        <p className="font-body text-on-surface-variant max-w-md mx-auto text-sm font-medium leading-relaxed">
          Create an account to experience seamless medical queuing and streamlined facility management.
        </p>
      </header>

      <main className="w-full max-w-[1100px] bg-white rounded-[2.5rem] border border-outline-variant ambient-shadow-card overflow-hidden flex flex-col lg:flex-row items-stretch animate-fade">
        {/* Left Side: Patient Signup */}
        <section className="flex-1 p-8 lg:p-12 bg-white flex flex-col">
          <div className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Patient Signup</h2>
              <p className="text-xs font-semibold text-outline uppercase tracking-widest mt-0.5">Join the queue faster</p>
            </div>
          </div>
          
          <form onSubmit={handlePatientSignup} className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="patient-name">Full Name</label>
              <div className="relative">
                <input 
                  className="w-full h-[52px] px-5 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold" 
                  id="patient-name" 
                  placeholder="John Doe" 
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="patient-email">Email Address</label>
              <input 
                className="w-full h-[52px] px-5 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold" 
                id="patient-email" 
                placeholder="john@example.com" 
                type="email"
                value={patientData.email}
                onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="patient-password">Password</label>
              <input 
                className="w-full h-[52px] px-5 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold tracking-widest" 
                id="patient-password" 
                placeholder="••••••••" 
                type="password"
                value={patientData.password}
                onChange={(e) => setPatientData({ ...patientData, password: e.target.value })}
              />
            </div>
            <div className="mt-auto pt-8">
              <button 
                disabled={loading}
                className="w-full h-[56px] bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Create Patient Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center font-body text-sm text-on-surface-variant font-medium mt-6">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline ml-1">Log in</Link>
              </p>
            </div>
          </form>
        </section>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-outline-variant/30"></div>
        <div className="block lg:hidden h-px w-full bg-outline-variant/30 my-4"></div>

        {/* Right Side: Hospital Signup */}
        <section className="flex-1 p-8 lg:p-12 bg-surface-container-low flex flex-col relative overflow-hidden">
          <div className="mb-10 flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Hospital Partner</h2>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mt-0.5">Streamline Intake</p>
            </div>
          </div>
          
          <form onSubmit={handleHospitalSignup} className="flex-1 flex flex-col gap-5 relative z-10">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="hospital-name">Facility Name</label>
              <input 
                className="w-full h-[48px] px-4 bg-white border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold" 
                id="hospital-name" 
                placeholder="City General Hospital" 
                type="text"
                value={hospitalData.name}
                onChange={(e) => setHospitalData({ ...hospitalData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="hospital-address">Facility Address</label>
              <input 
                className="h-[48px] px-4 bg-white border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold" 
                id="hospital-address" 
                placeholder="123 Medical Way, Suite 100" 
                type="text"
                value={hospitalData.address}
                onChange={(e) => setHospitalData({ ...hospitalData, address: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="hospital-email">Admin Email</label>
              <input 
                className="h-[48px] px-4 bg-white border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold" 
                id="hospital-email" 
                placeholder="admin@hospital.com" 
                type="email"
                value={hospitalData.email}
                onChange={(e) => setHospitalData({ ...hospitalData, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="hospital-password">Admin Password</label>
              <input 
                className="h-[48px] px-4 bg-white border border-outline-variant rounded-xl focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline font-semibold tracking-widest" 
                id="hospital-password" 
                placeholder="••••••••" 
                type="password"
                value={hospitalData.password}
                onChange={(e) => setHospitalData({ ...hospitalData, password: e.target.value })}
              />
            </div>
            <div className="mt-auto pt-6">
              <button 
                disabled={loading}
                className="w-full h-[52px] bg-secondary text-on-secondary font-bold rounded-xl shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Register Facility</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center font-body text-[10px] font-black text-outline uppercase tracking-widest mt-4">
                Requires verification node review
              </p>
            </div>
          </form>
        </section>
      </main>

      <footer className="mt-12 text-center pb-8">
        <p className="font-body text-[10px] font-black text-outline uppercase tracking-[0.2em]">© 2024 MEDIQUEUE AI. Clinical Precision Guaranteed.</p>
        <button onClick={() => signUpWithEmail('admin@mediqueue.com', 'admin123', 'System Admin', 'admin')} className="mt-4 text-[10px] text-outline hover:text-primary transition-colors uppercase tracking-widest font-black">
          Initialize Admin Node
        </button>
      </footer>
    </div>
  );
};

export default Signup;
