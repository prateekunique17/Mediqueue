import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Building2, 
  FileText, 
  ExternalLink, 
  MapPin, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Activity,
  Globe,
  Users,
  Search,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingHospitals, setPendingHospitals] = useState<any[]>([]);
  const [activeHospitals, setActiveHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'prateek17') {
      setIsAuthorized(true);
      toast.success("System Access Granted");
    } else {
      toast.error("Invalid Administrative Credentials");
      setPassword('');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: pendings } = await supabase.from('hospitals').select('*').eq('status', 'pending');
    const { data: actives } = await supabase.from('hospitals').select('*').eq('status', 'approved');
    setPendingHospitals(pendings || []);
    setActiveHospitals(actives || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (hospId: string, userId: string, status: 'approved' | 'rejected') => {
    try {
      await supabase.from('hospitals').update({ status }).eq('id', hospId);
      await supabase.from('users').update({ status }).eq('uid', userId);
      toast.success(status === 'approved' ? 'Node Authorized!' : 'Access Revoked');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 antialiased font-body">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-[2.5rem] border border-outline-variant p-10 shadow-ambient-elevated text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-headline text-2xl font-black text-on-surface mb-2 uppercase tracking-tight">System Restricted</h1>
            <p className="text-on-surface-variant text-sm mb-8 font-medium italic">"Clinical Precision Guard Active"</p>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-black text-outline uppercase tracking-[0.2em] ml-2">Console Password</label>
                <input 
                  type="password" 
                  autoFocus
                  placeholder="••••••••"
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-2xl outline-none focus:border-primary transition-all text-center tracking-widest font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Verify Credentials
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-outline-variant">
              <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em]">Global Security Protocol v5.0</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body antialiased">
      {/* Admin Toolbar */}
      <header className="h-16 border-b border-outline-variant px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="font-headline font-extrabold text-on-surface">SYSTEM CONSOLE</h1>
          <div className="h-4 w-px bg-outline-variant"></div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Global Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase border border-secondary/20">
            <Globe className="w-3 h-3" /> System Online
          </div>
          <div className="flex items-center gap-4 border-l border-outline-variant pl-6">
            <button className="text-outline hover:text-primary transition-colors"><Bell className="w-5 h-5" /></button>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-bold text-xs">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-fade">
          {[
            { label: 'Active Nodes', value: activeHospitals.length, icon: Building2, color: 'text-primary' },
            { label: 'Pending Audit', value: pendingHospitals.length, icon: FileText, color: 'text-orange-500' },
            { label: 'System Traffic', value: 'Live', icon: Activity, color: 'text-secondary' },
            { label: 'Verified Staff', value: '42', icon: Users, color: 'text-primary' }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-outline-variant rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-outline uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-headline font-extrabold text-on-surface">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Audit Queue */}
          <div className="lg:col-span-8 animate-fade" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                Audit Queue
                <span className="text-xs font-black bg-surface-container px-2 py-0.5 rounded text-outline">{pendingHospitals.length}</span>
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-white border border-outline-variant rounded-lg text-outline hover:text-primary transition-colors"><Search className="w-4 h-4" /></button>
                <button className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Sort by Date</button>
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="py-20 text-center animate-pulse">
                  <div className="w-12 h-12 bg-surface-container-high rounded-full mx-auto mb-4"></div>
                  <p className="text-xs font-black text-outline uppercase tracking-widest">Auditing System Data...</p>
                </div>
              ) : pendingHospitals.length === 0 ? (
                <div className="py-20 text-center bg-surface-container-low rounded-[2.5rem] border-2 border-dashed border-outline-variant opacity-50">
                  <FileText className="w-12 h-12 text-outline mx-auto mb-4" />
                  <p className="font-bold text-outline uppercase tracking-widest text-xs">No pending applications in queue.</p>
                </div>
              ) : pendingHospitals.map(hosp => (
                <div key={hosp.id} className="bg-white border-2 border-outline-variant rounded-[2.5rem] p-10 hover:border-primary/50 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-6 flex-1">
                      <div>
                        <h3 className="font-headline text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors tracking-tight">{hosp.name}</h3>
                        <p className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant mt-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {hosp.address}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <a href={hosp.licenseUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-primary rounded-xl text-xs font-bold border border-primary/10 hover:bg-primary hover:text-on-primary transition-all">
                          Medical License <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold border border-outline-variant">
                          User ID: {hosp.userId.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <button 
                        onClick={() => handleAction(hosp.id, hosp.userId, 'approved')}
                        className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Authorize Node
                      </button>
                      <button 
                        onClick={() => handleAction(hosp.id, hosp.userId, 'rejected')}
                        className="w-full py-4 bg-white border border-error/30 text-error rounded-2xl font-bold text-sm hover:bg-error-container hover:text-on-error-container transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject App
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registry Sidepanel */}
          <div className="lg:col-span-4 animate-fade" style={{ animationDelay: '0.2s' }}>
            <div className="bg-surface-container-low rounded-[2rem] border border-outline-variant overflow-hidden flex flex-col">
              <div className="p-8 border-b border-outline-variant bg-white">
                <h3 className="font-headline text-xl font-bold mb-1">Node Registry</h3>
                <p className="text-xs text-outline font-semibold uppercase tracking-widest">Active Infrastructure</p>
              </div>
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {activeHospitals.length === 0 ? (
                  <p className="text-center py-10 text-xs italic text-outline font-medium">No active nodes registered.</p>
                ) : activeHospitals.map(hosp => (
                  <div key={hosp.id} className="bg-white p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{hosp.name}</h4>
                        <p className="text-[10px] text-outline font-black uppercase tracking-widest">{hosp.status}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAction(hosp.id, hosp.userId, 'rejected')}
                      className="p-2 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-surface-container border-t border-outline-variant">
                <p className="text-[10px] text-outline font-black text-center uppercase tracking-widest leading-relaxed">
                  Total Managed Nodes: {activeHospitals.length} • Clinical Precision Guard Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
