import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Clock, Users, ExternalLink, MapPin } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-bg py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold tracking-widest uppercase border border-accent/20">
              <Activity className="w-3.5 h-3.5" />
              AI-Powered Triage Monitor
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-text-primary leading-[0.9]">
              Skip the <br />
              <span className="text-accent underline decoration-accent/30 underline-offset-8">Waiting.</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-lg leading-relaxed font-medium">
              MEDIQUEUE uses Google Gemini to analyze your symptoms, assign urgency, and match you with the right specialist instantly.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <Link to="/signup" className="px-10 py-4 bg-accent text-white rounded-xl font-extrabold text-lg hover:brightness-110 transition shadow-2xl shadow-accent/20">
                Start Triage
              </Link>
              <Link to="/login" className="px-10 py-4 bg-card text-text-primary border border-border rounded-xl font-extrabold text-lg hover:border-accent transition">
                Hospital Login
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block relative"
          >
             <div className="aspect-[4/5] bg-card rounded-[3rem] border border-border p-8 overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent"></div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="h-6 w-32 bg-border rounded-lg"></div>
                      <div className="badge-emergency">CRITICAL</div>
                   </div>
                   <div className="h-4 w-3/4 bg-border/50 rounded"></div>
                   <div className="h-4 w-1/2 bg-border/50 rounded"></div>
                   <div className="p-6 border border-border bg-bg/50 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                         <div className="w-6 h-6 bg-accent rounded-full animate-pulse"></div>
                      </div>
                      <div>
                         <div className="h-4 w-24 bg-border rounded mb-2"></div>
                         <div className="h-3 w-32 bg-border/50 rounded"></div>
                      </div>
                   </div>
                   <div className="h-48 w-full bg-bg rounded-2xl border border-border flex items-center justify-center text-text-secondary">
                      <div className="text-center">
                         <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                         <span className="text-xs font-bold tracking-widest uppercase opacity-30 tracking-widest">Scanning Symptoms...</span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Hospitals Section */}
      <section className="py-24 px-4 bg-card/40 border-y border-border">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
               <div className="space-y-3">
                  <h2 className="text-4xl font-extrabold text-text-primary tracking-tight">Vetted Healthcare Facilities</h2>
                  <p className="text-text-secondary font-medium text-lg">Trusted hospitals ready to receive your triage reports.</p>
               </div>
               <Link to="/signup" className="text-accent font-bold flex items-center gap-2 hover:text-white transition group">
                  Add your Facility <ExternalLink size={18} className="group-hover:translate-x-1 transition" />
               </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
               {[
                  { name: 'City Central General', location: 'Downtown', specialty: 'Multi-speciality' },
                  { name: 'St. Mary Childrens', location: 'North Side', specialty: 'Pediatrics' },
                  { name: 'Heart & Vascular Inst.', location: 'East Side', specialty: 'Cardiology' }
               ].map((h, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer bg-card border border-border rounded-[2rem] p-4 p-4 shadow-xl"
                  >
                     <div className="aspect-video bg-bg rounded-2xl mb-6 overflow-hidden relative border border-border">
                        <img 
                          src={`https://picsum.photos/seed/hosp-${i}/800/450?grayscale`} 
                          alt="Hospital" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-60" 
                        />
                        <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20">Verified</div>
                     </div>
                     <div className="px-2 pb-2">
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition">{h.name}</h3>
                        <p className="text-text-secondary font-medium flex items-center gap-2 text-sm mt-2">
                           <MapPin size={14} className="text-accent" />
                           {h.location} • {h.specialty}
                        </p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default Landing;
