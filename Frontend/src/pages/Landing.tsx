import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body antialiased">
      {/* Hero Section */}
      <section className="relative pt-2xl pb-3xl px-6 lg:px-24 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center relative z-10">
          <div className="flex flex-col gap-lg animate-fade">
            <h1 className="font-headline text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight">
              Skip the <span className="text-primary">Queue</span>
            </h1>
            <p className="font-body text-lg lg:text-xl text-on-surface-variant max-w-lg leading-relaxed">
              AI-powered medical pre-diagnosis and smart appointment system. Get the right care, at the right time, without the wait.
            </p>
            <div className="flex flex-wrap gap-md mt-sm">
              <Link 
                to="/signup" 
                className="btn-primary bg-primary text-on-primary font-semibold px-8 py-4 rounded-lg hover:bg-primary/90 text-center transition-all shadow-lg"
              >
                Book Appointment
              </Link>
              <Link 
                to="/signup" 
                className="bg-transparent border border-outline text-on-surface font-semibold px-8 py-4 rounded-lg hover:bg-surface-container-low transition-colors text-center"
              >
                Join as Hospital
              </Link>
            </div>
          </div>
          
          <div className="relative w-full aspect-square animate-slide-in">
             <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" 
               alt="Medical professional using tablet" 
               className="w-full h-full object-cover rounded-[2rem] ambient-shadow-float border-4 border-white"
             />
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low rounded-bl-[120px] -z-0"></div>
      </section>

      {/* Problem Section */}
      <section className="py-3xl px-6 lg:px-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto text-center mb-2xl animate-fade">
          <h2 className="font-headline text-3xl lg:text-4xl font-bold text-on-surface mb-sm">The Waiting Room is Obsolete</h2>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto">Traditional medical queues lead to frustration and potential exposure. Mediqueue reimagines access to care through intelligent triage.</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: 'smart_toy', title: 'AI Diagnostics', desc: 'Symptom analysis powered by advanced LLMs.' },
            { icon: 'bolt', title: 'Instant Triage', desc: 'Prioritize emergencies and redirect routine care.' },
            { icon: 'verified', title: 'Verified Nodes', desc: 'Secure connection to licensed healthcare facilities.' }
          ].map((feature, i) => (
            <div key={i} className="ambient-shadow-card p-8 flex flex-col items-center text-center group hover:border-primary transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">{feature.icon}</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-3">{feature.title}</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-white border-t border-outline-variant">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-headline text-2xl font-extrabold text-primary">MEDIQUEUE</span>
            <p className="text-xs text-outline font-medium">© 2024 MEDIQUEUE AI. Clinical Precision Guaranteed.</p>
          </div>
          <nav className="flex flex-wrap gap-8 justify-center">
            {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Contact Support'].map(link => (
              <a key={link} href="#" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">{link}</a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
