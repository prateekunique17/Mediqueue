import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ShieldCheck, XCircle, CheckCircle, FileText, ExternalLink, MapPin, Building2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingHospitals, setPendingHospitals] = useState<any[]>([]);
  const [activeHospitals, setActiveHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.success(status === 'approved' ? 'Facility Authorized!' : 'Facility License Revoked');
      fetchData(); // Refresh both lists
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const initializeAdmin = async () => {
    if (user) {
      try {
        await supabase.from('users').update({ role: 'admin' }).eq('uid', user.id);
        toast.success("Identity updated to ADMIN. Please refresh.");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-bg text-text-primary">
      <div className="flex items-center gap-6 mb-16">
         <div className="w-20 h-20 bg-accent/10 border border-accent/20 text-accent rounded-[2rem] flex items-center justify-center shadow-2xl">
            <ShieldCheck className="w-10 h-10" />
         </div>
         <div>
            <h1 className="text-4xl font-black tracking-tight">Admin Console</h1>
            <p className="text-text-secondary font-bold text-lg mt-1">Verified facility audit & node management.</p>
         </div>
      </div>

      <div className="grid gap-16">
        {/* Section 1: Pending Applications */}
        <section className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-border bg-bg/50 flex justify-between items-center">
             <h2 className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                <FileText className="text-accent w-5 h-5" />
                Pending Applications ({pendingHospitals.length})
             </h2>
          </div>

          <div className="divide-y divide-border">
             {loading ? (
                <div className="p-20 text-center text-text-secondary font-black uppercase tracking-[0.3em] text-xs">Auditing Registries...</div>
             ) : pendingHospitals.length === 0 ? (
                <div className="p-20 text-center opacity-40">
                   <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">No pending applications.</p>
                </div>
             ) : pendingHospitals.map(hosp => (
                <div key={hosp.id} className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12 group">
                   <div className="space-y-6 max-w-2xl">
                      <div>
                         <h3 className="text-3xl font-black text-text-primary tracking-tight group-hover:text-accent transition">{hosp.name}</h3>
                         <p className="text-text-secondary flex items-center gap-2 font-bold mt-2 text-sm uppercase tracking-tight">
                            <MapPin size={16} className="text-accent" />
                            {hosp.address}
                         </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                         <a href={hosp.licenseUrl} target="_blank" rel="noopener noreferrer" className="badge-docs">Medical License <ExternalLink size={12} /></a>
                         <a href={hosp.buildingProofUrl} target="_blank" rel="noopener noreferrer" className="badge-docs">Facility Photos <ExternalLink size={12} /></a>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <button onClick={() => handleAction(hosp.id, hosp.userId, 'rejected')} className="btn-reject">
                         Reject
                      </button>
                      <button onClick={() => handleAction(hosp.id, hosp.userId, 'approved')} className="btn-approve">
                         Authorize & Deploy
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </section>

        {/* Section 2: Active Facilities */}
        <section className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-border bg-bg/50 flex justify-between items-center">
             <h2 className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                <Building2 className="text-routine w-5 h-5" />
                Active Healthcare Nodes ({activeHospitals.length})
             </h2>
          </div>

          <div className="divide-y divide-border">
             {activeHospitals.length === 0 ? (
                <div className="p-20 text-center opacity-40">
                   <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">No active nodes in network.</p>
                </div>
             ) : activeHospitals.map(hosp => (
                <div key={hosp.id} className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12 hover:bg-white/5 transition">
                   <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-bg rounded-2xl border border-border flex items-center justify-center">
                         <Building2 className="text-text-secondary opacity-20" size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-text-primary tracking-tight">{hosp.name}</h3>
                         <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-black text-routine uppercase tracking-widest">Active & Verified</span>
                            <span className="text-[10px] font-bold text-text-secondary px-2 py-0.5 bg-bg border border-border rounded-full">{hosp.address}</span>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => handleAction(hosp.id, hosp.userId, 'rejected')}
                     className="flex items-center gap-3 px-6 py-3 bg-emergency/10 border border-emergency/20 text-emergency rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emergency hover:text-white transition group shadow-xl"
                   >
                      <Trash2 size={16} />
                      Revoke License & Evict
                   </button>
                </div>
             ))}
          </div>
        </section>
      </div>
      
      {/* Admin Seed Button */}
      <div className="mt-20 text-center p-12 border-2 border-dashed border-border rounded-[3rem] bg-card/40 opacity-40 hover:opacity-100 transition">
         <button onClick={initializeAdmin} className="text-[10px] text-text-secondary hover:text-accent font-black uppercase tracking-widest border border-border px-6 py-2 rounded-full hover:border-accent transition">
           Initialize Admin Rights
         </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
